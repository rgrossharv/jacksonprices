import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const projectDir = "/Volumes/Extreme SSD/codexfiles/jacksonprices";
const outputPath = path.join(projectDir, "jackson-price-entry.xlsx");

const today = 46185;

const groceryItems = [
  ["Eggs Dozen Large", "12 large eggs", "Dairy & Eggs", 3.49, 2.96],
  ["Milk Gallon Whole", "1 gallon", "Dairy & Eggs", 4.39, 3.82],
  ["White Bread", "20 oz loaf", "Pantry", 2.79, 1.88],
  ["Rice", "5 lb bag", "Pantry", 4.99, 3.34],
  ["Flour", "5 lb bag", "Pantry", 3.29, 2.58],
  ["Sugar", "4 lb bag", "Pantry", 3.69, 2.94],
  ["Butter", "1 lb sticks", "Dairy & Eggs", 4.99, 4.18],
  ["Peanut Butter", "16 oz jar", "Pantry", 2.99, 2.24],
  ["Spaghetti Pasta Noodles", "16 oz box", "Pantry", 1.89, 1.18],
  ["Cooking / Veg Oil", "48 fl oz", "Pantry", 4.79, 3.67],
  ["Ground Beef", "1 lb, 80/20", "Meat", 5.49, 4.96],
  ["Chicken Tenders", "1 lb fresh", "Meat", 4.99, 4.47],
  ["Bacon", "12 oz pack", "Meat", 5.99, 4.98],
  ["Sandwich Turkey", "9 oz deli pack", "Meat", 4.49, 3.92],
  ["Bananas", "1 lb", "Produce", 0.69, 0.58],
  ["Potatoes", "5 lb bag", "Produce", 4.49, 3.77],
  ["Coca-Cola and Pepsi Cola", "12 pack cans", "Drinks & Snacks", 7.99, 6.98],
  ["Frozen Pizza", "standard 12 inch", "Frozen", 5.49, 4.48],
  ["Coffee", "medium roast 30 oz", "Pantry", 10.99, 8.98],
  ["Toilet Paper", "12 mega rolls", "Household", 12.99, 10.98],
  ["Laundry Detergent", "92 fl oz", "Household", 13.49, 11.97],
  ["Dryer Sheets", "120 count", "Household", 5.49, 4.48],
];

const fuelItems = [
  ["Gasoline", "regular unleaded, per gallon", 3.39, 3.45],
  ["Diesel", "per gallon", 3.99, 4.05],
];

function dollars(value) {
  return typeof value === "number" ? value : "";
}

const workbook = Workbook.create();
const grocery = workbook.worksheets.add("Grocery Prices");
const fuel = workbook.worksheets.add("Fuel Prices");
const summary = workbook.worksheets.add("Summary");

grocery.getRange("A1:H1").values = [["Date", "Category", "Item", "Size", "IGA Price", "Walmart Price", "Lowest Store", "Lowest Price"]];
grocery.getRange(`A2:H${groceryItems.length + 1}`).values = groceryItems.map((item) => [
  today,
  item[2],
  item[0],
  item[1],
  dollars(item[3]),
  dollars(item[4]),
  "",
  "",
]);
grocery.getRange(`G2:G${groceryItems.length + 1}`).formulas = groceryItems.map((_, index) => {
  const row = index + 2;
  return [`=IF(COUNTA(E${row}:F${row})=0,"",IF(E${row}=F${row},"Tie",IF(E${row}<F${row},"IGA","Walmart")))`];
});
grocery.getRange(`H2:H${groceryItems.length + 1}`).formulas = groceryItems.map((_, index) => {
  const row = index + 2;
  return [`=IF(COUNTA(E${row}:F${row})=0,"",MIN(E${row}:F${row}))`];
});

fuel.getRange("A1:G1").values = [["Date", "Fuel", "Unit", "Jiffy Mart Price", "BP Price", "Lowest Station", "Lowest Price"]];
fuel.getRange(`A2:G${fuelItems.length + 1}`).values = fuelItems.map((item) => [
  today,
  item[0],
  item[1],
  dollars(item[2]),
  dollars(item[3]),
  "",
  "",
]);
fuel.getRange(`F2:F${fuelItems.length + 1}`).formulas = fuelItems.map((_, index) => {
  const row = index + 2;
  return [`=IF(COUNTA(D${row}:E${row})=0,"",IF(D${row}=E${row},"Tie",IF(D${row}<E${row},"Jiffy Mart","BP")))`];
});
fuel.getRange(`G2:G${fuelItems.length + 1}`).formulas = fuelItems.map((_, index) => {
  const row = index + 2;
  return [`=IF(COUNTA(D${row}:E${row})=0,"",MIN(D${row}:E${row}))`];
});

