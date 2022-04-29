/** Reads and parses HDL chip descriptions. */

import { isErr, Ok } from "@davidsouther/jiffies/result.js";
import { IResult, ParseErrors, Parser } from "./parser/base.js";
import { alt } from "./parser/branch.js";
import { tag } from "./parser/bytes.js";
import { value } from "./parser/combinator.js";
import { many1 } from "./parser/multi.js";
import { filler, identifier, list, ws } from "./parser/recipe.js";
import {
  delimited,
  pair,
  preceded,
  separated_pair,
  terminated,
  tuple,
} from "./parser/sequence.js";

const hdlWs = <O>(p: Parser<O>): Parser<O> => {
  const parser = ws(p, filler);
  const hdlWs = (i: string) => parser(i);
  return hdlWs;
};
const hdlTag = (s: Parameters<typeof tag>[0]) => {
  const parser = hdlWs(tag(s));
  const hdlTag = (i: string) => parser(i);
  return hdlTag;
};
const hdlIdentifierParser = hdlWs(identifier());
const hdlIdentifier = (i: string) => hdlIdentifierParser(i);

export interface PinParts {
  pin: string;
  start?: number;
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

function pin(toPin: string): IResult<PinParts> {
  const match = toPin.match(/^(?<pin>[a-z]+)(\[(?<i>\d+)(\.\.(?<j>\d+))?\])?/);
  if (!match) {
    return ParseErrors.failure("toPin expected pin");
  }

  const matched = match[0];
  const { pin, i, j } = match.groups as { pin: string; i?: string; j?: string };
  return Ok([
    toPin.substring(matched.length),
    {
      pin,
      start: i ? Number(i) : undefined,
      end: j ? Number(j) : undefined,
    },
  ]);
}

const wireParser = separated_pair(hdlIdentifier, hdlTag("="), hdlWs(pin));
const wire = (i: string) => wireParser(i);
const wireListParser = list(wire, tag(","));
const wireList = (i: string) => wireListParser(i);

const partParser = tuple(
  hdlIdentifier,
  delimited(hdlTag("("), wireList, hdlTag(")"))
);
function part(i: string): IResult<Part> {
  const parse = partParser(i);
  if (isErr(parse)) {
    return ParseErrors.error("part parser has no identifier");
  }
  const [input, [name, wires]] = Ok(parse);
  const part: Part = {
    name,
    wires: wires.map(([lhs, rhs]) => ({ lhs, rhs })),
  };
  return Ok([input, part]);
}

const pinListParser = list(hdlWs(pin), hdlTag(","));
const pinList = (i: string) => pinListParser(i);
const inListParser = delimited(hdlTag("IN"), pinList, hdlTag(";"));
const inList = (i: string) => inListParser(i);
const outListParser = delimited(hdlTag("OUT"), pinList, hdlTag(";"));
const outList = (i: string) => outListParser(i);

const partsParser = alt<"BUILTIN" | Part[]>(
  preceded(hdlTag("PARTS:"), many1(terminated(part, hdlTag(";")))),
  value("BUILTIN", terminated(hdlTag("BUILTIN"), hdlTag(";")))
);
const parts = (i: string) => partsParser(i);

const chipBlockParser = delimited(
  hdlTag("{"),
  tuple(inList, outList, parts),
  hdlTag("}")
);
const chipBlock = (i: string) => chipBlockParser(i);

const chipParser = preceded(hdlWs(tag("CHIP")), pair(hdlIdentifier, chipBlock));

export function HdlParser(i: string): IResult<{
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

  return Ok(["", { name, ins, outs, parts }]);
}

export const TEST_ONLY = {
  hdlWs,
  hdlIdentifier,
  hdlTag,
  pin,
  inList,
  outList,
  part,
  parts,
  chipBlock,
  chipParser,
  wire,
};
