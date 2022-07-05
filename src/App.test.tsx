import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders NAND2Tetris Header", () => {
  render(<App />);
  const linkElement = screen.getByText(/^NAND2Tetris$/i);
  expect(linkElement).toBeInTheDocument();
});

test("renders User Guide link", () => {
  render(<App />);
  const linkElement = screen.getByText(/User.Guide/i);
  expect(linkElement).toBeInTheDocument();
});
