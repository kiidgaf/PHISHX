from flask import Blueprint, request, jsonify
from flask_mail import Message
from app import db, bcrypt, mail
from app.models.user import User
from flask_jwt_extended import create_access_token
from datetime import datetime

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    required = ["first_name", "last_name", "phone", "country", "email", "password", "confirm_password"]
    if not all(data.get(k) for k in required):
        return jsonify({"error": "All fields are required"}), 400

    if data["password"] != data["confirm_password"]:
        return jsonify({"error": "Passwords do not match"}), 400

    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 400

    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        phone=data["phone"],
        country=data["country"],
        email=data["email"],
        password=hashed_pw,
        )
    db.session.add(user)
    db.session.commit()

    # Send confirmation email
    # verification_url = f"http://localhost:3000/verify-email/{user.verification_token}"
    msg = Message(subject="Welcome to PhishX!",
                #   sender="no-reply@phishx.com",
                  recipients=[user.email],
                  body=f"Hello {first_name} {last_name},\n\nYour PhishX account has been successfully created.\nYou can now log in and start using the platform.\n\nRegards,\nPhishX Team")

    mail.send(msg)

    return jsonify({"message": "Registration successful!"}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({"token": access_token, "user": {"username": user.username, "role": user.role}})
    return jsonify({"error": "Invalid credentials"}), 401

    

