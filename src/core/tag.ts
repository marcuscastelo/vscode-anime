import { Registry } from "./registry/registry";
import { TagRegistry } from "./registry/tag-registry";

export enum TagTarget {
	WATCH_LINE = 1, // such as [EPISODE-ORDER-VIOLATION]
	WATCH_SESSION, // such as [REWATCH]
	SCRIPT_TAG, //such as [SCRIPT-SKIP(count=100)]
	SHOW, //such as [NOT-ANIME]
};

export type Tag = {
	name: string
	target: TagTarget
	parameters: string[]
};

function createSimpleTag(name: string, target: TagTarget): Tag {
    return {
        name,
        target,
        parameters: []
    };
}

const defaultShowTagsNames = [
    'NOT-ANIME',
    'NOT-IN-MAL',
    'MANGA',
    'WEBTOON',
    'COURSE',
    'DORAMA',
];

const defaultWatchSessionTagsNames = [
    '勉強',
    'REWATCH',
];

const defaultWatchLineTagsNames = [
    'UNSAFE-ORDER',
];

const specificTags = [
    {
        name: 'SCRIPT-SKIP',
        target: TagTarget.SCRIPT_TAG,
        parameters: ['count']
    }
];

function createTagsFromNames(names: string[], target: TagTarget): Tag[] {
    return names.map(name => createSimpleTag(name, target));
}

function createDefaultTags(): Tag[] {
    const defaultTags = [];

    const showTags = createTagsFromNames(defaultShowTagsNames, TagTarget.SHOW);
    const watchSessionTags = createTagsFromNames(defaultWatchSessionTagsNames, TagTarget.WATCH_SESSION);
    const watchLineTags = createTagsFromNames(defaultWatchLineTagsNames, TagTarget.WATCH_LINE);

    defaultTags.push(...showTags);
    defaultTags.push(...watchSessionTags);
    defaultTags.push(...watchLineTags);
    defaultTags.push(...specificTags);

    return defaultTags;
}

export function registerDefaultTags(registry: Registry<Tag>): void {
    const defaultTags = createDefaultTags();
    defaultTags.forEach(tag => registry.register(tag.name, tag));
}