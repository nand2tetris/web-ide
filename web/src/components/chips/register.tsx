import { dec } from "@computron5k/simulator/util/twos.js";

export const RegisterComponent = ({
  name,
  bits,
}: {
  name: string;
  bits: number;
}) => (
  <div>
    {name}: {dec(bits)}
  </div>
);
