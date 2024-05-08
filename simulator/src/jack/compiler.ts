import {
  Err,
  Ok,
  Result,
  isErr,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { CompilationError } from "../languages/base.js";
import {
  Class,
  ClassVarDec,
  DoStatement,
  Expression,
  IfStatement,
  JACK,
  KeywordConstant,
  LetStatement,
  Op,
  Parameter,
  ReturnStatement,
  Statement,
  Subroutine,
  SubroutineCall,
  Term,
  Type,
  UnaryOp,
  VarDec,
  WhileStatement,
} from "../languages/jack.js";
import { Segment } from "../languages/vm.js";

export function compile(source: string): Result<string, CompilationError> {
  const parsed = JACK.parse(source);
  if (isErr(parsed)) {
    return parsed;
  }
  try {
    return new Compiler().compile(Ok(parsed));
  } catch (e) {
    console.error(e);
    return Err(e as Error);
  }
}

interface VariableData {
  type: Type;
  segment: Segment;
  index: number;
}

const ops: Record<Op, string> = {
  "+": "add",
  "-": "sub",
  "*": "call Math.multiply 2",
  "/": "call Math.divide 2",
  "&": "and",
  "|": "or",
  "<": "lt",
  ">": "gt",
  "=": "eq",
};

const unaryOps: Record<UnaryOp, string> = {
  "-": "neg",
  "~": "not",
};

class Compiler {
  private instructions: string[] = [];
  private globalSymbolTable: Record<string, VariableData> = {};
  private localSymbolTable: Record<string, VariableData> = {};

  private className = "";

  private labelNum = 0;
  private fieldNum = 0;
  private staticNum = 0;
  private localNum = 0;

  varData(name: string): VariableData | undefined {
    return this.localSymbolTable[name] || this.globalSymbolTable[name];
  }

  var(name: string) {
    const data = this.varData(name);
    return `${data?.segment} ${data?.index}`;
  }

  write(line: string) {
    this.instructions.push(line);
  }

  writeMultiple(lines: string[]) {
    for (const line of lines) {
      this.write(line);
    }
  }

  getLabel() {
    const label = `L${this.labelNum}`;
    this.labelNum += 1;
    return label;
  }

  compile(cls: Class): Result<string, CompilationError> {
    this.className = cls.name;
    for (const varDec of cls.varDecs) {
      this.compileClassVarDec(varDec);
    }
    for (const subroutine of cls.subroutines) {
      this.compileSubroutineDec(subroutine);
    }
    return Ok(this.instructions.join("\n"));
  }

  compileClassVarDec(dec: ClassVarDec) {
    for (const name of dec.names) {
      if (dec.varType == "field") {
        this.globalSymbolTable[name] = {
          type: dec.type,
          segment: "this",
          index: this.fieldNum,
        };
        this.fieldNum += 1;
      } else {
        this.globalSymbolTable[name] = {
          type: dec.type,
          segment: "static",
          index: this.staticNum,
        };
        this.staticNum += 1;
      }
    }
  }

  compileVarDec(dec: VarDec) {
    for (const name of dec.names) {
      this.localSymbolTable[name] = {
        type: dec.type,
        segment: "local",
        index: this.localNum,
      };
      this.localNum += 1;
    }
  }

  registerArgs(params: Parameter[], offset = false) {
    let argNum = 0;
    for (const param of params) {
      this.localSymbolTable[param.name] = {
        type: param.type,
        segment: "argument",
        index: argNum + (offset ? 1 : 0), // when compiling a method the first argument is this, so we offset the others by 1
      };
      argNum += 1;
    }
  }

  compileSubroutineDec(subroutine: Subroutine) {
    switch (subroutine.type) {
      case "method":
        this.compileMethod(subroutine);
        break;
      case "constructor":
        this.compileConstructor(subroutine);
        break;
      case "function":
        this.compileFunction(subroutine);
    }
  }

  compileSubroutineStart(subroutine: Subroutine, isMethod = false) {
    this.localSymbolTable = {};
    this.localNum = 0;
    this.registerArgs(subroutine.parameters, isMethod);

    const localCount = subroutine.body.varDecs
      .map((dec) => dec.names.length)
      .reduce((a, b) => a + b, 0);
    this.write(`function ${this.className}.${subroutine.name} ${localCount}`);
    for (const varDec of subroutine.body.varDecs) {
      this.compileVarDec(varDec);
    }
  }

  compileFunction(subroutine: Subroutine) {
    this.compileSubroutineStart(subroutine);
    this.compileStatements(subroutine.body.statements);
  }

  compileMethod(subroutine: Subroutine) {
    this.compileSubroutineStart(subroutine, true);
    this.writeMultiple(["push argument 0", "pop pointer 0"]);
    this.compileStatements(subroutine.body.statements);
  }

  compileConstructor(subroutine: Subroutine) {
    this.compileSubroutineStart(subroutine);
    this.writeMultiple([
      `push constant ${this.fieldNum}`,
      "call Memory.alloc 1",
      "pop pointer 0",
    ]);
    this.compileStatements(subroutine.body.statements);
  }

  compileExpression(expression: Expression) {
    this.compileTerm(expression.term);
    for (const part of expression.rest) {
      this.compileTerm(part.term);
      this.compileOp(part.op); // postfix
    }
  }

  compileOp(op: Op) {
    this.write(ops[op]);
  }

  compileTerm(term: Term) {
    switch (term.termType) {
      case "numericLiteral":
        this.write(`push constant ${term.value}`);
        break;
      case "stringLiteral":
        this.compileStringLiteral(term.value);
        break;
      case "variable":
        this.write(`push ${this.var(term.name)}`);
        break;
      case "keywordLiteral":
        this.compileKeywordLiteral(term.value);
        break;
      case "subroutineCall":
        this.compileSubroutineCall(term);
        break;
      case "arrayAccess":
        this.compileExpression(term.index);
        this.writeMultiple([
          `push ${this.var(term.name)}`,
          "add",
          "pop pointer 1",
          "push that 0",
        ]);
        break;
      case "groupedExpression":
        this.compileExpression(term.expression);
        break;
      case "unaryExpression":
        this.compileTerm(term.term);
        this.write(unaryOps[term.op]);
    }
  }

  compileSubroutineCall(call: SubroutineCall) {
    let object = "";
    let className = "";
    let subroutineName = "";
    let isMethod = true;

    if (call.name.includes(".")) {
      const [prefix, suffix] = call.name.split(".");
      subroutineName = suffix;
      const varData = this.varData(prefix);
      if (varData) {
        // method call
        object = this.var(prefix);
        className = varData.type;
      } else {
        // function call
        isMethod = false;
        className = prefix;
      }
    } else {
      object = "pointer 0"; // this
      className = this.className;
      subroutineName = call.name;
    }
    if (isMethod) {
      this.write(`push ${object}`);
    }
    for (const param of call.parameters) {
      this.compileExpression(param);
    }
    this.write(
      `call ${className}.${subroutineName} ${
        call.parameters.length + (isMethod ? 1 : 0)
      }`
    );
  }

  compileStringLiteral(str: string) {
    this.writeMultiple([`push constant ${str.length}`, `call String.new 1`]);
    for (let i = 0; i < str.length; i++) {
      this.writeMultiple([
        `push constant ${str.charCodeAt(i)}`,
        `call String.appendChar 2`,
      ]);
    }
  }

  compileKeywordLiteral(keyword: KeywordConstant) {
    switch (keyword) {
      case "true":
        this.write(`push constant 1`);
        break;
      case "false":
        this.write(`push constant 0`);
        break;
      case "null":
        this.write(`push constant 0`);
        break;
      case "this":
        this.write(`push pointer 0`);
    }
  }

  compileStatements(statements: Statement[]) {
    for (const statement of statements) {
      this.compileStatement(statement);
    }
  }

  compileStatement(statement: Statement) {
    switch (statement.statementType) {
      case "doStatement":
        this.compileDoStatement(statement);
        break;
      case "ifStatement":
        this.compileIf(statement);
        break;
      case "letStatement":
        this.compileLet(statement);
        break;
      case "returnStatement":
        this.compileReturn(statement);
        break;
      case "whileStatement":
        this.compileWhile(statement);
    }
  }

  compileReturn(statement: ReturnStatement) {
    if (statement.value) {
      this.compileExpression(statement.value);
    } else {
      this.write(`push constant 0`); // return 0
    }
    this.write(`return`);
  }

  compileLet(statement: LetStatement) {
    if (statement.arrayIndex) {
      this.compileExpression(statement.arrayIndex);
      this.writeMultiple([`push ${this.var(statement.name)}`, "add"]);
      this.compileExpression(statement.value);
      this.writeMultiple([
        "pop temp 0",
        "pop pointer 1",
        "push temp 0",
        "pop that 0",
      ]);
    } else {
      this.compileExpression(statement.value);
      this.write(`pop ${this.var(statement.name)}`);
    }
  }

  compileDoStatement(statement: DoStatement) {
    this.compileSubroutineCall(statement.call);
    this.write(`pop temp 0`);
  }

  compileIf(statement: IfStatement) {
    const condTrue = this.getLabel();
    const condFalse = this.getLabel();

    this.compileExpression(statement.condition);
    this.writeMultiple(["not", `if-goto ${condFalse}`]);
    this.compileStatements(statement.body);
    this.writeMultiple([`goto ${condTrue}`, `label ${condFalse}`]);
    this.compileStatements(statement.else);
    this.write(`label ${condTrue}`);
  }

  compileWhile(statement: WhileStatement) {
    const loop = this.getLabel();
    const exit = this.getLabel();

    this.write(`label ${loop}`);
    this.compileExpression(statement.condition);
    this.writeMultiple([`not`, `if-goto ${exit}`]);
    this.compileStatements(statement.body);
    this.writeMultiple([`goto ${loop}`, `label ${exit}`]);
  }
}
