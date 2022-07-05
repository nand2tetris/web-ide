import { Suspense, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { LocalStorageFileSystemAdapter } from "@davidsouther/jiffies/lib/esm/fs";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";

import urls from "./urls";
import * as projects from "./projects";
import Header from "./components/shell/header";
import Footer from "./components/shell/footer";
import { StorageContext } from "./util/storage";
import { StatusLineContext } from "./components/shell/statusline";

function App() {
  const [status, setStatus] = useState("");
  const fs = new FileSystem(new LocalStorageFileSystemAdapter());
  useEffect(() => {
    fs.stat("/projects/01/Not/Not.hdl").catch(() => projects.resetFiles(fs));
  });

  return (
    <StatusLineContext.Provider value={{ status, setStatus }}>
      <StorageContext.Provider value={fs}>
        {/* <Settings></Settings> */}
        <Router>
          <Header urls={urls}></Header>
          <main className="flex flex-1">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                {urls.map(({ href, target }) => (
                  <Route key={href} path={href} element={target} />
                ))}
              </Routes>
            </Suspense>
          </main>
          <Footer></Footer>
        </Router>
      </StorageContext.Provider>
    </StatusLineContext.Provider>
  );
}

export default App;
