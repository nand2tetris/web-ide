import { Link } from "react-router-dom";

import URLs from "../../urls";
import { Icon } from "../pico/icon";

const Header = ({ urls }: { urls: typeof URLs }) => (
  <header>
    <nav>
      <ul>
        <li>
          <strong>
            <a href="https://nand2tetris.org" target="_blank" rel="noreferrer">
              NAND2Tetris
            </a>
            &nbsp;Online
          </strong>
        </li>
      </ul>
      <ul className="icon-list">
        {urls.map(({ href, icon, link }) => (
          <li key={href}>
            <Icon name={icon}></Icon>
            <Link to={href}>{link}</Link>
          </li>
        ))}
      </ul>
    </nav>
  </header>
);

export default Header;
