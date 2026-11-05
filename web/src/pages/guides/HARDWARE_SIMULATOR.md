**The Hardware Simulator** is used for building and testing all the chips discussed in Nand to Tetris projects 1, 2, 3, and 5. Each chip is defined in a chipName.hdl file, and the most recent versions of these files are autosaved and persisted in your browser memory. This means that the next time you will use the hardware simulator, you will see the most recent versions of these files.

**Submitting HDL files:** If the course that you take requires submitting HDL files (e.g. for grading), you can write and test the files using this hardware simulator. When a chip passes its tests, you can copy its HDL code from the simulator’s editor panel and paste it into any standard text editor.
The simulator features three panels (from left to right): an HDL editor, a pins panel, and a test panel.

##### **HDL editor** (left panel)

To build or edit a chip (HDL program), select the chip name from the Project menu and the menu right next to it. This results in three actions: (i) the chipName.hdl file is loaded into the editor; (ii) the chip’s pin names are displayed in the middle panel, and (iii) the chip’s test script is displayed in the right panel. Any change that you make to the HDL code is saved automatically.

**Builtin chips:** Each chip in projects 1, 2, 3 and 5 has a builtin version. The builtin version features the chip’s interface, and a builtin implementation which is part of the simulator’s software. The builtin version allows users to experiment with the chip’s operations before implementing it in HDL. To do so, select the BuiltIn toggle and test the chip using either interactive or script-based simulation (described next).

**Editor help:** Red squiggle marks chip and pins that do not exist, or a pin that is declared twice. Hover over a squiggle or view the Problems panel to read what is wrong. Try this in the `Not` chip, which you build from a `Nand` chip:

```
CHIP Not {
    IN in;
    OUT out;

    PARTS:
    Nand(a=in, b=, out=in);
}
```

* **Problems.** The `b=` and `out=in` both need fixing. The missing pin after `b=` is reported first. After you complete `b=in`, the `Nand` line reports a loop caused by `out=in`.
* **Completion.** Depending on context, suggestions can be builtin and custom chip names, valid pins for the current left or right hand side of a pin assignment, or appropriate HDL keywords. In this example, set the cursor at `b=`, and then press `Ctrl+Space` (`Control+Space` on macOS) for suggestions. It should suggest `in` as a pin name. Choose `in` to complete `b=in` before trying the navigation examples below.
* **Go to definition.** Put the cursor on the `in` pin in `out=in`  and press `F12` to jump to its declaration. For an internal pin, that would be the first wire that pin is wired to.
* **Find all references.** Press `Shift+F12` on a pin to list every wire that uses it, this time the pins in the `Nand` gate.
* **Rename.** Press `F2` on a pin and type a new name. Every use in the chip changes together. The rename is refused if the new name is already taken.
* **Outline.** Press `Ctrl+Shift+O` (`Cmd+Shift+O` on a Mac) to list the chip and its pins, and to jump to any of them.

The editor checks your chip against the builtin chips, and other `.hdl` files in the project. It can tell you about a misspelled chip or pin names before you click Eval. When parsing resumes after an incomplete line, checking continues. Unresolved names may appear as faint hints while input is incomplete.

##### **Pins panel** (in the middle)

Displays the names of the chip’s pins (input, output, internal), and their current values. The current pin values are computed by the chip logic when the user clicks the Eval button, or when an “eval” command is executed in the chip’s test script. If a pin’s width is more than one bit, a dec/bin toggle allows displaying its value in either a decimal or a binary format. To “evaluate a chip”, change one or more of its input pins, and click the Eval button.

**The clock and reset buttons** are enabled only for sequential chips. A chip is said to be sequential if it contains a sequential chip-part, or one of its chip-parts contains a sequential chip-part. The DFF chip is sequential. Therefore, all the chips that use a DFF directly or indirectly are sequential. Clicking the clock button advances the clock forward in either one tick or one tock. The resulting time step is displayed. Clicking the reset button resets the clock.

**Chip visualizations:** Some builtin chips have optional visualizations, which are displayed automatically by the simulator (and can be turned off by the user). The chip visualizations provide helpful information about some of the chips. For example, the ALU visualization displays the name of the operation that the ALU performs, and the visualizations of the memory chips display their internal states. We use this information to illustrate the intended chips’ behavior.

##### **Test panel** (on the right)

The test panel displays the test script that we supply for the loaded chip. The “current command”, which is highlighted in yellow, is the test script command that will be executed next. To test a chip, use the step button (executes the current command), run button (executes the entire test script, from the current command onward), or the reset button (makes the first command in the script the current command).

The compare file (if one is supplied) and the output file generated by the test script can be displayed by clicking the respective tabs.

The test script can be edited, but it is recommended to start testing the chip using the supplied script. Changes made to the test script (if any) are not saved.

**Bug / issue reports**
If you wish to report a bug or propose how to improve something, click the bug icon and write your bug/issue description. You will be asked to login into your GitHub account (if you have one).
