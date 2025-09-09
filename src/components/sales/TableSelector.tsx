import React from 'react';
import { TableOrder } from '../../types';
import { useCompanySettings } from '../../hooks/useCompanySettings';

interface TableSelectorProps {
  selectedTable: number | null;
  onTableSelect: (tableNumber: number) => void;
  tableOrders: Record<number, TableOrder>;
}

export function TableSelector({ selectedTable, onTableSelect, tableOrders }: TableSelectorProps) {
  const { settings } = useCompanySettings();
  const maxTables = settings?.max_tables || 12;
  const tables = Array.from({ length: maxTables }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Mesa</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {tables.map((tableNumber) => {
          const hasOrder = tableOrders[tableNumber];
          const isSelected = selectedTable === tableNumber;
          
          return (
            <button
              key={tableNumber}
              onClick={() => onTableSelect(tableNumber)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105
                ${isSelected 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : hasOrder 
                    ? 'border-orange-300 bg-orange-50 text-orange-700 hover:border-orange-400' 
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="text-center">
                <div className="text-lg font-bold">Mesa {tableNumber}</div>
                {hasOrder && (
                  <div className="text-xs mt-1">
                    {hasOrder.items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </div>
                )}
              </div>
              {hasOrder && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}