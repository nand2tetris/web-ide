import { span } from "@davidsouther/jiffies/dom/html.js";

export function icon(name: string) {
  return span({ class: "material-symbols-outlined" }, name);
}
