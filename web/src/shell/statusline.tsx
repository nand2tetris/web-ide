import { plural, t } from "@lingui/core/macro";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import {
  type Status,
  type StatusHeading,
  type StatusSource,
} from "@nand2tetris/components/stores/status.js";
import { useContext } from "react";
import { describeDiagnostic } from "./diagnostics";
import "./statusline.scss";

/** The text of a status as the status line shows it. */
export function describeStatus({
  heading,
  diagnostics,
  comparison,
  message,
}: Status): string {
  if (diagnostics === undefined) {
    if (comparison === "equal") {
      return t`Simulation successful: The output file is identical to the compare file`;
    }
    if (comparison === "different") {
      return t`Simulation error: The output file differs from the compare file`;
    }
    return message ?? "";
  }
  const lead = heading === undefined ? [] : [describeHeading(heading)];
  const listed = diagnostics.map(({ diagnostic }) =>
    describeDiagnostic(diagnostic),
  );
  return [...lead, ...listed].join(". ");
}

function describeSource(source: StatusSource): string {
  switch (source) {
    case "asm":
      return t`ASM code`;
    case "hdl":
      return t`HDL code`;
    case "vm":
      return t`VM code`;
    case "tst":
      return t`Test script`;
    case "cmp":
      return t`Compare file`;
    case "builtin":
      return t`Built-in chip`;
  }
}

function describeHeading({ source, count, semantic = 0 }: StatusHeading) {
  const file = describeSource(source);
  const errors =
    semantic === 0
      ? plural(count, { one: "# syntax error", other: "# syntax errors" })
      : semantic < count
        ? plural(count, { one: "# error", other: "# errors" })
        : plural(count, {
            one: "# semantic error",
            other: "# semantic errors",
          });
  return t`${file}: ${errors}`;
}

function StatusLine() {
  const { status } = useContext(BaseContext);
  const statusClass = `StatusLine status-${status.severity.toLowerCase()}`;
  return <div className={statusClass}>{describeStatus(status)}</div>;
}

export default StatusLine;
