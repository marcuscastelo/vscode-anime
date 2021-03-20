import axios, { AxiosResponse } from 'axios'
import { Console } from 'node:console';

const API = axios.create({
    baseURL: "https://api.jikan.moe/v3/"
});

const { CLIENT_ID, CLIENT_SECRET } = require('../../mal-api.json');

let _pendingRequests: [string, (res: AxiosResponse<any>) => void][] = [];
async function _processPendingRequests() {
    let needsSleeping = _pendingRequests.length === 0;
    while (_pendingRequests.length > 0) {
        let [resPath, resolve] = _pendingRequests.shift() ?? ['', undefined];
        await new Promise(r => setTimeout(r, 5000));

        console.log((new Date(Date.now()).toLocaleTimeString()), "Making request: ", resPath);
        let response = await API.get(resPath);

        if (resolve) {
            resolve(response);
        }
    }
    
    setTimeout(_processPendingRequests, needsSleeping ? 5000 : 1);
}

function request(resourcePath: string) {
    return new Promise((res, rej) => {
        _pendingRequests.push([resourcePath, response => res(response)]);
    });
}

export async function testee() {
    console.log("Starting MAL test")
    let searchResult = await request('/search/anime?q=one');
    let searchResult2 = await request('/search/anime?q=re:z');
    console.log(searchResult);
    console.log(searchResult2);
}

_processPendingRequests();