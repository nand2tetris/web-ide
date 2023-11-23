import { rounded } from "@davidsouther/jiffies/lib/esm/dom/css/border.js";
import { dec } from "@nand2tetris/simulator/util/twos.js";

export const Table = ({ values = [] }: { values?: [string, string][] }) => {
  const rows = values.map((entry, i) => (
    <TableRow key={i} identifier={entry[0]} value={entry[1]} size={5} />
  ));

  return <div>{rows}</div>;
};

export const NumberedTable = ({ values = [] }: { values?: string[] }) => {
  const getIndexString = (i: number) =>
    values.length ? dec(i).padStart(Math.ceil(Math.log10(i)), " ") : dec(i);

  return <Table values={values.map((v, i) => [getIndexString(i), v])} />;
};

const TableRow = ({
  identifier,
  value,
  highlight = false,
}: {
  identifier: string;
  value: string;
  size: number;
  highlight?: boolean;
}) => {
  return (
    <div style={{ display: "flex", height: "100%" }}>
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
