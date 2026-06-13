import fs from "node:fs/promises";
import path from "node:path";

const projectDir = "/Volumes/Extreme SSD/codexfiles/jacksonprices";
const groceryCsv = path.join(projectDir, "jackson-price-entry", "Grocery Prices-Table 1.csv");
const fuelCsv = path.join(projectDir, "jackson-price-entry", "Fuel Prices-Table 1.csv");
const dataFile = path.join(projectDir, "data.js");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }

  return rows;
}

function dollars(value) {
  const clean = String(value || "").replace(/[$,]/g, "").trim();
  if (!clean || clean.toUpperCase() === "N/A") return null;
  const number = Number(clean);
  return Number.isFinite(number) ? number : null;
}

function headerMap(headers) {
  return Object.fromEntries(headers.map((header, index) => [header.trim(), index]));
}

const groceryRows = parseCsv(await fs.readFile(groceryCsv, "utf8"));
const fuelRows = parseCsv(await fs.readFile(fuelCsv, "utf8"));
const groceryHeader = headerMap(groceryRows.shift());
const fuelHeader = headerMap(fuelRows.shift());

const lastUpdated = groceryRows[0]?.[groceryHeader.Date] || fuelRows[0]?.[fuelHeader.Date] || "2026-06-12";
const lastUpdatedDate = new Date(`${lastUpdated}T12:00:00`);
const nextUpdateDate = new Date(lastUpdatedDate);
nextUpdateDate.setDate(nextUpdateDate.getDate() + 7);
const nextUpdate = nextUpdateDate.toISOString().slice(0, 10);

const groceryItems = groceryRows.map((row) => ({
  name: row[groceryHeader.Item],
  size: row[groceryHeader.Size],
  category: row[groceryHeader.Category],
  prices: {
    iga: dollars(row[groceryHeader["IGA Price"]]),
    walmart: dollars(row[groceryHeader["Walmart Price"]]),
  },
  trend: 0,
}));

const fuelItems = fuelRows.map((row) => ({
  name: row[fuelHeader.Fuel],
  size: row[fuelHeader.Unit],
  category: "Fuel",
  prices: {
    jiffymart: dollars(row[fuelHeader["Jiffy Mart Price"]]),
    bpjackson: dollars(row[fuelHeader["BP Price"]]),
  },
  trend: 0,
}));

const data = {
  townName: "Jackson",
  lastUpdated,
  nextUpdate,
  analytics: {
    provider: "local",
    endpoint: "",
  },
  stores: [
    { id: "iga", name: "IGA", color: "#22704a" },
    { id: "walmart", name: "Walmart", color: "#2b5c92" },
  ],
  gasStations: [
    { id: "jiffymart", name: "Jiffy Mart" },
    { id: "bpjackson", name: "BP Jackson" },
  ],
  items: [...groceryItems, ...fuelItems],
};

const js = `window.priceWatchData = ${JSON.stringify(data, null, 2)};\n`;
await fs.writeFile(dataFile, js);

console.log(JSON.stringify({
  lastUpdated,
  nextUpdate,
  groceryItems: groceryItems.length,
  fuelItems: fuelItems.length,
  totalItems: data.items.length,
}, null, 2));
