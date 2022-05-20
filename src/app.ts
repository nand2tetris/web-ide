import ButtonBar from "@davidsouther/jiffies/components/button_bar.js";
import {
  a,
  article,
  button,
  dd,
  dialog,
  div,
  dl,
  dt,
  footer,
  header,
  li,
  main,
  nav,
  p,
  strong,
  ul,
} from "@davidsouther/jiffies/dom/html.js";
import { provide } from "@davidsouther/jiffies/dom/provide.js";
import { link } from "@davidsouther/jiffies/dom/router/link.js";
import { Router } from "@davidsouther/jiffies/dom/router/router.js";
import {
  FileSystem,
  LocalStorageFileSystemAdapter,
} from "@davidsouther/jiffies/fs.js";

import urls from "./urls.js";
import * as projects from "./projects/index.js";

export const App = () => {
  const router = Router.for(urls, "chip");
  const fs = new FileSystem(new LocalStorageFileSystemAdapter());
  fs.stat("/projects/01/Not.hdl").catch(() => projects.resetFiles(fs));
  provide({ fs, status: (status: string) => statusLine.update(status) });

  const statusLine = div("\u00a0");
  const settings = dialog(
    article(
      header(
        p("Settings"),
        a({
          class: "close",
          href: "#",
          events: {
            click: (e) => {
              e.preventDefault();
              settings.removeAttribute("open");
            },
          },
        })
      ),
      main(
        dl(
          header("Project"),
          dt("Files"),
          dd(
            button(
              {
                events: {
                  click: (e) => {
                    projects.resetFiles(fs);
                    statusLine.update("Reset files in local storage");
                  },
                },
              },
              "Reset"
            )
          )
          // dt("Numeric Format"),
          // dd(
          //   ButtonBar({
          //     value: "B",
          //     values: ["B", "D", "X", "A"],
          //     events: {
          //       onSelect: () => {},
          //     },
          //   })
          // )
        )
      )
    )
  );

  const app = [
    settings,
    header(
      nav(
        ul(li(strong("NAND2Tetris Online"))),
        ul(...urls.map((url) => li(link(url))))
      )
    ),
    router(main({ class: "flex flex-1" })),
    footer(
      { class: "flex row justify-between" },
      statusLine,
      div(
        { class: "flex row align-center" },
        a(
          { href: "./user_guide/", style: { marginRight: "var(--spacing)" } },
          "User\u00a0Guide"
        ),
        button(
          {
            events: {
              click: () => settings.setAttribute("open", "open"),
            },
          },
          "Settings"
        )
      )
    ),
  ];
  return app;
};
