from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from models import (
    get_interview, get_interviews, create_interview, update_interview_progress,
    update_interview_result, add_message, get_messages, get_match_instance,
    get_resume, get_jd, create_ai_request
)

router = APIRouter()

class StartInterviewRequest(BaseModel):
    match_instance_id: Optional[int] = None
    mode: str
    company_name: str = ""
    job_title: str = ""
    resume_text: str = ""
    jd_text: str = ""

class AnswerRequest(BaseModel):
    content: str
    question_index: int

@router.get("")
def list_interviews():
    return get_interviews()

@router.get("/{interview_id}")
def get_interview_detail(interview_id: int):
    interview = get_interview(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="面试不存在")
    messages = get_messages(interview_id)
    return {**interview, "messages": messages}

@router.post("/start")
def start_interview(req: StartInterviewRequest):
    company_name = req.company_name
    job_title = req.job_title
    resume_text = req.resume_text
    jd_text = req.jd_text

    if req.match_instance_id:
        match = get_match_instance(req.match_instance_id)
        if match:
            resume = get_resume(match.get("resume_id"))
            jd = get_jd(match.get("jd_document_id")) if match.get("jd_document_id") else None
            company_name = match.get("company_name") or req.company_name
            job_title = match.get("job_title") or req.job_title
            resume_text = resume.get("raw_text", "") if resume else ""
            jd_text = jd.get("raw_text", "") if jd else ""

    interview_id = create_interview(req.match_instance_id, req.mode)

    context = {
        "request_type": "interview_question",
        "interview_id": interview_id,
        "mode": req.mode,
        "company_name": company_name,
        "job_title": job_title,
        "resume_text": resume_text,
        "jd_text": jd_text,
        "question_index": 0,
        "conversation": []
    }

    request_id = create_ai_request("interview_question", context)

    return {
        "interview_id": interview_id,
        "request_id": request_id,
        "status": "pending"
    }

@router.post("/{interview_id}/answer")
def submit_answer(interview_id: int, req: AnswerRequest):
    interview = get_interview(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="面试不存在")

    add_message(interview_id, "user", req.content, req.question_index)

    messages = get_messages(interview_id)
    ai_messages = [m for m in messages if m["role"] == "ai"]
    conversation = [{"role": m["role"], "content": m["content"]} for m in ai_messages]

    request_type = "interview_answer" if interview["mode"] == "train" else "sim_answer"
    context = {
        "request_type": request_type,
        "interview_id": interview_id,
        "mode": interview["mode"],
        "user_answer": req.content,
        "question_index": req.question_index,
        "conversation": conversation,
        "company_name": "",
        "job_title": "",
        "resume_text": "",
        "jd_text": ""
    }

    request_id = create_ai_request(request_type, context)
    update_interview_progress(interview_id, req.question_index + 1, req.question_index + 1)

    return {"request_id": request_id, "status": "pending"}

@router.post("/{interview_id}/reverse-question")
def submit_reverse_question(interview_id: int, content: str):
    interview = get_interview(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="面试不存在")

    add_message(interview_id, "user", content, 99)

    messages = get_messages(interview_id)
    conversation = [{"role": m["role"], "content": m["content"]} for m in messages]

    context = {
        "request_type": "reverse_question",
        "interview_id": interview_id,
        "user_question": content,
        "conversation": conversation
    }

    request_id = create_ai_request("reverse_question", context)
    return {"request_id": request_id, "status": "pending"}

@router.post("/{interview_id}/finish")
def finish_interview(interview_id: int):
    interview = get_interview(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="面试不存在")

    messages = get_messages(interview_id)
    conversation = [{"role": m["role"], "content": m["content"]} for m in messages]

    context = {
        "request_type": "interview_report",
        "interview_id": interview_id,
        "mode": interview["mode"],
        "conversation": conversation
    }

    request_id = create_ai_request("interview_report", context)
    return {"request_id": request_id, "status": "pending"}

@router.get("/{interview_id}/messages")
def get_interview_messages(interview_id: int):
    return get_messages(interview_id)
