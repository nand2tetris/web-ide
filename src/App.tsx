import { Suspense, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { LocalStorageFileSystemAdapter } from "@davidsouther/jiffies/lib/esm/fs";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";

import urls from "./urls";
import * as projects from "./projects";
import Header from "./components/shell/header";
import Footer from "./components/shell/footer";
import { AppContext, makeAppContext } from "./App.context";
import { Settings } from "./components/shell/settings";

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
  );
}

export default App;
