import { Err, isErr, Ok, Result } from "@davidsouther/jiffies/result.ts";
import {
  Diagnostic,
  DiagnosticArgs,
  DiagnosticCode,
  Diagnostics,
  describeEnglish,
  diagnostic,
  mergeDiagnostics,
  Origin,
  Origins,
  originsOf,
  Provenance,
  Recovered,
  recoveredOf,
  Span,
  semanticError,
  skipsAny,
  Valid,
} from "../languages/base.js";
import {
  ArrayAccess,
  Class,
  ClassVarDec,
  DoStatement,
  Expression,
  IfStatement,
  isPrimitive,
  JACK,
  JackSkipKind,
  KeywordConstant,
  LetStatement,
  Op,
  Parameter,
  prune,
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

/** Options of the Jack final call. */
export interface CompileOptions {
  /** Recover from syntax errors to keep checking. Default true. */
  attemptRecovery?: boolean;
}

/**
 * What a class's checks know of the declarations recovery damaged: each
 * class's provenance by name, and the names of the files that built no class
 * of that name.
 */
export interface Damage {
  readonly provenance: Readonly<Record<string, Provenance>>;
  readonly lost: ReadonlySet<string>;
}

const NO_DAMAGE: Damage = { provenance: {}, lost: new Set() };

/** Skipped nodes that could declare a variable of their scope. */
const DECLARES_VARIABLE: ReadonlySet<string> = new Set<JackSkipKind>([
  "ClassStart",
  "ClassVarDecBody",
  "VarDecBody",
]);

/** Skipped nodes that declare variables of the whole class, not of one subroutine. */
const DECLARES_CLASS_VARIABLE: ReadonlySet<string> = new Set<JackSkipKind>([
  "ClassStart",
  "ClassVarDecBody",
]);

/** Skipped nodes that could name their class. */
const NAMES_CLASS: ReadonlySet<string> = new Set<JackSkipKind>([
  "ClassHead",
  "ClassStart",
]);

/** Skipped nodes that could declare a subroutine of their class. */
const DECLARES_SUBROUTINE: ReadonlySet<string> = new Set<JackSkipKind>([
  "SubroutineHead",
  "ClassClose",
]);

/** Skipped statements, at any depth of a subroutine body, that could return. */
const SKIPS_STATEMENT: ReadonlySet<string> = new Set<JackSkipKind>([
  "LetBody",
  "DoBody",
  "ReturnBody",
  "IfHead",
  "WhileHead",
  "SubroutineBodyClose",
  "IfClose",
  "ElseClose",
  "WhileClose",
]);

/**
 * Compiles each Jack file by name. Each value is the file's VM text when the
 * file has no diagnostic, and otherwise its merged diagnostics.
 *
 * A file that recovered from syntax errors still has its class checked and
 * compiled from the pruned tree, and its intact declarations serve the other
 * files; a file that built no class contributes none. Keys are class names.
 */
export function compile(
  files: Record<string, string>,
  options: CompileOptions = {},
): Record<string, string | Diagnostics> {
  const { lists, origins, classes, damage } = checkFiles(
    files,
    options.attemptRecovery ?? true,
  );
  const vms: Record<string, string | Diagnostics> = {};
  for (const [name, list] of Object.entries(lists)) {
    const cls = classes[name];
    if (cls !== undefined) {
      const compiled = new Compiler().compile(cls, classes, damage);
      if (isErr(compiled)) {
        list.push(...Err(compiled));
      } else if (list.length === 0) {
        vms[name] = Ok(compiled);
        continue;
      }
    }
    // A file without a compiled class always has a diagnostic.
    const [first, ...rest] = list;
    if (first !== undefined) {
      vms[name] = mergeDiagnostics([first, ...rest], origins);
    }
  }
  return vms;
}

/** Each file's parse and class diagnostics, and the classes other files may use. */
interface CheckedFiles {
  readonly lists: Record<string, Diagnostic[]>;
  readonly origins: Origins;
  readonly classes: Record<string, Valid<Class>>;
  readonly damage: Damage;
}

/**
 * Parses and checks each file. A class enters the table when its file built
 * one under its own name; otherwise the file's name is lost.
 */
function checkFiles(
  files: Record<string, string>,
  attemptRecovery: boolean,
): CheckedFiles {
  const lists: Record<string, Diagnostic[]> = {};
  const origins = new Map<Diagnostic, Origin>();
  const classes: Record<string, Valid<Class>> = {};
  const provenance: Record<string, Provenance> = {};
  const lost = new Set<string>();
  for (const [name, content] of Object.entries(files)) {
    const outcome = JACK.parse(content, { attemptRecovery });
    const diagnostics: Diagnostic[] = [...outcome.diagnostics];
    lists[name] = diagnostics;
    const recovered = recoveredOf(outcome, prune);
    if (recovered === undefined) {
      lost.add(name);
      continue;
    }
    for (const [diagnostic, origin] of originsOf(recovered.provenance)) {
      origins.set(diagnostic, origin);
    }
    diagnostics.push(...validateClass(recovered));
    // Suppressed: a class name that does not match its file, when recovery
    // skipped the header that names the class.
    const cls = namedClass(recovered, name);
    if (cls.name.value != name) {
      diagnostics.push(
        semanticError(
          "jack.classNameMismatch",
          { name: cls.name.value, file: name },
          cls.name.span,
        ),
      );
      lost.add(name);
      continue;
    }
    classes[name] = cls;
    provenance[name] = recovered.provenance;
  }

  return { lists, origins, classes, damage: { provenance, lost } };
}

/**
 * The class a file built, named for the file when recovery skipped its
 * header: the header could have named it so, and no other name lets the
 * class serve its file.
 */
function namedClass({ ast, provenance }: Recovered<Class>, file: string) {
  return skipsAny(provenance, NAMES_CLASS)
    ? { ...ast, name: { ...ast.name, value: file } }
    : ast;
}

/**
 * Every class level diagnostic: each repeated subroutine name, and each
 * subroutine's control flow diagnostics.
 */
function validateClass({
  ast: cls,
  provenance,
}: Recovered<Class>): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const subroutineNames = new Set<string>();
  for (const subroutine of cls.subroutines) {
    const name = subroutine.name.value;
    if (subroutineNames.has(name)) {
      diagnostics.push(
        semanticError(
          "jack.duplicateSubroutine",
          { name },
          subroutine.name.span,
        ),
      );
    }
    subroutineNames.add(name);
    const holdsSkip = provenance.some(
      ({ kind, scope }) => SKIPS_STATEMENT.has(kind) && scope[1] === name,
    );
    diagnostics.push(...validateSubroutine(subroutine, { holdsSkip }));
  }
  return diagnostics;
}

