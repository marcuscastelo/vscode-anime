"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shows_1 = require("./shows");
class ShowStorage {
    constructor() {
        this.showDict = {};
        this.friendList = [];
    }
    registerShow(declarationLine, title, tags = [], overwrite = true) {
        if (!overwrite && this.isShowRegistered(title)) {
            console.warn(`Not registering already registered anime: `, title);
            return this.getShow(title);
        }
        let anime = new shows_1.Show(declarationLine, { title, tags });
        this.showDict[title] = anime;
        return anime;
    }
    registerFriend(friendName) {
        if (this.friendList.indexOf(friendName) === -1)
            this.friendList.push(friendName);
    }
    getShow(animeName) {
        const show = this.showDict[animeName];
        return show;
    }
    getOrCreateShow(showTitle, currentLine, animeTagsAtCreation = []) {
        return this.getShow(showTitle) ?? this.registerShow(currentLine, showTitle, animeTagsAtCreation);
    }
    isShowRegistered(animeName) {
        return this.getShow(animeName) !== null;
    }
    registerWatchEntry(animeName, watchEntry) {
        let show = this.getShow(animeName);
        if (show) {
            show.updateLastWatchEntry(watchEntry);
        }
        else {
            console.error(`Trying to add watch entry to unkown anime: \n\
			Anime: ${animeName} \n\
			Entry: ${watchEntry}`);
        }
    }
    listShows() {
        return Object.keys(this.showDict);
    }
    listFriends() {
        return [...this.friendList];
    }
}
exports.default = ShowStorage;
//# sourceMappingURL=showStorage.js.map