import { provide } from "@davidsouther/jiffies/lib/esm/dom/provide";
import { Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import { LocalStorageFileSystemAdapter } from "@davidsouther/jiffies/lib/esm/fs";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";

import { Icon } from "./components/icon";
import urls from "./urls";
import * as projects from "./projects";

function StatusLine() {
  return <></>;
}

function App() {
  useEffect(() => {
    const fs = new FileSystem(new LocalStorageFileSystemAdapter());
    fs.stat("/projects/01/Not/Not.hdl").catch(() => projects.resetFiles(fs));
    provide({ fs, status: (status: string) => statusLine.update(status) });
  });
  return (
    <>
      {/* <Settings></Settings> */}
      <Router>
        <header>
          <nav>
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
                  Online
                </strong>
              </li>
            </ul>
            <ul className="icon-list">
              {urls.map(({ href, icon, link }) => (
                <li key={href}>
                  <Icon name={icon}></Icon>
                  <Link to={href}>{link}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main className="flex flex-1">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {urls.map(({ href, target }) => (
                <Route key={href} path={href} element={target} />
              ))}
            </Routes>
          </Suspense>
        </main>
        <footer className="flex row justify-between">
          <StatusLine />
          <div className="flex row align-center">
            <a href="./user_guide/" style={{ marginRight: "var(--spacing)" }}>
              User&nbsp;Guide
            </a>
            <button
              onClick={() => {
                // settings.setAttribute("open", "open");
              }}
            >
              Settings
            </button>
          </div>
        </footer>
      </Router>
    </>
  );
}

export default App;
