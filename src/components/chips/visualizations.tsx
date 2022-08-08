import { Trans } from "@lingui/macro";
import { ReactNode } from "react";
import { Chip } from "../../simulator/chip/chip";

export const Visualizations = ({ parts }: { parts: Set<Chip> }) => {
  if (parts.size === 0) {
    return <Trans>None</Trans>;
  }
  const visualizations: [string, ReactNode][] = [...parts].flatMap((part) =>
    part.render().map((v, i) => [`${part.id}_${i}`, v] as [string, ReactNode])
  );

  return (
    <>
      {visualizations.map(([p, v]) => (
        <div key={p}>{v}</div>
      ))}
    </>
  );
};
