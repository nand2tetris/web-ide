import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { RefObject, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AppContext, useAppContext } from "src/App.context";
import { Icon } from "../pico/icon";
import URLs, { LAST_ROUTE_KEY, TOOLS } from "../urls";

interface HeaderButton {
  tooltip: string;
  icon: string;
  href?: string;
  tool?: string;
  target?: JSX.Element;
  onClick?: (context: ReturnType<typeof useAppContext>) => void;
}

const headerButtons: HeaderButton[] = [
  URLs["chip"],
  URLs["cpu"],
  URLs["asm"],
  URLs["bitmap"],
  URLs["util"],
  URLs["guide"],
  {
    href: "https://github.com/nand2tetris/web-ide/issues/new/choose",
    icon: "bug_report",
    tooltip: "Bug Report",
  },
  {
    onClick: (context: ReturnType<typeof useAppContext>) => {
      context.settings.open();
    },
    icon: "settings",
    tooltip: "Settings",
  },
  URLs["about"],
];

const Header = () => {
  const appContext = useContext(AppContext);
  const { setStatus } = useContext(BaseContext);

  const redirectRefs: Record<string, RefObject<HTMLAnchorElement>> = {};
  for (const button of headerButtons) {
    if (button.href) {
      redirectRefs[button.href] = useRef<HTMLAnchorElement>(null);
    }
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
            {appContext.toolStates.tool &&
              ` / ${TOOLS[appContext.toolStates.tool]}`}
          </li>
        </ul>
        <ul className="icon-list">
          {headerButtons.map(
            ({ href, icon, onClick, tooltip, target, tool }) => {
              return (
                <li
                  key={icon}
                  data-tooltip={tooltip}
                  data-placement="bottom"
                  onClick={
                    onClick
                      ? () => {
                          onClick?.(appContext);
                        }
                      : () => {
                          setStatus("");
                          if (href) {
                            if (href != "/guide") {
                              appContext.toolStates.setTool(tool);
                              if (target) {
                                localStorage.setItem(LAST_ROUTE_KEY, href);
                              }
                            }
                            redirectRefs[href].current?.click();
                          }
                        }
                  }
                >
                  <Icon name={icon}></Icon>
                  {href &&
                    (target ? (
                      <Link
                        to={href}
                        ref={redirectRefs[href]}
                        style={{ display: "none" }}
                      />
                    ) : (
                      <a
                        href={href}
                        target="new"
                        ref={redirectRefs[href]}
                        style={{ display: "none" }}
                      />
                    ))}
                </li>
              );
            }
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
