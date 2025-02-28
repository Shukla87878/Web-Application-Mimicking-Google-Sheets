import React from 'react';
import { Type } from 'lucide-react';

interface FormulaBarProps {
  value: string;
  onChange: (value: string) => void;
  activeCell: string;
}

const FormulaBar: React.FC<FormulaBarProps> = ({ value, onChange, activeCell }) => {
  return (
    <div className="flex items-center p-2 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-center w-10 h-8 bg-gray-100 border border-gray-300 rounded-l text-gray-600">
        <Type className="w-4 h-4" />
      </div>
      <div className="w-16 h-8 flex items-center justify-center bg-gray-100 border-t border-b border-gray-300 text-sm font-medium text-gray-700">
        {activeCell}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-8 px-2 border border-gray-300 rounded-r focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Enter a value or formula (e.g., =SUM(A1:A5))"
        disabled={!activeCell}
      />
    </div>
  );
};

export default FormulaBar;