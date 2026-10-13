// Fetches DK1 day-ahead spot prices from Energi Data Service and writes prices.json
// (hourly averages of the 15-min prices, DKK/kWh excl. VAT). Run by GitHub Actions.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const AREA = process.env.PRICE_AREA || 'DK1';
const url = 'https://api.energidataservice.dk/dataset/DayAheadPrices'
  + '?filter=' + encodeURIComponent(JSON.stringify({ PriceArea: [AREA] }))
  + '&columns=TimeUTC,TimeDK,DayAheadPriceDKK&sort=TimeUTC%20desc&limit=400';

const res = await fetch(url);
if (!res.ok) throw new Error('Energi Data Service HTTP ' + res.status);
const { records = [] } = await res.json();

const byHour = {};
for (const r of records) {
  if (r.DayAheadPriceDKK == null) continue;
  const k = r.TimeUTC.slice(0, 13);
  const dk = r.TimeDK.slice(0, 13);
  (byHour[k] ||= { utc: k, dk, sum: 0, n: 0 });
  byHour[k].sum += r.DayAheadPriceDKK; byHour[k].n++;
  if (dk < byHour[k].dk) byHour[k].dk = dk;
}
const hours = Object.values(byHour)
  .sort((a, b) => a.utc.localeCompare(b.utc))
  .map(h => ({ utc: h.utc, dk: h.dk, spot: +(h.sum / h.n / 1000).toFixed(5), quarters: h.n }));
if (hours.length < 12) throw new Error('Too few hours returned: ' + hours.length);

const out = { area: AREA, unit: 'DKK/kWh excl. VAT', source: 'energidataservice.dk DayAheadPrices', hours };
const prev = existsSync('prices.json') ? readFileSync('prices.json', 'utf8') : '';
const prevHours = prev ? JSON.stringify(JSON.parse(prev).hours) : '';
if (prevHours === JSON.stringify(hours)) { console.log('No change'); process.exit(0); }
out.updated = new Date().toISOString();
writeFileSync('prices.json', JSON.stringify(out, null, 1) + '\n');
console.log(`Wrote ${hours.length} hours, ${hours[0].dk} → ${hours.at(-1).dk} (DK time)`);
