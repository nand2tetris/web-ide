import { Err, Ok, isErr } from "@davidsouther/jiffies/lib/esm/result";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { compile } from "@nand2tetris/simulator/jack/compiler";
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

  const [jack, setJack] = useState(SAMPLE);
  const [parsed, setParsed] = useState<Class>();
  const [vm, setVm] = useState<string>();
  const [error, setError] = useState<CompilationError>();

  useEffect(() => {
    const parsed = JACK.parse(jack);

    if (isErr(parsed)) {
      setParsed(undefined);
      setError(Err(parsed));
      setStatus(Err(parsed).message);
    } else {
      setParsed(Ok(parsed));

      const vm = compile(jack);

      if (isErr(vm)) {
        setVm(undefined);
        setError(Err(vm));
        setStatus(Err(vm).message);
      } else {
        setVm(Ok(vm));
        setError(undefined);
        setStatus("");
      }
    }
  }, [jack]);

  return (
    <div className="Page CompilerPage grid">
      <Panel className="code">
        <Editor
          value={jack}
          onChange={(source: string) => {
            setJack(source);
          }}
          error={error}
          language={""}
        />
      </Panel>
      <Panel className="parsed">
        {parsed ? (
          <Editor
            value={JSON.stringify(parsed, null, 2)}
            onChange={(_) => {
              return;
            }}
            disabled={true}
            language={"json"}
          ></Editor>
        ) : (
          <p>{error?.message}</p>
        )}
      </Panel>
      <Panel className="compiled">
        {vm ? (
          <Editor
            value={vm}
            onChange={(_) => {
              return;
            }}
            disabled={true}
            language={"vm"}
          ></Editor>
        ) : (
          <p>{error?.message}</p>
        )}
      </Panel>
    </div>
  );
};

export default Compiler;
