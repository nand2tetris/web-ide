export async function hardware(fileUri: string) {
  // The await eval() hack is for https://github.com/microsoft/TypeScript/issues/43329
  const tst = await import("@nand2tetris/simulator/test/chiptst.js");
  console.log(`Hardware for ${fileUri}`);
  console.log(new tst.ChipTest());
}
