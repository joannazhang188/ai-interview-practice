import json
from database import get_db

def row_to_dict(row):
    if row is None:
        return None
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, str):
            try:
                d[k] = json.loads(v)
            except (json.JSONDecodeError, TypeError):
                pass
    return d

def rows_to_list(rows):
    return [row_to_dict(r) for r in rows]

def create_resume(filename, file_path, raw_text="", parse_status="done"):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO resumes (filename, file_path, raw_text, parse_status) VALUES (?, ?, ?, ?)",
        (filename, file_path, raw_text, parse_status)
    )
    resume_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return resume_id

def get_resumes():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resumes ORDER BY uploaded_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return rows_to_list(rows)

def get_resume(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resumes WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row)

def update_resume_parsed(id, raw_text, parsed_data, parse_status="done"):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE resumes SET raw_text=?, parsed_data=?, parse_status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        (raw_text, json.dumps(parsed_data, ensure_ascii=False), parse_status, id)
    )
    conn.commit()
    conn.close()

def delete_resume(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM resumes WHERE id = ?", (id,))
    conn.commit()
    conn.close()

def set_default_resume(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE resumes SET is_default=0")
    cursor.execute("UPDATE resumes SET is_default=1 WHERE id=?", (id,))
    conn.commit()
    conn.close()

def create_portfolio(filename, file_path, file_type, raw_text="", parse_status="done"):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO portfolios (filename, file_path, file_type, raw_text, parse_status) VALUES (?, ?, ?, ?, ?)",
        (filename, file_path, file_type, raw_text, parse_status)
    )
    pid = cursor.lastrowid
    conn.commit()
    conn.close()
    return pid

def get_portfolios():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM portfolios ORDER BY uploaded_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return rows_to_list(rows)

def get_portfolio(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM portfolios WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row)

def update_portfolio_parsed(id, raw_text, parsed_data, parse_status="done"):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE portfolios SET raw_text=?, parsed_data=?, parse_status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        (raw_text, json.dumps(parsed_data, ensure_ascii=False), parse_status, id)
    )
    conn.commit()
    conn.close()

def delete_portfolio(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM portfolios WHERE id = ?", (id,))
    conn.commit()
    conn.close()

def create_jd(company_name, job_title, raw_text, file_path=""):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO jd_documents (company_name, job_title, raw_text, file_path) VALUES (?, ?, ?, ?)",
        (company_name, job_title, raw_text, file_path)
    )
    jd_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return jd_id

def get_jds():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jd_documents ORDER BY uploaded_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return rows_to_list(rows)

def get_jd(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jd_documents WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row)

def create_match_instance(jd_document_id, resume_id, portfolio_ids, job_title, company_name):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO match_instances (jd_document_id, resume_id, portfolio_ids, job_title, company_name, status) VALUES (?, ?, ?, ?, ?, 'pending')",
        (jd_document_id, resume_id, json.dumps(portfolio_ids), job_title, company_name)
    )
    mid = cursor.lastrowid
    conn.commit()
    conn.close()
    return mid

def get_match_instances():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM match_instances ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return rows_to_list(rows)

def get_match_instance(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM match_instances WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row)

def update_match_result(id, total_score, sub_scores, analysis_cards, threshold_result, status="done"):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE match_instances SET total_score=?, sub_scores=?, analysis_cards=?, threshold_result=?, status=? WHERE id=?",
        (total_score, json.dumps(sub_scores, ensure_ascii=False), json.dumps(analysis_cards, ensure_ascii=False), threshold_result, status, id)
    )
    conn.commit()
    conn.close()

def delete_match_instance(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM match_instances WHERE id=?", (id,))
    conn.commit()
    conn.close()

def create_interview(match_instance_id, mode):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO interviews (match_instance_id, mode) VALUES (?, ?)",
        (match_instance_id, mode)
    )
    iid = cursor.lastrowid
    conn.commit()
    conn.close()
    return iid

def get_interview(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM interviews WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row)

def get_interviews():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM interviews ORDER BY started_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return rows_to_list(rows)

def update_interview_progress(id, question_index, total_questions):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE interviews SET current_question_index=?, total_questions=? WHERE id=?",
        (question_index, total_questions, id)
    )
    conn.commit()
    conn.close()

def update_interview_result(id, total_score, dimension_scores, status="finished"):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE interviews SET total_score=?, dimension_scores=?, status=?, ended_at=CURRENT_TIMESTAMP WHERE id=?",
        (total_score, json.dumps(dimension_scores, ensure_ascii=False), status, id)
    )
    conn.commit()
    conn.close()

def add_message(interview_id, role, content, question_index, score=None, feedback=None, dimensions=None):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO interview_messages (interview_id, role, content, question_index, score, feedback, dimensions) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (interview_id, role, content, question_index, score,
         json.dumps(feedback, ensure_ascii=False) if feedback else None,
         json.dumps(dimensions, ensure_ascii=False) if dimensions else None)
    )
    mid = cursor.lastrowid
    conn.commit()
    conn.close()
    return mid

def get_messages(interview_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM interview_messages WHERE interview_id=? ORDER BY created_at ASC", (interview_id,))
    rows = cursor.fetchall()
    conn.close()
    return rows_to_list(rows)

def create_ai_request(request_type, context):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO ai_requests (request_type, context) VALUES (?, ?)",
        (request_type, json.dumps(context, ensure_ascii=False))
    )
    rid = cursor.lastrowid
    conn.commit()
    conn.close()
    return rid

def get_ai_request(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ai_requests WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row)

def get_pending_ai_requests():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ai_requests WHERE status='pending' ORDER BY created_at ASC")
    rows = cursor.fetchall()
    conn.close()
    return rows_to_list(rows)

def update_ai_result(id, result, status="done"):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE ai_requests SET result=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        (json.dumps(result, ensure_ascii=False), status, id)
    )
    conn.commit()
    conn.close()
