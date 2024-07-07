import { useAsmPageStore } from "@nand2tetris/components/stores/asm.store";
import { useChipPageStore } from "@nand2tetris/components/stores/chip.store";
import { useCompilerPageStore } from "@nand2tetris/components/stores/compiler.store";
import { useCpuPageStore } from "@nand2tetris/components/stores/cpu.store";
import { useVmPageStore } from "@nand2tetris/components/stores/vm.store";
import { ReactNode, createContext, useEffect, useState } from "react";

export function usePageContext() {
  const [title, setTitle] = useState<string>();
  const [tool, setTool] = useState<string>();

  const chip = useChipPageStore();
  const cpu = useCpuPageStore();
  const asm = useAsmPageStore();
  const vm = useVmPageStore();
  const compiler = useCompilerPageStore();

  useEffect(() => {
    // chip.actions.initialize();
  }, [chip.actions]);

  useEffect(() => {
    vm.actions.initialize();
  }, [vm.actions]);

  useEffect(() => {
    switch (tool) {
      case "chip":
        setTitle(chip.state.title);
        break;
      case "cpu":
        setTitle(cpu.state.title);
        break;
      case "asm":
        setTitle(asm.state.title);
        break;
      case "vm":
        setTitle(vm.state.title);
        break;
      case "compiler":
        setTitle(compiler.state.title);
        break;
      default:
        setTitle(undefined);
        break;
    }
  }, [
    tool,
    chip.state.title,
    cpu.state.title,
    asm.state.title,
    vm.state.title,
    compiler.state.title,
  ]);

  return {
    setTool,
    title,
    stores: {
      chip,
      cpu,
      asm,
      vm,
      compiler,
    },
  };
}

export const PageContext = createContext<ReturnType<typeof usePageContext>>(
  {} as ReturnType<typeof usePageContext>,
);

export function PageContextProvider(props: { children: ReactNode }) {
  const context = usePageContext();
  return (
    <PageContext.Provider value={context}>
      {props.children}
    </PageContext.Provider>
  );
}
