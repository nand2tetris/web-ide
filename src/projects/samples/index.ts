import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs";
// import * as Hack from "./hack";
import * as Tst from "./tst";
import { FILES as PROJECT6 } from "../project_06";
// import { Fill } from "./asm";

const TST = {
  "TickTock.tst": Tst.TickTock,
};

// const HACK = {
//   "Add.hack": Hack.Add,
//   "Max.hack": Hack.Max,
//   "Rect.hack": Hack.Rect,
// };

// const ASM = {
//   "Fill.asm": Fill,
// };

export async function loadSamples(fs: FileSystem) {
  await fs.pushd("/samples");
  // await reset(fs, HACK);
  await reset(fs, TST);
  await reset(fs, PROJECT6);
  // await reset(fs, ASM);
  await fs.popd();
}
