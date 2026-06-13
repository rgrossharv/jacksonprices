import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const file = await FileBlob.load("/Volumes/Extreme SSD/codexfiles/jacksonprices/jackson-price-entry.xlsx");
const workbook = await SpreadsheetFile.importXlsx(file);

for (const range of ["'Grocery Prices'!A1:H80", "'Fuel Prices'!A1:G20", "Summary!A1:D14"]) {
  const table = await workbook.inspect({
    kind: "table",
    range,
    include: "values,formulas",
    tableMaxRows: 80,
    tableMaxCols: 8,
  });
  console.log(`--- ${range} ---`);
  console.log(table.ndjson);
}
