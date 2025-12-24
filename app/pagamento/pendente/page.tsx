"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function PagamentoPendenteContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedido_id");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Ícone de Pendente */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagamento Pendente
        </h1>

        {/* Mensagem */}
        <p className="text-gray-600 mb-2">
          Estamos aguardando a confirmação do seu pagamento.
        </p>

        {/* Pedido ID */}
        {pedidoId && (
          <p className="text-sm text-gray-500 mb-8">
            Pedido:{" "}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {pedidoId}
            </span>
          </p>
        )}

        {/* Informações Adicionais */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 space-y-2">
          <p className="text-sm text-yellow-800">
            ⏱️ Isso pode levar alguns minutos ou até 2 dias úteis, dependendo do
            método de pagamento escolhido.
          </p>
          <p className="text-sm text-yellow-800">
            📧 Você receberá um e-mail assim que o pagamento for confirmado.
          </p>
        </div>

        {/* Botão de Retorno */}
        <Link
          href="/"
          className="block w-full bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-yellow-700 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl"
        >
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
}

export default function PagamentoPendentePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        </div>
      }
    >
      <PagamentoPendenteContent />
    </Suspense>
  );
}
