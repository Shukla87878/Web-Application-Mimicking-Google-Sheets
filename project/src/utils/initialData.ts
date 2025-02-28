import { SpreadsheetData } from '../types';

export const initialData: SpreadsheetData = {
  columns: Array(10).fill(0).map((_, index) => ({
    id: `col-${index}`,
    label: String.fromCharCode(65 + index),
    width: 100
  })),
  rows: Array(20).fill(0).map((_, rowIndex) => ({
    id: `row-${rowIndex}`,
    cells: Array(10).fill(0).map((_, colIndex) => ({
      id: `cell-${rowIndex}-${colIndex}`,
      value: '',
      formula: null,
      error: null,
      formatting: {
        bold: false,
        italic: false,
        align: 'left'
      }
    }))
  }))
};