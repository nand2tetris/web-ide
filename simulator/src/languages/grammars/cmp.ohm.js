const cmp = `
Cmp <: Base {
  Root := line*
  line = lineBody ! (newline | end)
  lineBody = bar cell+
  cell = cellvalue bar
  cellvalue = (~(bar|newline) any)*
}`;
export default cmp;
