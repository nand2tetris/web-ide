import { rounded } from "@davidsouther/jiffies/lib/esm/dom/css/border.js";
import { TranslatorSymbol } from "./stores/asm.store";

export const Table = ({
  values = [],
  highlight = -1,
  onClick,
}: {
  values?: TranslatorSymbol[];
  highlight?: number;
  onClick?: (id: string, value: string) => void;
}) => {
  return (
    <div>
      {values.map((entry, i) => (
        <TableRow
          key={i}
          identifier={entry.name}
          value={entry.value}
          highlight={i === highlight}
          onClick={() => onClick?.(entry.name, entry.value)}
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
