import React from 'react';
import { TableOrder } from '../../types';
import { Trash2, DollarSign } from 'lucide-react';

interface TableOrderSummaryProps {
  tableOrders: Record<number, TableOrder>;
  onClearTable: (tableNumber: number) => void;
  onProcessAllSales: () => void;
  processing: boolean;
}

export function TableOrderSummary({ 
  tableOrders, 
  onClearTable, 
  onProcessAllSales, 
  processing 
}: TableOrderSummaryProps) {
  const tablesWithOrders = Object.values(tableOrders).filter(order => order.items.length > 0);
  const grandTotal = tablesWithOrders.reduce((sum, order) => sum + order.total, 0);

  if (tablesWithOrders.length === 0) {
    return null;
  }

function formatPrice(value: number | null | undefined) {
  return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 2 
  }).format(value || 0);
};


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Resumen de Mesas</h3>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total General</p>
          <p className="text-2xl font-bold text-green-600">{formatPrice(grandTotal)}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
        {tablesWithOrders.map((order) => (
          <div key={order.tableNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Mesa {order.tableNumber}</span>
                <span className="font-bold text-green-600">{formatPrice(order.total)}</span>
              </div>
              <p className="text-sm text-gray-600">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} productos
              </p>
            </div>
            <button
              onClick={() => onClearTable(order.tableNumber)}
              className="ml-3 text-red-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onProcessAllSales}
        disabled={processing}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
      >
        <DollarSign className="w-5 h-5 mr-2" />
        {processing ? 'Procesando...' : `Procesar Todas las Ventas (${tablesWithOrders.length} mesas)`}
      </button>
    </div>
  );
}