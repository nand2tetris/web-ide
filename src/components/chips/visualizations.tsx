import { Trans } from "@lingui/macro";
import { ReactNode } from "react";
import { Chip } from "../../simulator/chip/chip";

export const Visualizations = ({ parts }: { parts: Set<Chip> }) => {
  const visualizations: [string, ReactNode][] = [...parts].flatMap((part) =>
    part.render().map((v, i) => [`${part.id}_${i}`, v] as [string, ReactNode])
  );

  if (visualizations.length === 0) {
    return <Trans>None</Trans>;
  }

  return (
    <>
      {visualizations.map(([p, v]) => (
        <div key={p}>{v}</div>
      ))}
    </>
  );
};
