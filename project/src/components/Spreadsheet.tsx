import React from 'react';
import { SpreadsheetData } from '../types';

interface SpreadsheetProps {
  data: SpreadsheetData;
  activeCell: { row: number; col: number } | null;
  selectedRange: { start: { row: number; col: number }; end: { row: number; col: number } } | null;
  onCellClick: (row: number, col: number) => void;
  onCellChange: (row: number, col: number, value: string) => void;
  onCellDragStart: (row: number, col: number) => void;
  onCellDragMove: (row: number, col: number) => void;
  onCellDragEnd: () => void;
}

const Spreadsheet: React.FC<SpreadsheetProps> = ({
  data,
  activeCell,
  selectedRange,
  onCellClick,
  onCellChange,
  onCellDragStart,
  onCellDragMove,
  onCellDragEnd
}) => {
  const isCellSelected = (row: number, col: number) => {
    if (!selectedRange) return false;
    
    const startRow = Math.min(selectedRange.start.row, selectedRange.end.row);
    const endRow = Math.max(selectedRange.start.row, selectedRange.end.row);
    const startCol = Math.min(selectedRange.start.col, selectedRange.end.col);
    const endCol = Math.max(selectedRange.start.col, selectedRange.end.col);
    
    return row >= startRow && row <= endRow && col >= startCol && col <= endCol;
  };
  
  const isCellActive = (row: number, col: number) => {
    return activeCell?.row === row && activeCell?.col === col;
  };
  
  const handleCellMouseDown = (row: number, col: number, e: React.MouseEvent) => {
    onCellClick(row, col);
    onCellDragStart(row, col);
    
    // Prevent text selection during drag
    e.preventDefault();
  };
  
  const handleCellMouseEnter = (row: number, col: number) => {
    onCellDragMove(row, col);
  };
  
  const handleMouseUp = () => {
    onCellDragEnd();
  };
  
  const handleCellDoubleClick = (row: number, col: number) => {
    // Focus the input when double-clicking a cell
    const input = document.getElementById(`cell-input-${row}-${col}`);
    if (input) {
      (input as HTMLInputElement).focus();
    }
  };
  
  const handleCellInputChange = (row: number, col: number, e: React.ChangeEvent<HTMLInputElement>) => {
    onCellChange(row, col, e.target.value);
  };
  
  const handleCellInputBlur = (row: number, col: number, e: React.FocusEvent<HTMLInputElement>) => {
    onCellChange(row, col, e.target.value);
  };
  
  const handleCellKeyDown = (row: number, col: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Move to the cell below
      if (row < data.rows.length - 1) {
        onCellClick(row + 1, col);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Move to the next cell
      if (col < data.columns.length - 1) {
        onCellClick(row, col + 1);
      } else if (row < data.rows.length - 1) {
        onCellClick(row + 1, 0);
      }
    } else if (e.key === 'ArrowUp' && row > 0) {
      e.preventDefault();
      onCellClick(row - 1, col);
    } else if (e.key === 'ArrowDown' && row < data.rows.length - 1) {
      e.preventDefault();
      onCellClick(row + 1, col);
    } else if (e.key === 'ArrowLeft' && col > 0) {
      if ((e.target as HTMLInputElement).selectionStart === 0) {
        e.preventDefault();
        onCellClick(row, col - 1);
      }
    } else if (e.key === 'ArrowRight' && col < data.columns.length - 1) {
      const input = e.target as HTMLInputElement;
      if (input.selectionStart === input.value.length) {
        e.preventDefault();
        onCellClick(row, col + 1);
      }
    }
  };
  
  return (
    <div 
      className="relative"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <table className="border-collapse table-fixed">
        <thead>
          <tr>
            <th className="w-10 h-8 bg-gray-100 border border-gray-300 sticky top-0 left-0 z-20"></th>
            {data.columns.map((column, colIndex) => (
              <th 
                key={column.id} 
                className="h-8 bg-gray-100 border border-gray-300 font-normal text-sm text-gray-700 sticky top-0 z-10"
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={row.id}>
              <td className="w-10 bg-gray-100 border border-gray-300 text-center text-sm text-gray-700 sticky left-0 z-10">
                {rowIndex + 1}
              </td>
              {row.cells.map((cell, colIndex) => {
                const isSelected = isCellSelected(rowIndex, colIndex);
                const isActive = isCellActive(rowIndex, colIndex);
                
                return (
                  <td 
                    key={cell.id}
                    className={`border border-gray-300 p-0 relative ${isSelected ? 'bg-blue-50' : ''} ${isActive ? 'z-10' : ''}`}
                    onMouseDown={(e) => handleCellMouseDown(rowIndex, colIndex, e)}
                    onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                  >
                    <div 
                      className={`w-full h-full min-h-[24px] px-2 py-1 outline-none ${
                        cell.formatting.bold ? 'font-bold' : ''
                      } ${
                        cell.formatting.italic ? 'italic' : ''
                      } text-${cell.formatting.align}`}
                    >
                      {isActive ? (
                        <input
                          id={`cell-input-${rowIndex}-${colIndex}`}
                          type="text"
                          value={cell.formula || cell.value || ''}
                          onChange={(e) => handleCellInputChange(rowIndex, colIndex, e)}
                          onBlur={(e) => handleCellInputBlur(rowIndex, colIndex, e)}
                          onKeyDown={(e) => handleCellKeyDown(rowIndex, colIndex, e)}
                          className={`w-full h-full outline-none bg-transparent ${
                            cell.formatting.bold ? 'font-bold' : ''
                          } ${
                            cell.formatting.italic ? 'italic' : ''
                          } text-${cell.formatting.align}`}
                          autoFocus
                        />
                      ) : (
                        <div className="w-full h-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {cell.value}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-nwse-resize"></div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none"></div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Spreadsheet;