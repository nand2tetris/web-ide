export async function hardware(fileUri: string) {
  // The await eval() hack is for https://github.com/microsoft/TypeScript/issues/43329
  const tst = await eval('import("@computron5k/simulator/tst")');
  console.log(`Hardware for ${fileUri}`);
  console.log(new tst.ChipTest());
}
