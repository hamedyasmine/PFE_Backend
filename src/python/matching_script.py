# matching_script.py
import sys
import os
import json
import re
import numpy as np
from sentence_transformers import SentenceTransformer, util
from PyPDF2 import PdfReader
import docx

model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_text_from_file(file_path):
    if file_path.endswith('.pdf'):
        reader = PdfReader(file_path)
        return ' '.join([page.extract_text() or '' for page in reader.pages])
    elif file_path.endswith('.docx'):
        doc = docx.Document(file_path)
        return ' '.join([para.text for para in doc.paragraphs])
    else:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    return re.sub(r'\s+', ' ', text).strip()

def compute_similarity(cv_texts, job_description):
    texts = [job_description] + cv_texts
    embeddings = model.encode(texts, convert_to_tensor=True)
    job_embedding = embeddings[0]
    cv_embeddings = embeddings[1:]
    scores = util.cos_sim(job_embedding, cv_embeddings)[0]
    return scores.cpu().numpy()

if __name__ == '__main__':
    job_desc = clean_text(sys.argv[1])
    cv_paths = sys.argv[2:]
    cv_texts = [clean_text(extract_text_from_file(p)) for p in cv_paths]
    scores = compute_similarity(cv_texts, job_desc)
    results = [
        {"filename": os.path.basename(path), "score": round(float(score) * 100, 2)}
        for path, score in zip(cv_paths, scores)
    ]
    print(json.dumps(results))
