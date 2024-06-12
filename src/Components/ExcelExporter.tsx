import React from "react";
import * as XLSX from "xlsx";
import {saveAs} from "file-saver";

export interface ExcelExporterProps {
    name: string;
    fileName: string;
    headers: string[];
    getData: () => (string | number)[][];
}

const ExcelExporter: React.FC<ExcelExporterProps> = ({name, fileName, headers, getData}) => {
    function exportToExcel() {
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

    return (
        <img
            src="/images/excel.jpg"
            alt=""
            onClick={() => exportToExcel()}
            style={{
                height: "32px",
                position: "absolute",
                right: "10px",
                top: "8px",
                cursor: "pointer",
                zIndex: "1000",
            }}
        />
    )
}

export default ExcelExporter;
