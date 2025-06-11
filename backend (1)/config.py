import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "postgresql://etamrakar:admin@localhost/phishing_tool")
    

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask-Mail configuration
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "true").lower() in ['true', '1', 't']
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")  # your email username
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")  # your email password
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER")  
