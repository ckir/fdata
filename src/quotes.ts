import {
	ApiNasdaqQuotes,
	type NasdaqResult,
} from "../../corelib/ts-markets/dist/index.js";

/** The slice of ApiNasdaqQuotes this app uses, so tests can substitute a fake. */
export interface QuoteClient {
	getNasdaqQuote(symbols: string[]): Promise<NasdaqResult<unknown>[]>;
	close(): Promise<void>;
}

export interface QuoteLine {
	symbol: string;
	ok: boolean;
	/** Raw provider payload on success, the failure message otherwise. */
	data: unknown;
}

/** Normalizes user input: trims, upper-cases, drops empties and duplicates (order kept). */
export function parseSymbols(args: readonly string[]): string[] {
	const seen = new Set<string>();
	for (const arg of args) {
		for (const part of arg.split(",")) {
			const symbol = part.trim().toUpperCase();
			if (symbol) seen.add(symbol);
		}
	}
	return [...seen];
}

/** Fetches quotes for the symbols; results line up with the normalized symbol order. */
export async function fetchQuotes(
	client: QuoteClient,
	symbols: readonly string[],
): Promise<QuoteLine[]> {
	if (symbols.length === 0) return [];
	const results = await client.getNasdaqQuote([...symbols]);
	return symbols.map((symbol, i) => {
		const result = results[i];
		if (result?.status === "success") {
			return { symbol, ok: true, data: result.value };
		}
		const message =
			result?.status === "error" ? result.reason.message : "no result returned";
		return { symbol, ok: false, data: message };
	});
}

export function createQuoteClient(): QuoteClient {
	return new ApiNasdaqQuotes();
}
