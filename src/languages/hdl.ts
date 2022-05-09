/** Reads and parses HDL chip descriptions. */

import { isErr, Ok } from "@davidsouther/jiffies/result.js";
import { IResult, ParseErrors, Parser, StringLike } from "./parser/base.js";
import { alt } from "./parser/branch.js";
import { tag } from "./parser/bytes.js";
import { value } from "./parser/combinator.js";
import { many0 } from "./parser/multi.js";
import { filler, identifier, list, token, ws } from "./parser/recipe.js";
import {
  delimited,
  pair,
  preceded,
  separated,
  terminated,
  tuple,
} from "./parser/sequence.js";

const hdlWs = <O>(p: Parser<O>): Parser<O> => {
  const parser = ws(p, filler);
  const hdlWs: Parser<O> = (i) => parser(i);
  return hdlWs;
};
const hdlIdentifierParser = hdlWs(identifier());
const hdlIdentifier = (i: StringLike) => hdlIdentifierParser(i);

export interface PinParts {
  pin: string;
  start: number;
  end?: number;
}

export interface Wire {
  lhs: string;
  rhs: PinParts;
}

export interface Part {
  name: string;
  wires: Wire[];
}

function pin(toPin: StringLike): IResult<PinParts> {
  const match = toPin
    .toString()
    .match(/^(?<pin>[a-z]+)(\[(?<i>\d+)(\.\.(?<j>\d+))?\])?/);
  if (!match) {
    return ParseErrors.failure("toPin expected pin");
  }

  const matched = match[0];
  const { pin, i, j } = match.groups as { pin: string; i?: string; j?: string };
  return Ok([
    toPin.substring(matched.length),
    {
      pin,
      start: i ? Number(i) : 0,
      end: j ? Number(j) : 1,
    },
  ]);
}

const wireParser = separated(hdlIdentifier, token("="), hdlWs(pin));
const wire: Parser<[StringLike, PinParts]> = (i) => wireParser(i);
const wireListParser = list(wire, tag(","));
const wireList: Parser<[StringLike, PinParts][]> = (i) => wireListParser(i);

const partParser = tuple(
  hdlIdentifier,
  delimited(token("("), wireList, token(")"))
);
const part: Parser<Part> = (i) => {
  const parse = partParser(i);
  if (isErr(parse)) {
    return ParseErrors.error("part parser has no identifier");
  }
  const [input, [name, wires]] = Ok(parse);
  const part: Part = {
    name: name.toString(),
    wires: wires.map(([lhs, rhs]) => ({ lhs: lhs.toString(), rhs })),
  };
  return Ok([input, part]);
};

const pinListParser = list(hdlWs(pin), token(","));
const pinList: Parser<PinParts[]> = (i) => pinListParser(i);
const inListParser = delimited(token("IN"), pinList, token(";"));
const inList: Parser<PinParts[]> = (i) => inListParser(i);
const outListParser = delimited(token("OUT"), pinList, token(";"));
const outList: Parser<PinParts[]> = (i) => outListParser(i);

const partsParser = alt<"BUILTIN" | Part[]>(
  preceded(token("PARTS:"), many0(terminated(part, token(";")))),
  value("BUILTIN", terminated(token("BUILTIN"), token(";")))
);
const parts: Parser<"BUILTIN" | Part[]> = (i) => partsParser(i);

const chipBlockParser = delimited(
  token("{"),
  tuple(inList, outList, parts),
  token("}")
);
const chipBlock = (i: StringLike) => chipBlockParser(i);

const chipParser = preceded(hdlWs(tag("CHIP")), pair(hdlIdentifier, chipBlock));

export function HdlParser(i: StringLike): IResult<{
  name: string;
  ins: PinParts[];
  outs: PinParts[];
  parts: "BUILTIN" | Part[];
}> {
  const chipParse = chipParser(i);
  if (isErr(chipParse)) {
    return chipParse;
  }

  const [_, [name, [ins, outs, parts]]] = Ok(chipParse);

  return Ok(["", { name: name.toString(), ins, outs, parts }]);
}

export const TEST_ONLY = {
  hdlWs,
  hdlIdentifier,
  pin,
  inList,
  outList,
  part,
  parts,
  chipBlock,
  chipParser,
  wire,
};
