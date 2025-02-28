import { SpreadsheetData } from '../types';

// Helper to get cell reference from A1 notation
const getCellReference = (ref: string): { row: number; col: number } | null => {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  
  const colStr = match[1];
  const rowStr = match[2];
  
  let colIndex = 0;
  for (let i = 0; i < colStr.length; i++) {
    colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64);
  }
  
  return {
    row: parseInt(rowStr, 10) - 1,
    col: colIndex - 1
  };
};

// Helper to get range from A1:B2 notation
const getRangeReference = (range: string): { start: { row: number; col: number }; end: { row: number; col: number } } | null => {
  const parts = range.split(':');
  if (parts.length !== 2) return null;
  
  const start = getCellReference(parts[0]);
  const end = getCellReference(parts[1]);
  
  if (!start || !end) return null;
  
  return { start, end };
};

// Helper to get cell value
const getCellValue = (ref: string, data: SpreadsheetData): string | number => {
  const cellRef = getCellReference(ref);
  if (!cellRef) throw new Error(`Invalid cell reference: ${ref}`);
  
  const { row, col } = cellRef;
  
  if (row < 0 || row >= data.rows.length || col < 0 || col >= data.columns.length) {
    throw new Error(`Cell reference out of bounds: ${ref}`);
  }
  
  const cell = data.rows[row].cells[col];
  const value = cell.value;
  
  // Try to convert to number if possible
  const numValue = parseFloat(value);
  return isNaN(numValue) ? value : numValue;
};

// Helper to get range values
const getRangeValues = (range: string, data: SpreadsheetData): (string | number)[] => {
  const rangeRef = getRangeReference(range);
  if (!rangeRef) throw new Error(`Invalid range reference: ${range}`);
  
  const { start, end } = rangeRef;
  const values: (string | number)[] = [];
  
  for (let row = Math.min(start.row, end.row); row <= Math.max(start.row, end.row); row++) {
    for (let col = Math.min(start.col, end.col); col <= Math.max(start.col, end.col); col++) {
      if (row < 0 || row >= data.rows.length || col < 0 || col >= data.columns.length) {
        continue; // Skip out of bounds cells
      }
      
      const cell = data.rows[row].cells[col];
      const value = cell.value;
      
      // Try to convert to number if possible
      const numValue = parseFloat(value);
      values.push(isNaN(numValue) ? value : numValue);
    }
  }
  
  return values;
};

// Mathematical functions
const mathFunctions = {
  SUM: (args: string[], data: SpreadsheetData): number => {
    let sum = 0;
    
    args.forEach(arg => {
      if (arg.includes(':')) {
        // Range reference
        const values = getRangeValues(arg, data);
        values.forEach(value => {
          if (typeof value === 'number') {
            sum += value;
          }
        });
      } else {
        // Single cell reference
        const value = getCellValue(arg, data);
        if (typeof value === 'number') {
          sum += value;
        }
      }
    });
    
    return sum;
  },
  
  AVERAGE: (args: string[], data: SpreadsheetData): number => {
    let sum = 0;
    let count = 0;
    
    args.forEach(arg => {
      if (arg.includes(':')) {
        // Range reference
        const values = getRangeValues(arg, data);
        values.forEach(value => {
          if (typeof value === 'number') {
            sum += value;
            count++;
          }
        });
      } else {
        // Single cell reference
        const value = getCellValue(arg, data);
        if (typeof value === 'number') {
          sum += value;
          count++;
        }
      }
    });
    
    if (count === 0) return 0;
    return sum / count;
  },
  
  MAX: (args: string[], data: SpreadsheetData): number => {
    let max = Number.NEGATIVE_INFINITY;
    let hasValue = false;
    
    args.forEach(arg => {
      if (arg.includes(':')) {
        // Range reference
        const values = getRangeValues(arg, data);
        values.forEach(value => {
          if (typeof value === 'number') {
            max = Math.max(max, value);
            hasValue = true;
          }
        });
      } else {
        // Single cell reference
        const value = getCellValue(arg, data);
        if (typeof value === 'number') {
          max = Math.max(max, value);
          hasValue = true;
        }
      }
    });
    
    if (!hasValue) return 0;
    return max;
  },
  
  MIN: (args: string[], data: SpreadsheetData): number => {
    let min = Number.POSITIVE_INFINITY;
    let hasValue = false;
    
    args.forEach(arg => {
      if (arg.includes(':')) {
        // Range reference
        const values = getRangeValues(arg, data);
        values.forEach(value => {
          if (typeof value === 'number') {
            min = Math.min(min, value);
            hasValue = true;
          }
        });
      } else {
        // Single cell reference
        const value = getCellValue(arg, data);
        if (typeof value === 'number') {
          min = Math.min(min, value);
          hasValue = true;
        }
      }
    });
    
    if (!hasValue) return 0;
    return min;
  },
  
  COUNT: (args: string[], data: SpreadsheetData): number => {
    let count = 0;
    
    args.forEach(arg => {
      if (arg.includes(':')) {
        // Range reference
        const values = getRangeValues(arg, data);
        values.forEach(value => {
          if (typeof value === 'number') {
            count++;
          }
        });
      } else {
        // Single cell reference
        const value = getCellValue(arg, data);
        if (typeof value === 'number') {
          count++;
        }
      }
    });
    
    return count;
  }
};

