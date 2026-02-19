const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN,
});

const generateExplanation = async (context) => {

    // Safe Fallback for Missing Key
    if (!process.env.HF_TOKEN) {
        // Internal log only
        console.warn("LLM Service: HF_TOKEN missing - using fallback.");
        return getFallbackExplanation();
    }

    try {
        const prompt = `
You are a clinical pharmacogenomics expert.

Generate a structured JSON explanation for:

Gene: ${context.gene}
Diplotype: ${context.diplotype}
Phenotype: ${context.phenotype}
Drug: ${context.drug}
Risk: ${context.risk}
Guideline: ${context.recommendation}

Rules:
- Be clinically precise.
- Mention enzyme function.
- Explain biological mechanism.
- Keep it professional.
- Respond ONLY with valid JSON.

{
  "summary": "1-2 sentence summary",
  "mechanism": "2-3 sentences explaining biological mechanism",
  "clinical_impact": "2 sentences explaining clinical consequences"
}
`;

        const response = await openai.chat.completions.create({
            model: "meta-llama/Meta-Llama-3-8B-Instruct:novita",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 400
        });

        let content = response.choices[0].message.content;

        // 🔥 Remove code block formatting if model adds it
        content = content.replace(/```json/g, "").replace(/```/g, "").trim();

        const json = JSON.parse(content);

        if (json.summary && json.mechanism && json.clinical_impact) {
            return json;
        } else {
            console.warn("LLM Service: Malformed JSON response.");
            return getFallbackExplanation();
        }

    } catch (error) {
        // STEP 6: Safe LLM Failure Handling
        // Log internally, never expose stack trace or specific error details to user
        console.error("LLM Generation Internal Error:", error.message);
        return getFallbackExplanation();
    }
};

const getFallbackExplanation = () => {
    return {
        summary: "LLM explanation unavailable.",
        mechanism: "Deterministic pharmacogenomic interpretation used.",
        clinical_impact: "Refer to CPIC recommendation above."
    };
};

module.exports = { generateExplanation };
