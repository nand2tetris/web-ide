import StatusLine from "./statusline";

const Footer = () => (
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
);

export default Footer;
