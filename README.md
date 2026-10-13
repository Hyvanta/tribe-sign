# Tribe Sønderborg – ViewNet price sign

Static page for the 144×96 px ViewNet LED sign at Tribe. Rebuilt from Better Energy's original
sign code (`ptribe/Renders/BetterEnergySign.zip`), same layout and stylesheet.

**Price shown** = DK1 spot (hourly average, excl. VAT) × 1.25 + N1 B-høj tariff + 2.00 kr surcharge.
This mirrors the Monta "Public" price group (#385129).

- `index.html` – the sign. Tariff, surcharge, VAT and decimal separator are in `CONFIG` at the top.
- `prices.json` – hourly DK1 spot prices, refreshed every hour by the GitHub Action.
- `scripts/fetch-prices.mjs` + `.github/workflows/update-prices.yml` – the hourly job.

URL options: `?mode=open` → ÅBEN, `?mode=closed` → LUKKET/CLOSED/GESCHLOSSEN.
If no price data is available the sign falls back to ÅBEN.

**Before April 2027:** check the N1 summer tariff schedule in Monta and update `tariffFor()`/`CONFIG.tariff`.
