from app import db
from datetime import datetime

class URLRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    url = db.Column(db.String(500), nullable=False)
    classification = db.Column(db.String(20), nullable=False)  # Safe, Suspicious, Phishing
    risk_score = db.Column(db.Integer, nullable=False)
    scanned_on = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<URL {self.url} - {self.classification}>"
