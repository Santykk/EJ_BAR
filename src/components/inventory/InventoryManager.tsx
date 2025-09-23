import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Product } from "../../types";
import { Plus, Edit2, Package, Search, Trash2 } from "lucide-react";
import { ProductForm } from "./ProductForm";
import { useUserProfile } from "../../hooks/useUserProfile";

export function InventoryManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockEntries, setStockEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { isAdmin } = useUserProfile();

  const categories = ["Bebidas", "Cervezas", "Licores", "Comidas", "Snacks", "Otros"];

  useEffect(() => {
    loadProducts();
    loadStockEntries();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("title");
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleProductSaved = () => {
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
      loadProducts();
      alert("Producto eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error al eliminar el producto");
    }
  };

  const addStock = async (product: Product) => {
    const quantity = parseInt(prompt("¿Cuántas unidades deseas añadir?") || "0");
    if (isNaN(quantity) || quantity <= 0) return;

    try {
      // Insertar en historial
      const { error: entryError } = await supabase.from("stock_entries").insert([
        { product_id: product.id, quantity },
      ]);
      if (entryError) throw entryError;

      // Actualizar stock del producto
      const { error: updateError } = await supabase
        .from("products")
        .update({ stock: product.stock + quantity })
        .eq("id", product.id);
      if (updateError) throw updateError;

      alert("Stock añadido correctamente");
      loadProducts();
      loadStockEntries();
    } catch (error) {
      console.error("Error adding stock:", error);
      alert("No se pudo añadir stock");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h2>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Producto
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.title}</h3>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>
                <div className="flex space-x-2">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => addStock(product)}
                      className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-700"
                    >
                      Añadir Stock
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Precio:</span>
                  <span className="font-medium">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <span
                    className={`font-medium ${
                      product.stock <= product.min_stock ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {product.stock}
                  </span>
                </div>
                {product.min_stock && product.stock <= product.min_stock && (
                  <div className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded flex items-center">
                    <Package className="w-3 h-3 mr-1" />
                    Stock bajo
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Tabla de ingresos de stock */}
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

      {/* Formulario */}
      {showForm && isAdmin && (
        <ProductForm
          product={editingProduct}
          onSave={handleProductSaved}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}
