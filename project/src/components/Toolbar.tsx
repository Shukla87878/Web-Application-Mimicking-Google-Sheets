import React from 'react';
import { Plus, Trash2, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { SpreadsheetData } from '../types';

interface ToolbarProps {
  onAddRow: () => void;
  onAddColumn: () => void;
  onDeleteRow: () => void;
  onDeleteColumn: () => void;
  onFormatBold: () => void;
  onFormatItalic: () => void;
  onFormatAlign: (align: 'left' | 'center' | 'right') => void;
  activeCell: { row: number; col: number } | null;
  data: SpreadsheetData;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddRow,
  onAddColumn,
  onDeleteRow,
  onDeleteColumn,
  onFormatBold,
  onFormatItalic,
  onFormatAlign,
  activeCell,
  data
}) => {
  const isFormatActive = (format: 'bold' | 'italic' | 'align', value?: string) => {
    if (!activeCell) return false;
    
    const cell = data.rows[activeCell.row].cells[activeCell.col];
    
    if (format === 'bold') return cell.formatting.bold;
    if (format === 'italic') return cell.formatting.italic;
    if (format === 'align') return cell.formatting.align === value;
    
    return false;
  };
  
  return (
    <div className="flex items-center p-2 border-b border-gray-200 bg-gray-50">
      <div className="flex space-x-1 mr-4">
        <button 
          onClick={onAddRow}
          className="p-1 hover:bg-gray-200 rounded"
          title="Add row"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button 
          onClick={onAddColumn}
          className="p-1 hover:bg-gray-200 rounded"
          title="Add column"
        >
          <Plus className="w-5 h-5 rotate-90" />
        </button>
        <button 
          onClick={onDeleteRow}
          className="p-1 hover:bg-gray-200 rounded"
          title="Delete row"
          disabled={!activeCell}
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button 
          onClick={onDeleteColumn}
          className="p-1 hover:bg-gray-200 rounded"
          title="Delete column"
          disabled={!activeCell}
        >
          <Trash2 className="w-5 h-5 rotate-90" />
        </button>
      </div>
      
      <div className="h-6 w-px bg-gray-300 mx-2"></div>
      
      <div className="flex space-x-1">
        <button 
          onClick={onFormatBold}
          className={`p-1 rounded ${isFormatActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
          title="Bold"
          disabled={!activeCell}
        >
          <Bold className="w-5 h-5" />
        </button>
        <button 
          onClick={onFormatItalic}
          className={`p-1 rounded ${isFormatActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
          title="Italic"
          disabled={!activeCell}
        >
          <Italic className="w-5 h-5" />
        </button>
      </div>
      
      <div className="h-6 w-px bg-gray-300 mx-2"></div>
      
      <div className="flex space-x-1">
        <button 
          onClick={() => onFormatAlign('left')}
          className={`p-1 rounded ${isFormatActive('align', 'left') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
          title="Align left"
          disabled={!activeCell}
        >
          <AlignLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onFormatAlign('center')}
          className={`p-1 rounded ${isFormatActive('align', 'center') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
          title="Align center"
          disabled={!activeCell}
        >
          <AlignCenter className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onFormatAlign('right')}
          className={`p-1 rounded ${isFormatActive('align', 'right') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
          title="Align right"
          disabled={!activeCell}
        >
          <AlignRight className="w-5 h-5" />
        </button>
      </div>
      
      <div className="h-6 w-px bg-gray-300 mx-2"></div>
      
      <div className="flex space-x-2">
        <select className="text-sm border border-gray-300 rounded px-2 py-1">
          <option>Functions</option>
          <optgroup label="Mathematical">
            <option value="SUM">SUM</option>
            <option value="AVERAGE">AVERAGE</option>
            <option value="MAX">MAX</option>
            <option value="MIN">MIN</option>
            <option value="COUNT">COUNT</option>
          </optgroup>
          <optgroup label="Data Quality">
            <option value="TRIM">TRIM</option>
            <option value="UPPER">UPPER</option>
            <option value="LOWER">LOWER</option>
            <option value="REMOVE_DUPLICATES">REMOVE_DUPLICATES</option>
            <option value="FIND_AND_REPLACE">FIND_AND_REPLACE</option>
          </optgroup>
        </select>
      </div>
    </div>
  );
};

export default Toolbar;