summary.getRange("A1:D1").values = [["Jackson Price Entry Workbook", "", "", ""]];
summary.getRange("A3:B8").values = [
  ["Current entry date", today],
  ["Grocery items", groceryItems.length],
  ["IGA grocery basket", ""],
  ["Walmart grocery basket", ""],
  ["Jiffy Mart fuel avg", ""],
  ["BP fuel avg", ""],
];
summary.getRange("B5:B8").formulas = [
  [`=SUM('Grocery Prices'!E2:E${groceryItems.length + 1})`],
  [`=SUM('Grocery Prices'!F2:F${groceryItems.length + 1})`],
  [`=AVERAGE('Fuel Prices'!D2:D${fuelItems.length + 1})`],
  [`=AVERAGE('Fuel Prices'!E2:E${fuelItems.length + 1})`],
];
summary.getRange("A10:D10").values = [["How to use", "", "", ""]];
summary.getRange("A11:D14").values = [
  ["Enter or replace prices in the price columns each time you shop.", "", "", ""],
  ["Use one dated block per shopping date; copy the existing item rows below when you need a new date.", "", "", ""],
  ["Lowest store/station and lowest price calculate automatically.", "", "", ""],
  ["This workbook currently tracks only IGA, Walmart, Jiffy Mart, and BP.", "", "", ""],
];

summary.getRange("A1:D1").merge();
summary.getRange("A10:D10").merge();

summary.getRange("A1:D1").format.fill = "#174968";
summary.getRange("A1:D1").format.font = { color: "#FFFFFF", bold: true, size: 16 };
summary.getRange("A1:D1").format.horizontalAlignment = "center";
summary.getRange("A10:D10").format.fill = "#D7E6EE";
summary.getRange("A10:D10").format.font = { bold: true };

for (const sheet of [grocery, fuel]) {
  sheet.getRange("A1:H1").format.fill = "#174968";
  sheet.getRange("A1:H1").format.font = { color: "#FFFFFF", bold: true };
}

grocery.getRange(`A2:A${groceryItems.length + 1}`).format.numberFormat = "yyyy-mm-dd";
fuel.getRange(`A2:A${fuelItems.length + 1}`).format.numberFormat = "yyyy-mm-dd";
summary.getRange("B3:B3").format.numberFormat = "yyyy-mm-dd";
grocery.getRange(`E2:F${groceryItems.length + 1}`).format.numberFormat = "$0.00";
grocery.getRange(`H2:H${groceryItems.length + 1}`).format.numberFormat = "$0.00";
fuel.getRange(`D2:E${fuelItems.length + 1}`).format.numberFormat = "$0.00";
fuel.getRange(`G2:G${fuelItems.length + 1}`).format.numberFormat = "$0.00";
summary.getRange("B5:B8").format.numberFormat = "$0.00";

summary.getRange("A:D").format.columnWidthPx = 150;
summary.getRange("A:A").format.columnWidthPx = 210;
grocery.getRange("A:A").format.columnWidthPx = 100;
grocery.getRange("B:B").format.columnWidthPx = 130;
grocery.getRange("C:C").format.columnWidthPx = 210;
grocery.getRange("D:D").format.columnWidthPx = 160;
grocery.getRange("E:H").format.columnWidthPx = 120;
fuel.getRange("A:A").format.columnWidthPx = 100;
fuel.getRange("B:B").format.columnWidthPx = 120;
fuel.getRange("C:C").format.columnWidthPx = 220;
fuel.getRange("D:G").format.columnWidthPx = 130;

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

await workbook.render({ sheetName: "Summary", range: "A1:D14", scale: 2 });
await workbook.render({ sheetName: "Grocery Prices", range: "A1:H24", scale: 2 });
await workbook.render({ sheetName: "Fuel Prices", range: "A1:G3", scale: 2 });

await fs.mkdir(projectDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(outputPath);
