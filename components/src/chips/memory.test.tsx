import { Memory as MemoryChip } from "@nand2tetris/simulator/cpu/memory.js";
import { range } from "@davidsouther/jiffies/lib/esm/range.js";
import { render, screen } from "@testing-library/react";
import { MemoryBlock, MemoryCell } from "./memory.js";

describe("<Memory />", () => {
  describe("<MemoryCell />", () => {
    it("renders a read-only cell", () => {
      render(<MemoryCell index={16} value={"34"} />);

      const addr = screen.getByText("0x0010");
      expect(addr).toBeVisible();

      const cell = screen.getByText("34");
      expect(cell).toBeVisible();
    });
  });

  describe("<MemoryBlock />", () => {
    it.skip("renders a small amount of memory", () => {
      const memory = new MemoryChip(
        new Int16Array(
          range(0, 16).map((i) => (Math.pow(i, 12) ^ 0x9753) & 0xffff)
        )
      );
      render(<MemoryBlock memory={memory} />);

      const zero = screen.getByText("0x0000");
      expect(zero).toBeVisible();

      // const indexes = document.querySelectorAll("code:nth-of-type(even)");
      // expect(indexes.length).toBe(16);

      // const cells = document.querySelectorAll("code:nth-of-type(even)");
      // expect(cells.length).toBe(16);
    });
  });
});