/**
 * Stops compiling the current declaration or statement. `diagnostic` is what
 * stopped it, or undefined when a check was suppressed.
 */
class Halt extends Error {
  constructor(readonly diagnostic?: Diagnostic) {
    super(
      diagnostic === undefined ? "suppressed" : describeEnglish(diagnostic),
    );
  }
}

/** A failure while compiling, stopping the current declaration or statement. */
function compileError<C extends DiagnosticCode>(
  code: C,
  args: DiagnosticArgs[C],
  span?: Span,
): Halt {
  return new Halt(diagnostic(code, args, span, "compile"));
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
  private damage: Damage = NO_DAMAGE;
  /** The subroutine being compiled, which scopes its locals' provenance. */
  private subroutineName = "";
  /** Declared types already reported unknown; checks that need them are withheld. */
  private invalidTypes = new Set<string>();
  private diagnostics: Diagnostic[] = [];

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
      // Suppressed: an undeclared variable when a skipped class variable or
      // local declaration of this scope could have declared it. A skipped
      // statement declares nothing.
      throw this.mayDeclareVariable()
        ? new Halt()
        : compileError("jack.undeclaredVariable", { name }, span);
    }
    return `${data.segment} ${data.index}`;
  }

  /** True when a skipped declaration in scope could declare a variable. */
  private mayDeclareVariable(): boolean {
    return (this.damage.provenance[this.className] ?? []).some(
      ({ kind, scope }) =>
        DECLARES_VARIABLE.has(kind) &&
        (DECLARES_CLASS_VARIABLE.has(kind) || scope[1] === this.subroutineName),
    );
  }

  /** True when a skipped header of class `className` could declare a subroutine. */
  private mayDeclareSubroutine(className: string): boolean {
    return skipsAny(
      this.damage.provenance[className] ?? [],
      DECLARES_SUBROUTINE,
    );
  }

  /**
   * Runs one declaration's or statement's compilation, keeping its failure as
   * a diagnostic so the next one still compiles. An unexpected error becomes a
   * spanless `compile` diagnostic.
   */
  private contain(action: () => void) {
    try {
      action();
    } catch (e) {
      if (e instanceof Halt) {
        if (e.diagnostic !== undefined) this.diagnostics.push(e.diagnostic);
      } else {
        this.diagnostics.push(
          diagnostic(
            "error.unexpected",
            { message: e instanceof Error ? e.message : String(e) },
            undefined,
            "compile",
          ),
        );
      }
    }
  }

  write(...lines: string[]) {
    this.instructions.push(...lines);
  }

  getLabel() {
    const label = `${this.className}_${this.labelNum}`;
    this.labelNum += 1;
    return label;
  }

  /**
   * The class's VM text, or every diagnostic of its declarations, subroutine
   * headers and statements. `other` holds the classes it may use, and `damage`
   * what recovery skipped in them.
   */
  compile(
    cls: Valid<Class>,
    other?: Record<string, Valid<Class>>,
    damage: Damage = NO_DAMAGE,
  ): Result<string, Diagnostics> {
    this.className = cls.name.value;
    this.classes = other ?? {};
    this.damage = damage;
    for (const varDec of cls.varDecs) {
      this.contain(() => this.compileClassVarDec(varDec));
    }
    for (const subroutine of cls.subroutines) {
      this.contain(() => this.compileSubroutineDec(subroutine));
    }
    const [first, ...rest] = this.diagnostics;
    if (first !== undefined) {
      return Err([first, ...rest]);
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

  /**
   * Suppressed: an unknown type, when a file of that name built no class: its
   * own diagnostics report the damage.
   */
  validateType(type: string, span?: Span) {
    if (isPrimitive(type) || isOsClass(type) || this.classes[type]) {
      return;
    }
    this.invalidTypes.add(type);
    if (!this.damage.lost.has(type)) {
      throw compileError("jack.unknownType", { type }, span);
    }
  }

  /** Validates a declared type, reporting its failure and going on. */
  private checkType(type: string, span?: Span) {
    this.contain(() => this.validateType(type, span));
  }

  validateReturnType(returnType: string, span?: Span) {
    if (returnType == "void") {
      return;
    }
    this.validateType(returnType, span);
  }

  /** Registers the names even when their type is invalid. */
  compileClassVarDec(dec: ClassVarDec) {
    this.checkType(dec.type.value, dec.type.span);
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

  /** Registers the names even when their type is invalid. */
  compileVarDec(dec: VarDec) {
    this.checkType(dec.type.value, dec.type.span);
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
      this.checkType(param.type.value, param.type.span);
      this.localSymbolTable[param.name] = {
        type: param.type.value,
        segment: "argument",
        index: argNum + (offset ? 1 : 0), // when compiling a method the first argument is this, so we offset the others by 1
      };
      argNum += 1;
    }
  }

  /** Checks the return type and the OS interface, reporting each failure. */
  validateSubroutineDec(subroutine: Subroutine) {
    this.contain(() =>
      this.validateReturnType(
        subroutine.returnType.value,
        subroutine.returnType.span,
      ),
    );
    this.contain(() => this.validateOsInterface(subroutine));
  }

  private validateOsInterface(subroutine: Subroutine) {
    if (isOsClass(this.className)) {
      const builtin = VM_BUILTINS[`${this.className}.${subroutine.name.value}`];

      if (builtin && !overridesOsCorrectly(this.className, subroutine)) {
        throw compileError("jack.osInterface", {
          class: this.className,
          subroutine: subroutine.name.value,
          signature: makeInterface(subroutine.name.value, builtin),
        });
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
    this.subroutineName = subroutine.name.value;
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

    if (this.fieldNum > 0)
      this.write(
        `push constant ${this.fieldNum}`,
        "call Memory.alloc 1",
        "pop pointer 0",
      );
    else this.write("push constant 0", "pop pointer 0");

    this.compileStatements(subroutine.body.statements);
  }

  compileExpression(expression: Expression) {
    this.compileTerm(expression.term);
    for (const part of expression.rest) {
      this.compileTerm(part.term);
      this.compileOp(part.op);
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
      throw compileError(
        "jack.argCount",
        { name, expected, received },
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
        throw compileError(
          "jack.methodCalledAsFunction",
          { name: `${className}.${subroutineName}` },
          call.name.span,
        );
      }
      if (builtin.type != "method" && isMethod) {
        throw compileError(
          "jack.calledAsMethod",
          { kind: builtin.type, name: `${className}.${subroutineName}` },
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
            throw compileError(
              "jack.methodCalledAsFunction",
              { name: `${className}.${subroutineName}` },
              call.name.span,
            );
          }
          if (subroutine.type != "method" && isMethod) {
            throw compileError(
              "jack.calledAsMethod",
              { kind: subroutine.type, name: `${className}.${subroutineName}` },
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
      // Suppressed: a missing subroutine, when recovery skipped a subroutine
      // header of that class, which could have declared it.
      if (!this.mayDeclareSubroutine(className)) {
        throw compileError(
          "jack.missingSubroutine",
          { class: className, subroutine: subroutineName },
          call.name.span,
        );
      }
    } else if (!this.damage.lost.has(className) && !this.mayDeclareVariable()) {
      // Suppressed: a missing class, when a file of that name built no
      // class, or when a skipped declaration could make it a variable.
      throw compileError(
        "jack.undefinedClass",
        { name: className },
        call.name.span,
      );
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
        if (this.invalidTypes.has(className)) {
          // Withheld: the type is already reported unknown.
          return { className, subroutineName, object };
        }
      } else {
        // function / constructor call
        className = prefix;
      }
    } else {
      object = "pointer 0";
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

    if (
      attributes.className === "Memory" &&
      attributes.subroutineName === "deAlloc" &&
      this.fieldNum === 0
    ) {
      for (const param of call.parameters) {
        this.compileExpression(param);
        this.write("pop temp 0");
      }

      this.write("push constant 0");
      return;
    }

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

  /** Compiles each statement, going on after one that fails. */
  compileStatements(statements: Statement[]) {
    for (const statement of statements) {
      this.contain(() => this.compileStatement(statement));
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
      this.write(`push constant 0`);
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

    // A failed condition still lets the intact bodies be checked.
    this.contain(() => this.compileExpression(statement.condition));
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
    this.contain(() => this.compileExpression(statement.condition));
    this.write(`not`, `if-goto ${exit}`);
    this.compileStatements(statement.body);
    this.write(`goto ${loop}`, `label ${exit}`);
  }
}
