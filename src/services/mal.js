"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAL = void 0;
const axios_1 = require("axios");
const time_utils_1 = require("../utils/time-utils");
const API = axios_1.default.create({
    baseURL: "https://api.jikan.moe/v3/"
});
let _processing = false;
function _wakeUpProcess() {
    if (_processing) {
        return;
    }
    _processPendingRequests();
}
const WAIT_TIME = 4500;
let _lastTime = 0;
let _pendingRequests = [];
async function _processPendingRequests() {
    _processing = true;
    while (_pendingRequests.length > 0) {
        let [resPath, resolve] = _pendingRequests.shift() ?? ['', undefined];
        // Sleeps if too many requests are being made
        let elapsedTime = Date.now() - _lastTime;
        await (0, time_utils_1.sleep)(Math.max(0, WAIT_TIME - elapsedTime));
        _lastTime = Date.now();
        // Makes the request
        console.log((new Date(Date.now()).toLocaleTimeString()), "Making request: ", resPath);
        let response = await API.get(resPath);
        console.log("Response = ", response);
        console.log('\n\n');
        // Returns the request to the informed callback
        if (resolve) {
            resolve(response.data);
        }
    }
    _processing = false;
}
function request(resourcePath) {
    return new Promise((res, rej) => {
        _pendingRequests.push([resourcePath, response => res(response)]);
        _wakeUpProcess();
    });
}
var MAL;
(function (MAL) {
    async function searchAnime(animeTitle) {
        return (await request('/search/anime?q=' + animeTitle)).results;
    }
    MAL.searchAnime = searchAnime;
})(MAL = exports.MAL || (exports.MAL = {}));
_processPendingRequests();
//# sourceMappingURL=mal.js.map