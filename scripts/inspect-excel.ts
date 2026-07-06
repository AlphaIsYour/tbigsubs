import * as XLSX from "xlsx";
import * as path from "path";

async function main() {
  const filePath = path.join(process.cwd(), "Data PLN Multiguna.xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet) as any[];
  
  console.log("Headers definition (Row 0):");
  console.log(data[0]);
  
  console.log("\nRows 1-15 (indexed):");
  for (let i = 1; i <= 15; i++) {
    console.log(`\nRow ${i}:`);
    const row = data[i];
    for (const key of Object.keys(data[0])) {
      if (row[key] !== undefined) {
        console.log(`  ${data[0][key]}: ${row[key]}`);
      }
    }
  }
}

main();
