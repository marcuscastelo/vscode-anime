import { Tag } from "../tag";
import { Registry } from "./registry";

export class TagRegistry extends Registry<Tag> {
    public static readonly instance = new TagRegistry();
}


