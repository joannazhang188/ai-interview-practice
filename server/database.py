import sqlite3
import json

DATABASE_URL = "interview.db"

def get_db():
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            version TEXT DEFAULT 'v1.0',
            is_default INTEGER DEFAULT 0,
            raw_text TEXT,
            parsed_data TEXT,
            parse_status TEXT DEFAULT 'pending',
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS portfolios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_type TEXT,
            raw_text TEXT,
            parsed_data TEXT,
            parse_status TEXT DEFAULT 'pending',
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jd_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name TEXT,
            job_title TEXT NOT NULL,
            raw_text TEXT,
            file_path TEXT,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS match_instances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jd_document_id INTEGER,
            resume_id INTEGER,
            portfolio_ids TEXT,
            job_title TEXT,
            company_name TEXT,
            total_score INTEGER,
            sub_scores TEXT,
            analysis_cards TEXT,
            threshold_result TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS interviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_instance_id INTEGER,
            mode TEXT NOT NULL,
            round_status TEXT DEFAULT 'hr',
            current_question_index INTEGER DEFAULT 0,
            total_questions INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            total_score INTEGER,
            dimension_scores TEXT,
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            ended_at DATETIME
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS interview_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            interview_id INTEGER,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            question_index INTEGER,
            score INTEGER,
            feedback TEXT,
            dimensions TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_type TEXT NOT NULL,
            context TEXT NOT NULL,
            result TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()
