function StatusLine() {
  return <></>
}

  // const router = Router.for(urls, "chip");
  // const fs = new FileSystem(new LocalStorageFileSystemAdapter());
  // fs.stat("/projects/01/Not/Not.hdl").catch(() => projects.resetFiles(fs));
  // provide({ fs, status: (status: string) => statusLine.update(status) });


function App() {
  return (
    <>
      {/* <Settings></Settings> */}
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
            {/* {... urls.map((url) => (<li>
            <icon icon={url.icon}><link href={url}</link></icon>
            </li>)) } */}
          </ul>
        </nav>
      </header>
      <main className="flex flex-1">{/* <router></router> */}</main>
      <footer className="flex row justify-between">
        <StatusLine></StatusLine>
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
    </>
  );
}

export default App;
