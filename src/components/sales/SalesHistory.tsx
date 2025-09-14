import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Sale } from '../../types';
import { Calendar, DollarSign, Package, ShoppingCart } from 'lucide-react';

const formatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR', // Cambia según tu moneda local
});

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    setPage(1);
    loadSales(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const loadSales = async (pageToLoad: number) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // Calculamos el inicio y fin del día en UTC para evitar errores
      const start = new Date(selectedDate + 'T00:00:00Z');
      const end = new Date(start.getTime() + MS_PER_DAY);

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', start.toISOString())
        .lt('created_at', end.toISOString())
        .order('created_at', { ascending: false })
        .range((pageToLoad - 1) * PAGE_SIZE, pageToLoad * PAGE_SIZE - 1);

      if (error) throw error;

      if (pageToLoad === 1) {
        setSales(data || []);
      } else {
        setSales((prev) => [...prev, ...(data || [])]);
      }
    } catch (error) {
      console.error('Error loading sales:', error);
      setErrorMsg('Error cargando las ventas. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getTotalRevenue = useMemo(() => {
    return sales.reduce((total, sale) => total + sale.total, 0);
  }, [sales]);

  const getTotalItems = useMemo(() => {
    return sales.reduce(
      (total, sale) =>
        total + sale.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0),
      0
    );
  }, [sales]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadSales(nextPage);
  };

  return (
    <div className="space-y-6" role="region" aria-label="Historial de ventas">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Historial de Ventas</h2>
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-400" aria-hidden="true" />
          <label htmlFor="dateInput" className="sr-only">
            Seleccionar fecha
          </label>
          <input
            id="dateInput"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            aria-describedby="dateHelp"
          />
          <span id="dateHelp" className="sr-only">
            Selecciona la fecha para filtrar las ventas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          aria-labelledby="revenueTitle"
          role="region"
        >
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <DollarSign className="w-6 h-6 text-green-600" aria-hidden="true" />
            </div>
            <div>
              <p id="revenueTitle" className="text-sm text-gray-600">
                Ingresos del Día
              </p>
              <p className="text-2xl font-bold text-gray-900">{formatter.format(getTotalRevenue)}</p>
            </div>
          </div>
        </section>

        <section
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          aria-labelledby="itemsTitle"
          role="region"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <Package className="w-6 h-6 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <p id="itemsTitle" className="text-sm text-gray-600">
                Productos Vendidos
              </p>
              <p className="text-2xl font-bold text-gray-900">{getTotalItems}</p>
            </div>
          </div>
        </section>

        <section
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          aria-labelledby="salesCountTitle"
          role="region"
        >
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-3 mr-4">
              <Calendar className="w-6 h-6 text-purple-600" aria-hidden="true" />
            </div>
            <div>
              <p id="salesCountTitle" className="text-sm text-gray-600">
                Total Ventas
              </p>
              <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
            </div>
          </div>
        </section>
      </div>

      <div
        className="bg-white rounded-xl shadow-sm border border-gray-200"
        role="region"
        aria-labelledby="salesDetailsTitle"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 id="salesDetailsTitle" className="text-lg font-semibold text-gray-900">
            Detalle de Ventas
          </h3>
        </div>

        {errorMsg && (
          <div
            className="text-red-600 text-center py-4"
            role="alert"
            aria-live="assertive"
          >
            {errorMsg}
          </div>
        )}

        {loading && page === 1 ? (
          <div className="flex items-center justify-center h-32" aria-busy="true" aria-label="Cargando ventas">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-500">No hay ventas para esta fecha</p>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-4">
              {sales.map((sale) => (
                <article
                  key={sale.id}
                  className="border border-gray-200 rounded-lg p-4"
                  role="group"
                  aria-labelledby={`saleTitle-${sale.id}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p
                        id={`saleTitle-${sale.id}`}
                        className="font-medium text-gray-900"
                      >
                        Venta #{sale.id.slice(0, 8)}
                      </p>
                      <time className="text-sm text-gray-600" dateTime={sale.created_at}>
                        {new Date(sale.created_at).toLocaleTimeString('es-ES')}
                      </time>
                    </div>
                    <span className="font-bold text-green-600">
                      {formatter.format(sale.total)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {sale.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.product_name || 'Producto'}
                        </span>
                        <span className="text-gray-900">{formatter.format(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            {/* Botón cargar más si hay más ventas que mostrar */}
            {sales.length % PAGE_SIZE === 0 && sales.length !== 0 && (
              <div className="flex justify-center pb-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Cargar más ventas"
                >
                  {loading ? 'Cargando...' : 'Cargar más'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
