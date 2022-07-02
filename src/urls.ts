import { lazy } from "react";

const Chip = lazy(() => import("./pages/chip"));
const CPU = lazy(() => import("./pages/cpu"));
const VM = lazy(() => import("./pages/vm"));

const URLs = [
  { href: "/chip", link: "Chip", icon: "memory", target: Chip },
  { href: "/cpu", link: "CPU", icon: "developer_board", target: CPU },
  { href: "/vm", link: "VM", icon: "computer", target: VM },
];

export default URLs;
