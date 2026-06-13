import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const input = await FileBlob.load("/Volumes/Extreme SSD/codexfiles/jacksonprices/jackson-price-entry.xlsx");
const workbook = await SpreadsheetFile.importXlsx(input);

for (const range of ["Summary!A1:D14", "'Grocery Prices'!A1:H24", "'Fuel Prices'!A1:G3"]) {
  const check = await workbook.inspect({
    kind: "table",
    range,
    include: "values,formulas",
    tableMaxRows: 24,
    tableMaxCols: 8,
  });
  console.log(check.ndjson);
}

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);
