import { loader } from "@monaco-editor/react";
import { CmpLanguage } from "./grammars/cmp";
import { HdlLanguage } from "./grammars/hdl";
import { TstLanguage } from "./grammars/tst";

const LANGUAGES = {
  hdl: HdlLanguage,
  cmp: CmpLanguage,
  tst: TstLanguage,
};

export async function registerLanguages() {
  const { languages } = await loader.init();
  for (const [id, language] of Object.entries(LANGUAGES)) {
    languages.register({ id });
    languages.setMonarchTokensProvider(id, language);
  }
}