// Data quality functions
const dataQualityFunctions = {
  TRIM: (args: string[], data: SpreadsheetData): string => {
    if (args.length !== 1) throw new Error('TRIM function requires exactly one argument');
    
    const value = getCellValue(args[0], data);
    return typeof value === 'string' ? value.trim() : String(value).trim();
  },
  
  UPPER: (args: string[], data: SpreadsheetData): string => {
    if (args.length !== 1) throw new Error('UPPER function requires exactly one argument');
    
    const value = getCellValue(args[0], data);
    return String(value).toUpperCase();
  },
  
  LOWER: (args: string[], data: SpreadsheetData): string => {
    if (args.length !== 1) throw new Error('LOWER function requires exactly one argument');
    
    const value = getCellValue(args[0], data);
    return String(value).toLowerCase();
  }
};

// Parse and evaluate formula
export const evaluateFormula = (formula: string, data: SpreadsheetData): string => {
  // Check for function calls
  const functionMatch = formula.match(/^(\w+)\((.*)\)$/);
  
  if (functionMatch) {
    const functionName = functionMatch[1].toUpperCase();
    const argsString = functionMatch[2];
    
    // Parse arguments, handling commas inside quotes
    const args: string[] = [];
    let currentArg = '';
    let inQuotes = false;
    
    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];
      
      if (char === '"' && (i === 0 || argsString[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
        currentArg += char;
      } else if (char === ',' && !inQuotes) {
        args.push(currentArg.trim());
        currentArg = '';
      } else {
        currentArg += char;
      }
    }
    
    if (currentArg.trim()) {
      args.push(currentArg.trim());
    }
    
    // Execute the function
    if (functionName in mathFunctions) {
      return String(mathFunctions[functionName as keyof typeof mathFunctions](args, data));
    } else if (functionName in dataQualityFunctions) {
      return String(dataQualityFunctions[functionName as keyof typeof dataQualityFunctions](args, data));
    } else {
      throw new Error(`Unknown function: ${functionName}`);
    }
  }
  
  // Check for cell references
  const cellRefRegex = /([A-Z]+\d+)/g;
  let result = formula;
  let match;
  
  while ((match = cellRefRegex.exec(formula)) !== null) {
    const cellRef = match[0];
    const value = getCellValue(cellRef, data);
    result = result.replace(cellRef, String(value));
  }
  
  // Evaluate the resulting expression
  try {
    // Use Function constructor to evaluate the expression
    // This is a simple approach and has security implications in a real app
    const evalResult = new Function(`return ${result}`)();
    return String(evalResult);
  } catch (error) {
    throw new Error(`Error evaluating formula: ${formula}`);
  }
};