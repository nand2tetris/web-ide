const cmp = `
Cmp <: Base {
  Root := line*
  line = bar cell+ newline?
  cell = cellvalue bar
  cellvalue = (~(bar|newline) any)*
}`;
export default cmp;
