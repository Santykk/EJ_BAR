import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export function StockHistory() {
  const [stockEntries, setStockEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStockEntries();
  }, []);

  const loadStockEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("stock_entries")
        .select("id, product_id, quantity, created_at, products(title)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStockEntries(data || []);
    } catch (error) {
      console.error("Error loading stock entries:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold mb-4">Ingresos de Stock</h3>
      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Producto</th>
            <th className="px-4 py-2 border">Cantidad</th>
            <th className="px-4 py-2 border">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {stockEntries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{entry.products?.title}</td>
              <td className="px-4 py-2 border">{entry.quantity}</td>
              <td className="px-4 py-2 border">
                {new Date(entry.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales por producto */}
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Totales por producto</h4>
        <ul className="list-disc pl-6 text-sm">
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
