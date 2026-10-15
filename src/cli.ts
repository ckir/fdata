#!/usr/bin/env node
import { createQuoteClient, fetchQuotes, parseSymbols } from "./quotes.js";

const USAGE = "usage: fdata quote <SYMBOL[,SYMBOL...]>...\n";

async function main(argv: readonly string[]): Promise<number> {
	const [command, ...rest] = argv;
	if (command !== "quote") {
		process.stderr.write(USAGE);
		return 2;
	}
	const symbols = parseSymbols(rest);
	if (symbols.length === 0) {
		process.stderr.write(USAGE);
		return 2;
	}
	const client = createQuoteClient();
	try {
		const lines = await fetchQuotes(client, symbols);
		process.stdout.write(`${JSON.stringify(lines, null, 2)}\n`);
		return lines.every((l) => l.ok) ? 0 : 1;
	} finally {
		await client.close();
	}
}

process.exitCode = await main(process.argv.slice(2));
