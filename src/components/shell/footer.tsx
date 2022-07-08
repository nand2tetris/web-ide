import { Icon } from "../pico/icon";
import StatusLine from "./statusline";

const Footer = ({ openSettings }: { openSettings: () => void }) => (
  <footer className="flex row justify-between">
    <StatusLine />
    <div className="flex row align-center">
      <button onClick={openSettings}>
        <Icon name="settings"></Icon>
      </button>
    </div>
  </footer>
);

export default Footer;
