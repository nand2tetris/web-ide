import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { RefObject, useContext, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppContext, useAppContext } from "src/App.context";
import { Icon } from "../pico/icon";
import URLs, { LAST_ROUTE_KEY, TOOLS, URL } from "../urls";

interface HeaderButton {
  tooltip: string;
  icon: string;
  href?: string;
  tool?: string;
  target?: JSX.Element;
  onClick?: (context: HeaderButtonContext) => void;
}

interface HeaderButtonContext {
  appContext: ReturnType<typeof useAppContext>;
  pathname: string;
  guideRefs: Record<string, RefObject<HTMLAnchorElement>>;
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

function openGuide(context: HeaderButtonContext) {
  context.guideRefs[context.pathname]?.current?.click();
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
    onClick: (context) => {
      context.appContext.settings.open();
    },
    icon: "settings",
    tooltip: "Settings",
  },
  headerButtonFromURL(URLs["about"], "info", "About"),
];

const guideLinks: Record<string, string> = {
  chip: "https://drive.google.com/file/d/15unXGgTfQySMr1V39xTCLTgGfCOr6iG9/view",
};

const Header = () => {
  const appContext = useContext(AppContext);
  const { setStatus } = useContext(BaseContext);

  const redirectRefs: Record<string, RefObject<HTMLAnchorElement>> = {};
  for (const button of headerButtons) {
    if (button.href) {
      redirectRefs[button.href] = useRef<HTMLAnchorElement>(null);
    }
  }

  const guideRefs: Record<string, RefObject<HTMLAnchorElement>> = {};
  for (const path of Object.keys(guideLinks)) {
    guideRefs[path] = useRef<HTMLAnchorElement>(null);
  }

  const pathname = useLocation().pathname.replace("/", "");

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
            {TOOLS[pathname] && ` / ${TOOLS[pathname]}`}
            {appContext.title && ` / ${appContext.title}`}
          </li>
        </ul>
        {Object.entries(guideLinks).map(([path, guideLink]) => (
          <a
            key={path}
            style={{ display: "none" }}
            href={guideLink}
            ref={guideRefs[path]}
            target="_blank"
            rel="noreferrer"
          ></a>
        ))}
        <ul className="icon-list">
          {headerButtons.map(
            ({ href, icon, onClick, tooltip, target, tool }) => {
              return (
                <li
                  key={icon}
                  data-tooltip={tooltip}
                  data-placement="bottom"
                  onClick={() => {
                    appContext.setTitle(undefined);
                    setStatus("");
                    if (onClick) {
                      onClick?.({ appContext, pathname, guideRefs });
                    } else {
                      if (href) {
                        if (target) {
                          localStorage.setItem(LAST_ROUTE_KEY, href);
                        }

                        redirectRefs[href].current?.click();
                      }
                    }
                  }}
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
