from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from fpdf import FPDF
import io
from datetime import datetime, timedelta
from typing import List

from database import get_db
import models
import schemas.sales as schemas
from routers.auth import get_current_user

router = APIRouter(prefix="/api/proposals", tags=["Proposals"])

@router.post("/", response_model=schemas.ProposalResponse)
def create_proposal(
    proposal: schemas.ProposalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Criar cabeçalho da proposta
    new_proposal = models.Proposal(
        tenant_id=current_user.tenant_id,
        lead_id=proposal.lead_id,
        unit_id=proposal.unit_id,
        broker_id=current_user.id,
        total_amount=proposal.total_amount,
        status=models.sales.ProposalStatus.PENDING,
        valid_until=proposal.valid_until or (datetime.now() + timedelta(days=7)),
        notes=proposal.notes
    )
    
    db.add(new_proposal)
    db.flush() # Para pegar o ID da proposta

    # Criar parcelas/pagamentos
    for inst in proposal.installments:
        new_inst = models.ProposalInstallment(
            tenant_id=current_user.tenant_id,
            proposal_id=new_proposal.id,
            payment_type=inst.payment_type,
            count=inst.count,
            amount_per_installment=inst.amount_per_installment,
            total_group_amount=inst.total_group_amount,
            start_date=inst.start_date,
            index_type=inst.index_type,
            interest_rate=inst.interest_rate
        )
        db.add(new_inst)

    db.commit()
    db.refresh(new_proposal)
    return new_proposal

@router.get("/lead/{lead_id}", response_model=List[schemas.ProposalResponse])
def get_lead_proposals(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Proposal).filter(
        models.Proposal.lead_id == lead_id,
        models.Proposal.tenant_id == current_user.tenant_id
    ).all()

class ProposalPDF(FPDF):
    def header(self):
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

@router.get("/{proposal_id}/pdf")
def generate_proposal_pdf(
    proposal_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    proposal = db.query(models.Proposal).filter(
        models.Proposal.id == proposal_id,
        models.Proposal.tenant_id == current_user.tenant_id
    ).first()

    if not proposal:
        raise HTTPException(status_code=404, detail="Proposta não encontrada.")

    lead = proposal.lead
    unit = proposal.unit

    pdf = ProposalPDF()
    pdf.add_page()
    
    # Seção Cliente
    pdf.set_font('helvetica', 'B', 14)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, 'DADOS DO CLIENTE', ln=True)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)
    
    pdf.set_font('helvetica', '', 11)
    pdf.cell(0, 8, f'Nome: {lead.full_name}', ln=True)
    pdf.cell(0, 8, f'E-mail: {lead.email}', ln=True)
    pdf.cell(0, 8, f'Telefone: {lead.phone}', ln=True)
    pdf.ln(10)

    # Seção Imóvel
    pdf.set_font('helvetica', 'B', 14)
    pdf.cell(0, 10, 'DETALHES DA UNIDADE', ln=True)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)
    
    pdf.set_font('helvetica', '', 11)
    pdf.cell(0, 8, f'Loteamento: {unit.development.name}', ln=True)
    pdf.cell(0, 8, f'Quadra: {unit.block.name} | Lote: {unit.number}', ln=True)
    pdf.cell(0, 8, f'Área Total: {unit.area_m2} m2', ln=True)
    pdf.cell(0, 8, f'Valor Financiado: R$ {proposal.total_amount:,.2f}', ln=True)
    pdf.ln(10)

    # Condições de Pagamento
    pdf.set_fill_color(245, 245, 245)
    pdf.set_font('helvetica', 'B', 14)
    pdf.cell(0, 10, 'FLUXO DE PAGAMENTO SIMULADO', ln=True, fill=True)
    pdf.ln(5)
    
    pdf.set_font('helvetica', 'B', 10)
    for inst in proposal.installments:
        type_label = inst.payment_type.value.upper()
        pdf.cell(0, 8, f'{inst.count}x {type_label} - Valor Unit: R$ {inst.amount_per_installment:,.2f} | Total: R$ {inst.total_group_amount:,.2f}', ln=True)
    
    pdf.ln(20)
    pdf.set_font('helvetica', 'I', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(0, 5, 'Esta proposta tem validade e está sujeita a aprovação de crédito pela incorporadora. Os valores podem sofrer alterações sem aviso prévio.')

    pdf_output = pdf.output()
    return Response(
        content=pdf_output,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=proposta_{lead.full_name.replace(' ', '_')}.pdf"}
    )
