import { RefObject, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "src/App.context";
import { TOOLS } from "src/tools";
import { Icon } from "../pico/icon";
import URLs from "../urls";

const Header = ({ urls }: { urls: typeof URLs }) => {
  const { tool, setTool } = useContext(AppContext);

  const redirectRefs: Record<string, RefObject<HTMLAnchorElement>> = {};
  for (const url of urls) {
    redirectRefs[url.href] = useRef<HTMLAnchorElement>(null);
  }

  return (
    <header>
      <nav style={{ width: "100%" }}>
        <ul>
          <li>
            <strong>
              <a
                href="https://nand2tetris.org"
                target="_blank"
                rel="noreferrer"
              >
                NAND2Tetris
              </a>
              &nbsp;IDE Online
            </strong>
            {tool && ` / ${TOOLS[tool]}`}
          </li>
        </ul>
        <ul className="icon-list">
          {urls.map(({ href, icon, tool, link }) => {
            return (
              <li
                key={href}
                data-tooltip={
                  (tool
                    ? (TOOLS as Record<string, string>)[tool]
                    : undefined) ?? link
                }
                data-placement="bottom"
                onClick={() => {
                  setTool(tool as keyof typeof TOOLS | undefined);
                  redirectRefs[href].current?.click();
                }}
              >
                <Icon name={icon}></Icon>
                <Link
                  to={href}
                  ref={redirectRefs[href]}
                  style={{ display: "none" }}
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
