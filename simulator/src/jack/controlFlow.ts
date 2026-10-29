import { Diagnostic, semanticError } from "../languages/base.js";
import {
  IfStatement,
  ReturnType,
  Statement,
  Subroutine,
  WhileStatement,
} from "../languages/jack.js";

class CFGNode {
  id: number;
  hasReturn = false;
  children: CFGNode[] = [];

  static count = 0;

  constructor() {
    this.id = CFGNode.count;
    CFGNode.count += 1;
  }

  alwaysReturns(): boolean {
    const visited: Set<CFGNode> = new Set();

    function checkReturn(node: CFGNode): boolean {
      if (node.hasReturn) {
        return true;
      } else if (node.children.length === 0) {
        return false;
      }
      visited.add(node);
      for (const child of node.children) {
        if (!visited.has(child) && !checkReturn(child)) {
          return false;
        }
      }
      return true;
    }

    return checkReturn(this);
  }

  getLeafs(): CFGNode[] {
    const leafs: Set<CFGNode> = new Set();
    const visited: Set<CFGNode> = new Set();

    function findLeafs(node: CFGNode) {
      if (node.children.length === 0) {
        leafs.add(node);
      } else {
        visited.add(node);
        for (const child of node.children) {
          if (!visited.has(child)) {
            findLeafs(child);
          }
        }
      }
    }

    findLeafs(this);
    return Array.from(leafs);
  }
}

function processIf(
  statement: IfStatement,
  returnType: ReturnType,
  current: CFGNode,
  diagnostics: Diagnostic[],
): CFGNode {
  const ifStart = new CFGNode();
  current.children.push(ifStart);
  const path1 = buildCFG(statement.body, returnType, diagnostics);
  const path2 = buildCFG(statement.else, returnType, diagnostics);
  ifStart.children.push(path1, path2);
  const leafs = path1.getLeafs().concat(path2.getLeafs());
  const next = new CFGNode();
  for (const leaf of leafs) {
    leaf.children.push(next);
  }
  return next;
}

function processWhile(
  statement: WhileStatement,
  returnType: ReturnType,
  current: CFGNode,
  diagnostics: Diagnostic[],
): CFGNode {
  const whileStart = new CFGNode();
  current.children.push(whileStart);
  const body = buildCFG(statement.body, returnType, diagnostics);
  for (const leaf of body.getLeafs()) {
    leaf.children.push(whileStart);
  }
  const next = new CFGNode();
  whileStart.children.push(body, next);
  return next;
}

/** The control flow graph of `statements`, adding each bad return to `diagnostics`. */
function buildCFG(
  statements: Statement[],
  returnType: ReturnType,
  diagnostics: Diagnostic[],
): CFGNode {
  const root = new CFGNode();
  let current = root;

  for (const statement of statements) {
    switch (statement.statementType) {
      case "letStatement":
      case "doStatement":
        break;
      case "returnStatement":
        if (returnType != "void" && statement.value == undefined) {
          diagnostics.push(
            semanticError(
              `A non void subroutine must return a value`,
              statement.span,
            ),
          );
        }
        current.hasReturn = true;
        break;
      case "ifStatement":
        current = processIf(statement, returnType, current, diagnostics);
        break;
      case "whileStatement":
        current = processWhile(statement, returnType, current, diagnostics);
        break;
    }
  }
  return root;
}

/**
 * Every control flow diagnostic of a subroutine: each return without a value
 * in a non void subroutine, then a path that does not return.
 *
 * Suppressed: the missing return check, when `holdsSkip` says recovery skipped
 * a statement of this subroutine, at any depth, which could have returned.
 */
export function validateSubroutine(
  subroutine: Subroutine,
  { holdsSkip = false }: { holdsSkip?: boolean } = {},
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const cfg = buildCFG(
    subroutine.body.statements,
    subroutine.returnType.value,
    diagnostics,
  );
  if (!holdsSkip && !cfg.alwaysReturns()) {
    diagnostics.push(
      semanticError(
        `Subroutine ${subroutine.name.value}: not all code paths return a value`,
        subroutine.name.span,
      ),
    );
  }
  return diagnostics;
}
