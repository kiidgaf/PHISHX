from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from flask_mail import Mail

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    mail.init_app(app)
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    # CORS(app)  
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)


    from app.routes import auth, url, admin
    app.register_blueprint(auth.bp)
    app.register_blueprint(url.bp)
    app.register_blueprint(admin.bp)

    return app
