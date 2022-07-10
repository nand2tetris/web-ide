import { Suspense, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { en } from "make-plural/plurals";

import { LocalStorageFileSystemAdapter } from "@davidsouther/jiffies/lib/esm/fs";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";

import urls from "./urls";
import * as projects from "./projects";
import Header from "./components/shell/header";
import Footer from "./components/shell/footer";
import { AppContext, makeAppContext } from "./App.context";
import { Settings } from "./components/shell/settings";
import { messages } from "./locales/en/messages";
import { messages as plMessages } from "./locales/en-PL/messages";

i18n.load("en", messages);
i18n.load("en-PL", plMessages);
i18n.loadLocaleData({
  en: { plurals: en },
  "en-PL": { plurals: en },
});
i18n.activate("en");

function App() {
  const appContext = useMemo(
    () => makeAppContext(new FileSystem(new LocalStorageFileSystemAdapter())),
    []
  );

  useEffect(() => {
    appContext.fs
      .stat("/projects/01/Not/Not.hdl")
      .catch(() => projects.resetFiles(appContext.fs));
  }, [appContext.fs]);

  return (
    <I18nProvider i18n={i18n}>
      <AppContext.Provider value={appContext}>
        <Settings />
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
          <Footer openSettings={() => appContext.settings.open.next()} />
        </Router>
      </AppContext.Provider>
    </I18nProvider>
  );
}

export default App;
