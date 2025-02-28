import React, { useState, useEffect, useRef } from 'react';
import { Grid, Save, FileUp, Plus, Trash2, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';
import Spreadsheet from './components/Spreadsheet';
import Toolbar from './components/Toolbar';
import FormulaBar from './components/FormulaBar';
import { Cell, SpreadsheetData } from './types';
import { evaluateFormula } from './utils/formulaEvaluator';
import { initialData } from './utils/initialData';

function App() {
  const [data, setData] = useState<SpreadsheetData>(initialData);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [formulaValue, setFormulaValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ row: number; col: number } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: { row: number; col: number }; end: { row: number; col: number } } | null>(null);
  
  const spreadsheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeCell) {
      const cell = data.rows[activeCell.row].cells[activeCell.col];
      setFormulaValue(cell.formula || cell.value || '');
    } else {
      setFormulaValue('');
    }
  }, [activeCell, data]);

  const handleCellChange = (row: number, col: number, value: string) => {
    const newData = { ...data };
    const cell = newData.rows[row].cells[col];
    
    if (value.startsWith('=')) {
      cell.formula = value;
      try {
        cell.value = evaluateFormula(value.substring(1), newData);
        cell.error = null;
      } catch (error) {
        cell.value = '#ERROR';
        cell.error = error instanceof Error ? error.message : String(error);
      }
    } else {
      cell.value = value;
      cell.formula = null;
    }
    
    // Update dependent cells
    updateDependentCells(newData);
    
    setData(newData);
  };

  const updateDependentCells = (data: SpreadsheetData) => {
    // For each cell with a formula, recalculate its value
    data.rows.forEach((row, rowIndex) => {
      row.cells.forEach((cell, colIndex) => {
        if (cell.formula) {
          try {
            cell.value = evaluateFormula(cell.formula.substring(1), data);
            cell.error = null;
          } catch (error) {
            cell.value = '#ERROR';
            cell.error = error instanceof Error ? error.message : String(error);
          }
        }
      });
    });
  };

  const handleFormulaChange = (value: string) => {
    setFormulaValue(value);
    if (activeCell) {
      handleCellChange(activeCell.row, activeCell.col, value);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    setActiveCell({ row, col });
    setSelectedRange({ start: { row, col }, end: { row, col } });
  };

  const handleCellDragStart = (row: number, col: number) => {
    setIsDragging(true);
    setDragStart({ row, col });
    setDragEnd({ row, col });
    setSelectedRange({ start: { row, col }, end: { row, col } });
  };

  const handleCellDragMove = (row: number, col: number) => {
    if (isDragging && dragStart) {
      setDragEnd({ row, col });
      setSelectedRange({
        start: dragStart,
        end: { row, col }
      });
    }
  };

  const handleCellDragEnd = () => {
    setIsDragging(false);
  };

  const addRow = () => {
    const newData = { ...data };
    const newRow = {
      id: `row-${newData.rows.length}`,
      cells: Array(data.columns.length).fill(0).map((_, index) => ({
        id: `cell-${newData.rows.length}-${index}`,
        value: '',
        formula: null,
        error: null,
        formatting: { bold: false, italic: false, align: 'left' }
      }))
    };
    newData.rows.push(newRow);
    setData(newData);
  };

  const addColumn = () => {
    const newData = { ...data };
    const newColumnIndex = newData.columns.length;
    
    // Add new column header
    newData.columns.push({
      id: `col-${newColumnIndex}`,
      label: String.fromCharCode(65 + newColumnIndex % 26) + (Math.floor(newColumnIndex / 26) || ''),
      width: 100
    });
    
    // Add new cell to each row
    newData.rows.forEach((row, rowIndex) => {
      row.cells.push({
        id: `cell-${rowIndex}-${newColumnIndex}`,
        value: '',
        formula: null,
        error: null,
        formatting: { bold: false, italic: false, align: 'left' }
      });
    });
    
    setData(newData);
  };

  const deleteRow = () => {
    if (activeCell && data.rows.length > 1) {
      const newData = { ...data };
      newData.rows.splice(activeCell.row, 1);
      setData(newData);
      if (activeCell.row >= newData.rows.length) {
        setActiveCell({ row: newData.rows.length - 1, col: activeCell.col });
      }
      updateDependentCells(newData);
    }
  };

  const deleteColumn = () => {
    if (activeCell && data.columns.length > 1) {
      const newData = { ...data };
      newData.columns.splice(activeCell.col, 1);
      newData.rows.forEach(row => {
        row.cells.splice(activeCell.col, 1);
      });
      setData(newData);
      if (activeCell.col >= newData.columns.length) {
        setActiveCell({ row: activeCell.row, col: newData.columns.length - 1 });
      }
      updateDependentCells(newData);
    }
  };

  const formatCell = (formatting: Partial<Cell['formatting']>) => {
    if (activeCell) {
      const newData = { ...data };
      const cell = newData.rows[activeCell.row].cells[activeCell.col];
      cell.formatting = { ...cell.formatting, ...formatting };
      setData(newData);
    }
  };

  const saveSpreadsheet = () => {
    const dataStr = JSON.stringify(data);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'spreadsheet.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const loadSpreadsheet = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedData = JSON.parse(e.target?.result as string);
        setData(loadedData);
        setActiveCell(null);
        setFormulaValue('');
      } catch (error) {
        console.error('Error loading spreadsheet:', error);
        alert('Error loading spreadsheet. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex items-center p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center mr-4">
          <Grid className="w-6 h-6 text-green-600 mr-2" />
          <h1 className="text-lg font-semibold text-gray-700">Sheets Clone</h1>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={saveSpreadsheet}
            className="flex items-center px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </button>
          <label className="flex items-center px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
            <FileUp className="w-4 h-4 mr-1" />
            Load
            <input 
              type="file" 
              accept=".json" 
              onChange={loadSpreadsheet} 
              className="hidden" 
            />
          </label>
        </div>
      </div>
      
      <Toolbar 
        onAddRow={addRow}
        onAddColumn={addColumn}
        onDeleteRow={deleteRow}
        onDeleteColumn={deleteColumn}
        onFormatBold={() => formatCell({ bold: !data.rows[activeCell?.row || 0].cells[activeCell?.col || 0].formatting.bold })}
        onFormatItalic={() => formatCell({ italic: !data.rows[activeCell?.row || 0].cells[activeCell?.col || 0].formatting.italic })}
        onFormatAlign={(align) => formatCell({ align })}
        activeCell={activeCell}
        data={data}
      />
      
      <FormulaBar 
        value={formulaValue} 
        onChange={handleFormulaChange} 
        activeCell={activeCell ? `${data.columns[activeCell.col].label}${activeCell.row + 1}` : ''}
      />
      
      <div className="flex-1 overflow-auto" ref={spreadsheetRef}>
        <Spreadsheet 
          data={data}
          activeCell={activeCell}
          selectedRange={selectedRange}
          onCellClick={handleCellClick}
          onCellChange={handleCellChange}
          onCellDragStart={handleCellDragStart}
          onCellDragMove={handleCellDragMove}
          onCellDragEnd={handleCellDragEnd}
        />
      </div>
      
      <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        {selectedRange && (
          <div>
            Selected: {data.columns[selectedRange.start.col].label}{selectedRange.start.row + 1}:
            {data.columns[selectedRange.end.col].label}{selectedRange.end.row + 1}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;