import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Sale } from '../../types';
import { Calendar, DollarSign, Package, ShoppingCart } from 'lucide-react';

export function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadSales();
  }, [selectedDate]);

  const loadSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', selectedDate)
        .lt('created_at', new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalRevenue = () => {
    return sales.reduce((total, sale) => total + sale.total, 0);
  };

  const getTotalItems = () => {
    return sales.reduce((total, sale) => 
      total + sale.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0), 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Historial de Ventas</h2>
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ingresos del Día</p>
              <p className="text-2xl font-bold text-gray-900">${getTotalRevenue().toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Productos Vendidos</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalItems()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-3 mr-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Ventas</p>
              <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detalle de Ventas</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay ventas para esta fecha</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {sales.map((sale) => (
              <div key={sale.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      Venta #{sale.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(sale.created_at).toLocaleTimeString('es-ES')}
                    </p>
                  </div>
                  <span className="font-bold text-green-600">${sale.total.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  {sale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity}x {item.product_name || 'Producto'}
                      </span>
                      <span className="text-gray-900">${item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}