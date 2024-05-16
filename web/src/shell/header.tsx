import {
  BaseContext,
  useBaseContext,
} from "@nand2tetris/components/stores/base.context";
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
  baseContext: ReturnType<typeof useBaseContext>;
  pathname: string;
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

const guideLinks: Record<string, string> = {
  chip: "https://drive.google.com/file/d/15unXGgTfQySMr1V39xTCLTgGfCOr6iG9/view",
  cpu: "https://drive.google.com/file/d/16eHIj78Cpeb0uxXBAvxUPUaIwkrj3NIu/view",
  asm: "https://drive.google.com/file/d/16gy2EDqUqrPIzy-vyX0-M8ObN5HyQa3Y/view",
  vm: "https://drive.google.com/file/d/1IMKD_khjO7iQ673kH9j8qMkyIlMSOtUG/view",
};

const GUIDE_NOT_AVAILABLE_MESSAGE = "Guide not available for this tool";

async function openGuide(context: HeaderButtonContext) {
  if (!guideLinks[context.pathname]) {
    context.baseContext.setStatus(GUIDE_NOT_AVAILABLE_MESSAGE);
    return;
  }
  const pdfLink = guideLinks[context.pathname];
  const response = await fetch(pdfLink);
  if (response.status === 404) {
    context.baseContext.setStatus(GUIDE_NOT_AVAILABLE_MESSAGE);
    return;
  }
  window.open(pdfLink, "_blank", "width=1000,height=800");
}

const headerButtons: HeaderButton[] = [
  headerButtonFromURL(URLs["chip"], "memory"),
  headerButtonFromURL(URLs["cpu"], "developer_board"),
  headerButtonFromURL(URLs["asm"], "list_alt"),
  headerButtonFromURL(URLs["vm"], "computer"),
  headerButtonFromURL(URLs["compiler"], "code"),
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

const Header = () => {
  const appContext = useContext(AppContext);
  const baseContext = useContext(BaseContext);
  const { setStatus } = useContext(BaseContext);

  const redirectRefs: Record<string, RefObject<HTMLAnchorElement>> = {};
  for (const button of headerButtons) {
    if (button.href) {
      redirectRefs[button.href] = useRef<HTMLAnchorElement>(null);
    }
  }

  const pathname = useLocation().pathname.replaceAll("/", "");

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
            </strong>
            {TOOLS[pathname] && ` / ${TOOLS[pathname]}`}
            {appContext.title && ` / ${appContext.title}`}
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
                  onClick={() => {
                    appContext.setTitle(undefined);
                    setStatus("");
                    if (onClick) {
                      onClick?.({ appContext, baseContext, pathname });
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
