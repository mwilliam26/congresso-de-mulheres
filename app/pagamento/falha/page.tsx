"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function PagamentoFalhaContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedido_id");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Ícone de Falha */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagamento Não Aprovado
        </h1>

        {/* Mensagem */}
        <p className="text-gray-600 mb-2">
          Houve um problema com o processamento do seu pagamento.
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 mb-2">Possíveis motivos:</p>
          <ul className="text-xs text-red-700 text-left space-y-1 ml-4">
            <li>• Saldo insuficiente</li>
            <li>• Dados do cartão incorretos</li>
            <li>• Problema com a operadora</li>
            <li>• Limite excedido</li>
          </ul>
        </div>

        {/* Botões */}
        <div className="space-y-3">
          <Link
            href="/inscricao"
            className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Tentar Novamente
          </Link>

          <Link
            href="/"
            className="block w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all"
          >
            Voltar para o Início
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PagamentoFalhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      }
    >
      <PagamentoFalhaContent />
    </Suspense>
  );
}
