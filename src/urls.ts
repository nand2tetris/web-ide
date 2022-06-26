import { Chip } from "./pages/chip"
import { CPU } from "./pages/cpu"
import { VM } from "./pages/vm"

export default [
  { href: "chip", link: "Chip", icon: "memory", target: Chip },
  { href: "cpu", link: "CPU", icon: "developer_board", target: CPU },
  { href: "vm", link: "VM", icon: "computer", target: VM },
] as { href: string; link: string; icon: string; target: () => Element }[];
