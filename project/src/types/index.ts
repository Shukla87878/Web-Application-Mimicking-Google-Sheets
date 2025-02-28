export interface Cell {
  id: string;
  value: string;
  formula: string | null;
  error: string | null;
  formatting: {
    bold: boolean;
    italic: boolean;
    align: 'left' | 'center' | 'right';
  };
}

export interface Column {
  id: string;
  label: string;
  width: number;
}

export interface Row {
  id: string;
  cells: Cell[];
}

export interface SpreadsheetData {
  columns: Column[];
  rows: Row[];
}