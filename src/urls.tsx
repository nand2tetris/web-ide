import Chip from "./pages/chip";
// import CPU from "./pages/cpu";
import Home from "./pages/home";
// import VM from "./pages/vm";
import UserGuide from "./pages/user_guide";

const URLs = [
  { href: "/", link: "Home", icon: "home", target: <Home /> },
  { href: "/chip", link: "Chip", icon: "memory", target: <Chip /> },
  // { href: "/cpu", link: "CPU", icon: "developer_board", target: <CPU /> },
  // { href: "/vm", link: "VM", icon: "computer", target: <VM /> },
  { href: "/guide", link: "Guide", icon: "menu_book", target: <UserGuide /> },
];

export default URLs;
