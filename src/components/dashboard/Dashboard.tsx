import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Product, Sale } from "../../types";
import { Package, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

export function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    todaySales: 0,
    totalRevenue: 0,
  });

  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get products data
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*");

      if (productsError) throw productsError;

      // Get today's sales
      const today = new Date().toISOString().split("T")[0];
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("*")
        .gte("created_at", today);

      if (salesError) throw salesError;

      // Calculate stats
      const totalProducts = products?.length || 0;
      const lowStock =
        products?.filter(
          (p: Product) => p.min_stock && p.stock <= p.min_stock
        ) || [];
      const todaySales = sales?.length || 0;
      const totalRevenue =
        sales?.reduce((sum: number, sale: Sale) => sum + sale.total, 0) || 0;

      setStats({
        totalProducts,
        lowStockItems: lowStock.length,
        todaySales,
        totalRevenue,
      });

      setLowStockProducts(lowStock);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`${color} rounded-lg p-3 mr-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

        {/* Tarjetas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Package}
            title="Productos"
            value={stats.totalProducts}
            color="bg-green-500"
          />
          <StatCard
            icon={AlertTriangle}
            title="Stock Bajo"
            value={stats.lowStockItems}
            color="bg-orange-500"
          />
          <StatCard
            icon={TrendingUp}
            title="Ventas Hoy"
            value={stats.todaySales}
            color="bg-emerald-500"
          />
          <StatCard
            icon={DollarSign}
            title="Ingresos Hoy"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            color="bg-teal-500"
          />
        </div>
      </div>

      {/* Sección de productos con stock bajo */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
            Productos con Stock Bajo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border border-orange-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{product.title}</p>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-600">
                    Stock: {product.stock}
                  </p>
                  <p className="text-xs text-gray-500">
                    Mínimo: {product.min_stock || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
