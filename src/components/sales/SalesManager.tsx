import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product, CartItem, TableOrder } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useCompanySettings } from '../../hooks/useCompanySettings';
import { ShoppingCart, Plus, Minus, Trash2, Users } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { TableSelector } from './TableSelector';

export function SalesManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [tableOrders, setTableOrders] = useLocalStorage<Record<number, TableOrder>>('tableOrders', {});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const { settings } = useCompanySettings();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('title');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentCart = (): CartItem[] => {
    if (!selectedTable || !tableOrders[selectedTable]) return [];
    return tableOrders[selectedTable].items;
  };

  const updateTableOrder = (tableNumber: number, items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const now = new Date().toISOString();
    
    setTableOrders(prev => ({
      ...prev,
      [tableNumber]: {
        tableNumber,
        items,
        total,
        createdAt: prev[tableNumber]?.createdAt || now,
        updatedAt: now,
      }
    }));
  };

  const addToCart = (product: Product) => {
    if (!selectedTable) {
      alert('Por favor selecciona una mesa primero');
      return;
    }

    const currentCart = getCurrentCart();
    const existingItem = currentCart.find((item) => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        const updatedCart = currentCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        updateTableOrder(selectedTable, updatedCart);
      }
    } else {
      const updatedCart = [...currentCart, { product, quantity: 1 }];
      updateTableOrder(selectedTable, updatedCart);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!selectedTable) return;

    const currentCart = getCurrentCart();
    if (quantity <= 0) {
      const updatedCart = currentCart.filter((item) => item.product.id !== productId);
      updateTableOrder(selectedTable, updatedCart);
    } else {
      const updatedCart = currentCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      updateTableOrder(selectedTable, updatedCart);
    }
  };

  const removeFromCart = (productId: string) => {
    if (!selectedTable) return;

    const currentCart = getCurrentCart();
    const updatedCart = currentCart.filter((item) => item.product.id !== productId);
    updateTableOrder(selectedTable, updatedCart);
  };

  const getCurrentTotal = () => {
    if (!selectedTable || !tableOrders[selectedTable]) return 0;
    return tableOrders[selectedTable].total;
  };

  const processSingleTable = async (tableNumber: number) => {
    const tableOrder = tableOrders[tableNumber];
    if (!tableOrder || tableOrder.items.length === 0 || !user) return;

    try {
      const saleData = {
        user_id: user.id,
        total: tableOrder.total,
        items: tableOrder.items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.title,
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity,
        })),
      };

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([saleData])
        .select()
        .single();

      if (saleError) throw saleError;

      for (const item of tableOrder.items) {
        const newStock = item.product.stock - item.quantity;
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product.id);

        if (stockError) throw stockError;
      }

      // Clear table order
      setTableOrders(prev => {
        const updated = { ...prev };
        delete updated[tableNumber];
        return updated;
      });

      return true;
    } catch (error) {
      console.error('Error processing sale:', error);
      return false;
    }
  };

  const processSale = async () => {
    if (!selectedTable || !user) return;

    setProcessing(true);
    try {
      const success = await processSingleTable(selectedTable);
      if (success) {
        loadProducts();
        alert('Venta procesada exitosamente');
      } else {
        alert('Error al procesar la venta');
      }
    } finally {
      setProcessing(false);
    }
  };

  const processAllSales = async () => {
    if (!user) return;

    const tablesWithOrders = Object.values(tableOrders).filter(order => order.items.length > 0);
    if (tablesWithOrders.length === 0) return;

    setProcessing(true);
    try {
      let successCount = 0;
      for (const order of tablesWithOrders) {
        const success = await processSingleTable(order.tableNumber);
        if (success) successCount++;
      }

      loadProducts();
      if (successCount === tablesWithOrders.length) {
        alert(`Todas las ventas procesadas exitosamente (${successCount} mesas)`);
      } else {
        alert(`${successCount} de ${tablesWithOrders.length} ventas procesadas exitosamente`);
      }
    } finally {
      setProcessing(false);
    }
  };

  const clearTable = (tableNumber: number) => {
    if (confirm(`¿Estás seguro de que quieres limpiar la Mesa ${tableNumber}?`)) {
      setTableOrders(prev => {
        const updated = { ...prev };
        delete updated[tableNumber];
        return updated;
      });
    }
  };

  function formatPrice(value: number | null | undefined) {
  return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 2 
  }).format(value || 0);
};

  const handleTableSelect = (tableNumber: number) => {
    setSelectedTable(tableNumber);
  };

  const currentCart = getCurrentCart();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="w-8 h-8 mr-3 text-green-600" />
          Gestión de Ventas por Mesa
        </h2>
      </div>

      <TableSelector 
        selectedTable={selectedTable}
        onTableSelect={handleTableSelect}
        tableOrders={tableOrders}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Productos Disponibles
            {selectedTable && (
              <span className="ml-2 text-sm font-normal text-green-600">
                - Mesa {selectedTable}
              </span>
            )}
          </h3>
          {!selectedTable ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Selecciona una mesa para comenzar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <h4 className="font-medium text-gray-900">{product.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-600">{formatPrice(product.price)}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedTable ? `Mesa ${selectedTable}` : 'Carrito'}
            </h3>
            <ShoppingCart className="w-5 h-5 text-gray-600" />
          </div>

          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {currentCart.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product.title}</p>
                  <p className="text-xs text-gray-600">{formatPrice(item.product.price)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-medium w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-400 hover:text-red-600 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {currentCart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {selectedTable ? 'Mesa vacía' : 'Selecciona una mesa'}
            </p>
          ) : (
            <>
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total:</span>
                  <span className="font-bold text-xl text-green-600">
                    {formatPrice(getCurrentTotal())}
                  </span>
                </div>
              </div>
              <button
                onClick={processSale}
                disabled={processing || !selectedTable}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {processing ? 'Procesando...' : `Procesar Mesa ${selectedTable}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SalesManagerOld() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('title');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.product.id !== productId));
    } else {
      setCart(cart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const processSale = async () => {
    if (cart.length === 0 || !user) return;

    setProcessing(true);
    try {
      // Create sale record
      const saleData = {
        user_id: user.id,
        total: getTotalAmount(),
        items: cart.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.title,
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity,
        })),
      };

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([saleData])
        .select()
        .single();

      if (saleError) throw saleError;

      // Update product stock
      for (const item of cart) {
        const newStock = item.product.stock - item.quantity;
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product.id);

        if (stockError) throw stockError;
      }

      // Clear cart and refresh products
      setCart([]);
      loadProducts();
      alert('Venta procesada exitosamente');
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error al procesar la venta');
    } finally {
      setProcessing(false);
    }
  };

  function formatPrice(value: number | null | undefined) {
  return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 2 
  }).format(value || 0);
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => addToCart(product)}
            >
              <h4 className="font-medium text-gray-900">{product.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{product.category}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-green-600">{formatPrice(product.price)}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  Stock: {product.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Carrito</h3>
          <ShoppingCart className="w-5 h-5 text-gray-600" />
        </div>

        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {cart.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{item.product.title}</p>
                <p className="text-xs text-gray-600">{formatPrice(item.product.price)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-medium w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-red-400 hover:text-red-600 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Carrito vacío</p>
        ) : (
          <>
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total:</span>
                <span className="font-bold text-xl text-green-600">
                  {formatPrice(getTotalAmount())}
                </span>
              </div>
            </div>
            <button
              onClick={processSale}
              disabled={processing}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {processing ? 'Procesando...' : 'Procesar Venta'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}