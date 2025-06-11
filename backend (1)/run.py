from app import create_app, db, bcrypt
from app.models.user import User


app = create_app()

with app.app_context():
    db.create_all()

    # Check if admin already exists
    existing_admin = User.query.filter_by(email="admin@example.com").first()

    if not existing_admin:
        hashed_pw = bcrypt.generate_password_hash("admin123").decode("utf-8")

        admin_user = User(
            first_name="Admin",
            last_name="User",
            phone="0000000000",
            country="Global",
            email="admin@example.com",
            password=hashed_pw,
            role="admin"
        )
        db.session.add(admin_user)
        db.session.commit()

if __name__ == "__main__":
    app.run(debug=True)
