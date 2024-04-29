import { loader } from "@monaco-editor/react";
import { AsmLanguage } from "./asm";
import { CmpLanguage } from "./cmp";
import { HdlLanguage, HdlSnippets } from "./hdl";
import { TstLanguage } from "./tst";
import { VmLanguage } from "./vm";

const LANGUAGES = {
  hdl: HdlLanguage,
  cmp: CmpLanguage,
  tst: TstLanguage,
  vm: VmLanguage,
  asm: AsmLanguage,
};

const SNIPPETS = {
  hdl: HdlSnippets,
};

let lock = false;
export async function registerLanguages() {
  if (lock) return;
  lock = true;
  lock = true;
  const { languages } = await loader.init();
  for (const [id, language] of Object.entries(LANGUAGES)) {
    languages.register({ id });
    languages.setMonarchTokensProvider(id, language);

    if (SNIPPETS[id]) {
      languages.registerCompletionItemProvider(id, SNIPPETS[id]);
    }
  }
  lock = false;
}
