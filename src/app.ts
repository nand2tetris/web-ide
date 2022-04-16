import { header, li, main, nav, strong, ul } from "@jefri/jiffies/dom/html.js";
import { link } from "@jefri/jiffies/router/link.js";
import { Router } from "@jefri/jiffies/router/router.js";

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
