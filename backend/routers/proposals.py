from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from fpdf import FPDF
import io
from datetime import datetime

from database import get_db
import models
from routers.auth import get_current_user

router = APIRouter(prefix="/api/proposals", tags=["Proposals"])

class ProposalPDF(FPDF):
    def header(self):
        # Logo placeholder
        self.set_fill_color(0, 102, 204) # Primary Color
        self.rect(0, 0, 210, 40, 'F')
        
        self.set_font('helvetica', 'B', 20)
        self.set_text_color(255, 255, 255)
        self.cell(0, 20, 'PROPOSTA DE COMPRA - CRM LOTEAMENTO', ln=True, align='C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(169, 169, 169)
        self.cell(0, 10, f'Página {self.page_no()} | Gerado em {datetime.now().strftime("%d/%m/%Y %H:%M")}', align='C')

@router.get("/{lead_id}/pdf")
def generate_proposal_pdf(
    lead_id: int, 
    unit_id: int,
    installments: int = 120,
    interest_rate: float = 0.01,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id, models.Lead.tenant_id == current_user.tenant_id).first()
    unit = db.query(models.Unit).filter(models.Unit.id == unit_id).first()

    if not lead or not unit:
        raise HTTPException(status_code=404, detail="Lead ou Unidade não encontrada.")

    # Cálculos simples para a proposta
    total_price = unit.price
    entry = total_price * 0.1 # 10% entrada
    financing_amount = total_price - entry
    
    # Formula Price aproximada
    monthly_payment = (financing_amount * interest_rate) / (1 - (1 + interest_rate)**-installments)

    pdf = ProposalPDF()
    pdf.add_page()
    
    # Seção Cliente
    pdf.set_font('helvetica', 'B', 14)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, 'DADOS DO CLIENTE', ln=True)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)
    
    pdf.set_font('helvetica', '', 11)
    pdf.cell(0, 8, f'Nome: {lead.name}', ln=True)
    pdf.cell(0, 8, f'E-mail: {lead.email}', ln=True)
    pdf.cell(0, 8, f'Telefone: {lead.phone}', ln=True)
    pdf.ln(10)

    # Seção Imóvel
    pdf.set_font('helvetica', 'B', 14)
    pdf.cell(0, 10, 'DETALHES DA UNIDADE', ln=True)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)
    
    pdf.set_font('helvetica', '', 11)
    pdf.cell(0, 8, f'Loteamento: {unit.block.development.name}', ln=True)
    pdf.cell(0, 8, f'Quadra: {unit.block.name} | Lote: {unit.number}', ln=True)
    pdf.cell(0, 8, f'Área Total: {unit.area} m2', ln=True)
    pdf.cell(0, 8, f'Valor de Tabela: R$ {unit.price:,.2f}', ln=True)
    pdf.ln(10)

    # Condições de Pagamento
    pdf.set_fill_color(245, 245, 245)
    pdf.set_font('helvetica', 'B', 14)
    pdf.cell(0, 10, 'CONDIÇÕES DE PAGAMENTO', ln=True, fill=True)
    pdf.ln(5)
    
    pdf.set_font('helvetica', 'B', 12)
    pdf.cell(0, 10, f'Valor da Entrada (10%): R$ {entry:,.2f}', ln=True)
    pdf.cell(0, 10, f'Saldo a Financiar: R$ {financing_amount:,.2f}', ln=True)
    pdf.cell(0, 10, f'Plano de Pagamento: {installments} parcelas mensais', ln=True)
    pdf.set_font('helvetica', 'B', 16)
    pdf.set_text_color(0, 128, 0)
    pdf.cell(0, 15, f'PARCELAS DE: R$ {monthly_payment:,.2f}', ln=True)
    
    pdf.ln(20)
    pdf.set_font('helvetica', 'I', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(0, 5, 'Esta proposta tem validade de 48 horas e está sujeita a aprovação de crédito pela incorporadora. Os valores podem sofrer alterações sem aviso prévio.')

    # Buffer e Retorno
    pdf_output = pdf.output()
    return Response(
        content=pdf_output,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=proposta_{lead.name.replace(' ', '_')}.pdf"}
    )
