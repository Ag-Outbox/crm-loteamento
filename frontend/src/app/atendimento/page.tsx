"use client";

import { useState } from "react";
import { Send, User, Bot, Phone, Video, MoreVertical, Paperclip, Smile } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "lead", content: "Olá, vi o anúncio do Loteamento Reserva. Ainda tem unidades disponíveis?", time: "09:30" },
    { id: 2, sender: "ai", content: "Olá! Sim, temos ótimas unidades disponíveis. Posso te enviar o espelho de vendas?", time: "09:31" },
    { id: 3, sender: "lead", content: "Sim, por favor. Gostaria de saber também sobre o financiamento.", time: "09:35" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "agent", content: input, time: "09:40" }]);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header do Chat */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">JS</div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">João da Silva</h3>
            <p className="text-xs text-green-500 font-medium flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500"></span> Online no WhatsApp
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600"><Phone className="h-5 w-5" /></button>
          <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600"><Video className="h-5 w-5" /></button>
          <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600"><MoreVertical className="h-5 w-5" /></button>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm text-sm ${
              msg.sender === "agent" ? "bg-primary text-white rounded-tr-none" : 
              msg.sender === "ai" ? "bg-purple-50 text-purple-700 border border-purple-100 rounded-tl-none" :
              "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
            }`}>
              <div className="flex items-center gap-1 mb-1">
                {msg.sender === "ai" && <Bot className="h-3 w-3" />}
                <span className="text-[10px] opacity-70 uppercase font-bold">
                  {msg.sender === "agent" ? "Você" : msg.sender === "ai" ? "Assistente IA" : "João"}
                </span>
              </div>
              <p>{msg.content}</p>
              <p className={`text-[10px] mt-1 text-right ${msg.sender === "agent" ? "text-blue-100" : "text-gray-400"}`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sugestão da IA */}
      <div className="px-6 py-2 bg-purple-50/50 border-t border-purple-100">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-purple-600" />
          <p className="text-xs text-purple-700 italic">IA sugere: "Temos planos de até 120 meses. Quer ver uma simulação?"</p>
          <button className="ml-auto text-[10px] font-bold text-purple-600 uppercase hover:underline">Usar sugestão</button>
        </div>
      </div>

      {/* Input de Mensagem */}
      <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600"><Paperclip className="h-5 w-5" /></button>
        <div className="flex-1 relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Digite sua mensagem..." 
            className="w-full bg-gray-100 border-none rounded-full px-5 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><Smile className="h-5 w-5" /></button>
        </div>
        <button 
          onClick={sendMessage}
          className="bg-primary text-white p-2.5 rounded-full hover:bg-primary/90 transition-all"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
