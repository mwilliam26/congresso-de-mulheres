import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Configurar cliente do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

// Mapeamento de status do Mercado Pago para nosso sistema
const STATUS_MAP: Record<string, string> = {
  approved: "Pago",
  pending: "Pendente",
  in_process: "Pendente",
  rejected: "Cancelado",
  cancelled: "Cancelado",
  refunded: "Cancelado",
  charged_back: "Cancelado",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("📥 Webhook recebido:", body);

    // Mercado Pago envia notificações de diferentes tipos
    // Só processamos notificações de pagamento
    if (body.type !== "payment") {
      console.log("ℹ️ Notificação ignorada (não é pagamento):", body.type);
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id;

    if (!paymentId) {
      console.log("⚠️ Payment ID não encontrado no webhook");
      return NextResponse.json({ received: true });
    }

    // Buscar informações do pagamento no Mercado Pago
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });

    const pedidoId = paymentInfo.external_reference;
    const status = paymentInfo.status || "pending";

    if (!pedidoId) {
      console.log("⚠️ External reference (pedido_id) não encontrado");
      return NextResponse.json({ received: true });
    }

    // Mapear status do Mercado Pago para nosso sistema
    const statusPagamento = STATUS_MAP[status] || "Pendente";

    console.log("🔄 Atualizando pedido:", {
      pedido_id: pedidoId,
      payment_id: paymentId,
      status_mp: status,
      status_sistema: statusPagamento,
    });

    // Atualizar status no banco
    const { error } = await supabase
      .from("pedidos")
      .update({
        status_pagamento: statusPagamento,
        mercadopago_payment_id: paymentId.toString(),
        mercadopago_status: status,
      })
      .eq("id", pedidoId);

    if (error) {
      console.error("❌ Erro ao atualizar pedido:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Pedido atualizado com sucesso:", pedidoId);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Erro no webhook:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook", details: error.message },
      { status: 500 }
    );
  }
}
