import { Suspense, useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { LocalStorageFileSystemAdapter } from "@davidsouther/jiffies/lib/esm/fs";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";

import urls from "./urls";
import * as projects from "./projects";
import Header from "./components/shell/header";
import Footer from "./components/shell/footer";
import { StorageContext } from "./util/storage";
import { StatusLineContext } from "./components/shell/statusline";
import { Settings, SettingsContext } from "./components/shell/settings";

function App() {
  const [status, setStatus] = useState("");
  const { open } = useContext(SettingsContext);
  const fs = new FileSystem(new LocalStorageFileSystemAdapter());
  useEffect(() => {
    fs.stat("/projects/01/Not/Not.hdl").catch(() => projects.resetFiles(fs));
  });

  return (
    <StatusLineContext.Provider value={{ status, setStatus }}>
      <StorageContext.Provider value={fs}>
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
          <Footer openSettings={() => open.next()} />
        </Router>
      </StorageContext.Provider>
    </StatusLineContext.Provider>
  );
}

export default App;
