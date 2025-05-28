import * as XLSX from "xlsx";
import {saveAs} from "file-saver";

interface ExportToExcelOptions {
    name: string;
    fileName: string;
    headers: string[];
    getData: () => (string | number)[][];
}

export function exportToExcel({name, fileName, headers, getData}: ExportToExcelOptions) {
    let dataRows = getData();

    const wb = XLSX.utils.book_new();
    const wsData = [headers, ...dataRows];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, name);

    // Generate a Blob containing the Excel file
    const excelBuffer = XLSX.write(wb, {bookType: "xlsx", type: "array"});
    const excelData = new Blob([excelBuffer], {type: ".xlsx"});
    saveAs(excelData, `${fileName}.xlsx`);
}
