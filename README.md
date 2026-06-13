# Jackson Prices

Static website for weekly grocery and fuel price comparisons in Jackson, Kentucky.

The live site is configured for [jacksonprices.com](https://jacksonprices.com) through Cloudflare Pages. Community price submissions can be sent to `receiptsatjacksonprices@gmail.com`.

## What Is Tracked

- Grocery staples from IGA and Walmart
- Fuel prices from Jiffy Mart and BP Jackson
- Weekly grocery updates, with fuel updated more often when available
- Community-submitted shelf prices and receipt-backed examples

## Project Structure

- `index.html` - page markup
- `styles.css` - responsive site styling
- `data.js` - current store, station, grocery, and fuel price data
- `app.js` - table rendering, filters, metadata, and fuel cards
- `jackson-price-entry.xlsx` - workbook for entering and checking price data
- `jackson-price-entry/` - CSV exports used by the update scripts
- `spreadsheet-build/` - helper scripts for workbook export and site data updates
