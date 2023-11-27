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
    <div style={{ display: "flex", alignItems: "center" }} onClick={onClick}>
      {identifier.length > 0 && (
        <code
          style={{
            flex: "1",
            ...rounded("none"),
            ...(highlight
              ? { background: "var(--mark-background-color)" }
              : {}),
            whiteSpace: "pre",
            padding: "3px",
          }}
        >
          {identifier}
        </code>
      )}
      {value.length > 0 && (
        <code
          style={{
            flex: "1",
            textAlign: "right",
            color: "black",
            padding: "3px",
            ...rounded("none"),
            ...(highlight
              ? { background: "var(--mark-background-color)" }
              : {}),
          }}
        >
          {value}
        </code>
      )}
    </div>
  );
};
