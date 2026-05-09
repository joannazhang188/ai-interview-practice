from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from models import (
    get_resume, get_portfolio, get_jd, get_match_instances, get_match_instance,
    create_match_instance, update_match_result, delete_match_instance, create_ai_request
)

router = APIRouter()

class AnalyzeRequest(BaseModel):
    jd_document_id: Optional[int] = None
    company_name: str
    job_title: str
    job_text: str = ""
    resume_id: int
    portfolio_ids: List[int] = []

@router.get("/instances")
def list_match_instances():
    return get_match_instances()

@router.get("/instances/{instance_id}")
def get_match_instance_detail(instance_id: int):
    inst = get_match_instance(instance_id)
    if not inst:
        raise HTTPException(status_code=404, detail="分析记录不存在")
    return inst

@router.post("/analyze")
def analyze_match(req: AnalyzeRequest):
    resume = get_resume(req.resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="简历不存在")

    portfolio_texts = []
    for pid in req.portfolio_ids:
        p = get_portfolio(pid)
        if p:
            portfolio_texts.append(p.get("raw_text", ""))

    context = {
        "request_type": "match_analysis",
        "company_name": req.company_name,
        "job_title": req.job_title,
        "resume_text": resume.get("raw_text", ""),
        "resume_parsed": resume.get("parsed_data", {}),
        "jd_text": req.job_text,
        "portfolio_texts": portfolio_texts,
    }

    instance_id = create_match_instance(
        jd_document_id=req.jd_document_id,
        resume_id=req.resume_id,
        portfolio_ids=req.portfolio_ids,
        job_title=req.job_title,
        company_name=req.company_name
    )

    request_id = create_ai_request("match_analysis", context)

    return {
        "instance_id": instance_id,
        "request_id": request_id,
        "status": "pending"
    }

@router.delete("/instances/{instance_id}")
def delete_match_instance_route(instance_id: int):
    delete_match_instance(instance_id)
    return {"message": "删除成功"}

@router.put("/instances/{instance_id}/result")
def update_result(instance_id: int, total_score: int, sub_scores: dict, analysis_cards: list, threshold_result: str):
    update_match_result(instance_id, total_score, sub_scores, analysis_cards, threshold_result, "done")
    return {"message": "更新成功"}
