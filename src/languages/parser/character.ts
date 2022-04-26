import { Ok } from "@davidsouther/jiffies/result.js";
import { ParseErrors, Parser } from "./base.js";
import { alt } from "./branch.js";
import { tag } from "./bytes.js";

// Tests if byte is ASCII alphabetic: A-Z, a-z
export const is_alphabetic = (i: string) =>
  ("A" <= i && i <= "Z") || ("a" <= i && i <= "z");

// Tests if byte is ASCII alphanumeric: A-Z, a-z, 0-9
export const is_alphanumeric = (i: string) => is_alphabetic(i) || is_digit(i);

// Tests if byte is ASCII digit: 0-9
export const is_digit = (i: string) => "0" <= i && i <= "9";

// Tests if byte is ASCII hex digit: 0-9, A-F, a-f
export const is_hex_digit = (i: string) =>
  is_digit(i) || ("A" <= i && i <= "F") || ("a" <= i && i <= "f");

// Tests if byte is ASCII newline: \n
export const is_newine = (i: string) => i == "\n";

// Tests if byte is ASCII octal digit: 0-7
export const is_oct_digit = (i: string) => "0" <= i && i <= "7";

// Tests if byte is ASCII space or tab
export const is_space = (i: string) => i == " " || i == "\t";

export const chars =
  (charClass: (i: string) => boolean, min: number): Parser<string> =>
  (i: string) => {
    let d = 0;
    while (charClass(i[d++]));
    if (d < min) {
      return ParseErrors.incomplete(min - d);
    }
    return Ok([i.substring(d), i.substring(0, d)]);
  };

// https://docs.rs/nom/latest/nom/character/complete/index.html
export const alpha = (min: number): Parser<string> => chars(is_alphabetic, min);

// Recognizes zero or more lowercase and uppercase ASCII alphabetic characters: a-z, A-Z
export const alpha0 = () => alpha(0);

// alpha1	Recognizes one or more lowercase and uppercase ASCII alphabetic characters: a-z, A-Z
export const alpha1 = () => alpha(1);

// alphanumeric0	Recognizes zero or more ASCII numerical and alphabetic characters: 0-9, a-z, A-Z
// alphanumeric1	Recognizes one or more ASCII numerical and alphabetic characters: 0-9, a-z, A-Z

// char	Recognizes one character.

// Recognizes the string “\r\n”.
export const crlf = () => tag("\r\n");

export const digit = (min: number) => chars(is_digit, min);

// Recognizes zero or more ASCII numerical characters: 0-9
export const digit0 = () => digit(0);

// Recognizes one or more ASCII numerical characters: 0-9
export const digit1 = () => digit(1);

// hex_digit0	Recognizes zero or more ASCII hexadecimal numerical characters: 0-9, A-F, a-f
// hex_digit1	Recognizes one or more ASCII hexadecimal numerical characters: 0-9, A-F, a-f
// integer  Parsers a number in text form to an integer number

// Recognizes an end of line (both ‘\n’ and ‘\r\n’).
export const line_ending = () => alt(newline(), crlf());

// multispace0	Recognizes zero or more spaces, tabs, carriage returns and line feeds.
// multispace1	Recognizes one or more spaces, tabs, carriage returns and line feeds.

// newline	Matches a newline character ‘\n’.
export const newline = () => tag("\n");

// none_of	Recognizes a character that is not in the provided characters.
// not_line_ending	Recognizes a string of any char except ‘\r\n’ or ‘\n’.
// number	Parses a number in text form to a number
// oct_digit0	Recognizes zero or more octal characters: 0-7
// oct_digit1	Recognizes one or more octal characters: 0-7
// one_of	Recognizes one of the provided characters.
// satisfy	Recognizes one character and checks that it satisfies a predicate
// space0	Recognizes zero or more spaces and tabs.
// space1	Recognizes one or more spaces and tabs.
// tab	Matches a tab character ‘\t’.
