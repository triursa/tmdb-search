export interface MediaData {
	media_type: "movie" | "tv";
	title: string;
	year: string;
	overview: string;
	rating: string;
	genres: string;
	poster_url: string;
	status: string;
	tagline: string;
	// Movie-only
	director: string;
	runtime: string;
	// TV-only
	creators: string;
	seasons: string;
}

// Raw shapes returned by TMDB API

interface TMDBSearchResult {
	id: number;
	media_type: "movie" | "tv" | "person";
	title?: string;
	name?: string;
	release_date?: string;
	first_air_date?: string;
	overview: string;
	vote_average: number;
	poster_path: string | null;
	genre_ids: number[];
}

interface TMDBSearchResponse {
	results: TMDBSearchResult[];
	total_results: number;
	total_pages: number;
}

interface TMDBMovieDetails {
	id: number;
	title: string;
	release_date: string;
	overview: string;
	vote_average: number;
	genres: Array<{ id: number; name: string }>;
	poster_path: string | null;
	runtime: number | null;
	status: string;
	tagline: string;
	credits: {
		crew: Array<{ job: string; name: string }>;
	};
}

interface TMDBTVDetails {
	id: number;
	name: string;
	first_air_date: string;
	overview: string;
	vote_average: number;
	genres: Array<{ id: number; name: string }>;
	poster_path: string | null;
	number_of_seasons: number;
	status: string;
	tagline: string;
	created_by: Array<{ name: string }>;
}

export class TMDBError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number,
		public readonly isAuthError: boolean
	) {
		super(message);
		this.name = "TMDBError";
	}
}

// Re-export the search result type for use in modal
export type { TMDBSearchResult };

export class TMDBClient {
	private readonly baseUrl = "https://api.themoviedb.org/3";
	private readonly imageBaseUrl = "https://image.tmdb.org/t/p/w500";
	private readonly max429Retries = 3;
	private readonly retryBaseDelayMs = 750;

	constructor(private token: string) {}

	async searchMulti(query: string): Promise<TMDBSearchResult[]> {
		const encoded = encodeURIComponent(query);
		const data = await this.fetchTMDB<TMDBSearchResponse>(
			`/search/multi?query=${encoded}&language=en-US&page=1&include_adult=false`
		);
		return data.results
			.filter((r) => r.media_type === "movie" || r.media_type === "tv")
			.slice(0, 10);
	}

	async getMovieDetails(id: number): Promise<MediaData> {
		const data = await this.fetchTMDB<TMDBMovieDetails>(
			`/movie/${id}?append_to_response=credits&language=en-US`
		);

		const director =
			data.credits.crew.find((c) => c.job === "Director")?.name ?? "";
		const genres = data.genres.map((g) => g.name).join(", ");
		const year = data.release_date
			? data.release_date.substring(0, 4)
			: "";

		return {
			media_type: "movie",
			title: data.title,
			year,
			overview: data.overview,
			rating: this.formatRating(data.vote_average),
			genres,
			poster_url: this.getPosterUrl(data.poster_path),
			status: data.status,
			tagline: data.tagline ?? "",
			director,
			runtime: data.runtime != null ? String(data.runtime) : "",
			creators: "",
			seasons: "",
		};
	}

	async getTVDetails(id: number): Promise<MediaData> {
		const data = await this.fetchTMDB<TMDBTVDetails>(
			`/tv/${id}?append_to_response=credits&language=en-US`
		);

		const creators = data.created_by.map((c) => c.name).join(", ");
		const genres = data.genres.map((g) => g.name).join(", ");
		const year = data.first_air_date
			? data.first_air_date.substring(0, 4)
			: "";

		return {
			media_type: "tv",
			title: data.name,
			year,
			overview: data.overview,
			rating: this.formatRating(data.vote_average),
			genres,
			poster_url: this.getPosterUrl(data.poster_path),
			status: data.status,
			tagline: data.tagline ?? "",
			director: "",
			runtime: "",
			creators,
			seasons: String(data.number_of_seasons),
		};
	}

	private async fetchTMDB<T>(path: string, retryCount = 0): Promise<T> {
		const response = await fetch(`${this.baseUrl}${path}`, {
			headers: {
				Authorization: `Bearer ${this.token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			if (response.status === 429 && retryCount < this.max429Retries) {
				const retryDelayMs = this.getRetryDelayMs(response, retryCount);
				await this.delay(retryDelayMs);
				return this.fetchTMDB<T>(path, retryCount + 1);
			}

			const isAuthError = response.status === 401;
			let message = "TMDB request failed. Please try again.";

			if (response.status === 401) {
				message = "TMDB authentication failed. Check your API token.";
			} else if (response.status === 404) {
				message = "TMDB resource not found.";
			} else if (response.status >= 500) {
				message = "TMDB service is unavailable. Please try again later.";
			}
			if (response.status === 429) {
				message = "TMDB rate limit reached after automatic retries. Please try again shortly.";
			}

			throw new TMDBError(message, response.status, isAuthError);
		}

		return response.json() as Promise<T>;
	}

	private getRetryDelayMs(response: Response, retryCount: number): number {
		const retryAfterHeader = response.headers.get("Retry-After");
		const retryAfterSeconds = retryAfterHeader
			? Number.parseInt(retryAfterHeader, 10)
			: Number.NaN;

		if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
			return Math.min(retryAfterSeconds * 1000, 10000);
		}

		return Math.min(this.retryBaseDelayMs * 2 ** retryCount, 10000);
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => window.setTimeout(resolve, ms));
	}

	private getPosterUrl(path: string | null): string {
		if (!path) return "";
		if (!/^\/[a-zA-Z0-9/_-]+\.(jpg|jpeg|png|webp)$/i.test(path)) {
			return "";
		}
		return `${this.imageBaseUrl}${path}`;
	}

	private formatRating(avg: number): string {
		return avg.toFixed(1);
	}
}
