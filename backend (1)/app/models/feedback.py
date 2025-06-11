from app import db
from datetime import datetime

class FeedbackReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500), nullable=False)
    classification = db.Column(db.String(50), nullable=False)  # False Positive or Phishing
    comment = db.Column(db.String(500))
    reviewed_by = db.Column(db.String(50))
    status = db.Column(db.String(50), default="Under Review")  # Under Review, Approved, Rejected
    final_decision = db.Column(db.String(50))  # Whitelisted / Blacklisted
    reported_on = db.Column(db.DateTime, default=datetime.utcnow)
