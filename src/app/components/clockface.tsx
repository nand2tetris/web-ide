import { useClockface } from "../../simulator/chip/clock";

export const Clockface = () => {
  const clockface = useClockface();
  return <span style={{ whiteSpace: "nowrap" }}>{clockface}</span>;
};
