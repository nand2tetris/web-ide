import { loader } from "@monaco-editor/react";
import { AsmLanguage } from "./asm";
import { CmpLanguage } from "./cmp";
import { HdlLanguage } from "./hdl";
import { JackLanguage } from "./jack";
import { TstLanguage } from "./tst";
import { VmLanguage } from "./vm";

const LANGUAGES = {
  hdl: HdlLanguage,
  cmp: CmpLanguage,
  tst: TstLanguage,
  vm: VmLanguage,
  asm: AsmLanguage,
  jack: JackLanguage,
};

export async function registerLanguages() {
  const { languages } = await loader.init();
  for (const [id, language] of Object.entries(LANGUAGES)) {
    languages.register({ id });
    languages.setMonarchTokensProvider(id, language);
  }
}
