import { COMMENT_TOKEN } from "./line-type";


export default class LineUtils {
    /**
     * Removes the comment from the line
     * @param text line text
     * @returns line text without the comment
     */
    public static removeComment(text: string): string {
        let commentTokenPosition = text.indexOf(COMMENT_TOKEN);
        if (commentTokenPosition !== -1) {
            text = text.substring(0, commentTokenPosition);
        }
        return text;
    }
}