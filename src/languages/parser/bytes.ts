import { isErr, Ok } from "@davidsouther/jiffies/result.js";
import { ParseErrors, Parser } from "./base.js";

// https://docs.rs/nom/latest/nom/bytes/complete/index.html
// escaped	Matches a byte string with escaped characters.
// escaped_transform	Matches a byte string with escaped characters.
// is_a	Returns the longest slice of the matches the pattern.

// Parse till certain characters are met.
export const is_not =
  (chars: string): Parser =>
  (i) => {
    let d = 0;
    while (d < i.length && !chars.includes(i[d])) d++;
    if (d == 0) return ParseErrors.error("is_not found immediately");
    return Ok([i.substring(d), i.substring(0, d)]);
  };

// tag_no_case	Recognizes a case insensitive pattern.
// take_till	Returns the longest input slice (if any) till a predicate is met.
// take_till1	Returns the longest (at least 1) input slice till a predicate is met.
// take_until1	Returns the non empty input slice up to the first occurrence of the pattern.
// take_while	Returns the longest input slice (if any) that matches the predicate.
// take_while1	Returns the longest (at least 1) input slice that matches the predicate.
// take_while_m_n	Returns the longest (m <= len <= n) input slice that matches the predicate.

// Returns an input slice containing the first N input elements (Input[..N]).
export const take =
  (n: number): Parser =>
  (i) => {
    if (i.length < n) {
      return ParseErrors.incomplete(n - i.length);
    }
    const o = i.substring(0, n);
    i = i.substring(n);
    return Ok([i, o]);
  };

// Returns the input slice up to the first occurrence of the pattern.
export const take_until =
  (p: Parser): Parser =>
  (i) => {
    let o = "";
    let noInput = i.length == 0;
    while (isErr(p(i))) {
      o += i[0];
      i = i.substring(1);
      if (i.length == 0) {
        if (noInput) {
          return ParseErrors.failure("take_until went past end of input");
        } else {
          noInput = true;
        }
      }
    }
    return Ok([i, o]);
  };

// Recognizes a pattern
export const tag = (s: string | RegExp): Parser =>
  typeof s == "string"
    ? (i) =>
        i.startsWith(s)
          ? Ok([i.substring(s.length), s])
          : ParseErrors.error("tag not found")
    : (i) => {
        let m = i.match(s);
        if (m != null) {
          let o = m[0];
          return Ok([i.substring(o.length), o]);
        } else {
          return ParseErrors.error("tag did not match");
        }
      };
