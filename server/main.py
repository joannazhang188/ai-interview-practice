from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from database import init_db
from routers import resume, portfolio, jd, match, interview, ai

app = FastAPI(title="AI 面试陪练 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()
    os.makedirs("uploads", exist_ok=True)

@app.get("/")
def root():
    return {"message": "AI 面试陪练 API", "version": "1.0.0"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

app.include_router(resume.router, prefix="/api/resumes", tags=["简历"])
app.include_router(portfolio.router, prefix="/api/portfolios", tags=["作品"])
app.include_router(jd.router, prefix="/api/jd", tags=["JD"])
app.include_router(match.router, prefix="/api/match", tags=["匹配度分析"])
app.include_router(interview.router, prefix="/api/interview", tags=["面试"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI分析"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
