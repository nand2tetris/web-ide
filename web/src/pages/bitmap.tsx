import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Panel } from "../shell/panel";
import "./bitmap.scss";

// Constants
const STATE_KEY = "bitmap_editor_state";
const GRID_KEY = "bitmap_editor_grid";
const BINARY_BITS = 16;

interface BitmapState {
  width: number;
  height: number;
  pixelSize: number;
  currentIShift: number;
  currentJShift: number;
  marginSaveFrames: number;
  baseI: number;
  baseJ: number;
  drawHeight: number;
  invertMode: boolean;
  comments: boolean;
}

const defaultState: BitmapState = {
  width: 48,
  height: 32,
  pixelSize: 16,
  currentIShift: 0,
  currentJShift: 0,
  marginSaveFrames: 1,
  baseI: 0,
  baseJ: 0,
  drawHeight: 0,
  invertMode: false,
  comments: true,
};

type CodeMode = "jack" | "hack";
type MarginType = "fitToDrawing" | "rectangular" | "fullCanvas";

// Utility functions for code generation
function getWordValue(
  grid: boolean[][],
  i: number,
  j: number,
  invertMode: boolean,
  width: number
): number {
  let binary = "";
  for (let m = j; m < j + BINARY_BITS; m++) {
    if (m < 0 || m >= width) {
      binary = (invertMode ? "1" : "0") + binary;
    } else {
      binary = (grid[i][m] ? "1" : "0") + binary;
    }
  }

  let isNegative = false;
  if (binary[0] === "1") {
    isNegative = true;
    let oneComplement = "";
    for (let k = 0; k < BINARY_BITS; k++) {
      oneComplement += binary[k] === "1" ? "0" : "1";
    }
    binary = oneComplement;
  }

  let value = 0;
  for (let k = 0; k < BINARY_BITS; k++) {
    value = value * 2;
    if (binary[k] === "1") value = value + 1;
  }

  if (isNegative) value = -(value + 1);
  return value;
}

function generateJackCodeLine(row: number, value: number, col: number): string {
  let memShift = row * 32 + col;
  let memShiftStr = "";
  if (memShift > 0) memShiftStr = " +" + memShift;
  else if (memShift === 0) memShiftStr = "";
  else memShiftStr = " " + memShift;

  if (value === -32768) {
    return "\tdo Memory.poke(memAddress" + memShiftStr + ", ~32767);\n";
  }
  return "\tdo Memory.poke(memAddress" + memShiftStr + ", " + value + ");\n";
}

function generateHackAssemblyCode(
  addrIncrement: number,
  pixelsValue: number,
  dHoldsAddr: boolean,
  comments: boolean
): { code: string; dHoldsAddr: boolean } {
  let str = "";
  const c = comments
    ? [
      "// D holds previous addr",
      "// D holds addr",
      "// D holds addr",
      "// A holds val",
      "// D = addr + val",
      "// A=addr + val - val = addr",
      "// RAM[addr] = val",
      "// RAM[addr]=-val",
    ]
    : ["", "", "", "", "", "", "", ""];

  if (!dHoldsAddr && addrIncrement > 2) str += "\tD=A " + c[0] + "\n";

  if (addrIncrement === 1) str += "\tAD=A+1 " + c[1] + "\n";
  else if (addrIncrement === 2) str += "\tAD=A+1\n\tAD=A+1 " + c[2] + "\n";
  else if (addrIncrement !== 0) str += "\t@" + addrIncrement + "\n\tAD=D+A\n";

  if (pixelsValue === 1 || pixelsValue === 0 || pixelsValue === -1) {
    str += "\tM=" + pixelsValue.toString() + "\n";
    return { code: str, dHoldsAddr: true };
  } else if (pixelsValue === -32768) {
    str +=
      "\t@32767\n\tA=!A " +
      c[3] +
      "\n\tD=D+A " +
      c[4] +
      "\n\tA=D-A " +
      c[5] +
      "\n";
    str += "\tM=D-A " + c[6] + "\n";
    return { code: str, dHoldsAddr: false };
  } else if (pixelsValue < 0) {
    str +=
      "\t@" +
      -pixelsValue +
      " " +
      c[3] +
      "\n\tD=D+A " +
      c[4] +
      "\n\tA=D-A " +
      c[5] +
      "\n";
    str += "\tM=A-D " + c[7] + "\n";
    return { code: str, dHoldsAddr: false };
  } else {
    str +=
      "\t@" +
      pixelsValue +
      " " +
      c[3] +
      "\n\tD=D+A " +
      c[4] +
      "\n\tA=D-A " +
      c[5] +
      "\n";
    str += "\tM=D-A " + c[6] + "\n";
    return { code: str, dHoldsAddr: false };
  }
}

