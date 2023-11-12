import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";
import * as basic_loop from "./11_basic_loop.js";
import * as fibonacci_series from "./12_fibonacci_series.js";
import * as simple_function from "./20_simple_function.js";
import * as nested_call from "./21_nested_call.js";
import * as fibonacci_element from "./22_fibonacci_element.js";
import * as statics_test from "./23_statics_test.js";

export const VMS = {
  BasicLoop: {
    "BasicLoop.vm": basic_loop.vm,
    "BasicLoop.vm_tst": basic_loop.vm_tst,
    "BasicLoop.cmp": basic_loop.cmp,
    "BasicLoop.tst": basic_loop.hdl_tst,
  },
  FibonacciSeries: {
    "FibonacciSeries.vm": fibonacci_series.vm,
    "FibonacciSeries.vm_tst": fibonacci_series.vm_tst,
    "FibonacciSeries.cmp": fibonacci_series.cmp,
    "FibonacciSeries.tst": fibonacci_series.hdl_tst,
  },
  SimpleFunction: {
    "SimpleFunction.vm": simple_function.vm,
    "SimpleFunction.vm_tst": simple_function.vm_tst,
    "SimpleFunction.cmp": simple_function.cmp,
    "SimpleFunction.tst": simple_function.hdl_tst,
  },
  NestedCall: {
    "NestedCall.vm": nested_call.vm,
    "NestedCall.vm_tst": nested_call.vm_tst,
    "NestedCall.cmp": nested_call.cmp,
    "NestedCall.tst": nested_call.hdl_tst,
  },
  FibonacciElement: {
    "FibonacciElement.vm": fibonacci_element.vm,
    "FibonacciElement.vm_tst": fibonacci_element.vm_tst,
    "FibonacciElement.cmp": fibonacci_element.cmp,
    "FibonacciElement.tst": fibonacci_element.hdl_tst,
  },
  StaticsTest: {
    "StaticsTest.vm": statics_test.vm,
    "StaticsTest.vm_tst": statics_test.vm_tst,
    "StaticsTest.cmp": statics_test.cmp,
    "StaticsTest.tst": statics_test.hdl_tst,
  },
};

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/08");
  await reset(fs, VMS);
  await fs.popd();
}
