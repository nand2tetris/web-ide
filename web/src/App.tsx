import { Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { en } from "make-plural/plurals";
import {
  FileSystem,
  LocalStorageFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs";
import urls from "./urls";
import { loaders } from "@computron5k/simulator/projects/index.js";
import {
  BaseContext,
  useBaseContext,
} from "@computron5k/components/stores/base.context.js";
import Header from "./shell/header";
import Footer from "./shell/footer";
import { AppContext, useAppContext } from "./App.context";
import { Settings } from "./shell/settings";
import { messages } from "./locales/en/messages";
import { messages as plMessages } from "./locales/en-PL/messages";
import { registerLanguages } from "./languages/loader";
import { FilePicker } from "./shell/file_select";

import "./pico/flex.scss";
import "./pico/pico.scss";

i18n.load("en", messages);
i18n.load("en-PL", plMessages);
i18n.loadLocaleData({
  en: { plurals: en },
  "en-US": { plurals: en },
  "en-PL": { plurals: en },
});
i18n.activate(navigator.language);
const fs = new FileSystem(new LocalStorageFileSystemAdapter());

function App() {
  const baseContext = useBaseContext(fs);
  const appContext = useAppContext();

  useEffect(() => {
    registerLanguages();
  }, []);

  useEffect(() => {
    fs.stat("/projects/01/Not/Not.hdl").catch(async () => {
      await loaders.resetFiles(fs);
    });
  }, [fs]);

  useEffect(() => {
    (document.children[0] as HTMLHtmlElement).dataset.theme =
      appContext.theme === "system" ? "" : appContext.theme;
  }, [appContext.theme]);

  return (
    <I18nProvider i18n={i18n}>
      <BaseContext.Provider value={baseContext}>
        <AppContext.Provider value={appContext}>
          <Settings />
          <FilePicker />
          <Router basename={process.env.PUBLIC_URL}>
            <Header urls={urls} />
            <main className="flex flex-1">
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  {urls.map(({ href, target }) => (
                    <Route key={href} path={href} element={target} />
                  ))}
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </Router>
        </AppContext.Provider>
      </BaseContext.Provider>
    </I18nProvider>
  );
}

export default App;
