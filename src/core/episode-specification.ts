import { equip, Err, Ok, Result } from "rustic";
import { EpisodeRange } from './episode-range';

export enum EpisodeSpecificationKind {
    EpisodeNumber = "EpisodeNumber",
    EpisodeRange = "EpisodeRange",
    EpisodePartial = "EpisodePartial",
};

export type CompleteEpisodeSpecification = EpisodeSpecification & { partial: false };
export type PartialEpisodeSpecification = EpisodeSpecification & { partial: true };

export type EpisodeSpecification =
    | { partial: false } & { kind: EpisodeSpecificationKind.EpisodeNumber, number: number }
    | { partial: false } & { kind: EpisodeSpecificationKind.EpisodeRange, range: EpisodeRange }
    | { partial: true  } & { kind: EpisodeSpecificationKind.EpisodePartial };

export namespace EpisodeSpecification {
    export function fromString(spec: string): Result<EpisodeSpecification, Error> {
        spec = spec ?? '';
        if (spec === '--') {
            return Ok({
                kind: EpisodeSpecificationKind.EpisodePartial,
                partial: true,
            });
        }

        const episodeNumber = +spec;
        if (!isNaN(episodeNumber)) {
            return Ok({
                kind: EpisodeSpecificationKind.EpisodeNumber,
                partial: false,
                number: episodeNumber,
            });
        }

        const range = equip(EpisodeRange.fromString(spec));
        if (range.isSome()) {
            return Ok({
                kind: EpisodeSpecificationKind.EpisodeRange,
                partial: false,
                range: range.unwrap(),
            });
        }

        return Err(new Error(`Invalid episode specification: ${spec}`));
    }

    export function fromNumber(episodeNumber: number): EpisodeSpecification {
        return {
            kind: EpisodeSpecificationKind.EpisodeNumber,
            partial: false,
            number: episodeNumber,
        };
    }

    export function getLastEpisodeNumber(specification: CompleteEpisodeSpecification): number {
        switch (specification.kind) {
            case EpisodeSpecificationKind.EpisodeNumber:
                return specification.number;
            case EpisodeSpecificationKind.EpisodeRange:
                return specification.range.end;
        }
    }
}