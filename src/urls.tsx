import { lazy } from "react";

const Home = lazy(() => import("./pages/home"));
const Chip = lazy(() => import("./pages/chip"));
const Util = lazy(() => import("./pages/util"));
const Guide = lazy(() => import("./pages/user_guide"));

const URLs = [
  { href: "/", link: "Home", icon: "home", target: <Home /> },
  { href: "/chip", link: "Chip", icon: "memory", target: <Chip /> },
  // { href: "/cpu", link: "CPU", icon: "developer_board", target: <CPU /> },
  // { href: "/vm", link: "VM", icon: "computer", target: <VM /> },
  { href: "/util", link: "Conv", icon: "function", target: <Util /> },
  { href: "/guide", link: "Guide", icon: "menu_book", target: <Guide /> },
];

export default URLs;
