import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// Cliente Supabase com service role key para o webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export async function POST(request: NextRequest) {
  try {
    // Obter dados do webhook
    const body = await request.json();

    console.log("Webhook recebido:", body);

    // Verificar se é uma notificação de pagamento
    if (body.type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data.id;

    // Buscar detalhes do pagamento no Mercado Pago
    const mercadoPagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    const paymentResponse = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${mercadoPagoAccessToken}`,
        },
      },
    );

    const payment = paymentResponse.data;
    const preferenceId =
      payment.external_reference || payment.metadata?.preference_id;

    // Mapear status do Mercado Pago para nosso sistema
    let statusPagamento = "Pendente";

    switch (payment.status) {
      case "approved":
        statusPagamento = "Pago";
        break;
      case "rejected":
      case "cancelled":
        statusPagamento = "Cancelado";
        break;
      case "pending":
      case "in_process":
      case "in_mediation":
        statusPagamento = "Pendente";
        break;
    }

    // Atualizar pedido no Supabase
    // Primeiro, buscar pelo preference_id ou payment_id
    const { data: pedidos, error: searchError } = await supabaseAdmin
      .from("pedidos")
      .select("*")
      .or(
        `mercado_pago_preference_id.eq.${preferenceId},mercado_pago_payment_id.eq.${paymentId}`,
      );

    if (searchError) {
      console.error("Erro ao buscar pedido:", searchError);
      return NextResponse.json(
        { error: "Erro ao buscar pedido" },
        { status: 500 },
      );
    }

    if (!pedidos || pedidos.length === 0) {
      // Se não encontrou por preference_id, tentar buscar por email do pagador
      const payerEmail = payment.payer?.email;

      if (payerEmail) {
        const { data: pedidosPorEmail, error: emailSearchError } =
          await supabaseAdmin
            .from("pedidos")
            .select("*")
            .eq("email", payerEmail)
            .eq("status_pagamento", "Pendente")
            .order("created_at", { ascending: false })
            .limit(1);

        if (
          !emailSearchError &&
          pedidosPorEmail &&
          pedidosPorEmail.length > 0
        ) {
          const pedido = pedidosPorEmail[0];

          // Preparar dados de atualização
          const updateData: any = {
            status_pagamento: statusPagamento,
            mercado_pago_payment_id: paymentId.toString(),
          };

          // Preencher data_compra quando pagamento for aprovado
          if (statusPagamento === "Pago") {
            updateData.data_compra = new Date().toISOString();
          }

          // Atualizar pedido
          const { error: updateError } = await supabaseAdmin
            .from("pedidos")
            .update(updateData)
            .eq("id", pedido.id);

          if (updateError) {
            console.error("Erro ao atualizar pedido:", updateError);
            return NextResponse.json(
              { error: "Erro ao atualizar pedido" },
              { status: 500 },
            );
          }

          return NextResponse.json({ success: true, updated: true });
        }
      }

      console.log("Pedido não encontrado para preference_id:", preferenceId);
      return NextResponse.json({
        received: true,
        warning: "Pedido não encontrado",
      });
    }

    // Atualizar o primeiro pedido encontrado
    const pedido = pedidos[0];

    // Preparar dados de atualização
    const updateData: any = {
      status_pagamento: statusPagamento,
      mercado_pago_payment_id: paymentId.toString(),
    };

    // Preencher data_compra quando pagamento for aprovado
    if (statusPagamento === "Pago") {
      updateData.data_compra = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from("pedidos")
      .update(updateData)
      .eq("id", pedido.id);

    if (updateError) {
      console.error("Erro ao atualizar pedido:", updateError);
      return NextResponse.json(
        { error: "Erro ao atualizar pedido" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, updated: true });
  } catch (error: any) {
    console.error("Erro no webhook:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar webhook" },
      { status: 500 },
    );
  }
}

// Permitir GET para verificação do Mercado Pago
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: "Webhook ativo" });
}
