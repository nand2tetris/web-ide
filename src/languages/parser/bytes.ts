import { isErr, Ok } from "@davidsouther/jiffies/lib/esm/result";
import { ParseErrors, Parser, StringLike } from "./base";

// https://docs.rs/nom/latest/nom/bytes/complete/index.html
// escaped	Matches a byte string with escaped characters.
// escaped_transform	Matches a byte string with escaped characters.
// is_a	Returns the longest slice of the matches the pattern.

// Parse till certain characters are met.
export const is_not = (chars: string): Parser<StringLike> => {
  const is_not: Parser<StringLike> = (i) => {
    let m = i.toString();
    let d = 0;
    while (d < i.length && !chars.includes(m[d])) d++;
    if (d === 0)
      return ParseErrors.error("is_not found immediately", { span: i });
    return Ok([i.substring(d), i.substring(0, d)]);
  };
  return is_not;
};

// tag_no_case	Recognizes a case insensitive pattern.
// take_till	Returns the longest input slice (if any) till a predicate is met.
// take_till1	Returns the longest (at least 1) input slice till a predicate is met.
// take_until1	Returns the non empty input slice up to the first occurrence of the pattern.
// take_while	Returns the longest input slice (if any) that matches the predicate.
// take_while1	Returns the longest (at least 1) input slice that matches the predicate.
// take_while_m_n	Returns the longest (m <= len <= n) input slice that matches the predicate.

// Returns an input slice containing the first N input elements (Input[..N]).
export const take = (n: number): Parser<StringLike> => {
  const take: Parser<StringLike> = (i) => {
    if (i.length < n) {
      return ParseErrors.incomplete(n - i.length, { span: i });
    }
    const o = i.substring(0, n);
    i = i.substring(n);
    return Ok([i, o]);
  };
  return take;
};

// Returns the input slice up to the first occurrence of the pattern.
export const take_until = (p: Parser<StringLike>): Parser<StringLike> => {
  const take_until: Parser<StringLike> = (i) => {
    let o = "";
    let noInput = i.length === 0;
    while (isErr(p(i))) {
      o += i.substring(0, 1);
      i = i.substring(1);
      if (i.length === 0) {
        if (noInput) {
          return ParseErrors.failure("take_until went past end of input", {
            span: i,
          });
        } else {
          noInput = true;
        }
      }
    }
    return Ok([i, o]);
  };
  return take_until;
};

// Recognizes a pattern
export const tag = (s: string | RegExp): Parser<StringLike> => {
  const tag: Parser<StringLike> =
    typeof s === "string"
      ? (i) =>
          i.indexOf(s) === 0
            ? Ok([i.substring(s.length), s])
            : ParseErrors.error("tag not found", {
                cause: `tag '${s}'`,
                span: i,
              })
      : (i) => {
          let m = i.toString().match(s);
          if (m === null)
            return ParseErrors.error("tag did not match", {
              cause: `tag ${s}`,
              span: i,
            });
          let o = m[0];
          return Ok([i.substring(o.length), i.substring(0, o.length)]);
        };
  return tag;
};
