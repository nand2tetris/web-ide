import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import {
  BaseContext,
  useBaseContext,
} from "@nand2tetris/components/stores/base.context.js";
import { loaders } from "@nand2tetris/projects/loader.js";
import { en } from "make-plural/plurals";
import { Suspense, useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AppContext, useAppContext } from "./App.context";
import { registerLanguages } from "./languages/loader";
import { messages, plMessages } from "./locales";
import { FilePicker } from "./shell/file_select";
import Footer from "./shell/footer";
import Header from "./shell/header";
import { Settings } from "./shell/settings";
import urls from "./urls";

import { ErrorBoundary, RenderError } from "./ErrorBoundary";
import { PageContextProvider } from "./Page.context";
import { Redirect } from "./pages/redirect";
import "./pico/flex.scss";
import "./pico/pico.scss";
import "./pico/tooltip.scss";
import { TrackingBanner } from "./tracking";
import { updateVersion } from "./versions";

i18n.load("en", messages.messages);
i18n.load("en-PL", plMessages.messages);
i18n.loadLocaleData({
  en: { plurals: en },
  "en-US": { plurals: en },
  "en-PL": { plurals: en },
});
i18n.activate(navigator.language);

function App() {
  const baseContext = useBaseContext();
  const appContext = useAppContext();

  const fs = baseContext.fs;

  useEffect(() => {
    registerLanguages();
  }, []);

  useEffect(() => {
    if (baseContext.localFsRoot) return;
    fs.stat("/projects/01/Not/Not.hdl").catch(async () => {
      await loaders.resetFiles(fs);
    });
    updateVersion(fs);
  }, [fs]);

  useEffect(() => {
    (document.children[0] as HTMLHtmlElement).dataset.theme =
      appContext.theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : appContext.theme;
  }, [appContext.theme]);

  return (
    <I18nProvider i18n={i18n}>
      <BaseContext.Provider value={baseContext}>
        <AppContext.Provider value={appContext}>
          <PageContextProvider>
            <Settings />
            <FilePicker />
            <Router basename={process.env.PUBLIC_URL}>
              <Header />
              <main className="flex flex-1">
                <ErrorBoundary fallback={RenderError}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                      <Route path="/" element={<Redirect />} />
                      {Object.values(urls).map(({ href, target }) => (
                        <Route key={href} path={href} element={target} />
                      ))}
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </main>
              <Footer />
              <TrackingBanner />
            </Router>
          </PageContextProvider>
        </AppContext.Provider>
      </BaseContext.Provider>
    </I18nProvider>
  );
}

export default App;
