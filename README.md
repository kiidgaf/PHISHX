# PhishX

PhishX is a phishing detection system designed to identify malicious URLs in real time. Built using a Flask backend and a JavaScript-based frontend, the tool leverages machine learning, WHOIS data, SSL verification, and DNS resolution to determine whether a URL is safe, suspicious, or phishing.

This project was developed as part of the NIT3004 Capstone Unit at Victoria University by Group 2.

---

## Project Members – Group 2 (NIT3004)

- Kipa Shakya 
- Eliza Tamrakar 
- Palak Rani
- Enu Rai 
---

## Features

- User authentication (login and registration)
- URL scanning with classification (Safe / Suspicious / Phishing)
- Machine learning model for classification (scikit-learn)
- WHOIS domain age check
- SSL certificate validation
- DNS resolution handling
- Admin panel for managing and reclassifying results
- Exporting scan results as CSV and PDF

---

## Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Backend      | Flask, Python, psycopg2        |
| Frontend     | HTML, CSS, JavaScript          |
| Machine Learning | scikit-learn (custom model) |
| Database     | PostgreSQL                     |
| APIs Used    | WHOIS, SSL, DNS                |

---

## Folder Structure

NEWPHISHXX/
├── backend/ # Flask backend application
│ ├── app/ # Core Flask logic and ML integration
│ ├── instance/ # Configuration files
│ ├── config.py # App configuration
│ ├── run.py # Entry point
│ └── requirements.txt
├── frontend/ # Static files (HTML, JS, CSS)


---

## Setup Instructions

1. Clone the repository:
git clone https://github.com/kiidgaf/PHISHX.git
cd PHISHX/backend


2. Create and activate a virtual environment:
python3 -m venv venv
source venv/bin/activate


3. Install the required dependencies:
pip install -r requirements.txt


4. Run the Flask application:
python run.py


5. To access the frontend, open the `frontend/index.html` file in a browser.

---

## License

This project is for academic purposes only and is not intended for commercial or production use. All rights reserved to Group 2, Victoria University – NIT3004, 2025.


