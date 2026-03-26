import { FileText, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";

export default function ReservasPropostasPage() {
  const propostas = [
    { id: 1, lead: "João da Silva", produto: "Loteamento Reserva", unidade: "Torre A - 101", status: "aguardando", data: "14/03/2026", valor: "R$ 450.000,00" },
    { id: 2, lead: "Maria Oliveira", produto: "Residencial Park", unidade: "Quadra 05 - Lote 12", status: "aprovada", data: "13/03/2026", valor: "R$ 180.000,00" },
    { id: 3, lead: "Carlos Santos", produto: "Loteamento Reserva", unidade: "Torre B - 204", status: "pendencia", data: "12/03/2026", valor: "R$ 420.000,00" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aprovada": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "aguardando": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "pendencia": return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "reprovada": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      aprovada: "bg-green-50 text-green-700 ring-green-600/20",
      aguardando: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
      pendencia: "bg-orange-50 text-orange-700 ring-orange-600/20",
      reprovada: "bg-red-50 text-red-700 ring-red-600/20",
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${classes[status as keyof typeof classes]}`}>
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reservas e Propostas</h1>
        <p className="text-sm text-gray-500 mt-1">Gestão centralizada de negociações em andamento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Aprovadas</p>
          <p className="text-2xl font-bold text-green-600">45</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Aguardando</p>
          <p className="text-2xl font-bold text-yellow-600">12</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Pendências</p>
          <p className="text-2xl font-bold text-orange-600">5</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Reprovadas</p>
          <p className="text-2xl font-bold text-red-600">3</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Lead/Produto</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Unidade</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {propostas.map((prop) => (
              <tr key={prop.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{prop.lead}</p>
                  <p className="text-xs text-gray-500">{prop.produto}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{prop.unidade}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{prop.valor}</td>
                <td className="px-6 py-4">{getStatusBadge(prop.status)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{prop.data}</td>
                <td className="px-6 py-4">
                  <button className="text-primary hover:underline text-sm font-medium">Visualizar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
