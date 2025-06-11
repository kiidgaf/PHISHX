from app import db


class URLDatabase(db.Model):
   __tablename__ = 'url_database'


   id = db.Column(db.Integer, primary_key=True)
   url = db.Column(db.String(500), unique=True, nullable=False)
   is_phishing = db.Column(db.Boolean, nullable=False)
   source = db.Column(db.String(100), nullable=True)  # Optional