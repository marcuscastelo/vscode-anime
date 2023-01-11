import { Option } from "rustic";
import { EpisodeSpecification } from "./episode-specification";

export type EpisodeRange = {
    start: number,
    end: number,
};

export namespace EpisodeRange {
    export function fromString(spec: string): Option<EpisodeRange> {
        const match = spec.match(/^([\d.]+)(?:->|,)([\d.]+)$/); //TODO: episode list vs range [1,2,3] == [1->3]
        if (match === null) {
            return undefined;
        }

        const start = parseInt(match[1]);
        const end = parseInt(match[2]);

        if (isNaN(start) || isNaN(end)) {
            return undefined;
        }

        return {
            start,
            end,
        };
    }

    export function fromSpec(spec: EpisodeSpecification, implicitConvert = true) : Option<EpisodeRange> {
        switch (spec.kind) {
            case "EpisodeNumber":
                if (!implicitConvert) {
                    return undefined;
                }
                return {
                    start: spec.number,
                    end: spec.number,
                };
            case "EpisodeRange":
                return spec.range;
        }
    }
}