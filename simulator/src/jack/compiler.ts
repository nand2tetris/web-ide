import { Err, isErr, Ok, Result } from "@davidsouther/jiffies/result.ts";
import {
  mergeDiagnostics,
  Origin,
  Origins,
  originsOf,
  Provenance,
  Recovered,
  recoveredOf,
  Skip,
  semanticError,
  skipsAny,
  Valid,
} from "../languages/base.js";
import {
  Diagnostic,
  DiagnosticArgs,
  DiagnosticCode,
  Diagnostics,
  describeDiagnostic,
  diagnostic,
  Span,
  Stage,
} from "../languages/diagnostic.js";
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

export interface CompileOptions {
  /** Recover from syntax errors to keep checking. Default false. */
  attemptRecovery?: boolean;
}

/**
 * `provenance` records skipped input by class; `lost` lists input class names
 * whose source produced no usable class. Dependent name checks are withheld.
 */
export interface Damage {
  readonly provenance: Readonly<Record<string, Provenance>>;
  readonly lost: ReadonlySet<string>;
}

const NO_DAMAGE: Damage = { provenance: {}, lost: new Set() };

const DECLARES_VARIABLE: ReadonlySet<string> = new Set<JackSkipKind>([
  "ClassStart",
  "ClassVarDecBody",
  "VarDecBody",
]);

const DECLARES_CLASS_VARIABLE: ReadonlySet<string> = new Set<JackSkipKind>([
  "ClassStart",
  "ClassVarDecBody",
]);

const NAMES_CLASS: ReadonlySet<string> = new Set<JackSkipKind>([
  "ClassHead",
  "ClassStart",
]);

const DECLARES_SUBROUTINE: ReadonlySet<string> = new Set<JackSkipKind>([
  "SubroutineHead",
  "ClassClose",
]);

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
 * Returns VM text or merged diagnostics for each input class name.
 * Recovered files supply intact declarations to other classes, but receive
 * diagnostics instead of executable output. Files with no usable class
 * supply no declarations.
 */
export function compile(
  files: Record<string, string>,
  options: CompileOptions = {},
): Record<string, string | Diagnostics> {
  const { lists, origins, classes, damage } = checkFiles(
    files,
    options.attemptRecovery ?? false,
  );
  const vms: Record<string, string | Diagnostics> = Object.create(null);
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

    const [first, ...rest] = list;
    if (first !== undefined) {
      vms[name] = mergeDiagnostics([first, ...rest], origins);
    }
  }
  return vms;
}

interface CheckedFiles {
  readonly lists: Record<string, Diagnostic[]>;
  readonly origins: Origins;
  readonly classes: Record<string, Valid<Class>>;
  readonly damage: Damage;
}

function checkFiles(
  files: Record<string, string>,
  attemptRecovery: boolean,
): CheckedFiles {
  const lists: Record<string, Diagnostic[]> = Object.create(null);
  const origins = new Map<Diagnostic, Origin>();
  const classes: Record<string, Valid<Class>> = Object.create(null);
  const provenance: Record<string, Provenance> = Object.create(null);
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
    const cls = namedClass(recovered, name);
    if (cls.name.value != name) {
      diagnostics.push(
        semanticError(
          DiagnosticCode.Jack.CLASS_NAME_MISMATCH,
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

/** Gives a skipped class header its input name so callers can use intact declarations. */
function namedClass({ ast, provenance }: Recovered<Class>, file: string) {
  return skipsAny(provenance, NAMES_CLASS)
    ? { ...ast, name: { ...ast.name, value: file } }
    : ast;
}

/**
 * Finds the last subroutine header before a body skip. The declaration object
 * keeps scopes distinct when names repeat.
 */
function subroutineOf(
  skip: Skip,
  subroutines: readonly Subroutine[],
): Subroutine | undefined {
  return subroutines.findLast(
    (subroutine) => subroutine.name.span.end <= skip.interval.start,
  );
}

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
          DiagnosticCode.Jack.DUPLICATE_SUBROUTINE,
          { name },
          subroutine.name.span,
        ),
      );
    }
    subroutineNames.add(name);
    const holdsSkip = provenance.some(
      (skip) =>
        SKIPS_STATEMENT.has(skip.kind) &&
        subroutineOf(skip, cls.subroutines) === subroutine,
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
      diagnostic === undefined ? "suppressed" : describeDiagnostic(diagnostic),
    );
  }
}

