import { TextDocument } from "vscode";
import LineContext from "../../list-parser/line-context";
import { WatchEntry } from "../../types";
import { PropertyType } from "../../utils/typescript-utils";
import { DocumentMaker } from "../helpers/text-document";
import { WatchEntryLineInfo } from "../../list-parser/line-info";

export type DocumentTestExpectations = {
    currentDate: string,
    currentShowTitle:string,
    lastWatchEntryParams: PropertyType<WatchEntryLineInfo, "params">;
};

export type Sample = {
    document: TextDocument,
    expectations: DocumentTestExpectations,
};

export const minimalDateTitleWatchEntry: Sample = {
    document: DocumentMaker.makeFromLines([
        "27/03/2021",
        "Anime1:",
        "21:32 - 21:33 01",
    ]),
    expectations: {
        currentDate: "27/03/2021",
        currentShowTitle: "Anime1",
        lastWatchEntryParams: {
            startTime: "21:32",
            endTime: "21:33",
            episode: "01",
            company: [],
        }
    }
};

export const minimalDateTitleWatchEntryWithFriends: Sample = {
    document: DocumentMaker.makeFromLines([
        "27/03/2021",
        "Anime1:",
        "21:32 - 21:33 01 {Fulano}",
    ]),
    expectations: {
        currentDate: "27/03/2021",
        currentShowTitle: "Anime1",
        lastWatchEntryParams: {
            startTime: "21:32",
            endTime: "21:33",
            episode: "01",
            company: ["Fulano"],
        }
    }
};

export const minimalDateTitleWatchEntryWithFriendsAndTags: Sample = {
    document: DocumentMaker.makeFromLines([
        "27/03/2021",
        "[NOT-ANIME]",
        "Anime1:",
        "21:32 - 21:33 01 {Fulano}",
    ]),
    expectations: {
        currentDate: "27/03/2021",
        currentShowTitle: "Anime1",
        lastWatchEntryParams: {
            startTime: "21:32",
            endTime: "21:33",
            episode: "01",
            company: ["Fulano"],
        }
    }
};