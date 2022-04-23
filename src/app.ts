import {
  header,
  li,
  main,
  nav,
  strong,
  ul,
} from "@davidsouther/jiffies/dom/html.js";
import { link } from "@davidsouther/jiffies/dom/router/link.js";
import { Router } from "@davidsouther/jiffies/dom/router/router.js";

import urls from "./urls.js";

export const App = () => {
  const router = Router.for(urls, "test");

  const app = [
    header(
      nav(
        ul(li(strong("CPU Emulator"))),
        ul(...urls.map((url) => li(link(url))))
      )
    ),
    router(main({ class: "container-fluid" })),
  ];
  return app;
};
