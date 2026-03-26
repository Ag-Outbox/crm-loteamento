from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import math

router = APIRouter(prefix="/api/calculator", tags=["Finance Calculator"])

class SimulationRequest(BaseModel):
    total_value: float
    down_payment: float
    installments_count: int
    interest_rate: float # Mensal %
    index: Optional[str] = "INCC"

class Installment(BaseModel):
    number: int
    amount: float
    interest_portion: float
    principal_portion: float

class SimulationResponse(BaseModel):
    installments: List[Installment]
    total_interest: float
    total_payable: float

@router.post("/simulate", response_model=SimulationResponse)
def simulate_financing(req: SimulationRequest):
    remaining_balance = req.total_value - req.down_payment
    rate = req.interest_rate / 100
    
    if rate == 0:
        installment_amount = remaining_balance / req.installments_count
    else:
        # Price Table Formula: PMT = PV * [i * (1+i)^n] / [(1+i)^n - 1]
        installment_amount = remaining_balance * (rate * math.pow(1 + rate, req.installments_count)) / (math.pow(1 + rate, req.installments_count) - 1)
    
    installments = []
    total_interest = 0
    current_balance = remaining_balance
    
    for i in range(1, req.installments_count + 1):
        interest_p = current_balance * rate
        principal_p = installment_amount - interest_p
        total_interest += interest_p
        
        installments.append(Installment(
            number=i,
            amount=round(installment_amount, 2),
            interest_portion=round(interest_p, 2),
            principal_portion=round(principal_p, 2)
        ))
        current_balance -= principal_p

    return SimulationResponse(
        installments=installments,
        total_interest=round(total_interest, 2),
        total_payable=round(req.down_payment + (installment_amount * req.installments_count), 2)
    )
