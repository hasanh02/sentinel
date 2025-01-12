import os
from flask import Flask, jsonify, request, send_file
from dotenv import load_dotenv
import openai
from fpdf import FPDF
from flask_cors import CORS
# Load environment variables from .env
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load OpenAI API Key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# Optional: Create a custom PDF class to style headers/footers if desired
class SentinelPDF(FPDF):
    def header(self):
        # Set font for the header (Times, bold, size 16)
        self.set_font("Times", "B", 16)
        # Add a "Sentinel Security" title centered at the top
        self.cell(0, 10, "Sentinel Security Solutions", ln=True, align="C")
        # Slight space below
        self.ln(5)
        
    def footer(self):
        # Position footer at 1.5 cm from bottom
        self.set_y(-15)
        # Set font for the footer (Times, "I", size 10)
        self.set_font("Times", "I", 10)
        # Add a page number
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

@app.route('/')
def home():
    return "Backend is running!"

@app.route('/generate-report', methods=['POST'])
def generate_report():
    try:
        # 1. Get input data from the request body (JSON)
        data = request.get_json(force=True)

        # 2. Extract fields from the JSON
        windows = data.get('windows', 0)
        doors = data.get('doors', 0)
        entries = data.get('entries', 0)
        city = data.get('city', "Unknown City")

        # 3. Construct an in-depth GPT prompt
        prompt = f"""
You are a world-class home security specialist. You will analyze the following property:
- City: {city}
- Number of windows: {windows}
- Number of doors: {doors}
- Number of total entry points: {entries}

Act as a professional security consultant, providing an extremely detailed and thorough report. 
You should use bullet points for major items or recommendations, 
BUT also include an in-depth paragraph under each bullet point to give a deep analysis. 

Cover at least the following sections:

1) Introduction and Overview:
   - Give a concise intro of the situation and the importance of home security.
   - Then provide a detailed paragraph that explains any relevant context about the city, 
     the typical security challenges, and why a customized security plan is essential.

2) Threat Level Assessment (Scale 1-10):
   - Provide the numeric threat level for {city} with bullet points for key factors influencing the score.
   - Then follow with a detailed paragraph explaining those factors in depth.

3) Vulnerabilities:
   - Provide bullet points identifying each vulnerability.
   - For each bullet point, follow with a thorough paragraph explaining exactly why this is a concern 
     and how intruders might exploit it.

4) Financial Situation Assumptions:
   - Use bullet points to outline your assumptions about the homeowner’s budget.
   - Then a detailed paragraph explaining how these assumptions affect your security recommendations.

5) Detailed Security Solutions:
   - Provide bullet points naming specific measures (reinforced windows, cameras, etc.), 
     approximate costs, and potential vendors.
   - Include a deeper paragraph after each bullet, explaining how it integrates with other solutions.

6) Comprehensive Security Plan:
   - Summarize all recommendations in bullet form, 
     then add a unifying paragraph describing how each measure works together for robust security.

7) Conclusion:
   - Give a final bullet point recap of the most critical actions.
   - Add a concluding paragraph emphasizing the importance of professional installation, 
     routine maintenance, and future upgrades.

Ensure the final report is very professional, organized, and logically structured, with no stray asterisks.
"""

        # 4. Call the OpenAI ChatCompletion API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a top-tier security consultant. "
                        "Always respond with a formal, coherent structure, "
                        "using bullet points for major items and thorough paragraphs underneath for deeper analysis. "
                        "Avoid asterisks or markdown formatting for bolding."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        # 5. Extract GPT output
        gpt_output = response['choices'][0]['message']['content'].strip()
        gpt_output = gpt_output.replace("*", "")  # remove any stray asterisks

        # 6. Create a custom PDF (from SentinelPDF class) for nice headers/footers
        pdf = SentinelPDF('P', 'mm', 'Letter')
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()

        # Set default font to Times New Roman, size 12
        pdf.set_font("Times", size=12)
        pdf.set_text_color(50, 50, 50)

        # Document Title (below the custom header)
        pdf.set_font("Times", "B", 16)
        pdf.cell(0, 10, "Comprehensive Home Security Report", ln=True, align="C")
        pdf.ln(5)

        # Subheading: Property Details
        pdf.set_font("Times", "B", 14)
        pdf.cell(0, 10, "Property Details:", ln=True)
        pdf.set_font("Times", size=12)

        # Show user inputs (aligned left)
        pdf.cell(0, 8, f"City: {city}", ln=True)
        pdf.cell(0, 8, f"Number of Windows: {windows}", ln=True)
        pdf.cell(0, 8, f"Number of Doors: {doors}", ln=True)
        pdf.cell(0, 8, f"Number of Total Entry Points: {entries}", ln=True)
        pdf.ln(5)

        # Main GPT content
        pdf.multi_cell(0, 8, gpt_output)

        # 7. Save PDF to a temporary file
        pdf_path = "security_report.pdf"
        pdf.output(pdf_path)

        # 8. Return the PDF for download
        return send_file(pdf_path, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e), "message": "Failed to generate the report."}), 500

if __name__ == "__main__":
    app.run(debug=True)