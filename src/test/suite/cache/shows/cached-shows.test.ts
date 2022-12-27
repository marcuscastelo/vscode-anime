import * as assert from 'assert';
import { Show } from '../../../../cache/shows/cached-shows';
import { Tags, WatchEntry } from '../../../../types';

class CachedShowTest {
    public static get test() { return new CachedShowTest(); }

    private _show?: Show;

    public get show() { return this._show; }

    public withShow(show: Show) {
        this._show = show;
        return this;
    }

    public expectTitleIs(title: string) {
        assert.strictEqual(this._show?.info.title, title, `Expected title to be ${title} but was ${this._show?.info.title}`);
    }

    public expectFirstMentionedLineIs(line: number) {
        assert.strictEqual(this._show?.info.firstMentionedLine, line, `Expected first mentioned line to be ${line} but was ${this._show?.info.firstMentionedLine}`);
    }

    public expectLastMentionedLineIs(line: number) {
        assert.strictEqual(this._show?.info.lastMentionedLine, line, `Expected last mentioned line to be ${line} but was ${this._show?.info.lastMentionedLine}`);
    }

    public expectTagsAre(tags: string[]) {
        assert.deepStrictEqual(this._show?.info.tags.map(t => t.name), tags, `Expected tags to be ${tags} but was ${this._show?.info.tags.map(t => t.name)}`);
    }

    public expectLastWatchEntryIs(watchEntry: WatchEntry | null) {
        assert.deepStrictEqual(this._show?.info.lastWatchEntry, watchEntry, `Expected last watch entry to be ${watchEntry} but was ${this._show?.info.lastWatchEntry}`);
    }
}

suite("LineProcessor Test Suite", () => {
    suite("Show after simple declaration", () => {
        const declaredLine = 0x29A;
        const show = new Show(declaredLine, {title: "SimpleTitle"});
        test("Should have correct title", () => CachedShowTest.test.withShow(show).expectTitleIs("SimpleTitle"));
        test("Should have correct first mentioned line", () => CachedShowTest.test.withShow(show).expectFirstMentionedLineIs(0x29A));
        test("Should have correct last mentioned line", () => CachedShowTest.test.withShow(show).expectLastMentionedLineIs(0x29A));
        test("Should have correct tags", () => CachedShowTest.test.withShow(show).expectTagsAre([]));
        test("Should have correct last watch entry", () => CachedShowTest.test.withShow(show).expectLastWatchEntryIs(null));
    });

    suite("Show after declaration with tags", () => {
        const declaredLine = 0x29A;
        const show = new Show(declaredLine, {title: "SimpleTitle", tags: [Tags['NOT-ANIME'], Tags['MANGA']]});
        test("Should have correct title", () => CachedShowTest.test.withShow(show).expectTitleIs("SimpleTitle"));
        test("Should have correct first mentioned line", () => CachedShowTest.test.withShow(show).expectFirstMentionedLineIs(0x29A));
        test("Should have correct last mentioned line", () => CachedShowTest.test.withShow(show).expectLastMentionedLineIs(0x29A));
        test("Should have correct tags", () => CachedShowTest.test.withShow(show).expectTagsAre(['NOT-ANIME', 'MANGA']));
        test("Should have correct last watch entry", () => CachedShowTest.test.withShow(show).expectLastWatchEntryIs(null));
    });

    suite("Show after declaration and update mentioned line", () => {
        const declaredLine = 0x29A;
        const show = new Show(declaredLine, {title: "SimpleTitle"});
        show.updateLastMentionedLine(0xFFFF);
        test("Should have correct title", () => CachedShowTest.test.withShow(show).expectTitleIs("SimpleTitle"));
        test("Should have correct first mentioned line", () => CachedShowTest.test.withShow(show).expectFirstMentionedLineIs(0x29A));
        test("Should have correct last mentioned line", () => CachedShowTest.test.withShow(show).expectLastMentionedLineIs(0xFFFF));
        test("Should have correct tags", () => CachedShowTest.test.withShow(show).expectTagsAre([]));
        test("Should have correct last watch entry", () => CachedShowTest.test.withShow(show).expectLastWatchEntryIs(null));
    });

    suite("Show after declaration and update last watch entry", () => {
        const declaredLine = 0x29A;
        const show = new Show(declaredLine, {title: "SimpleTitle"});
        const watchEntry: WatchEntry = {
            startTime: "20:00",
            endTime: "21:00",
            episode: 1,
            lineNumber: 0xABCD,
            showTitle: "SimpleTitle",
            company: ['Friend1', 'Friend2']
        };
        show.updateLastWatchEntry(watchEntry);
        
        test("Should have correct title", () => CachedShowTest.test.withShow(show).expectTitleIs("SimpleTitle"));
        test("Should have correct first mentioned line", () => CachedShowTest.test.withShow(show).expectFirstMentionedLineIs(0x29A));
        test("Should have correct last mentioned line", () => CachedShowTest.test.withShow(show).expectLastMentionedLineIs(0xABCD));
        test("Should have correct tags", () => CachedShowTest.test.withShow(show).expectTagsAre([]));
        test("Should have correct last watch entry", () => CachedShowTest.test.withShow(show).expectLastWatchEntryIs(watchEntry));
    });
});