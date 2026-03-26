import { DollarSign, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";

export default function FinanceiroPage() {
  const titulos = [
    { id: 1, cliente: "João da Silva", descricao: "Entrada - Proposta 865", vencimento: "15/03/2026", valor: "R$ 45.000,00", status: "vencido" },
    { id: 2, cliente: "Maria Oliveira", descricao: "Mensal 01/24 - Lote 12", vencimento: "20/03/2026", valor: "R$ 1.500,00", status: "pendente" },
    { id: 3, cliente: "Carlos Santos", descricao: "Entrada - Proposta 864", vencimento: "10/03/2026", valor: "R$ 42.000,00", status: "pago" },
  ];

  const getStatusBadge = (status: string) => {
    const classes = {
      pago: "bg-green-100 text-green-700",
      pendente: "bg-blue-100 text-blue-700",
      vencido: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${classes[status as keyof typeof classes]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Financeiro</h1>
        <p className="text-sm text-gray-500 mt-1">Gestão de recebíveis e fluxo de caixa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg"><ArrowUpCircle className="text-red-600 h-6 w-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Vencidos</p>
            <p className="text-xl font-bold text-gray-900">R$ 125.400,00</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg"><Clock className="text-blue-600 h-6 w-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">A Receber (30 dias)</p>
            <p className="text-xl font-bold text-gray-900">R$ 842.000,00</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg"><CheckCircle2 className="text-green-600 h-6 w-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Recebido no Mês</p>
            <p className="text-xl font-bold text-gray-900">R$ 2.150.000,00</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-700">Contas a Receber</h3>
          <button className="text-sm font-medium text-primary hover:underline">Ver todos</button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Descrição</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Vencimento</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Valor</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {titulos.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.cliente}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{t.descricao}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{t.vencimento}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">{t.valor}</td>
                <td className="px-6 py-4">{getStatusBadge(t.status)}</td>
                <td className="px-6 py-4">
                  <button className="text-gray-400 hover:text-primary"><MoreHorizontal className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { Clock, CheckCircle2, MoreHorizontal } from "lucide-react";
