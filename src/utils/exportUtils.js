import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportToPDF = (title, columns, data, filename = "reporte.pdf") => {
    const doc = new jsPDF();
    doc.text(title, 14, 20);
    doc.autoTable({
        startY: 30,
        head: [columns],
        body: data,
    });
    doc.save(filename);
};

export const exportToExcel = (data, filename = "reporte.xlsx") => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
    XLSX.writeFile(workbook, filename);
};
