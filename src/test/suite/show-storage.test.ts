import LineContextFinder from '../../list-parser/line-context-finder';
import * as assert from 'assert';
import * as SampleDocuments from '../mocks/sample-documents';
import ShowStorage from '../../cache/shows/show-storage';
import 'should';
import { beforeEach, describe, it, suite } from 'mocha';
import { equip } from 'rustic';
import { WatchEntry } from '../../types';

describe("The Show Storage", () => {
    describe("When fresh", () => {
        let showStorage = new ShowStorage();
        beforeEach(() => {
            showStorage = new ShowStorage();
        });

        it("Should be empty", () => {
            showStorage.listShows().should.be.empty();
            showStorage.listFriends().should.be.empty();
        });

        it("Should be able to add a show", () => {
            const result1 = showStorage.registerShow(0, "The Office");
            equip(result1).isOk().should.be.true();

            showStorage.listShows().should.containEql("The Office");
            showStorage.listShows().should.be.size(1);
        });

        it("Should be able to add 2 different shows", () => {
            const result1 = showStorage.registerShow(0, "The Office");
            equip(result1).isOk().should.be.true();

            const result2 = showStorage.registerShow(1, "Friends");
            equip(result2).isOk().should.be.true();

            showStorage.listShows().should.containEql("The Office");
            showStorage.listShows().should.containEql("Friends");
            showStorage.listShows().should.be.size(2);
        });

        it("Should be able to add a friend", () => {
            const result1 = showStorage.registerFriend("Jim");
            equip(result1).isOk().should.be.true();

            showStorage.listFriends().should.containEql("Jim");
            showStorage.listFriends().should.be.size(1);
        });

        it("Should not be able to add the same show twice", () => {
            const result1 = showStorage.registerShow(0, "The Office", [], false);
            equip(result1).isOk().should.be.true();

            const result2 = showStorage.registerShow(0, "The Office", [], false);
            equip(result2).isOk().should.be.false();

            showStorage.listShows().should.be.size(1);
        });

        it("Should not be able to add the same friend twice", () => {
            const result1 = showStorage.registerFriend("Jim");
            equip(result1).isOk().should.be.true();

            const result2 = showStorage.registerFriend("Jim");
            equip(result2).isOk().should.be.false();

            showStorage.listFriends().should.be.size(1);
        });
    });

    describe("When populated", () => {
        let showStorage = new ShowStorage();
        beforeEach(() => {
            showStorage = new ShowStorage();
            showStorage.registerShow(0, "The Office");
            showStorage.registerShow(1, "Friends");
            showStorage.registerFriend("Jim");
            showStorage.registerFriend("Pam");
        });

        it("Should be able to add a new show", () => {
            const result1 = showStorage.registerShow(2, "The Simpsons");
            equip(result1).isOk().should.be.true();

            showStorage.listShows().should.containEql("The Simpsons");
            showStorage.listShows().should.be.size(3);
        });

        it("Should be able to add a new friend", () => {
            const result1 = showStorage.registerFriend("Michael");
            equip(result1).isOk().should.be.true();

            showStorage.listFriends().should.containEql("Michael");
            showStorage.listFriends().should.be.size(3);
        });

        it("Should be able to search for a show", () => {
            const option1 = showStorage.searchShow("The Office");
            equip(option1).isSome().should.be.true();
            
            equip(option1).unwrap().info.title.should.equal("The Office");
        });

        it("Should be able to search for a friend", () => {
            const option1 = showStorage.searchFriend("Jim");
            equip(option1).isSome().should.be.true();
            
            equip(option1).unwrap().should.equal("Jim");
        });

        it("Should return None if searching for a show that doesn't exist", () => {
            const option1 = showStorage.searchShow("The Simpsons");
            equip(option1).isNone().should.be.true();
        });

        it("Should return None if searching for a friend that doesn't exist", () => {
            const option1 = showStorage.searchFriend("Michael");
            equip(option1).isNone().should.be.true();
        });

        it("Should be able to create a new show with getOrCreateShow", () => {
            const result1 = showStorage.getOrCreateShow("The Simpsons", 0);
            equip(result1).isOk().should.be.true();

            showStorage.listShows().should.containEql("The Simpsons");
            showStorage.listShows().should.be.size(3);
        });

        it("Should be able to retrieve an existing show with getOrCreateShow", () => {
            const result1 = showStorage.getOrCreateShow("The Office", 0);
            equip(result1).isOk().should.be.true();

            showStorage.listShows().should.be.size(2);
        });

        it("Should be able to check if a show exists", () => {
            const result1 = showStorage.isShowRegistered("The Office");
            result1.should.be.true();

            const result2 = showStorage.isShowRegistered("The Simpsons");
            result2.should.be.false();
        });

        it("Should be able to check if a friend exists", () => {
            const result1 = showStorage.isFriendRegistered("Jim");
            result1.should.be.true();

            const result2 = showStorage.isFriendRegistered("Michael");
            result2.should.be.false();
        });

        it("Should be able to add a watch entry to a valid show", () => {
            const watchEntry: WatchEntry = {
                showTitle: "The Office",
                company: [
                    "Jim",
                ],
                startTime: "20:00",
                endTime: "21:00",
                episode: 1,
                lineNumber: 5,
            };

            const result1 = showStorage.registerWatchEntry("The Office", watchEntry);
            equip(result1).isOk().should.be.true();
        });

        it("Should not be able to add a watch entry with mismatching show titles", () => {
            const watchEntry: WatchEntry = {
                showTitle: "The Office",
                company: [
                    "Jim",
                ],
                startTime: "20:00",
                endTime: "21:00",
                episode: 1,
                lineNumber: 5,
            };

            const result1 = showStorage.registerWatchEntry("The Simpsons", watchEntry);
            equip(result1).isOk().should.be.false();
        });

        it("Should not be able to add a watch entry with a friend that doesn't exist", () => {
            const watchEntry: WatchEntry = {
                showTitle: "The Office",
                company: [
                    "Michael",
                ],
                startTime: "20:00",
                endTime: "21:00",
                episode: 1,
                lineNumber: 5,
            };

            const result1 = showStorage.registerWatchEntry("The Office", watchEntry);
            equip(result1).isOk().should.be.false();
        });

        it("Should not be able to add a watch entry with a show that doesn't exist", () => {
            const watchEntry: WatchEntry = {
                showTitle: "The Simpsons",
                company: [
                    "Jim",
                ],
                startTime: "20:00",
                endTime: "21:00",
                episode: 1,
                lineNumber: 5,
            };

            const result1 = showStorage.registerWatchEntry("The Simpsons", watchEntry);
            equip(result1).isOk().should.be.false();
        });
    });
});