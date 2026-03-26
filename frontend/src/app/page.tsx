"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, Building, DollarSign, PieChart, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if (!role) {
      router.push("/login");
    }
  }, [router]);

  const stats = [
    { name: "Total de Leads", value: "1,280", icon: Users, change: "+12%", color: "bg-blue-500" },
    { name: "Unidades Disponíveis", value: "145", icon: Building, change: "-3%", color: "bg-green-500" },
    { name: "Vendas no Mês", value: "R$ 4.2M", icon: TrendingUp, change: "+25%", color: "bg-orange-500" },
    { name: "Taxa de Conversão", value: "3.2%", icon: PieChart, change: "+2%", color: "bg-purple-500" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Gerencial</h1>
        <p className="text-sm text-gray-500 mt-1">Bem-vindo de volta! Aqui está o resumo da sua operação hoje.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 text-${stat.color.split("-")[1]}-600`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <span className={`text-xs font-semibold ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Empreendimento</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">Gráfico de Vendas (Placeholder)</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversão do Funil</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">Gráfico de Funil (Placeholder)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
