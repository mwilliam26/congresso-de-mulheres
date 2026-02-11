-- ============================================
-- SCRIPT PARA ATUALIZAR VALOR DO ALMOÇO
-- De R$15,00 para R$25,00
-- ============================================

-- Atualizar a tabela lotes_config (se existir)
UPDATE lotes_config 
SET preco_almoco = 25.00
WHERE preco_almoco = 15.00;

-- Atualizar a tabela config_sistema com as configurações dos lotes
UPDATE config_sistema 
SET valor = '25.00'
WHERE chave IN ('lote_1_preco_almoco', 'lote_2_preco_almoco', 'lote_3_preco_almoco');

-- Para pedidos existentes, recalcular valor_total baseado no novo almoço
-- Apenas atualiza pedidos que incluem almoço e ainda não foram processados
UPDATE pedidos 
SET valor_total = valor_total + 10.00
WHERE inclui_almoco = true 
AND status_pagamento IN ('pendente', 'aguardando');

-- Verificar as atualizações
SELECT * FROM lotes_config;
SELECT chave, valor FROM config_sistema WHERE chave LIKE 'lote_%preco%';
