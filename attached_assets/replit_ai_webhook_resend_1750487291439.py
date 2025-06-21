
import requests
import json
import os

# CONFIGURATION SECTION
RESEND_API_KEY = os.getenv("RESEND_API_KEY")  # Set this in Replit secrets
TO_EMAIL = "recipient@example.com"            # Replace with actual recipient
FROM_EMAIL = "no-reply@yourdomain.com"        # Replace with verified sender on Resend
REPORT_PATH = "diagnostic_report.txt"         # This should be created before sending

# FUNCTION: Load Report Content
def load_report():
    try:
        with open(REPORT_PATH, 'r') as file:
            return file.read()
    except FileNotFoundError:
        return "⚠️ Report file not found."

# FUNCTION: Send Report via Resend
def send_email_report():
    report_content = load_report()
    payload = {
        "from": FROM_EMAIL,
        "to": TO_EMAIL,
        "subject": "ACHIEVEMOR Logistics Platform – AI Diagnostic Report",
        "text": report_content
    }
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    response = requests.post("https://api.resend.com/emails", headers=headers, data=json.dumps(payload))
    if response.status_code == 200:
        print("✅ Report sent successfully.")
    else:
        print(f"❌ Failed to send report: {response.status_code} - {response.text}")

# MAIN EXECUTION
if __name__ == "__main__":
    send_email_report()
