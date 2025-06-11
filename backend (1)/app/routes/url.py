from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.url_record import URLRecord
from app.models.url_database import URLDatabase  # added
from app.utils.ml_classifier import classify_url
from app.models.feedback import FeedbackReport


bp = Blueprint('url', __name__, url_prefix='/url')


#  Submit URL for scanning
@bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_url():
   data = request.get_json()
   url = data.get('url')


   if not url or not url.startswith(('http://', 'https://')):
       return jsonify({"error": "Invalid URL format"}), 400


   user_id = get_jwt_identity()


   # Check if URL already verified by admin in url_database
   existing = URLDatabase.query.filter_by(url=url).first()
   if existing:
       classification = "Phishing" if existing.is_phishing else "Safe"
       risk_score = 90 if existing.is_phishing else 10
   else:
       #  Run ML model if not found
       classification, risk_score = classify_url(url)


   # Save to scan history
   record = URLRecord(user_id=user_id, url=url, classification=classification, risk_score=risk_score)
   db.session.add(record)
   db.session.commit()


   return jsonify({
       "url": url,
       "classification": classification,
       "risk_score": risk_score
   }), 200


# Get user’s scan history
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


#  Submit a report about wrong classification
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
