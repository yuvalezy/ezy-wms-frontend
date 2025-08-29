import ExcelJS from "exceljs";
import {saveAs} from "file-saver";

interface ExportToExcelOptions {
    name: string;
    fileName: string;
    headers: string[] | (() => string[]);
    getData: () => (string | number)[][];
}

export async function exportToExcel({name, fileName, headers, getData}: ExportToExcelOptions) {
    const dataRows = getData();
    const wsHeaders = headers instanceof Function ? headers() : headers;

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(name);

    // Add headers
    worksheet.addRow(wsHeaders);

    // Add data rows
    dataRows.forEach(row => {
        worksheet.addRow(row);
    });

    // Generate Excel buffer
    const excelBuffer = await workbook.xlsx.writeBuffer();
    const excelData = new Blob([excelBuffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    saveAs(excelData, `${fileName}.xlsx`);
}
