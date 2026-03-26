"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Building,
    DollarSign,
    MessageSquare,
    Globe,
    FileText,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        // Em um app real usaríamos um Contexto de Autenticação
        const role = localStorage.getItem("user_role");
        setUserRole(role || "broker");
    }, []);

    const navigation = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "broker"] },
        { name: "CRM de Vendas", href: "/crm", icon: Users, roles: ["admin", "broker"] },
        { name: "Unidades", href: "/unidades", icon: Building, roles: ["admin", "broker"] },
        { name: "Mapa Interativo", href: "/mapa-interativo", icon: Globe, roles: ["admin", "broker"] },
        { name: "Reservas/Propostas", href: "/reservas-propostas", icon: FileText, roles: ["admin", "broker"] },
        { name: "Financeiro", href: "/financeiro", icon: DollarSign, roles: ["admin"] },
        { name: "Atendimento", href: "/atendimento", icon: MessageSquare, roles: ["admin", "broker"] },
        { name: "Stand Online", href: "/stand", icon: Globe, roles: ["admin"] },
        { name: "Equipe", href: "/equipe", icon: Users, roles: ["admin"] },
    ];

    const filteredNavigation = navigation.filter(item => 
        userRole && item.roles.includes(userRole)
    );

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border hidden lg:flex lg:flex-col pb-4">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center px-6">
                <h1 className="text-xl font-bold text-primary">CRM Loteamento</h1>
            </div>

            {/* Navegação */}
            <nav className="flex flex-1 flex-col px-4 mt-6">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1">
                            {filteredNavigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                                            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        )}
                                    >
                                        <item.icon
                                            className="h-6 w-6 shrink-0"
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>

                    <li className="mt-auto">
                        <Link
                            href="/login"
                            onClick={() => localStorage.removeItem("user_role")}
                            className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-red-500 hover:bg-red-50"
                        >
                            Sair da Conta
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}
