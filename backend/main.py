from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import leads, units, sales, integrations, reports, calculator, auth, users, proposals, maps, stand

app = FastAPI(title="CRM Loteamento API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(proposals.router)
app.include_router(leads.router)
app.include_router(units.router)
app.include_router(sales.router)
app.include_router(integrations.router)
app.include_router(reports.router)
app.include_router(calculator.router)
app.include_router(stand.router)
app.include_router(maps.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "CRM Loteamento API rodando perfeitamente."}

