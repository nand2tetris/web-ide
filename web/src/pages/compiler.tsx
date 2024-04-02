import { display } from "@davidsouther/jiffies/lib/esm/display.js";
import { Err, Ok, isErr } from "@davidsouther/jiffies/lib/esm/result";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { CompilationError } from "@nand2tetris/simulator/languages/base";
import { Class, JACK } from "@nand2tetris/simulator/languages/jack";
import { useContext, useEffect, useState } from "react";
import { Editor } from "src/shell/editor";
import { Panel } from "src/shell/panel";
import "./compiler.scss";

const SAMPLE = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/10/ArrayTest/Main.jack

// (same as projects/9/Average/Main.jack)

/** Computes the average of a sequence of integers. */
class Main {
    function void main() {
        var Array a;
        var int length;
        var int i, sum;
	
	let length = Keyboard.readInt("HOW MANY NUMBERS? ");
	let a = Array.new(length);
	let i = 0;
	
	while (i < length) {
	    let a[i] = Keyboard.readInt("ENTER THE NEXT NUMBER: ");
	    let i = i + 1;
	}
	
	let i = 0;
	let sum = 0;
	
	while (i < length) {
	    let sum = sum + a[i];
	    let i = i + 1;
	}
	
	do Output.printString("THE AVERAGE IS: ");
	do Output.printInt(sum / length);
	do Output.println();
	
	return;
    }
}`;

export const Compiler = () => {
  const { setStatus } = useContext(BaseContext);

  const [code, setCode] = useState(SAMPLE);
  const [parsed, setParsed] = useState<Class>();
  const [error, setError] = useState<CompilationError>();

  useEffect(() => {
    const compiled = JACK.parse(code);

    if (isErr(compiled)) {
      setParsed(undefined);
      setError(Err(compiled));
      setStatus(Err(compiled).message);
    } else {
      setParsed(Ok(compiled));
      setError(undefined);
      setStatus("");
    }
  }, [code]);

  return (
    <div className="Page CompilerPage grid">
      <Panel className="code">
        <Editor
          value={code}
          onChange={(source: string) => {
            setCode(source);
          }}
          error={error}
          language={""}
        />
      </Panel>
      <Panel className="parsed">
        <p>{parsed ? display(parsed) : "Syntax errors"}</p>
      </Panel>
    </div>
  );
};

export default Compiler;
