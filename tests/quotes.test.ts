import { describe, expect, it } from "vitest";
import { fetchQuotes, parseSymbols, type QuoteClient } from "../src/quotes.js";

describe("parseSymbols", () => {
	it("upper-cases, splits on commas, trims and de-duplicates in first-seen order", () => {
		expect(parseSymbols(["msft, aapl", "AAPL", " ", "nvda"])).toEqual([
			"MSFT",
			"AAPL",
			"NVDA",
		]);
	});

	it("returns nothing for empty input", () => {
		expect(parseSymbols([])).toEqual([]);
		expect(parseSymbols([",, ,"])).toEqual([]);
	});
});

const fake = (results: Awaited<ReturnType<QuoteClient["getNasdaqQuote"]>>) => {
	const calls: string[][] = [];
	const client: QuoteClient = {
		getNasdaqQuote: async (symbols) => {
			calls.push(symbols);
			return results;
		},
		close: async () => {},
	};
	return { client, calls };
};

describe("fetchQuotes", () => {
	it("maps results back to their symbol by position, success and failure", async () => {
		const { client, calls } = fake([
			{ status: "success", value: { price: 1 } },
			{ status: "error", reason: { message: "Symbol ZZZZ not found" } },
		]);
		const lines = await fetchQuotes(client, ["AAPL", "ZZZZ"]);
		expect(calls).toEqual([["AAPL", "ZZZZ"]]);
		expect(lines).toEqual([
			{ symbol: "AAPL", ok: true, data: { price: 1 } },
			{ symbol: "ZZZZ", ok: false, data: "Symbol ZZZZ not found" },
		]);
	});

	it("reports a missing result instead of throwing", async () => {
		const { client } = fake([]);
		expect(await fetchQuotes(client, ["AAPL"])).toEqual([
			{ symbol: "AAPL", ok: false, data: "no result returned" },
		]);
	});

	it("does not call the client for an empty symbol list", async () => {
		const { client, calls } = fake([]);
		expect(await fetchQuotes(client, [])).toEqual([]);
		expect(calls).toEqual([]);
	});
});
