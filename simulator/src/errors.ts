import { ParseError, Span } from "./languages/base";

export interface CompilationError {
  message: string;
  span?: Span;
}

const UNKNOWN_HDL_ERROR = `HDL statement has a syntax error`;

export function parseErrorToCompilationError(error: ParseError) {
  if (!error.message) {
    return { message: UNKNOWN_HDL_ERROR, span: error.span };
  }
  const match = error.message.match(/Line \d+, col \d+: (?<message>.*)/);
  if (match?.groups?.message !== undefined) {
    return { message: match.groups.message, span: error.span };
  }
  return { message: error.message, span: error.span };
}
