/** Reads and parses HDL chip descriptions. */

import { t } from "@lingui/macro";
import { isErr, isNone, Ok } from "@davidsouther/jiffies/lib/esm/result";
import { IResult, ParseErrors, Parser, StringLike } from "./parser/base";
import { alt } from "./parser/branch";
import { tag } from "./parser/bytes";
import { map, opt, value } from "./parser/combinator";
import { many0 } from "./parser/multi";
import { filler, identifier, list, token, ws } from "./parser/recipe";
import {
  delimited,
  pair,
  preceded,
  separated,
  terminated,
  tuple,
} from "./parser/sequence";

const hdlWs = <O>(p: Parser<O>): Parser<O> => {
  const parser = ws(p, filler);
  const hdlWs: Parser<O> = (i) => parser(i);
  return hdlWs;
};
const hdlIdentifierParser = hdlWs(identifier());
const hdlIdentifier: Parser<string> = (i: StringLike) =>
  // @ts-ignore
  hdlIdentifierParser(i).map(([rest, id]: [StringLike, StringLike]) =>
    Ok([rest, id.toString()])
  );

export interface PinParts {
  pin: string;
  start?: number | undefined;
  end?: number | undefined;
}

export interface PinDeclaration {
  pin: string;
  width: number;
}

export interface Wire {
  lhs: PinParts;
  rhs: PinParts;
}

export interface Part {
  name: string;
  wires: Wire[];
}

function pinDeclaration(toPin: StringLike): IResult<PinDeclaration> {
  const match = toPin.toString().match(/^(?<pin>[0-9a-zA-Z]+)(\[(?<w>\d+)\])?/);
  if (!match) {
    return ParseErrors.failure("pinDeclaration expected pin");
  }

  const matched = match[0];
  const { pin, w } = match.groups as { pin: string; w?: string };
  return Ok([
    toPin.substring(matched.length),
    {
      pin,
      width: w ? Number(w) : 1,
    },
  ]);
}

function pin(toPin: StringLike): IResult<PinParts> {
  const match = toPin
    .toString()
    .match(
      /^(?<pin>[0-9a-zA-Z]+|[Tt]rue|[Ff]alse)(\[(?<i>\d+)(\.\.(?<j>\d+))?\])?/
    );
  if (!match) {
    return ParseErrors.failure(t`could not make a pin from ${toPin}`);
  }

  const matched = match[0];
  const { pin, i, j } = match.groups as { pin: string; i?: string; j?: string };
  const start = i ? Number(i) : undefined;
  const end = j ? Number(j) : start !== undefined ? start : undefined;
  return Ok([
    toPin.substring(matched.length),
    {
      pin,
      start,
      end,
    },
  ]);
}

const wireParser = separated(hdlWs(pin), token("="), hdlWs(pin));
const wire: Parser<[PinParts, PinParts]> = (i) => wireParser(i);
const wireListParser = list(wire, tag(","));
const wireList: Parser<[PinParts, PinParts][]> = (i) => wireListParser(i);

const partParser = tuple(
  hdlIdentifier,
  delimited(token("("), wireList, token(")"))
);
const part: Parser<Part> = (i) => {
  const parse = partParser(i);
  if (isErr(parse)) {
    return ParseErrors.error(t`part has no identifier`);
  }
  const [input, [name, wires]] = Ok(parse);
  const part: Part = {
    name: name.toString(),
    wires: wires.map(([lhs, rhs]) => ({ lhs, rhs })),
  };
  return Ok([input, part]);
};

const pinDeclParser = list(hdlWs(pinDeclaration), token(","));
const pinList: Parser<PinDeclaration[]> = (i) => pinDeclParser(i);
const inDeclParser = delimited(token("IN"), pinList, token(";"));
const inList: Parser<PinDeclaration[]> = (i) => inDeclParser(i);
const outDeclParser = map(
  opt(delimited(token("OUT"), pinList, token(";"))),
  (i) => (isNone(i) ? [] : i)
);
const outList: Parser<PinDeclaration[]> = (i) => outDeclParser(i);

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
  ins: PinDeclaration[];
  outs: PinDeclaration[];
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
  pinList,
  inList,
  outList,
  part,
  parts,
  chipBlock,
  chipParser,
  wire,
};
