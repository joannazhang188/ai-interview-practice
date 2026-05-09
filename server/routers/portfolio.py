import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from models import (
    get_portfolios, get_portfolio, create_portfolio,
    delete_portfolio, update_portfolio_parsed
)
from services.file_parser import extract_text, parse_portfolio

router = APIRouter()
UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg", ".xls", ".xlsx", ".ppt", ".pptx"}

def get_file_type(filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    mapping = {
        ".pdf": "pdf", ".docx": "doc", ".doc": "doc",
        ".png": "pic", ".jpg": "pic", ".jpeg": "pic",
        ".xls": "xls", ".xlsx": "xls",
        ".ppt": "ppt", ".pptx": "ppt",
        ".psd": "ps", ".ai": "ps"
    }
    return mapping.get(ext, "doc")

@router.get("")
def list_portfolios():
    return get_portfolios()

@router.get("/{portfolio_id}")
def get_portfolio_detail(portfolio_id: int):
    portfolio = get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="作品不存在")
    return portfolio

@router.post("/upload")
async def upload_portfolio(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="不支持的文件格式")

    portfolio_id = create_portfolio(file.filename, "", get_file_type(file.filename), "pending")
    safe_name = f"portfolio_{portfolio_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    raw_text = extract_text(file_path)
    parsed_data = parse_portfolio(raw_text)
    update_portfolio_parsed(portfolio_id, raw_text, parsed_data)

    return {"id": portfolio_id, "filename": file.filename, "parse_status": "done"}

@router.delete("/{portfolio_id}")
def delete_portfolio_route(portfolio_id: int):
    portfolio = get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="作品不存在")
    if portfolio.get("file_path") and os.path.exists(portfolio["file_path"]):
        os.remove(portfolio["file_path"])
    delete_portfolio(portfolio_id)
    return {"message": "删除成功"}
