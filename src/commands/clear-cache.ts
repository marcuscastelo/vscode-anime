import { MarucsAnime } from "../extension";
import { TextEditorCommand } from "./types";

export const clearCache: TextEditorCommand<void> = () => {
  MarucsAnime.INSTANCE.clearCache();
};
