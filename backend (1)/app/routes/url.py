from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.url_record import URLRecord
from app.utils.ml_classifier import classify_url
from app.models.feedback import FeedbackReport 
import re

bp = Blueprint('url', __name__, url_prefix='/url')

@bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_url():
    data = request.get_json()
    url = data.get('url')

    if not url or not url.startswith(('http://', 'https://')):
        return jsonify({"error": "Invalid URL format"}), 400

    user_id = get_jwt_identity()

    # Classify the URL (mock or real ML model)
    classification, risk_score = classify_url(url)

    # Save the result in DB
    record = URLRecord(user_id=user_id, url=url, classification=classification, risk_score=risk_score)
    db.session.add(record)
    db.session.commit()

    return jsonify({
        "url": url,
        "classification": classification,
        "risk_score": risk_score
    }), 200

@bp.route('/history', methods=['GET'])
@jwt_required()
def scan_history():
    user_id = get_jwt_identity()
    records = URLRecord.query.filter_by(user_id=user_id).order_by(URLRecord.scanned_on.desc()).all()

    history = [{
        "url": r.url,
        "classification": r.classification,
        "risk_score": r.risk_score,
        "scanned_on": r.scanned_on.strftime("%Y-%m-%d %H:%M:%S")
    } for r in records]

    return jsonify({"history": history}), 200

@bp.route('/report', methods=['POST'])
@jwt_required()
def report_url():
    user_id = get_jwt_identity()
    data = request.get_json()

    url = data.get("url")
    classification = data.get("classification")  # "False Positive" or "Phishing"
    comment = data.get("comment", "")

    if not url or classification not in ["False Positive", "Phishing"]:
        return jsonify({"error": "Invalid input"}), 400

    report = FeedbackReport(
        url=url,
        classification=classification,
        comment=comment,
        status="Under Review",
    )

    db.session.add(report)
    db.session.commit()

    return jsonify({"message": "Report submitted successfully"}), 201

def extract_urls_from_text(text):
    # Basic regex for URLs
    url_pattern = r'(https?://[^\s]+)'
    return re.findall(url_pattern, text)

@bp.route('/email/scan', methods=['POST'])
@jwt_required()
def scan_email():
    data = request.get_json()
    email_content = data.get('email_content')

    if not email_content:
        return jsonify({"error": "Email content is required"}), 400

    urls = extract_urls_from_text(email_content)
    results = []

    for url in urls:
        classification, risk_score = classify_url(url)
        results.append({
            "url": url,
            "classification": classification,
            "risk_score": risk_score
        })

    return jsonify({
        "extracted_urls": urls,
        "scan_results": results,
        "summary": {
            "phishing": sum(1 for r in results if r['classification'] == 'Phishing'),
            "suspicious": sum(1 for r in results if r['classification'] == 'Suspicious'),
            "safe": sum(1 for r in results if r['classification'] == 'Safe'),
        }
    }), 200