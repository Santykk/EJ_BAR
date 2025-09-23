import React, { useState } from "react";
import { StockHistory } from "./StockHistory";
import { SalesHistory } from "./SalesHistory";

export const History: React.FC = () => {
  const [view, setView] = useState<"stock" | "sales">("stock");

  return (
    <div className="p-4">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setView("stock")}
          className={`px-4 py-2 rounded-lg ${
            view === "stock" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Stock
        </button>
        <button
          onClick={() => setView("sales")}
          className={`px-4 py-2 rounded-lg ${
            view === "sales" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Ventas
        </button>
      </div>

      <div>
        {view === "stock" ? <StockHistory /> : <SalesHistory />}
      </div>
    </div>
  );
};
