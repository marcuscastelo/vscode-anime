import * as assert from 'assert';
import { checkTags } from "../../../analysis/check-tags";
import { Show } from "../../../cache/shows/cached-shows";
import { Tag } from "../../../core/tag";
import { MarucsAnime } from '../../../extension';

interface ExpectOptions {
    BeOk(): void;
    BeWrong(): void;
    HaveTheseMissingTags(missingTags: Tag[]): void;
    HaveTheseExtraTags(extraTags: Tag[]): void;
    HaveThoseMissingAndExtraTags(missingTags: Tag[], extraTags: Tag[]): void;
};

class TagsExpect implements ExpectOptions {
    private readonly _missingTags: Tag[];
    private readonly _extraTags: Tag[];

    public constructor({ missingTags, extraTags }: { missingTags?: Tag[], extraTags?: Tag[] }) {
        this._missingTags = missingTags ?? [];
        this._extraTags = extraTags ?? [];
    }

    public get missingTags() { return this._missingTags; }
    public get extraTags() { return this._extraTags; }

    public BeOk() {
        assert.strictEqual(this._missingTags.length, 0, `Missing tags: ${this._missingTags.map(t => t.name)}`);
        assert.strictEqual(this._extraTags.length, 0, `Extra tags: ${this._extraTags.map(t => t.name)}`);
    }

    public BeWrong() {
        assert.notStrictEqual(this._missingTags.length + this._extraTags.length, 0);
    }

    public HaveTheseMissingTags(missingTags: Tag[]) {
        assert.deepStrictEqual(missingTags, this._missingTags);
    }

    public HaveTheseExtraTags(extraTags: Tag[]) {
        assert.deepStrictEqual(extraTags, this._extraTags);
    }

    public HaveThoseMissingAndExtraTags(missingTags: Tag[], extraTags: Tag[]) {
        this.HaveTheseMissingTags(missingTags);
        this.HaveTheseExtraTags(extraTags);
    }
}

function nameToTag(tagName: string) {
    return MarucsAnime.INSTANCE.tagRegistry.get(tagName);
}

class CheckTagsTest {
    public static get test() { return new CheckTagsTest(); }
    private _result?: ReturnType<typeof checkTags>;

    private _checkTags(actualTags: (Tag | string)[], showTags: (Tag | string)[]) {
        const actual = actualTags.map(t => typeof t === 'string' ? nameToTag(t)! : t);
        const expected = showTags.map(t => typeof t === 'string' ? nameToTag(t)! : t);

        const dummyShow = new Show(0, {
            title: 'test',
            tags: expected
        });

        return checkTags(actual, dummyShow);
    }

    public withTags(actualTags: (Tag | string)[], showTags: (Tag | string)[]) {
        if (this._result) {
            throw new Error('Please call withTags only once');
        }

        this._result = this._checkTags(actualTags, showTags);
        return this;
    }

    get expectTo() {
        if (!this._result) {
            throw new Error('Please call withTags() first');
        }
        return new TagsExpect(this._result);
    }

    get result() {
        if (!this._result) {
            throw new Error('Please call withTags() first');
        }
        return this._result;
    }

}

suite("LineProcessor Test Suite", () => {
    suite("Correct usage", () => {
        test("NoTags", () => CheckTagsTest.test.withTags([], []).expectTo.BeOk());
        test("OneTag", () => CheckTagsTest.test.withTags(['NOT-ANIME'], ['NOT-ANIME']).expectTo.BeOk());
        test("TwoTags", () => CheckTagsTest.test.withTags(['MANGA', 'NOT-IN-MAL'], ['MANGA', 'NOT-IN-MAL']).expectTo.BeOk());
        test("TwoTagsInDifferentOrder", () => CheckTagsTest.test.withTags(['NOT-IN-MAL', 'MANGA'], ['MANGA', 'NOT-IN-MAL']).expectTo.BeOk());
    });

    suite("Wrong usage", () => {
        test("MissingTagEmpty", () => CheckTagsTest.test.withTags([], ['NOT-ANIME']).expectTo.HaveTheseMissingTags([nameToTag('NOT-ANIME')!]));
        test("MissingTag", () => CheckTagsTest.test.withTags(['MANGA'], ['NOT-ANIME', 'MANGA']).expectTo.HaveTheseMissingTags([nameToTag('NOT-ANIME')!]));
        test("ExtraTagEmpty", () => CheckTagsTest.test.withTags(['NOT-ANIME'], []).expectTo.HaveTheseExtraTags([nameToTag('NOT-ANIME')!]));
        test("ExtraTag", () => CheckTagsTest.test.withTags(['NOT-ANIME', 'MANGA'], ['MANGA']).expectTo.HaveTheseExtraTags([nameToTag('NOT-ANIME')!]));
        test("MissingAndExtraTag", () => CheckTagsTest.test.withTags(['NOT-IN-MAL'], ['MANGA']).expectTo.HaveThoseMissingAndExtraTags([nameToTag('MANGA')!], [nameToTag('NOT-IN-MAL')!]));
        test("MissingAndExtraTagInDifferentOrder", () => CheckTagsTest.test.withTags(['MANGA'], ['NOT-IN-MAL']).expectTo.HaveThoseMissingAndExtraTags([nameToTag('NOT-IN-MAL')!], [nameToTag('MANGA')!]));
    });

    suite("Tags which target are not the show", () => {
        test("MissingTagDoesntMatter", () => CheckTagsTest.test.withTags([], ['REWATCH', '勉強']).expectTo.BeOk());
        test("ExtraTagDoesntMatter", () => CheckTagsTest.test.withTags(['REWATCH', '勉強'], []).expectTo.BeOk());
        test("MissingAndExtraTagDoesntMatter", () => CheckTagsTest.test.withTags(['REWATCH'], ['勉強']).expectTo.BeOk());
        test("MissingAndExtraTagDoesntMatterInDifferentOrder", () => CheckTagsTest.test.withTags(['勉強'], ['REWATCH']).expectTo.BeOk());
    });
});