function getColumns(leftJ: number, rightJ: number, baseJ: number): number[] {
  const leftmost = Math.min(0, -Math.ceil((baseJ - leftJ) / 16));
  const rightmost = Math.max(0, Math.floor((rightJ - baseJ) / 16));
  const columns: number[] = [];
  for (let i = leftmost; i < rightmost + 1; i++) {
    columns.push(i);
  }
  if (rightJ < baseJ || leftJ > baseJ + 16) {
    const idx = columns.indexOf(0);
    if (idx !== -1) columns.splice(idx, 1);
  }
  return columns;
}

export const BitmapEditor = () => {
  // Load state from localStorage
  const loadState = (): BitmapState => {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        return { ...defaultState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Error loading bitmap editor state:", e);
    }
    return defaultState;
  };

  const loadGrid = (width: number, height: number, invertMode: boolean): boolean[][] => {
    try {
      const saved = localStorage.getItem(GRID_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading bitmap editor grid:", e);
    }
    return createGrid(width, height, invertMode);
  };

  const createGrid = (width: number, height: number, invertMode: boolean): boolean[][] => {
    const newGrid: boolean[][] = [];
    for (let i = 0; i < height; i++) {
      newGrid[i] = new Array(width).fill(invertMode);
    }
    return newGrid;
  };

  // State
  const initialState = loadState();
  const [width, setWidth] = useState(initialState.width);
  const [height, setHeight] = useState(initialState.height);
  const [pixelSize, setPixelSize] = useState(initialState.pixelSize);
  const [currentIShift, setCurrentIShift] = useState(initialState.currentIShift);
  const [currentJShift, setCurrentJShift] = useState(initialState.currentJShift);
  const [marginSaveFrames, setMarginSaveFrames] = useState(initialState.marginSaveFrames);
  const [invertMode, setInvertMode] = useState(initialState.invertMode);
  const [comments, setComments] = useState(initialState.comments);

  const [grid, setGrid] = useState<boolean[][]>(() =>
    loadGrid(initialState.width, initialState.height, initialState.invertMode)
  );

  const [currentColor, setCurrentColor] = useState<boolean | null>(null);
  const [codeMode, setCodeMode] = useState<CodeMode>("jack");
  const [pauseCode, setPauseCode] = useState(false);
  const [marginType, setMarginType] = useState<MarginType>("fitToDrawing");
  const [obviousStyling, setObviousStyling] = useState(false);
  const [baseTopLeft, setBaseTopLeft] = useState(true);

  // Refs for input fields
  const widthInputRef = useRef<HTMLInputElement>(null);
  const heightInputRef = useRef<HTMLInputElement>(null);
  const pixelSizeInputRef = useRef<HTMLInputElement>(null);
  const marginFramesInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save state to localStorage
  useEffect(() => {
    const state: BitmapState = {
      width,
      height,
      pixelSize,
      currentIShift,
      currentJShift,
      marginSaveFrames,
      baseI: 0,
      baseJ: 0,
      drawHeight: 0,
      invertMode,
      comments,
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }, [width, height, pixelSize, currentIShift, currentJShift, marginSaveFrames, invertMode, comments]);

  // Save grid to localStorage
  useEffect(() => {
    localStorage.setItem(GRID_KEY, JSON.stringify(grid));
  }, [grid]);

  // Get used words for code generation
  const getUsedWords = useCallback(() => {
    const words: Record<string, [number, number][]> = {};
    let leftJ = 0;
    let rightJ = width - 1;
    let baseJ = 0;
    let bottomI = height - 1;
    let topI = 0;
    let baseI = height - 1;

    if (marginType !== "fullCanvas") {
      // Find drawing borders
      let breaker = false;
      for (let j = 0; j < width && !breaker; j++) {
        for (let i = height - 1; i >= 0; i--) {
          if (grid[i]?.[j] !== invertMode) {
            leftJ = j;
            breaker = true;
            break;
          }
        }
      }

      breaker = false;
      for (let j = width - 1; j >= 0 && !breaker; j--) {
        for (let i = height - 1; i >= 0; i--) {
          if (grid[i]?.[j] !== invertMode) {
            rightJ = j;
            breaker = true;
            break;
          }
        }
      }

      breaker = false;
      for (let i = height - 1; i >= 0 && !breaker; i--) {
        for (let j = 0; j < width; j++) {
          if (grid[i]?.[j] !== invertMode) {
            bottomI = i;
            breaker = true;
            break;
          }
        }
      }

      breaker = false;
      for (let i = 0; i < height && !breaker; i++) {
        for (let j = 0; j < width; j++) {
          if (grid[i]?.[j] !== invertMode) {
            topI = i;
            breaker = true;
            break;
          }
        }
      }

      baseJ = leftJ - currentJShift;
      baseI = bottomI - currentIShift;
      rightJ = Math.max(rightJ, rightJ - currentJShift);
      leftJ = Math.min(leftJ, leftJ - currentJShift);
    }

    const columns = getColumns(leftJ, rightJ, baseJ);

    for (const col of columns) {
      const thisCol: [number, number][] = [];
      const colIndex = col * 16 + baseJ;

      if (marginType === "fullCanvas") {
        for (let i = 0; i < height; i++) {
          thisCol.push([i, colIndex]);
        }
      } else if (marginType === "rectangular") {
        const minI = Math.min(topI, baseI);
        const maxI = Math.max(bottomI, baseI);
        for (let i = minI; i <= maxI; i++) {
          if (i < 0 || i >= height) continue;
          thisCol.push([i, colIndex]);
        }
      } else {
        // fitToDrawing
        const includedIvalues = new Set<number>();
        const minI = Math.min(topI, baseI);
        const maxI = Math.max(bottomI, baseI);

        for (let i = minI; i <= maxI; i++) {
          if (i < 0 || i >= height) continue;
          let thisIIn = false;

          for (let j = colIndex; j < colIndex + 16; j++) {
            if (j >= 0 && j < width) {
              if (grid[i]?.[j] !== invertMode) {
                thisIIn = true;
                break;
              }

              if (currentJShift > 0) {
                for (let l = colIndex + 16; l < Math.min(currentJShift, marginSaveFrames) + colIndex + 16; l++) {
                  if (l >= width) break;
                  if (grid[i]?.[l] !== invertMode) {
                    thisIIn = true;
                    break;
                  }
                }
              } else if (currentJShift < 0) {
                for (let l = colIndex - 1; l > Math.max(currentJShift, -marginSaveFrames) + colIndex - 1; l--) {
                  if (l < 0) break;
                  if (grid[i]?.[l] !== invertMode) {
                    thisIIn = true;
                    break;
                  }
                }
              }
            }
          }

          if (thisIIn) {
            includedIvalues.add(i);
            const minM = Math.min(i, i - currentIShift);
            const maxM = Math.max(i, i - currentIShift);
            for (let m = minM; m <= maxM; m++) {
              if (m >= 0 && m < height) includedIvalues.add(m);
            }
          }
        }

        for (const item of includedIvalues) {
          thisCol.push([item, colIndex]);
        }
      }

      words[col.toString()] = thisCol;
    }

    const drawHeight = Math.max(bottomI, baseI) - Math.min(topI, baseI);
    return { words, baseI, baseJ, columns, drawHeight };
  }, [grid, width, height, invertMode, marginType, currentIShift, currentJShift, marginSaveFrames]);

  // Generate code
  const generatedCode = useMemo(() => {
    if (pauseCode) return "";

    const { words, baseI, columns, drawHeight } = getUsedWords();
    const baseRow = baseTopLeft ? drawHeight : 0;
    const subroutineName = "draw";

    if (codeMode === "jack") {
      let code =
        "function void " +
        subroutineName +
        "(int location) {\n\tvar int memAddress; \n\tlet memAddress = 16384+location;\n";

      for (const col of columns) {
        if (comments) {
          code += "\t// column " + col + "\n";
        }
        const coords = words[col.toString()] || [];
        for (const [i, j] of coords) {
          const value = getWordValue(grid, i, j, invertMode, width);
          code += generateJackCodeLine(i - baseI + baseRow, value, col);
        }
      }
      code += "\treturn;\n}";
      return code;
    } else {
      // hack assembly
      const rowsOfWords: Record<string, { coords: [number, number]; col: string }[]> = {};
      for (const col in words) {
        for (const coords of words[col]) {
          const key = coords[0].toString();
          if (!rowsOfWords[key]) rowsOfWords[key] = [];
          rowsOfWords[key].push({ coords, col });
        }
      }

      let code = "(" + subroutineName + ")\n";
      if (comments) {
        code += "\t// put bitmap location value in R12\n\t// put code return address in R13\n";
      }
      code += "\t@SCREEN\n\tD=A\n\t@R12\n\tAD=D+M\n";

      let dHoldsAddr = true;
      let previousCoords: [number, number] | null = null;
      let previousCol: string | null = null;

      const sortedRows = Object.keys(rowsOfWords)
        .map(Number)
        .sort((a, b) => a - b);

      for (const row of sortedRows) {
        if (comments) code += "\t// row " + (row + 1) + "\n";
        for (const data of rowsOfWords[row.toString()]) {
          const { coords, col } = data;
          const value = getWordValue(grid, coords[0], coords[1], invertMode, width);
          let addrIncrement = 0;
          if (previousCoords !== null && previousCol !== null) {
            addrIncrement =
              (coords[0] - previousCoords[0]) * 32 + (parseInt(col) - parseInt(previousCol));
          }
          const hackCode = generateHackAssemblyCode(addrIncrement, value, dHoldsAddr, comments);
          dHoldsAddr = hackCode.dHoldsAddr;
          code += hackCode.code;
          previousCoords = coords;
          previousCol = col;
        }
      }

      if (comments) code += "\t// return\n";
      code += "\t@R13\n\tA=M\n\tD;JMP\n";
      return code;
    }
  }, [grid, codeMode, comments, pauseCode, getUsedWords, invertMode, width, baseTopLeft]);

  // Word edge columns for styling
  const wordEdgeColumns = useMemo(() => {
    if (!obviousStyling) return new Set<number>();
    const { columns, baseJ } = getUsedWords();
    const edges = new Set<number>();
    for (const col of columns) {
      edges.add(col * 16 + baseJ);
    }
    return edges;
  }, [obviousStyling, getUsedWords]);

  // Event handlers
  const handleCellMouseDown = useCallback(
    (i: number, j: number) => {
      const newColor = !grid[i][j];
      setCurrentColor(newColor);
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row]);
        newGrid[i][j] = newColor;
        return newGrid;
      });
    },
    [grid]
  );

  const handleCellMouseOver = useCallback(
    (i: number, j: number) => {
      if (currentColor === null) return;
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row]);
        newGrid[i][j] = currentColor;
        return newGrid;
      });
    },
    [currentColor]
  );

  const handleMouseUp = useCallback(() => {
    setCurrentColor(null);
  }, []);

  const handleResize = useCallback(() => {
    const newWidth = Math.floor(parseInt(widthInputRef.current?.value || "48") / 16) * 16;
    const newHeight = parseInt(heightInputRef.current?.value || "32");
    const newPixelSize = parseInt(pixelSizeInputRef.current?.value || "16");

    if (isNaN(newWidth) || isNaN(newHeight) || isNaN(newPixelSize)) return;

    setWidth(newWidth);
    setHeight(newHeight);
    setPixelSize(newPixelSize);

    setGrid((prev) => {
      const newGrid = createGrid(newWidth, newHeight, invertMode);
      for (let i = 0; i < Math.min(newHeight, prev.length); i++) {
        for (let j = 0; j < Math.min(newWidth, prev[i]?.length || 0); j++) {
          newGrid[i][j] = prev[i][j];
        }
      }
      return newGrid;
    });
  }, [invertMode]);

  const handleReset = useCallback(() => {
    setWidth(defaultState.width);
    setHeight(defaultState.height);
    setPixelSize(defaultState.pixelSize);
    setCurrentIShift(0);
    setCurrentJShift(0);
    setMarginSaveFrames(1);
    setInvertMode(false);
    setComments(true);
    setGrid(createGrid(defaultState.width, defaultState.height, false));
  }, []);

  const shiftLeft = useCallback(() => {
    setCurrentJShift((prev) => prev - 1);
    setGrid((prev) => {
      return prev.map((row) => {
        const newRow = [...row];
        for (let j = 0; j < width - 1; j++) {
          newRow[j] = row[j + 1];
        }
        newRow[width - 1] = invertMode;
        return newRow;
      });
    });
  }, [width, invertMode]);

  const shiftRight = useCallback(() => {
    setCurrentJShift((prev) => prev + 1);
    setGrid((prev) => {
      return prev.map((row) => {
        const newRow = [...row];
        for (let j = width - 1; j > 0; j--) {
          newRow[j] = row[j - 1];
        }
        newRow[0] = invertMode;
        return newRow;
      });
    });
  }, [width, invertMode]);

  const shiftUp = useCallback(() => {
    setCurrentIShift((prev) => prev - 1);
    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row]);
      for (let i = 0; i < height - 1; i++) {
        newGrid[i] = [...prev[i + 1]];
      }
      newGrid[height - 1] = new Array(width).fill(invertMode);
      return newGrid;
    });
  }, [height, width, invertMode]);

  const shiftDown = useCallback(() => {
    setCurrentIShift((prev) => prev + 1);
    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row]);
      for (let i = height - 1; i > 0; i--) {
        newGrid[i] = [...prev[i - 1]];
      }
      newGrid[0] = new Array(width).fill(invertMode);
      return newGrid;
    });
  }, [height, width, invertMode]);

  const clearShifting = useCallback(() => {
    setCurrentIShift(0);
    setCurrentJShift(0);
  }, []);

  const rotateBitmapRight = useCallback(() => {
    if (height !== width) return;
    setGrid((prev) => {
      const newGrid = createGrid(width, height, invertMode);
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          newGrid[j][height - 1 - i] = prev[i][j];
        }
      }
      return newGrid;
    });
    clearShifting();
  }, [height, width, invertMode, clearShifting]);

  const mirrorBitmap = useCallback(() => {
    setGrid((prev) => {
      return prev.map((row) => {
        const newRow = [...row];
        for (let j = 0; j < width; j++) {
          newRow[j] = row[width - 1 - j];
        }
        return newRow;
      });
    });
  }, [width]);

  const invertBitmap = useCallback(() => {
    setGrid((prev) => {
      return prev.map((row) => row.map((cell) => !cell));
    });
  }, []);

  const handleMarginFramesChange = useCallback(() => {
    let value = parseInt(marginFramesInputRef.current?.value || "1");
    if (value < 1) value = 1;
    setMarginSaveFrames(value);
  }, []);

  // File import handlers
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const extension = file.name.toLowerCase().split(".").pop();

      if (extension === "bmp") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const buffer = new Uint8Array(e.target?.result as ArrayBuffer);
          parseBMP(buffer);
        };
        reader.readAsArrayBuffer(file);
      } else if (extension === "png") {
        parsePNG(file);
      } else {
        alert("This file type is not supported. Please upload a .bmp (24-bit) or .png image.");
      }

      event.target.value = "";
    },
    []
  );

  const parseBMP = useCallback((bytes: Uint8Array) => {
    const bmpWidth = bytes[18] + (bytes[19] << 8);
    const bmpHeight = bytes[22] + (bytes[23] << 8);
    const offset = bytes[10] + (bytes[11] << 8);
    const depth = bytes[28];

    if (depth !== 24) {
      alert(
        "Only 24-bit BMP files are supported. Please convert your BMP file to a 24-bit depth bitmap."
      );
      return;
    }

    const rowSize = Math.floor((24 * bmpWidth + 31) / 32) * 4;
    const newWidth = Math.ceil(bmpWidth / 16) * 16;
    const newHeight = bmpHeight;

    const newGrid: boolean[][] = [];
    for (let i = 0; i < newHeight; i++) {
      newGrid[i] = new Array(newWidth).fill(false);
    }

    for (let y = 0; y < bmpHeight; y++) {
      const row = bmpHeight - 1 - y;
      for (let x = 0; x < bmpWidth; x++) {
        const index = offset + row * rowSize + x * 3;
        const blue = bytes[index];
        const green = bytes[index + 1];
        const red = bytes[index + 2];
        const luminance = (red + green + blue) / 3;
        newGrid[y][x] = luminance < 128;
      }
    }

    setWidth(newWidth);
    setHeight(newHeight);
    setGrid(newGrid);
  }, []);

  const parsePNG = useCallback((file: File) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    img.onload = () => {
      const newWidth = Math.ceil(img.width / 16) * 16;
      const newHeight = img.height;

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, newWidth, newHeight);
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, newWidth, newHeight).data;

      const newGrid: boolean[][] = [];
      for (let y = 0; y < newHeight; y++) {
        newGrid[y] = new Array(newWidth).fill(false);
        for (let x = 0; x < newWidth; x++) {
          const index = (y * newWidth + x) * 4;
          const r = imageData[index];
          const g = imageData[index + 1];
          const b = imageData[index + 2];
          const a = imageData[index + 3];
          const luminance = (r + g + b) / 3;
          newGrid[y][x] = a > 0 && luminance < 250;
        }
      }

      setWidth(newWidth);
      setHeight(newHeight);
      setGrid(newGrid);
    };
  }, []);

  return (
    <div className="Page BitmapPage grid" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Canvas Panel */}
      <Panel
        className="canvas-panel"
        header={
          <div className="canvas-size-controls">
            <label htmlFor="inputWidth">Canvas Size:</label>
            <input
              ref={widthInputRef}
              id="inputWidth"
              type="text"
              placeholder="width"
              maxLength={3}
              defaultValue={width}
            />
            <span>x</span>
            <input
              ref={heightInputRef}
              id="inputHeight"
              type="text"
              placeholder="height"
              maxLength={3}
              defaultValue={height}
            />
            <label htmlFor="pixelSize">Pixel size:</label>
            <input
              ref={pixelSizeInputRef}
              id="pixelSize"
              type="text"
              placeholder="px"
              maxLength={2}
              defaultValue={pixelSize}
            />
            <button onClick={handleResize} title="Resize Canvas Preserving Upper-left Contents">
              Resize
            </button>
            <button onClick={handleReset} title="Reset Canvas Size, Settings, and Clear Contents">
              Reset
            </button>
          </div>
        }
      >
        <div style={{ overflow: "auto", padding: "var(--spacing)" }}>
          <table
            className={`canvas-grid ${obviousStyling ? "obvious-edges" : ""}`}
            onMouseLeave={handleMouseUp}
          >
            <tbody>
              {/* Column labels row */}
              <tr>
                <td></td>
                {Array.from({ length: width }, (_, j) => (
                  <td key={`col-${j}`} className="col-label" style={{ fontSize: `${pixelSize * 0.6}px` }}>
                    {j + 1}
                  </td>
                ))}
              </tr>
              {/* Grid rows */}
              {Array.from({ length: height }, (_, i) => (
                <tr key={`row-${i}`}>
                  <td className="row-label" style={{ fontSize: `${pixelSize * 0.6}px` }}>
                    {i + 1}
                  </td>
                  {Array.from({ length: width }, (_, j) => (
                    <td
                      key={`cell-${i}-${j}`}
                      className={`cell ${grid[i]?.[j] ? "filled" : "empty"} ${wordEdgeColumns.has(j) ? "word-edge" : ""
                        }`}
                      style={{ width: pixelSize, height: pixelSize }}
                      onMouseDown={() => handleCellMouseDown(i, j)}
                      onMouseOver={() => handleCellMouseOver(i, j)}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Code Panel */}
      <Panel
        className="code-panel"
        header={
          <div className="tab-container">
            <button
              className={`tab-button ${codeMode === "jack" ? "active" : ""}`}
              onClick={() => setCodeMode("jack")}
            >
              Generated Jack Code
            </button>
            <button
              className={`tab-button ${codeMode === "hack" ? "active" : ""}`}
              onClick={() => setCodeMode("hack")}
            >
              Generated Hack Assembly
            </button>
          </div>
        }
      >
        <textarea
          className="generated-code"
          readOnly
          value={generatedCode}
        />
      </Panel>

      {/* Controls Panel */}
      <Panel className="controls-panel">
        {/* Row 1: Manipulation buttons */}
        <div className="control-row">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden-file-input"
            accept=".bmp, .png, image/bmp, image/png"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import BMP (24-bit) or PNG (black and white) file"
          >
            Import Image
          </button>

          <div className="button-group">
            <button onClick={shiftLeft}>Shift left &lt;</button>
            <button onClick={shiftRight}>Shift right &gt;</button>
            <button onClick={shiftUp}>Shift up ^</button>
            <button onClick={shiftDown}>Shift down v</button>
            <button onClick={clearShifting}>Clear Shifting</button>
          </div>

          <div className="spacer" />

          <div className="button-group">
            <button onClick={rotateBitmapRight} disabled={width !== height}>
              Rotate right
            </button>
            <button onClick={mirrorBitmap}>Flip horizontally</button>
            <button onClick={invertBitmap}>Invert</button>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={invertMode}
                onChange={(e) => setInvertMode(e.target.checked)}
              />
              Inverted Mode
            </label>
          </div>

          <div className="spacer" />

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={pauseCode}
                onChange={(e) => setPauseCode(e.target.checked)}
              />
              Pause Code Generation
            </label>
            <label>
              <input
                type="checkbox"
                checked={comments}
                onChange={(e) => setComments(e.target.checked)}
              />
              Comments On
            </label>
            <label>
              <input
                type="checkbox"
                checked={obviousStyling}
                onChange={(e) => setObviousStyling(e.target.checked)}
              />
              Obvious Word Edges
            </label>
          </div>
        </div>

        {/* Row 2: Margin type controls */}
        <div className="control-row">
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="marginType"
                checked={marginType === "fitToDrawing"}
                onChange={() => setMarginType("fitToDrawing")}
              />
              Fit to drawing
            </label>
            <label>
              <input
                type="radio"
                name="marginType"
                checked={marginType === "rectangular"}
                onChange={() => setMarginType("rectangular")}
              />
              Rectangular
            </label>
            <label>
              <input
                type="radio"
                name="marginType"
                checked={marginType === "fullCanvas"}
                onChange={() => setMarginType("fullCanvas")}
              />
              Full Canvas
            </label>
          </div>

          {marginType === "fitToDrawing" && (
            <div className="input-group">
              <label htmlFor="marginSaveFrames"># horizontal shifts per animation frame:</label>
              <input
                ref={marginFramesInputRef}
                id="marginSaveFrames"
                type="text"
                maxLength={2}
                defaultValue={marginSaveFrames}
                onChange={handleMarginFramesChange}
              />
            </div>
          )}
        </div>

        {/* Row 3: Base address controls */}
        <div className="control-row">
          <span>Base address:</span>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="baseRowFrom"
                checked={baseTopLeft}
                onChange={() => setBaseTopLeft(true)}
              />
              Top Left
            </label>
            <label>
              <input
                type="radio"
                name="baseRowFrom"
                checked={!baseTopLeft}
                onChange={() => setBaseTopLeft(false)}
              />
              Bottom Left
            </label>
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default BitmapEditor;
