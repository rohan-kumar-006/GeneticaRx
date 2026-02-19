# GeneticaRx - Pharmacogenomic Risk Prediction System

**RIFT 2026 Hackathon - Pharmacogenomics / Explainable AI Track**

GeneticaRx interprets patient genetic data (VCF files) to predict personalized drug risks and generate clinically actionable recommendations with AI explanations.

## 🚀 Key Features

*   **VCF Parsing**: Extracts variants for **CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, DPYD**.
*   **Pharmacogenomic Logic**: strict diplotype construction and phenotype prediction.
*   **Risk Assessment**: Maps phenotypes to drug risks (Safe, Adjust Dosage, Toxic, Ineffective).
*   **CPIC Guidelines**: Integrated clinical recommendations.
*   **Explainable AI**: LLM-generated summaries of biological mechanisms (with failsafe).
*   **Strict Validation**: JSON schema enforcement and risk-CPIC alignment checks.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS
*   **Backend**: Node.js, Express.js
*   **AI**: OpenAI API (gpt-3.5-turbo)

## 📦 Installation & Setup

### Prerequisites

*   Node.js (v18+)
*   npm

### 1. clone Repository

```bash
git clone <repository-url>
cd pharmaguard
```

### 2. Backend Setup

```bash
cd backend
npm install
```

**Environment Variables**:
Create `.env` in `backend/`:
```env
PORT=5000
OPENAI_API_KEY=your_openai_key_here
```
*(Note: If no API key is provided, the system runs in failsafe mode)*

**Start Server**:
```bash
npm start
# Runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 4. Verification

To run the automated backend pipeline test:

```bash
cd backend
node test_pipeline.js
```

## 🧪 Usage

1.  Open Frontend.
2.  Upload a VCF file (Example: `backend/test/test.vcf`).
3.  Select drugs (e.g., Codeine, Warfarin).
4.  Click **Analyze Risk Profile**.
5.  View structured report with risk cards and CPIC guidelines.

## ⚠️ Compliance

*   **Schema**: Strictly enforces output JSON structure.
*   **Accuracy**: Validated against CPIC guidelines.
*   **Safety**: Internal cross-checks between risk engine and CPIC.

---
**Developers**: RIFT 2026 Hackathon Team
