import pickle
import os
import re
import socket
from urllib.parse import urlparse
import ssl
from datetime import datetime
from bs4 import BeautifulSoup
import whois
import requests


# Load model once
MODEL_PATH = os.path.join(os.path.dirname(__file__), "phishing_model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

def extract_features(url):
    features = []
    domain = urlparse(url).netloc
    
    def having_ip_address():
        try:
            socket.inet_aton(domain)
            return -1
        except:
            return 1

    def url_length(url):
        if len(url) < 54:
            return 1
        elif 54 <= len(url) <= 75:
            return 0
        else:
            return -1
        
    def shortening_service(url):
        shorteners = r"bit\.ly|goo\.gl|tinyurl|ow\.ly|t\.co|bitly\.com|is\.gd|buff\.ly|adf\.ly"
        return -1 if re.search(shorteners, url) else 1

    def having_at_symbol(url):
        return -1 if "@" in url else 1
    
    def double_slash_redirecting(url):
        return -1 if url.count("//") > 7 else 1

    def prefix_suffix(domain):
        return -1 if "-" in domain else 1

    def having_sub_domain(domain):
        dots = domain.split(".")
        if len(dots) < 3:
            return 1
        elif len(dots) == 3:
            return 0
        else:
            return -1

    def ssl_final_state(url):
        # Extract SSL certificate info
        ssl_info = get_ssl_certificate_info(url)
        
        if ssl_info:
            # Check if the certificate is from a trusted issuer and is older than 2 years
            if ssl_info['issuer_status'] == "Untrusted" or ssl_info['certificate_age_status'] == "Too New":
                return -1
            else:
                return 1
        else:
            return -1 

    def domain_registration_length():
        return -1  # placeholder — needs WHOIS (skip for now)

    def favicon(url):
        return -1  # placeholder

    def port(url):
        return -1  # placeholder

    def https_token(url):
        return -1 if "https" in domain else 1

    def request_url():
        return 0 # placeholder

    def url_of_anchor():
        return 0  # placeholder

    def links_in_tags():
        return 0  # placeholder

    def sfh():
        return 0  # placeholder

    def submitting_to_email():
        return 0  # placeholder

    def abnormal_url():
        return 0  # placeholder

    def redirect(response):
        if response == "":
            return -1
        else:
            if len(response.history) <= 1:
                return 1
            elif 2 <= len(response.history) < 4:
                return 0
            else:
                return -1

    def on_mouseover(response):
        if response == "" :
            return -1
        else:
            if re.findall("", response.text):
                return -1
            else:
                return 1

    def right_click(response):
        if response == "":
            return -1
        else:
            if re.findall(r"event.button ?== ?2", response.text):
                return 1
            else:
                return -1

    def popupwindow():
        return 0  # placeholder

    def iframe(response):
        if response == "":
            return -1
        else:
            if re.findall(r"[|]", response.text):
                return 1
            else:
                return -1

    def age_of_domain(domain):
        creation_date = domain.creation_date
        expiration_date = domain.expiration_date
        if (isinstance(creation_date,str) or isinstance(expiration_date,str)):
            try:
                creation_date = datetime.strptime(creation_date,'%Y-%m-%d')
                expiration_date = datetime.strptime(expiration_date,"%Y-%m-%d")
            except:
                return 1
            if ((expiration_date is None) or (creation_date is None)):
                return 1
            elif ((type(expiration_date) is list) or (type(creation_date) is list)):
                return 1
            else:
                ageofdomain = abs((expiration_date - creation_date).days)
                if ((ageofdomain/30) < 6):
                    age = -1
                else:
                    age = 1
            return age

    # def dnsrecord():
    #     dns = 1
    #     try:
    #         domain_name = whois.whois(urlparse(url).netloc)
    #     except:
    #         dns = -1

    def web_traffic(url):
        return -1

    def page_rank():
        return -1  # placeholder

    def google_index():
        return 1  # assume indexed

    def links_pointing_to_page():
        return 0  # placeholder

    def statistical_report():
        return -1  # placeholder


    # List of trusted Certificate Authorities (CAs)
    trusted_cas = [
        "GeoTrust", "GoDaddy", "Network Solutions", "Thawte", "Comodo", "Doster", "VeriSign"
    ]

    def get_ssl_certificate_info(url):
        try:
            # Parse the URL and extract the hostname
            hostname = url.split("//")[1].split("/")[0]
            
            # Create an SSL context to get the certificate information
            context = ssl.create_default_context()
            connection = context.wrap_socket(socket.socket(socket.AF_INET), server_hostname=hostname)
            
            # Connect to the server
            connection.connect((hostname, 443))
            
            # Get the certificate in PEM format
            cert = connection.getpeercert()
            connection.close()
            
            # Extract certificate details
            issuer = cert['issuer']
            issuer_name = issuer[0][0]  # e.g., 'GeoTrust' or 'GoDaddy'
            not_before = cert['notBefore']  # Start date of the certificate
            not_after = cert['notAfter']  # Expiry date of the certificate

            # Convert dates to datetime objects
            not_before_date = datetime.strptime(not_before, "%Y%m%d%H%M%SZ")
            not_after_date = datetime.strptime(not_after, "%Y%m%d%H%M%SZ")

            # Check if the issuer is in the trusted list
            if any(ca in issuer_name for ca in trusted_cas):
                issuer_status = "Trusted"
            else:
                issuer_status = "Untrusted"
            
            # Calculate the certificate age (in years)
            certificate_age = (datetime.utcnow() - not_before_date).days / 365.25  # Age in years
            
            # Determine if the certificate is too new (less than 2 years old)
            certificate_age_status = "Valid" if certificate_age >= 2 else "Too New"

            return {
                "issuer": issuer_name,
                "issuer_status": issuer_status,
                "certificate_age": certificate_age,
                "certificate_age_status": certificate_age_status
            }
        
        except Exception as e:
            print(f"Error in fetching certificate for {url}: {str(e)}")
            return None  # If something goes wrong, return None

    dns = 1
    try:
        domain_name = whois.whois(urlparse(url).netloc)
    except:
        dns = -1

    try:
        response = requests.get(url)
    except:
        response = ""

    # Now assemble all features in order
    features = [
        having_ip_address(),
        url_length(url),
        shortening_service(url),
        having_at_symbol(url),
        double_slash_redirecting(url),
        prefix_suffix(domain),
        having_sub_domain(domain),
        ssl_final_state(url),
        domain_registration_length(),
        favicon(url),
        port(url),
        https_token(url),
        request_url(),
        url_of_anchor(),
        links_in_tags(),
        sfh(),
        submitting_to_email(),
        abnormal_url(),
        redirect(response),
        on_mouseover(response),
        right_click(response),
        popupwindow(),
        iframe(response),
        age_of_domain(domain_name),
        dns,
        web_traffic(url),
        page_rank(),
        google_index(),
        links_pointing_to_page(),
        statistical_report()
    ]

    return features

def classify_url(url):
    features = [extract_features(url)]
    prediction = model.predict(features)[0]
    prob = model.predict_proba(features)[0]

    if prediction == -1:
        classification = "Phishing"
        confidence = prob[0] 
          
    else:
        classification = "Safe"
        confidence = prob[1] 
        if  confidence > 0.2:
            classification = "Suspicious"
    
    risk_score = int(confidence * 100)  

    # Fallback: confidence is too low → check GSB
    if 40 <= risk_score <= 60:
        print("Low confidence. Checking with Google Safe Browsing...")
        flagged = check_google_safebrowsing(url)
        if flagged:
            classification = "Phishing"
            risk_score = 95

    return classification, risk_score

def check_google_safebrowsing(url):
    api_key = os.getenv("GOOGLE_SAFEBROWSING_KEY")
    if not api_key:
        return None

    gsb_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={api_key}"

    payload = {
        "client": {
            "clientId": "phishx",
            "clientVersion": "1.0"
        },
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }

    response = requests.post(gsb_url, json=payload)
    if response.status_code == 200:
        result = response.json()
        print(result)
        return result.get("matches") is not None
    return None   