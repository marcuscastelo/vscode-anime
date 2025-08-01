import axios from 'axios';
import rateLimit from 'axios-rate-limit';

import { type AnimeSearchResultItem } from '../types';

const _API = axios.create({
	baseURL: 'https://api.jikan.moe/v4/',
});

const API = rateLimit(_API, {
	maxRequests: 1,
	perMilliseconds: 1000,
	maxRPS: 1,
});

// TODO: Remove namespace and export functions directly
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MAL {
	type Cache = {
		anime: {
			[animeTitle: string]: AnimeSearchResultItem[];
		};
		bestAnime: {
			[animeTitle: string]: AnimeSearchResultItem;
		};
	};

	const cache: Cache = {
		anime: {},
		bestAnime: {},
	};

	export async function searchAnime(animeTitle: string): Promise<AnimeSearchResultItem[]> {
		if (cache.anime[animeTitle]) {
			return cache.anime[animeTitle];
		}

		const response = await API.get('/anime', {
			params: {
				q: animeTitle,
				order_by: 'members',
				sort: 'desc',
			},
		});

		const results = (response.data as { data: AnimeSearchResultItem[] }).data;
		cache.anime[animeTitle] = results;

		return results;
	}

	export async function searchBestAnime(
		animeTitle: string
	): Promise<AnimeSearchResultItem | undefined> {
		if (cache.bestAnime[animeTitle]) {
			return cache.bestAnime[animeTitle];
		}

		const results = await searchAnime(animeTitle);
		if (results.length === 0) {
			return undefined;
		}

		// Order results by longest title
		results.sort((a, b) => b.title.length - a.title.length);

		// Return the first result that has the same title as the search
		for (let i = 0; i < results.length; i++) {
			if (results[i].title.toLowerCase() === animeTitle.toLowerCase()) {
				cache.bestAnime[animeTitle] = results[i];
				return results[i];
			}
		}

		// If no result has the same title, return the first result
		cache.bestAnime[animeTitle] = results[0];
		return results[0];
	}
}
