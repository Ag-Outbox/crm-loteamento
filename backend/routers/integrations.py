from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
import datetime

router = APIRouter(prefix="/api/integrations", tags=["Integrations"])

class ChatMessage(BaseModel):
    lead_id: int
    content: str
    sender: str # "ai", "user", "lead"

class WhatsAppMessage(BaseModel):
    to_phone: str
    message: str

@router.post("/whatsapp/send")
def send_whatsapp(msg: WhatsAppMessage):
    # Mocking WhatsApp Business API communication
    print(f"Enviando WhatsApp para {msg.to_phone}: {msg.message}")
    return {"status": "sent", "timestamp": datetime.datetime.now()}

@router.post("/ai/generate-response")
def generate_ai_response(lead_id: int, context: List[ChatMessage]):
    # Mocking AI response generation (OpenAI/Gemini style)
    # Em um cenário real, aqui usaríamos o histórico do Lead
    last_lead_msg = context[-1].content if context else "Olá"
    ai_suggestion = f"Resposta sugerida pela IA baseada na mensagem: '{last_lead_msg}'. Olá! Vi seu interesse no loteamento, gostaria de agendar uma visita?"
    
    return {"suggestion": ai_suggestion}

@router.post("/webhook/meta")
def meta_ads_webhook(payload: dict):
    # Simulação de captura de lead vindo de anúncio
    print("Lead capturado via Meta Ads:", payload)
    return {"status": "lead_created"}
