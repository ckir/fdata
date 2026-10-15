#!/usr/bin/env node
import { ConfigManager, logger } from "../../corelib/ts-core/dist/index.js";
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
	// Load corelib's defaults first, so nothing reads config before it is ready.
	await ConfigManager.getInstance().initialize([]);
	logger.debug(
		`fetching ${symbols.length} symbol(s), concurrency limit ${String(ConfigManager.get("markets.nasdaq.quotes.concurrencyLimit"))}`,
	);
	const client = createQuoteClient();
	try {
		const lines = await fetchQuotes(client, symbols);
		for (const line of lines) {
			if (!line.ok) logger.warn(`${line.symbol}: ${String(line.data)}`);
		}
		process.stdout.write(`${JSON.stringify(lines, null, 2)}\n`);
		return lines.every((l) => l.ok) ? 0 : 1;
	} finally {
		await client.close();
	}
}

process.exitCode = await main(process.argv.slice(2));
