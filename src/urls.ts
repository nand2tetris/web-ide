import { Chip } from "./pages/chip.js";
import { CPU } from "./pages/cpu.js";
import { Test } from "./pages/test.js";
import { VM } from "./pages/vm.js";

export default [
  { href: "chip", link: "Chip", icon: "memory", target: Chip },
  { href: "cpu", link: "CPU", icon: "developer_board", target: CPU },
  { href: "vm", link: "VM", icon: "computer", target: VM },
  { href: "test", link: "Tests", icon: "checklist", target: Test },
];
