import { StringLike } from "./parser/base";

export class Token {
  value: string;
  constructor(readonly str: StringLike) {
    this.value = str.toString();
  }
}
