import axios, { AxiosResponse } from 'axios';
import { AnimeSearchResultItem } from '../types';

const API = axios.create({
    baseURL: "https://api.jikan.moe/v3/"
});

let _processing = false;
function _wakeUpProcess() {
    if (_processing) { return; }

    _processPendingRequests();
}

let _pendingRequests: [string, (res: AxiosResponse<any>) => void][] = [];
async function _processPendingRequests() {
    _processing = true;

    let i = 0;
    while (_pendingRequests.length > 0) {
        let [resPath, resolve] = _pendingRequests.shift() ?? ['', undefined];
        if (i > 0) {
            await new Promise(r => setTimeout(r, 5000));
        }
        i++;

        console.log((new Date(Date.now()).toLocaleTimeString()), "Making request: ", resPath);
        let response = await API.get(resPath);
        console.log("Response = ", response);

        console.log('\n\n');
        if (resolve) {
            resolve(response.data);
        }
    }

    setTimeout(() => _processing = false, (i === 1) ? 5000 : 1);
}

function request(resourcePath: string) {

    return new Promise((res, rej) => {
        _pendingRequests.push([resourcePath, response => res(response)]);
        _wakeUpProcess();
    });
}

export async function searchAnime(animeTitle: string) {
    return ((await request('/search/anime?q=' + animeTitle)) as { results: AnimeSearchResultItem[] }).results;
}

_processPendingRequests();