import Compiler from "./compiler";

function compile() {
  console.log('Compiling ...');
  const code = document.querySelector<HTMLTextAreaElement>('#input')?.value ?? "";
  const res = Compiler.compile(code);
  console.log(res);
  document.querySelector<HTMLTextAreaElement>('#output')!.value = res;
}
document.querySelector<HTMLButtonElement>('#compile')?.addEventListener('click', () => compile());

// function error(line: number, message: string): string {
//   return report(line, "", message);
// }

// function report(line: number, where: string, message: string): string {
//   return `[line ${line} Error  ${where}:${message}`;
// }
