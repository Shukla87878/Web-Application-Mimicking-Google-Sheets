# Google Sheets Clone

A web application that mimics the user interface and core functionalities of Google Sheets, with a focus on mathematical and data quality functions, data entry, and key UI interactions.

## Features

### Spreadsheet Interface
- Google Sheets-like UI with toolbar, formula bar, and cell structure
- Drag functionality for cell selections
- Cell dependencies with formula evaluation
- Basic cell formatting (bold, italics, alignment)
- Add, delete, and resize rows and columns
- Save and load spreadsheets

### Mathematical Functions
- `SUM`: Calculates the sum of a range of cells
- `AVERAGE`: Calculates the average of a range of cells
- `MAX`: Returns the maximum value from a range of cells
- `MIN`: Returns the minimum value from a range of cells
- `COUNT`: Counts the number of cells containing numerical values in a range

### Data Quality Functions
- `TRIM`: Removes leading and trailing whitespace from a cell
- `UPPER`: Converts the text in a cell to uppercase
- `LOWER`: Converts the text in a cell to lowercase
- `REMOVE_DUPLICATES`: Removes duplicate rows from a selected range (in progress)
- `FIND_AND_REPLACE`: Allows users to find and replace specific text within a range of cells (in progress)

### Data Entry and Validation
- Support for various data types (numbers, text)
- Basic data validation for formulas

## Tech Stack and Data Structures

### Tech Stack
- **React**: For building the user interface
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: For styling the application
- **Vite**: For fast development and building

### Data Structures

The application uses the following key data structures:

1. **SpreadsheetData**: The main data structure that holds all the spreadsheet data
   ```typescript
   interface SpreadsheetData {
     columns: Column[];
     rows: Row[];
   }
   ```

2. **Column**: Represents a column in the spreadsheet
   ```typescript
   interface Column {
     id: string;
     label: string;
     width: number;
   }
   ```

3. **Row**: Represents a row in the spreadsheet
   ```typescript
   interface Row {
     id: string;
     cells: Cell[];
   }
   ```

4. **Cell**: Represents a cell in the spreadsheet
   ```typescript
   interface Cell {
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
   ```

### Formula Evaluation

The formula evaluation system uses a recursive approach to evaluate formulas:

1. Formulas are identified by starting with an equals sign (`=`)
2. The formula evaluator parses the formula and identifies functions and cell references
3. For cell references, it retrieves the values from the referenced cells
4. For functions, it evaluates the arguments and applies the function logic
5. The result is then stored in the cell's value property

### Cell Dependencies

Cell dependencies are handled by:

1. When a cell's value changes, all cells with formulas are re-evaluated
2. This ensures that any cell that depends on the changed cell gets updated

## Why This Approach?

- **React**: Provides a component-based architecture that makes it easy to build and maintain complex UIs
- **TypeScript**: Adds type safety, which is crucial for a complex application like a spreadsheet
- **Tailwind CSS**: Allows for rapid UI development with a utility-first approach
- **Immutable Data Structure**: Using immutable data patterns with React's state management ensures predictable updates and renders

## Future Improvements

- Implement the remaining data quality functions
- Add support for more complex formulas and cell referencing
- Improve performance for large spreadsheets
- Add data visualization capabilities (charts, graphs)
- Add more keyboard shortcuts for improved usability
- Implement undo/redo functionality

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to the URL shown in the terminal

## Usage Examples

### Basic Data Entry
- Click on a cell to select it
- Type a value and press Enter or Tab to move to the next cell

### Using Formulas
- Select a cell
- Type a formula starting with `=`, for example: `=SUM(A1:A5)`
- Press Enter to evaluate the formula

### Formatting Cells
- Select a cell or range of cells
- Use the formatting buttons in the toolbar to apply formatting

### Saving and Loading
- Click the Save button to download your spreadsheet as a JSON file
- Click the Load button to upload a previously saved spreadsheet