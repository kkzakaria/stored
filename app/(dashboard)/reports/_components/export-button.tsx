"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { downloadCSV, downloadExcel, convertToCSV } from "@/lib/utils/report";
import { toast } from "sonner";

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  headers: { key: keyof T; label: string }[];
  filename: string;
  sheetName?: string;
  disabled?: boolean;
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  headers,
  filename,
  sheetName = "Rapport",
  disabled = false,
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      const csvContent = convertToCSV(data, headers);
      const csvFilename = `${filename}.csv`;
      downloadCSV(csvContent, csvFilename);
      toast.success("Export CSV réussi", {
        description: `${data.length} ligne(s) exportée(s)`,
      });
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("Erreur lors de l'export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    try {
      setIsExporting(true);
      const excelFilename = `${filename}.xlsx`;
      downloadExcel(data, headers, excelFilename, sheetName);
      toast.success("Export Excel réussi", {
        description: `${data.length} ligne(s) exportée(s)`,
      });
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Erreur lors de l'export Excel");
    } finally {
      setIsExporting(false);
    }
  };

  if (data.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Download className="h-4 w-4 mr-2" />
        Exporter
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Export en cours..." : "Exporter"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileText className="h-4 w-4 mr-2" />
          Exporter en CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exporter en Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
