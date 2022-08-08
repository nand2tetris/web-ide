import { dec } from "../../util/twos";

export const RegisterComponent = ({
  name,
  bits,
}: {
  name: string;
  bits: number;
}) => (
  <span>
    {name}: {dec(bits)}
  </span>
);
