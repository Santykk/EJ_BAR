import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Calendar, Package, PlusCircle, List } from "lucide-react";

export function StockHistory() {
  const [stockEntries, setStockEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedProduct, setSelectedProduct] = useState("");

  useEffect(() => {
    loadStockEntries();
  }, [selectedDate, selectedProduct]);

  const loadStockEntries = async () => {
    try {
      let query = supabase
        .from("stock_entries")
        .select("id, product_id, quantity, created_at, products(title)")
        .gte("created_at", selectedDate)
        .lt(
          "created_at",
          new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000).toISOString()
        )
        .order("created_at", { ascending: false });

      if (selectedProduct) {
        query = query.eq("product_id", selectedProduct);
      }

      const { data, error } = await query;
      if (error) throw error;
      setStockEntries(data || []);
    } catch (error) {
      console.error("Error loading stock entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalQuantity = stockEntries.reduce((sum, e) => sum + e.quantity, 0);
  const uniqueProducts = new Set(stockEntries.map((e) => e.products?.title)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Historial de Stock</h2>
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

      {/* Filtros */}
      <div>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Todos los productos</option>
          {Array.from(new Set(stockEntries.map((e) => e.products?.title))).map(
            (title, idx) =>
              title && (
                <option key={idx} value={stockEntries.find((e) => e.products?.title === title)?.product_id}>
                  {title}
                </option>
              )
          )}
        </select>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <PlusCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Movimientos</p>
              <p className="text-2xl font-bold text-gray-900">{stockEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unidades ingresadas</p>
              <p className="text-2xl font-bold text-gray-900">{totalQuantity}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-3 mr-4">
              <List className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Productos distintos</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detalle de Ingresos</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : stockEntries.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay ingresos de stock para esta fecha</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {stockEntries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{entry.products?.title || "Producto"}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(entry.created_at).toLocaleTimeString("es-ES")}
                    </p>
                  </div>
                  <span className="font-bold text-green-600">+{entry.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold mb-4">Totales por producto</h4>
        <ul className="list-disc pl-6 text-sm space-y-1">
          {Object.entries(
            stockEntries.reduce<Record<string, number>>((acc, entry) => {
              const name = entry.products?.title || "Sin nombre";
              acc[name] = (acc[name] || 0) + entry.quantity;
              return acc;
            }, {})
          ).map(([title, total]) => (
            <li key={title}>
              {title}: <span className="font-medium">{total}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
