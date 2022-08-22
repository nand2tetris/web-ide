import { useState } from "react";

export function useDialog() {
  const [open, setOpen] = useState(false);
  return {
    isOpen: open,
    open() {
      setOpen(true);
    },
    close() {
      setOpen(false);
    },
  };
}
