import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs";
import { render, RenderOptions } from "@testing-library/react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { ReactElement } from "react";
import { makeAppContext } from "../App.context";
import * as Not from "../projects/project_01/01_not";
import ue from "@testing-library/user-event";
export const userEvent = ue;
export { cleanState } from "@davidsouther/jiffies/lib/esm/scope/state";

const I18nWrapper = ({ children }: any) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const i18nRender = (ui: ReactElement, options: RenderOptions = {}) =>
  render(ui, { wrapper: I18nWrapper, ...options });

export const appContext = () =>
  makeAppContext(
    new FileSystem(
      new ObjectFileSystemAdapter({
        "/chip/project": "01",
        "/chip/chip": "Not",
        "/projects/01/Not/Not.hdl": Not.hdl,
        "/projects/01/Not/Not.tst": Not.tst,
        "/projects/01/Not/Not.cmp": Not.cmp,
      })
    )
  );

export * from "@testing-library/react";
export { i18nRender as render };
