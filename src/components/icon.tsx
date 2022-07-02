import { FC } from "react";

export const Icon: FC<{name: string}> = ({name}) => {
   return (<span className="material-symbols-outlined">{name}</span>);
}

