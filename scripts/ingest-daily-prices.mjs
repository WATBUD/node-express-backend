// Ingest TWSE daily OHLC into the daily_price table.
//
// Usage (run from project root, .env provides DATABASE_URL):
//   node --env-file=.env scripts/ingest-daily-prices.mjs backfill [days]
//   node --env-file=.env scripts/ingest-daily-prices.mjs latest
//
//   backfill [days]  Backfill the last N trading days (default 30). Idempotent.
//   latest           Ingest only the most recent trading day (for cron).
import StocksService from "../src/services/stocks-service.js";

const svc = new StocksService();
const [, , cmd = "backfill", arg] = process.argv;

try {
  if (cmd === "latest") {
    const res = await svc.ingestLatestDay();
    console.log("latest:", JSON.stringify(res));
  } else if (cmd === "backfill") {
    const days = arg ? Number(arg) : 30;
    console.log(`Backfilling last ${days} trading days...`);
    const { tradingDays } = await svc.ingestBackfill({ days });
    console.log(`Done. Ingested ${tradingDays} trading days.`);
  } else {
    console.error(`Unknown command: ${cmd}. Use "backfill [days]" or "latest".`);
    process.exit(1);
  }
} catch (err) {
  console.error("Ingest failed:", err.message);
  process.exit(1);
}
process.exit(0);
