import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from models import create_jd, get_jds, get_jd
from services.file_parser import extract_text

router = APIRouter()
UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg"}

@router.get("")
def list_jds():
    return get_jds()

@router.get("/{jd_id}")
def get_jd_detail(jd_id: int):
    jd = get_jd(jd_id)
    if not jd:
        raise HTTPException(status_code=404, detail="JD不存在")
    return jd

@router.post("/upload")
async def upload_jd(
    company_name: Optional[str] = Form(""),
    job_title: str = Form(...),
    job_text: str = Form(""),
    file: Optional[UploadFile] = File(None)
):
    raw_text = job_text
    file_path = ""

    if file:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="不支持的文件格式")
        safe_name = f"jd_{job_title}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, safe_name)
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        raw_text = extract_text(file_path) + "\n" + job_text
    elif not job_text:
        raise HTTPException(status_code=400, detail="请上传 JD 文件或填写岗位说明")

    jd_id = create_jd(company_name, job_title, raw_text.strip(), file_path)
    return {"id": jd_id, "company_name": company_name, "job_title": job_title, "status": "done"}
