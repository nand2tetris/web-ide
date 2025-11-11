import {
  Err,
  isErr,
  Ok,
  Result,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { CompilationError, createError, Span } from "../languages/base.js";
import {
  ArrayAccess,
  Class,
  ClassVarDec,
  DoStatement,
  Expression,
  IfStatement,
  isPrimitive,
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
  Variable,
  WhileStatement,
} from "../languages/jack.js";
import { Segment } from "../languages/vm.js";
import {
  makeInterface,
  overridesOsCorrectly,
  VM_BUILTINS,
} from "../vm/builtins.js";
import { validateSubroutine } from "./controlFlow.js";

const osClasses = new Set([
  "Sys",
  "Screen",
  "Output",
  "Keyboard",
  "String",
  "Array",
  "Memory",
  "Math",
]);

function isOsClass(name: string): boolean {
  return osClasses.has(name);
}

function isError(value: unknown): value is CompilationError {
  return (value as CompilationError).message != undefined;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function compile(
  files: Record<string, string>,
): Record<string, string | CompilationError> {
  const classes: Record<string, Class | CompilationError> = {};
  for (const [name, content] of Object.entries(files)) {
    const parsed = JACK.parse(content);
    if (isErr(parsed)) {
      classes[name] = Err(parsed);
    } else {
      const cls = Ok(parsed);
      const result = validateClass(cls);
      classes[name] =
        cls.name.value == name
          ? isErr(result)
            ? Err(result)
            : cls
          : createError(
              `Class name ${cls.name.value} doesn't match file name ${name}`,
              cls.name.span,
            );
    }
  }

  const validClasses: Record<string, Class> = Object.fromEntries(
    Object.entries(classes).filter(([_, parsed]) => !isError(parsed)),
  ) as Record<string, Class>;

  const vms: Record<string, string | CompilationError> = {};
  for (const [name, parsed] of Object.entries(classes)) {
    if (isError(parsed)) {
      vms[name] = parsed;
    } else {
      try {
        const compiled = new Compiler().compile(parsed, validClasses);
        if (isErr(compiled)) {
          vms[name] = Err(compiled);
        } else {
          vms[name] = Ok(compiled);
        }
      } catch (e) {
        vms[name] = e as CompilationError;
      }
    }
  }
  return vms;
}

function validateClass(cls: Class): Result<void, CompilationError> {
  const subroutineNames = new Set<string>();
  for (const subroutine of cls.subroutines) {
    if (subroutineNames.has(subroutine.name.value)) {
      return Err(
        createError(
          `Subroutine ${subroutine.name.value} already declared`,
          subroutine.name.span,
        ),
      );
    }
    subroutineNames.add(subroutine.name.value);
    const result = validateSubroutine(subroutine);
    if (isErr(result)) {
      return result;
    }
  }
  return Ok();
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

interface SubroutineCallAttributes {
  className: string;
  subroutineName: string;
  object?: string; // object being acted upon if this is a method (undefined if function / constructor)
}

export class Compiler {
  private instructions: string[] = [];
  globalSymbolTable: Record<string, VariableData> = {};
  localSymbolTable: Record<string, VariableData> = {};

  className = "";
  private classes: Record<string, Class> = {};

  private labelNum = 0;
  private fieldNum = 0;
  private staticNum = 0;
  private localNum = 0;

  get output(): string[] {
    return Array.from(this.instructions);
  }

  varData(name: string): VariableData | undefined {
    return this.localSymbolTable[name] || this.globalSymbolTable[name];
  }

  var(name: string): string;
  var(variable: Variable): string;
  var(variable: ArrayAccess): string;
  var(variable: LetStatement): string;
  var(arg: string | Variable | ArrayAccess | LetStatement): string {
    let name: string;
    let span: Span | undefined;
    if (typeof arg == "string") {
      name = arg;
    } else {
      if (typeof arg.name == "string") {
        name = arg.name;
        span = arg.span;
      } else {
        name = arg.name.value;
        span = arg.name.span;
      }
    }
    const data = this.varData(name);
    if (!data) {
      throw createError(`Undeclared variable ${name}`, span);
    }
    return `${data.segment} ${data.index}`;
  }

  write(...lines: string[]) {
    this.instructions.push(...lines);
  }

  getLabel() {
    const label = `${this.className}_${this.labelNum}`;
    this.labelNum += 1;
    return label;
  }

  compile(
    cls: Class,
    other?: Record<string, Class>,
  ): Result<string, CompilationError> {
    this.className = cls.name.value;
    this.classes = other ?? {};
    for (const varDec of cls.varDecs) {
      this.compileClassVarDec(varDec);
    }
    for (const subroutine of cls.subroutines) {
      this.compileSubroutineDec(subroutine);
    }
    return Ok(
      this.instructions
        .map((inst) =>
          inst.startsWith("function") || inst.startsWith("label")
            ? inst
            : "    ".concat(inst),
        )
        .join("\n"),
    );
  }

  validateType(type: string, span?: Span) {
    if (isPrimitive(type) || isOsClass(type) || this.classes[type]) {
      return;
    }
    throw createError(`Unknown type ${type}`, span);
  }

  validateReturnType(returnType: string, span?: Span) {
    if (returnType == "void") {
      return;
    }
    this.validateType(returnType, span);
  }

  compileClassVarDec(dec: ClassVarDec) {
    this.validateType(dec.type.value, dec.type.span);
    for (const name of dec.names) {
      if (dec.varType == "field") {
        this.globalSymbolTable[name] = {
          type: dec.type.value,
          segment: "this",
          index: this.fieldNum,
        };
        this.fieldNum += 1;
      } else {
        this.globalSymbolTable[name] = {
          type: dec.type.value,
          segment: "static",
          index: this.staticNum,
        };
        this.staticNum += 1;
      }
    }
  }

  compileVarDec(dec: VarDec) {
    this.validateType(dec.type.value, dec.type.span);
    for (const name of dec.names) {
      this.localSymbolTable[name] = {
        type: dec.type.value,
        segment: "local",
        index: this.localNum,
      };
      this.localNum += 1;
    }
  }

  registerArgs(params: Parameter[], offset = false) {
    let argNum = 0;
    for (const param of params) {
      this.validateType(param.type.value, param.type.span);
      this.localSymbolTable[param.name] = {
        type: param.type.value,
        segment: "argument",
        index: argNum + (offset ? 1 : 0), // when compiling a method the first argument is this, so we offset the others by 1
      };
      argNum += 1;
    }
  }

  validateSubroutineDec(subroutine: Subroutine) {
    this.validateReturnType(
      subroutine.returnType.value,
      subroutine.returnType.span,
    );

    if (isOsClass(this.className)) {
      const builtin = VM_BUILTINS[`${this.className}.${subroutine.name.value}`];

      if (builtin && !overridesOsCorrectly(this.className, subroutine)) {
        throw createError(
          `OS subroutine ${this.className}.${subroutine.name.value} must follow the interface ${makeInterface(subroutine.name.value, builtin)})`,
        );
      }
    }
  }

  compileSubroutineDec(subroutine: Subroutine) {
    this.validateSubroutineDec(subroutine);
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
    this.write(
      `function ${this.className}.${subroutine.name.value} ${localCount}`,
    );
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
    this.write("push argument 0", "pop pointer 0");
    this.compileStatements(subroutine.body.statements);
  }

  compileConstructor(subroutine: Subroutine) {
    this.compileSubroutineStart(subroutine);
    this.write(
      `push constant ${this.fieldNum}`,
      "call Memory.alloc 1",
      "pop pointer 0",
    );
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
        this.write(`push ${this.var(term)}`);
        break;
      case "keywordLiteral":
        this.compileKeywordLiteral(term.value);
        break;
      case "subroutineCall":
        this.compileSubroutineCall(term);
        break;
      case "arrayAccess":
        this.compileExpression(term.index);
        this.write(
          `push ${this.var(term)}`,
          "add",
          "pop pointer 1",
          "push that 0",
        );
        break;
      case "groupedExpression":
        this.compileExpression(term.expression);
        break;
      case "unaryExpression":
        this.compileTerm(term.term);
        this.write(unaryOps[term.op]);
    }
  }

  validateArgNum(name: string, expected: number, call: SubroutineCall) {
    const received = call.parameters.length;
    if (expected != received) {
      throw createError(
        `${name} expected ${expected} arguments, got ${received}`,
        call.span,
      );
    }
  }

  validateSubroutineCall(
    className: string,
    subroutineName: string,
    call: SubroutineCall,
    isMethod: boolean,
  ) {
    const builtin = VM_BUILTINS[`${className}.${subroutineName}`];
    if (builtin) {
      if (builtin.type == "method" && !isMethod) {
        throw createError(
          `Method ${className}.${subroutineName} was called as a function/constructor`,
          call.name.span,
        );
      }
      if (builtin.type != "method" && isMethod) {
        throw createError(
          `${capitalize(
            builtin.type,
          )} ${className}.${subroutineName} was called as a method`,
          call.name.span,
        );
      }
      this.validateArgNum(
        `${className}.${subroutineName}`,
        builtin.args.length,
        call,
      );
      return;
    } else if (this.classes[className]) {
      for (const subroutine of this.classes[className].subroutines) {
        if (subroutine.name.value == subroutineName) {
          if (subroutine.type == "method" && !isMethod) {
            throw createError(
              `Method ${className}.${subroutineName} was called as a function/constructor`,
              call.name.span,
            );
          }
          if (subroutine.type != "method" && isMethod) {
            throw createError(
              `${capitalize(
                subroutine.name.value,
              )} ${className}.${subroutineName} was called as a method`,
              call.name.span,
            );
          }
          this.validateArgNum(
            `${className}.${subroutineName}`,
            subroutine.parameters.length,
            call,
          );
          return;
        }
      }
      throw createError(
        `Class ${className} doesn't contain a function/constructor ${subroutineName}`,
        call.name.span,
      );
    } else {
      throw createError(`Class ${className} doesn't exist`, call.name.span);
    }
  }

  classifySubroutineCall(call: SubroutineCall): SubroutineCallAttributes {
    let object: string | undefined;
    let className = "";
    let subroutineName = "";

    if (call.name.value.includes(".")) {
      const [prefix, suffix] = call.name.value.split(".", 2);
      subroutineName = suffix;
      const varData = this.varData(prefix);
      if (varData) {
        // external method call
        object = this.var(prefix);
        className = varData.type;
      } else {
        // function / constructor call
        className = prefix;
      }
    } else {
      object = "pointer 0"; // this
      className = this.className;
      subroutineName = call.name.value;
    }

    this.validateSubroutineCall(
      className,
      subroutineName,
      call,
      object != undefined,
    );

    return { className, subroutineName, object };
  }

  compileSubroutineCall(call: SubroutineCall) {
    const attributes = this.classifySubroutineCall(call);

    if (attributes.object) {
      this.write(`push ${attributes.object}`);
    }
    for (const param of call.parameters) {
      this.compileExpression(param);
    }
    this.write(
      `call ${attributes.className}.${attributes.subroutineName} ${
        call.parameters.length + (attributes.object ? 1 : 0)
      }`,
    );
  }

  compileStringLiteral(str: string) {
    this.write(`push constant ${str.length}`, `call String.new 1`);
    for (let i = 0; i < str.length; i++) {
      this.write(
        `push constant ${str.charCodeAt(i)}`,
        `call String.appendChar 2`,
      );
    }
  }

  compileKeywordLiteral(keyword: KeywordConstant) {
    switch (keyword) {
      case "true":
        this.write(`push constant 1`, `neg`);
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
      this.write(`push ${this.var(statement)}`, "add");
      this.compileExpression(statement.value);
      this.write("pop temp 0", "pop pointer 1", "push temp 0", "pop that 0");
    } else {
      this.compileExpression(statement.value);
      this.write(`pop ${this.var(statement)}`);
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
    this.write("not", `if-goto ${condFalse}`);
    this.compileStatements(statement.body);
    this.write(`goto ${condTrue}`, `label ${condFalse}`);
    this.compileStatements(statement.else);
    this.write(`label ${condTrue}`);
  }

  compileWhile(statement: WhileStatement) {
    const loop = this.getLabel();
    const exit = this.getLabel();

    this.write(`label ${loop}`);
    this.compileExpression(statement.condition);
    this.write(`not`, `if-goto ${exit}`);
    this.compileStatements(statement.body);
    this.write(`goto ${loop}`, `label ${exit}`);
  }
}
