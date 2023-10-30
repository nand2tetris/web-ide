import { useContext } from "react";
import { AppContext } from "../App.context";
import { Icon } from "../pico/icon";
import StatusLine from "./statusline";

const Footer = () => {
  const { settings } = useContext(AppContext);
  return (
    <footer className="flex row justify-between">
      <StatusLine />
      <div className="flex row align-center">
        <a
          href="https://github.com/nand2tetris/web-ide/issues/new/choose"
          target="new"
        >
          Report&nbsp;Bug
        </a>
        &nbsp;
        <button onClick={settings.open}>
          <Icon name="settings"></Icon>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
