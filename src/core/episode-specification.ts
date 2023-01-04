import { Err, Ok, Result } from "rustic";

export enum EpisodeSpecificationKind {
    EpisodeNumber = "EpisodeNumber",
    EpisodeRange = "EpisodeRange",
};

export type EpisodeSpecification = 
    | { kind: EpisodeSpecificationKind.EpisodeNumber, number: number }
    | { kind: EpisodeSpecificationKind.EpisodeRange, range: EpisodeRange };

export type EpisodeRange = {
    start: number,
    end: number,
};

export function parseEpisodeRange(spec: string): EpisodeRange | undefined {
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

export function createSpecificationFromString(spec: string): Result<EpisodeSpecification, Error> {
    const episodeNumber = +spec;
    if (!isNaN(episodeNumber)) {
        return Ok({
            kind: EpisodeSpecificationKind.EpisodeNumber,
            number: episodeNumber,
        });
    }

    const range = parseEpisodeRange(spec);
    if (range !== undefined) {
        return Ok({
            kind: EpisodeSpecificationKind.EpisodeRange,
            range,
        });
    }

    return Err(new Error(`Invalid episode specification: ${spec}`));
}