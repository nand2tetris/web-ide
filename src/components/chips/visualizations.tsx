import { Trans } from "@lingui/macro";
import { ReactNode } from "react";
import { Chip } from "../../simulator/chip/chip";

export const Visualizations = ({ parts }: { parts: Set<Chip> }) => {
  if (parts.size === 0) {
    return <Trans>None</Trans>;
  }
  const visualizations: [Chip, ReactNode][] = [...parts].flatMap((part) => {
    return (part.render() ?? [])
      .filter((v) => v !== undefined)
      .map((v) => [part, v] as [Chip, ReactNode]);
  });

  return (
    <>
      {visualizations.map(([p, v]) => (
        <div key={p.id}>{v}</div>
      ))}
    </>
  );
};
