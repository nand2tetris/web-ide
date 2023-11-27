import { rounded } from "@davidsouther/jiffies/lib/esm/dom/css/border.js";

export const Table = ({
  values = [],
  highlight = -1,
  onClick,
}: {
  values?: [string, string][];
  highlight?: number;
  onClick?: (id: string, value: string) => void;
}) => {
  return (
    <div>
      {values.map((entry, i) => (
        <TableRow
          key={i}
          identifier={entry[0]}
          value={entry[1]}
          highlight={i === highlight}
          onClick={() => onClick?.(entry[0], entry[1])}
        />
      ))}
    </div>
  );
};

const TableRow = ({
  identifier,
  value,
  highlight = false,
  onClick,
}: {
  identifier: string;
  value: string;
  highlight?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div style={{ display: "flex", height: "100%" }} onClick={onClick}>
      <code
        style={{
          ...rounded("none"),
          ...(highlight ? { background: "var(--mark-background-color)" } : {}),
          whiteSpace: "pre",
        }}
      >
        {identifier}
      </code>
      <code
        style={{
          flex: "1",
          textAlign: "right",
          color: "black",
          ...rounded("none"),
          ...(highlight ? { background: "var(--mark-background-color)" } : {}),
        }}
      >
        <span style={{ color: "black" }}>{value}</span>
      </code>
    </div>
  );
};
