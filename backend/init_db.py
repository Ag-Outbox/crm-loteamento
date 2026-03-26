from database import engine, SessionLocal
from models import Base, Tenant, User, PipelineStage, Lead, UserRole
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if we already seeded
    if db.query(Tenant).first():
        print("Database already seeded.")
        return

    print("Seeding database...")
    
    # Create Tenant
    tenant = Tenant(name="Loteadora Modelo", domain="modelo")
    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    # Create Admin
    admin = User(
        tenant_id=tenant.id, 
        email="admin@modelo.com", 
        hashed_password=pwd_context.hash("admin123"),
        full_name="Administrador Master",
        role=UserRole.ADMIN
    )
    # Create Broker
    broker = User(
        tenant_id=tenant.id, 
        email="corretor@modelo.com", 
        hashed_password=pwd_context.hash("123456"),
        full_name="Corretor Teste",
        role=UserRole.BROKER
    )
    db.add_all([admin, broker])
    db.commit()
    db.refresh(broker)

    # Base Pipeline Stages
    stages = [
        PipelineStage(tenant_id=tenant.id, name="Oportunidades", order=0, color="#E5E7EB"),
        PipelineStage(tenant_id=tenant.id, name="Em Atendimento", order=1, color="#DBEAFE"),
        PipelineStage(tenant_id=tenant.id, name="Apresentação", order=2, color="#FEF3C7"),
        PipelineStage(tenant_id=tenant.id, name="Reserva", order=3, color="#FFEDD5"),
        PipelineStage(tenant_id=tenant.id, name="Proposta", order=4, color="#E0E7FF"),
        PipelineStage(tenant_id=tenant.id, name="Contrato", order=5, color="#FCE7F3"),
        PipelineStage(tenant_id=tenant.id, name="Venda Concluída", order=6, color="#D1FAE5"),
    ]
    db.add_all(stages)
    db.commit()

    # Get the ID of the first stage (Oportunidades)
    oportunidade_stage = stages[0]

    # Create Mock Leads
    lead1 = Lead(
        tenant_id=tenant.id, broker_id=broker.id, stage_id=oportunidade_stage.id,
        full_name="João da Silva", email="joao@example.com", phone="11999999999",
        product_interest="Loteamento Reserva", temperature="quente", score=85
    )
    db.add(lead1)
    db.commit()

    print("Seeding finished successfully.")

if __name__ == "__main__":
    init_db()
