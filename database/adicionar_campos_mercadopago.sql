-- =========================================
-- ATUALIZAÇÃO DO SCHEMA PARA MERCADO PAGO
-- =========================================
-- Este script adiciona os campos necessários para integração com Mercado Pago
-- Execute no SQL Editor do Supabase

-- Adicionar campos para rastreamento de pagamentos do Mercado Pago
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS mercadopago_payment_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_status TEXT;

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_pedidos_mercadopago_payment_id 
ON pedidos(mercadopago_payment_id);

-- Comentários para documentação
COMMENT ON COLUMN pedidos.mercadopago_payment_id IS 'ID do pagamento no Mercado Pago';
COMMENT ON COLUMN pedidos.mercadopago_status IS 'Status original retornado pelo Mercado Pago (approved, pending, rejected, etc)';

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pedidos' 
  AND column_name IN ('mercadopago_payment_id', 'mercadopago_status');
