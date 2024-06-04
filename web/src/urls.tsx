import { lazy } from "react";

const Chip = lazy(() => import("./pages/chip"));
const CPU = lazy(() => import("./pages/cpu"));
const ASM = lazy(() => import("./pages/asm"));
const BITMAP = lazy(() => import("./pages/bitmap"));
const VM = lazy(() => import("./pages/vm"));
const Compiler = lazy(() => import("./pages/compiler"));
const Util = lazy(() => import("./pages/util"));
const About = lazy(() => import("./pages/about"));

export const LAST_ROUTE_KEY = "lastRoute";

export const TOOLS: Record<string, string> = {
  chip: "Hardware Simulator",
  cpu: "CPU Emulator",
  asm: "Assembler",
  vm: "VM Emulator",
  bitmap: "Bitmap Editor",
  compiler: "Jack Compiler",
};

export interface URL {
  href: string;
  tool?: string;
  target: JSX.Element;
}

const URLs: Record<string, URL> = {
  chip: {
    href: "/chip",
    tool: "chip",
    target: <Chip />,
  },
  cpu: {
    href: "/cpu",
    tool: "cpu",
    target: <CPU />,
  },
  asm: {
    href: "/asm",
    tool: "asm",
    target: <ASM />,
  },
  vm: {
    href: "/vm",
    tool: `vm`,
    target: <VM />,
  },
  compiler: {
    href: "/compiler",
    tool: "compiler",
    target: <Compiler />,
  },
  bitmap: {
    href: "/bitmap",
    tool: "bitmap",
    target: <BITMAP />,
  },
  util: {
    href: "/util",
    target: <Util />,
  },
  about: { href: "/about", target: <About /> },
};

export default URLs;