function compileError<C extends DiagnosticCode>(
  code: C,
  args: DiagnosticArgs[C],
  span?: Span,
): Halt {
  return new Halt(diagnostic(code, args, span, Stage.COMPILE));
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
  /** VM segment and index of a method's receiver; absent for class calls. */
  object?: string;
}

export class Compiler {
  private instructions: string[] = [];
  globalSymbolTable: Record<string, VariableData> = {};
  localSymbolTable: Record<string, VariableData> = {};

  className = "";
  private classes: Record<string, Class> = {};
  private damage: Damage = NO_DAMAGE;
  private subroutines: readonly Subroutine[] = [];
  /** Declaration identity keeps recovery scopes distinct when names repeat. */
  private subroutine?: Subroutine;
  /** Unavailable declared types whose dependent member checks must be skipped. */
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
        : compileError(DiagnosticCode.Jack.UNDECLARED_VARIABLE, { name }, span);
    }
    return `${data.segment} ${data.index}`;
  }

  private mayDeclareVariable(): boolean {
    return (this.damage.provenance[this.className] ?? []).some(
      (skip) =>
        DECLARES_VARIABLE.has(skip.kind) &&
        (DECLARES_CLASS_VARIABLE.has(skip.kind) ||
          (this.subroutine !== undefined &&
            subroutineOf(skip, this.subroutines) === this.subroutine)),
    );
  }

  private mayDeclareSubroutine(className: string): boolean {
    return skipsAny(
      this.damage.provenance[className] ?? [],
      DECLARES_SUBROUTINE,
    );
  }

  /**
   * Keeps a failure local to one declaration or statement so later checks run.
   * Suppressed checks add no diagnostic; unexpected exceptions become spanless
   * compile diagnostics.
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
            DiagnosticCode.Error.UNEXPECTED,
            { message: e instanceof Error ? e.message : String(e) },
            undefined,
            Stage.COMPILE,
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

  /** Returns VM text only when declaration and statement checks report no diagnostics. */
  compile(
    cls: Valid<Class>,
    other?: Record<string, Valid<Class>>,
    damage: Damage = NO_DAMAGE,
  ): Result<string, Diagnostics> {
    this.className = cls.name.value;
    this.classes = other ?? {};
    this.damage = damage;
    this.subroutines = cls.subroutines;
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
   * Records an unknown type to suppress dependent member checks. The type error
   * is omitted when `damage.lost` says its class was unavailable.
   */
  validateType(type: string, span?: Span) {
    if (isPrimitive(type) || isOsClass(type) || this.classes[type]) {
      return;
    }
    this.invalidTypes.add(type);
    if (!this.damage.lost.has(type)) {
      throw compileError(DiagnosticCode.Jack.UNKNOWN_TYPE, { type }, span);
    }
  }

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
        index: argNum + (offset ? 1 : 0), // Method argument 0 holds the receiver.
      };
      argNum += 1;
    }
  }

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
        throw compileError(DiagnosticCode.Jack.OS_INTERFACE, {
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
    this.subroutine = subroutine;
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
        DiagnosticCode.Jack.ARG_COUNT,
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
          DiagnosticCode.Jack.METHOD_CALLED_AS_FUNCTION,
          { name: `${className}.${subroutineName}` },
          call.name.span,
        );
      }
      if (builtin.type != "method" && isMethod) {
        throw compileError(
          DiagnosticCode.Jack.CALLED_AS_METHOD,
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
              DiagnosticCode.Jack.METHOD_CALLED_AS_FUNCTION,
              { name: `${className}.${subroutineName}` },
              call.name.span,
            );
          }
          if (subroutine.type != "method" && isMethod) {
            throw compileError(
              DiagnosticCode.Jack.CALLED_AS_METHOD,
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
          DiagnosticCode.Jack.MISSING_SUBROUTINE,
          { class: className, subroutine: subroutineName },
          call.name.span,
        );
      }
    } else if (!this.damage.lost.has(className) && !this.mayDeclareVariable()) {
      // Suppressed: a missing class, when a file of that name built no
      // class, or when a skipped declaration could make it a variable.
      throw compileError(
        DiagnosticCode.Jack.UNDEFINED_CLASS,
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
        object = this.var(prefix);
        className = varData.type;
        if (this.invalidTypes.has(className)) {
          // Member checks need a known receiver type.
          return { className, subroutineName, object };
        }
      } else {
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
