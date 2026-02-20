# GeneticaRx - Pharmacogenomic Risk Prediction System
Pharmacogenomic Risk Prediction System
Team: Alpha Beta (Team 16)
Members:
Anand Choubey
Rohan Kumar

🔗 Live Demo
👉 Hosted Application URL:
https://geneticarx-frontend.onrender.com/

🎥 LinkedIn Post
https://www.linkedin.com/posts/anand-choubey-979b17326_rift2026-pharmacogenomics-precisionmedicine-activity-7430413674655395841-JWs9?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFJkKa0Bh_9d7WfguLPeBQ7lceX1PjaU53E

🎥 Demo Video Demonstration: 
https://drive.google.com/file/d/16Onle8DtOZvQQ5JlRJoRUy5D1RGA6cdF/view?usp=drive_link


Hashtags used:
#RIFT2026 #Pharmacogenomics #AlinHealthcare
🏗 Architecture Overview
GeneticaRx is a deterministic pharmacogenomic interpretation system designed to convert raw VCF genomic files into structured, CPIC-aligned therapeutic insights.

High-Level Workflow
VCF Upload → Variant Parsing → Star Allele Mapping → Diplotype Engine → Phenotype Classification → Drug Risk Mapping → Clinical Explanation → Structured JSON Output

Backend Architecture
Express.js REST API
Deterministic rule-based pharmacogenomic engine
CPIC-aligned risk mapping
Confidence scoring module
Global error handling middleware
5MB VCF validation & parsing pipeline
Structured JSON schema enforcement
Frontend Architecture
Modern dashboard interface
Risk visualization (Safe / Adjust Dosage / Toxic / Ineffective / Unknown)
Structured clinical explanation module
Confidence bar visualization
Multi-drug selection support
AI Layer
LLM-assisted structured clinical explanation generation
Summary / Mechanism / Clinical Impact format
Fallback-safe generation handling

🧰 Tech Stack
Frontend
React (or specify if different)
Modern CSS / UI framework
REST API integration

Backend
Node.js
Express.js
Multer (file handling)
Custom deterministic rule engine
LLM API Integration

Deployment
Render

Environment-based configuration

⚙️ Installation Instructions
1️⃣ Clone Repository
git clone https://github.com/your-username/geneticarx.git
cd geneticarx
2️⃣ Backend Setup
cd backend
npm install

Create .env file:

PORT=5000
LLM_API_KEY=your_api_key_here

Start backend:

npm start
3️⃣ Frontend Setup
cd frontend
npm install
npm start
📡 API Documentation
POST /analyze

Analyzes uploaded VCF file for selected drugs.
Request
Content-Type: multipart/form-data
Fields:
file: VCF file (max 5MB)
drugs: array of selected drugs
Response Structure
Single Drug:
{
  "patient_id": "PATIENT_001",
  "drug": "CODEINE",
  "risk_assessment": {
    "risk_label": "Ineffective",
    "confidence_score": 0.95,
    "severity": "high"
  },
  "pharmacogenomic_profile": {
    "primary_gene": "CYP2D6",
    "diplotype": "*4/*4",
    "phenotype": "PM"
  },
  "clinical_recommendation": {
    "text": "Avoid codeine due to lack of efficacy.",
    "source": "CPIC Guidelines"
  }
}

Multi-Drug:

{
  "analysis_results": [
    { ...drug1_result },
    { ...drug2_result }
  ]
}

🧪 Usage Examples
Example 1 – Single Gene Case
Input:
CYP2D6 *4/*4
Drug:
Codeine
Output:
Ineffective
Recommendation: Avoid codeine.

Example 2 – Multi-Gene Case
Input:
CYP2C9 *3/*3
SLCO1B1 *1/*
Drugs:
Warfarin, Simvastatin
Output:
Warfarin → Toxic
Simvastatin → Adjust Dosage

🛡 Error Handling
Invalid VCF format detection
Missing INFO annotation validation
File size limit (5MB)
Structured error JSON responses
Graceful failure without server crash

📊 Features
CPIC-aligned dosing recommendations
Deterministic risk engine
Multi-drug support
Multi-gene analysis
Structured clinical explanation
Confidence scGorin
5MB VCF support
Production-ready backend

👥 Team Members
Team Alpha Beta (Team 16)
Anand Chouubry
Rohan Kumar
RIFT 2026 Submission
📜 License
For academic and hackathon evaluation purposes.
