import assert = require("assert");
import { test, suite } from "mocha";
import { equip } from "rustic";
import { EpisodeRange } from "../../core/episode-range";
import { EpisodeSpecificationKind, EpisodeSpecification } from "../../core/episode-specification";

suite("Episode Specification", () => {
    //TODO: move to new test file for range
    test("Episode parseRange Test", () => {
        const { start, end } = EpisodeRange.fromString("1->2")!;
        assert.strictEqual(start, 1);
        assert.strictEqual(end, 2);
    });

    test("Episode createSpecificationFromString Test with range", () => {
        const spec = equip(EpisodeSpecification.fromString("1->2")).unwrap();
        assert.strictEqual(spec.kind, EpisodeSpecificationKind.EpisodeRange);

        if (spec.kind !== EpisodeSpecificationKind.EpisodeRange) {
            throw new Error("Unexpected kind");
        }

        assert.strictEqual(spec.range.start, 1);
        assert.strictEqual(spec.range.end, 2);
    });

    test("Episode createSpecificationFromString Test with number", () => {
        const spec = equip(EpisodeSpecification.fromString("1")).unwrap();
        assert.strictEqual(spec.kind, EpisodeSpecificationKind.EpisodeNumber);

        if (spec.kind !== EpisodeSpecificationKind.EpisodeNumber) {
            throw new Error("Unexpected kind");
        }

        assert.strictEqual(spec.number, 1);
    });
});