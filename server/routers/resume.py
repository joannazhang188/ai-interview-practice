import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from models import (
    get_resumes, get_resume, create_resume, delete_resume,
    update_resume_parsed, set_default_resume
)
from services.file_parser import extract_text, parse_resume

router = APIRouter()
UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg"}

@router.get("")
def list_resumes():
    return get_resumes()

@router.get("/{resume_id}")
def get_resume_detail(resume_id: int):
    resume = get_resume(resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="简历不存在")
    return resume

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"不支持的文件格式: {ALLOWED_EXTENSIONS}")

    resume_id = create_resume(file.filename, "", "pending")
    safe_name = f"resume_{resume_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    raw_text = extract_text(file_path)
    parsed_data = parse_resume(raw_text)
    update_resume_parsed(resume_id, raw_text, parsed_data)

    return {"id": resume_id, "filename": file.filename, "parse_status": "done", "raw_text": raw_text[:500]}

@router.delete("/{resume_id}")
def delete_resume_route(resume_id: int):
    resume = get_resume(resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="简历不存在")
    if resume.get("file_path") and os.path.exists(resume["file_path"]):
        os.remove(resume["file_path"])
    delete_resume(resume_id)
    return {"message": "删除成功"}

@router.put("/{resume_id}/default")
def set_default_route(resume_id: int):
    resume = get_resume(resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="简历不存在")
    set_default_resume(resume_id)
    return {"message": "已设为默认简历"}
