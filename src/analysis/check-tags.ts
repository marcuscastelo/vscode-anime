import { type TextDocument } from 'vscode';

import { type Show } from '../core/show';
import { type Tag, TagTarget } from '../core/tag';

export function checkTags(_document: TextDocument, currTags: Tag[], targetShow: Show) {
	const missingTags = targetShow.tags.filter(
		tag => tag.target === TagTarget.SHOW && !currTags.includes(tag)
	);
	const extraTags = currTags.filter(
		tag => tag.target === TagTarget.SHOW && !targetShow.tags.includes(tag)
	);

	return { missingTags, extraTags };
}
