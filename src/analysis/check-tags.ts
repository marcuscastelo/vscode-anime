import { TextDocument } from "vscode";
import { Show } from "../core/show/shows";
import { Tag, TagTarget } from "../core/tag";

export function checkTags(
  _document: TextDocument,
  currTags: Tag[],
  targetShow: Show,
) {
  const missingTags = targetShow.info.tags.filter(
    (tag) => tag.target === TagTarget.SHOW && !currTags.includes(tag),
  );
  const extraTags = currTags.filter(
    (tag) =>
      tag.target === TagTarget.SHOW && !targetShow.info.tags.includes(tag),
  );

  return { missingTags, extraTags };
}
