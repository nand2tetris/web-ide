// export { Trans } from "@lingui/macro";

import { PropsWithChildren } from "react";

export const Trans = (props: PropsWithChildren) => props.children ?? <></>;
