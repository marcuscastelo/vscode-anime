import axios, { AxiosResponse } from 'axios';
const rateLimit = require('axios-rate-limit');
import { AnimeSearchResultItem } from '../types';
import { sleep } from '../utils/time-utils';

const _API = axios.create({
    baseURL: "https://api.jikan.moe/v4/"
});

const API = rateLimit(_API, {
    maxRequests: 1,
    perMilliseconds: 1000,
    maxRPS: 1
});

let _processing = false;
function _wakeUpProcess() {
    if (_processing) { return; }

    _processPendingRequests();
}

const WAIT_TIME = 4500;
let _lastTime = 0;
let _pendingRequests: [string, (res: AxiosResponse<any>) => void][] = [];
async function _processPendingRequests() {
    _processing = true;

    while (_pendingRequests.length > 0) {
        let [resPath, resolve] = _pendingRequests.shift() ?? ['', undefined];

        // Sleeps if too many requests are being made
        let elapsedTime = Date.now() - _lastTime;
        await sleep(Math.max(0, WAIT_TIME - elapsedTime));
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

function request(resourcePath: string) {
    return new Promise((res, rej) => {
        _pendingRequests.push([resourcePath, response => res(response)]);
        _wakeUpProcess();
    });
}


export namespace MAL {
    type Cache = {
        anime: {
            [animeTitle: string]: AnimeSearchResultItem[]
        }
    };

    const cache: Cache = {
        anime: {}
    };

    export async function searchAnime(animeTitle: string): Promise<AnimeSearchResultItem[]> {
        if (cache.anime[animeTitle]) {
            return cache.anime[animeTitle];
        }

        const response = await API.get('/anime', {
            params: {
                q: animeTitle,
            }
        });

        const results = response.data.data as AnimeSearchResultItem[];
        cache.anime[animeTitle] = results;
        
        return results;
    }

}

_processPendingRequests();