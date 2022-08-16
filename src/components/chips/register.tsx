import { dec } from "../../util/twos";

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
