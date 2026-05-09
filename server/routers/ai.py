from fastapi import APIRouter
from models import get_ai_request, update_ai_result, create_ai_request, get_pending_ai_requests

router = APIRouter()

@router.get("/result/{request_id}")
def get_ai_result(request_id: int):
    req = get_ai_request(request_id)
    if not req:
        return {"status": "not_found", "result": None}
    return {
        "status": req["status"],
        "result": req["result"],
        "request_type": req["request_type"],
        "created_at": req["created_at"]
    }

@router.get("/pending")
def get_pending():
    return get_pending_ai_requests()

@router.post("/request")
def create_request(request_type: str, context: dict):
    rid = create_ai_request(request_type, context)
    return {"request_id": rid, "status": "pending"}

@router.post("/result/{request_id}")
def post_result(request_id: int, result: dict, status: str = "done"):
    update_ai_result(request_id, result, status)
    return {"message": "ok"}
