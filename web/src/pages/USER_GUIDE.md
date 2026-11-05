# NAND2Tetris Web User Guide

This web application implements the [NAND2Tetris](https://nand2tetris.org) software suite, including an hdl chip simulator, a hack CPU, and a Hack VM.
Students are able to paste their implementations of the various chips and programs

## Chip Simulator

![Empty Chip](%PUBLIC_URL%/user_guide/01_chip_empty.png){:height="256px" width="512px"}

The chip page has five panels, as well as a project selction bar.
In the top left, users can input the text of their HDL chip.
The top center panel displays the chip's input pins, and the bottom center the output pins.
The bottom left panel has any internal pins in the chip.
The right panel includes the test program, the expected comparison output, and after executing the test, the test output and a diff of failed lines.

---

![Simple Not Chip](%PUBLIC_URL%/user_guide/02_chip_simple_nand.png)

The project selection bar loads the chip HDL outlines, tests, and cmp files from the book.
After choosing the "Not" chip, the input and output pins update.
After implementing the chip and clicking "Compile", clicking the input pin buttons will toggle their voltage states.
The output pins will update with the simulated state from the hdl spec.

---

![Complex Chip](%PUBLIC_URL%/user_guide/03_chip_complex.png)

Loading a chip with a 16-bit bus changes the pin panels to show a binary representation of the chip.

---

![Implemented Complex Chip](%PUBLIC_URL%/user_guide/04_chip_complex_implemented.png)

Clicking an input bus will increment that bus by one.

---

![Complex Chip Pins](%PUBLIC_URL%/user_guide/05_chip_complex_failed_test.png)

Clicking "Execute" will run the test against the chip implementation.
Any failing tests will be put in the bottom of the panel, with a diff between the expected and actual output.
You may need to scroll to see all failed lines.

---

![Passed Chip Test](%PUBLIC_URL%/user_guide/06_chip_complex_passed_test.png)

All tests pass!

---

## Editing HDL

While you type in the HDL panel, the editor checks names and offers help.

1. Choose the `Not` chip. Its outline is loaded into the HDL panel.
2. On the line after `PARTS:`, type `Na` and press `Ctrl+Space`. The editor offers `Nand` and the other chips you can use.
3. Choose `Nand` and the editor fills in `Nand(a=, b=, out=)`. Put the cursor after `a=` and press `Ctrl+Space` again. The editor offers `in`, `out`, `true` and `false`, which are the names that can be wired here.
4. Type `Nnad(a=in, b=in, out=out);` by mistake. The name `Nnad` gets a red squiggle. Hover over it to read that no such chip exists.
5. Click on `in` in a wire and press `F12`. The editor jumps to the `IN` line that declares it. Press `Shift+F12` to see every wire that uses it.
6. Press `F2` on `in`, type `x`, and press `Enter`. The declaration and every wire change together.

---

![Settings](%PUBLIC_URL%/user_guide/07_settings.png)

Clicking `Save` in the HDL panel will store the HDL chip to user's local storage.
In settings, clicking `Files: Reset` will restore the files to the book' projects.

## Jack Compiler

The Jack editor knows the classes, fields, variables and subroutines you write, and the classes of the Jack OS.

1. In `Main.jack`, declare `field int x;` and write `method int get() { return y; }`. The name `y` gets a red squiggle, because no field or variable has that name. Change it to `x` and the squiggle goes away.
2. Put the cursor on `x` in `return x;` and press `F12`. The editor jumps to the `field int x;` line. Press `Shift+F12` to see every use of `x` in the class.
3. Press `F2` on `x` and type `count`. The field and every use of it change together. Names in other subroutines that happen to be called `x`, such as a local variable, are left alone.
4. Inside a `function`, press `Ctrl+Space` to be offered the fields, variables, parameters and classes that are in scope. Calling a subroutine that does not exist, such as `Output.printIntt(1);`, shows a squiggle that names the class and the missing subroutine.
5. When your program has several classes, each file can use the others, and a class that no file declares is marked as undefined. The editor refuses to rename a name that other files use unless those files are open, so that no use is left behind.
6. Press `Ctrl+Shift+O` for an outline of the class, with its fields and subroutines. Parameters and variables are listed under their subroutine.
