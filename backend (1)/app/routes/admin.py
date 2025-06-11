from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.feedback import FeedbackReport
from app.models.user import User
from app.models.url_record import URLRecord
from app.models.url_database import URLDatabase




bp = Blueprint('admin', __name__, url_prefix='/admin')


def is_admin(user_id):
   user = User.query.get(user_id)
   return user and user.role == 'admin'


@bp.route('/feedback', methods=['GET'])
@jwt_required()
def get_feedback():
   user_id = get_jwt_identity()
   if not is_admin(user_id):
       return jsonify({"error": "Unauthorized"}), 403


   reports = FeedbackReport.query.order_by(FeedbackReport.reported_on.desc()).all()
   data = [{
       "id": r.id,
       "url": r.url,
       "classification": r.classification,
       "comment": r.comment,
       "status": r.status,
       "final_decision": r.final_decision,
       "reported_on": r.reported_on.strftime("%Y-%m-%d %H:%M:%S")
   } for r in reports]


   return jsonify(data), 200


@bp.route('/verify-url', methods=['POST'])
@jwt_required()
def verify_url():
   user_id = get_jwt_identity()
   if not is_admin(user_id):
       return jsonify({"error": "Unauthorized"}), 403


   data = request.get_json()
   report_id = data.get("report_id")
   decision = data.get("final_decision")  # Whitelisted or Blacklisted


   report = FeedbackReport.query.get(report_id)
   if not report:
       return jsonify({"error": "Report not found"}), 404


   report.status = "Approved"
   report.final_decision = decision
   report.reviewed_by = f"Admin {user_id}"


   url_record = URLRecord.query.filter_by(url=report.url).first()
   if url_record:
       if decision == "Whitelisted":
           url_record.classification = "Safe"
           url_record.risk_score = min(url_record.risk_score, 30)
       elif decision == "Blacklisted":
           url_record.classification = "Phishing"
           url_record.risk_score = max(url_record.risk_score, 90)
               # Update url_database with admin decision
   is_phishing = True if decision == "Blacklisted" else False


   entry = URLDatabase.query.filter_by(url=report.url).first()
   if entry:
       entry.is_phishing = is_phishing
       entry.source = "admin"
   else:
       new_entry = URLDatabase(url=report.url, is_phishing=is_phishing, source="admin")
       db.session.add(new_entry)




   db.session.commit()


   return jsonify({"message": f"Report updated and URL {decision.lower()}ed."}), 200