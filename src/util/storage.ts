import {
  FileSystem,
  LocalStorageFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs";
import { createContext } from "react";

export const StorageContext = createContext(
  new FileSystem(new LocalStorageFileSystemAdapter())
);
