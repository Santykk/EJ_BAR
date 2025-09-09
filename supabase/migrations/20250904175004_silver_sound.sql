/*
  # Tabla de ventas para el sistema de bar

  1. Nueva Tabla
    - `sales` - Registro de ventas
      - `id` (uuid, primary key)
      - `user_id` (uuid) - ID del usuario que realizó la venta
      - `total` (numeric) - Total de la venta
      - `items` (jsonb) - Detalles de los productos vendidos
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en la tabla `sales`
    - Política para usuarios autenticados pueden crear y leer ventas
*/

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  items jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS sales_created_at_idx ON sales(created_at);
CREATE INDEX IF NOT EXISTS sales_user_id_idx ON sales(user_id);