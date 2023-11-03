import { t } from "@lingui/macro";
import { lazy } from "react";

const Home = lazy(() => import("./pages/home"));
const Chip = lazy(() => import("./pages/chip"));
const CPU = lazy(() => import("./pages/cpu"));
const Util = lazy(() => import("./pages/util"));
const Guide = lazy(() => import("./pages/user_guide"));

const URLs = [
  { href: "/", link: t`Home`, icon: "home", target: <Home /> },
  { href: "/chip", link: t`Chip`, icon: "memory", target: <Chip /> },
  { href: "/cpu", link: `CPU`, icon: "developer_board", target: <CPU /> },
  // { href: "/vm", link: `VM`, icon: "computer", target: <VM /> },
  { href: "/util", link: t`Conv`, icon: "function", target: <Util /> },
  { href: "/guide", link: t`Guide`, icon: "menu_book", target: <Guide /> },
];

export default URLs;
