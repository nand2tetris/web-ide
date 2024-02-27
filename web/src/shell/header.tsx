import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { RefObject, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AppContext, useAppContext } from "src/App.context";
import { Icon } from "../pico/icon";
import URLs, { LAST_ROUTE_KEY, TOOLS, URL } from "../urls";

interface HeaderButton {
  tooltip: string;
  icon: string;
  href?: string;
  tool?: string;
  target?: JSX.Element;
  onClick?: (
    context: ReturnType<typeof useAppContext>,
    redirectRefs: Record<string, RefObject<HTMLAnchorElement>>
  ) => void;
}

function headerButtonFromURL(url: URL, icon: string, tooltip?: string) {
  return {
    href: url.href,
    tool: url.tool,
    tooltip:
      tooltip ??
      (url.tool && Object.keys(TOOLS).includes(url.tool)
        ? TOOLS[url.tool]
        : ""),
    icon,
    target: url.target,
  };
}

function openGuide(
  context: ReturnType<typeof useAppContext>,
  redirectRefs: Record<string, RefObject<HTMLAnchorElement>>
) {
  if (context.toolStates.tool == "chip") {
    redirectRefs[URLs["chipGuide"].href].current?.click();
  } else {
    redirectRefs[URLs["placeholder"].href].current?.click();
  }
  return;
}

const headerButtons: HeaderButton[] = [
  headerButtonFromURL(URLs["chip"], "memory"),
  headerButtonFromURL(URLs["cpu"], "developer_board"),
  headerButtonFromURL(URLs["asm"], "list_alt"),
  headerButtonFromURL(URLs["vm"], "computer"),
  headerButtonFromURL(URLs["bitmap"], "grid_on"),
  headerButtonFromURL(URLs["util"], "function", "Converter Tool"),
  {
    onClick: openGuide,
    tooltip: `Guide`,
    icon: "menu_book",
  },
  {
    href: "https://github.com/nand2tetris/web-ide/issues/new/choose",
    icon: "bug_report",
    tooltip: "Bug Report",
  },
  {
    onClick: (
      context: ReturnType<typeof useAppContext>,
      redirectRefs: Record<string, RefObject<HTMLAnchorElement>>
    ) => {
      context.settings.open();
    },
    icon: "settings",
    tooltip: "Settings",
  },
  headerButtonFromURL(URLs["about"], "info", "About"),
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
  // for user guides
  redirectRefs[URLs["chipGuide"].href] = useRef<HTMLAnchorElement>(null);
  redirectRefs[URLs["placeholder"].href] = useRef<HTMLAnchorElement>(null);

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
        {/* for guide */}
        {[URLs["chipGuide"].href, URLs["placeholder"].href].map((href) => (
          <Link
            key={href}
            to={href}
            ref={redirectRefs[href]}
            style={{ display: "none" }}
          />
        ))}
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
                          onClick?.(appContext, redirectRefs);
                        }
                      : () => {
                          setStatus("");
                          if (href) {
                            appContext.toolStates.setTool(tool);
                            if (target) {
                              localStorage.setItem(LAST_ROUTE_KEY, href);
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
