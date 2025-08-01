import { MarucsAnime } from '../extension';
import { type TextEditorCommand } from './types';

export const clearCache: TextEditorCommand<void> = () => {
	MarucsAnime.INSTANCE.clearCache();
};
