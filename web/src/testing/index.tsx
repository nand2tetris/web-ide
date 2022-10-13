import * as Not from "@computron5k/simulator/projects/project_01/01_not.js";
import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { render, RenderOptions } from "@testing-library/react";
import ue from "@testing-library/user-event";
import { ReactElement } from "react";
import { useAppContext } from "../App.context";

export const userEvent = ue;
export { cleanState } from "@davidsouther/jiffies/lib/esm/scope/state";
export * from "@testing-library/react";
export { i18nRender as render };

const I18nWrapper = ({ children }: { children: ReactElement }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const i18nRender = (ui: ReactElement, options: RenderOptions = {}) =>
  render(ui, { wrapper: I18nWrapper, ...options });

export const useTestingAppContext = () =>
  useAppContext(
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
