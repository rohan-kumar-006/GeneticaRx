/**
 * strict schema enforcement for Analysis Result
 */
const validateSchema = (result) => {
    const requiredFields = [
        "patient_id",
        "drug",
        "timestamp",
        "risk_assessment",
        "pharmacogenomic_profile",
        "clinical_recommendation",
        "llm_generated_explanation",
        "quality_metrics"
    ];

    const missingFields = requiredFields.filter(field => !result.hasOwnProperty(field));
    if (missingFields.length > 0) {
        return { valid: false, error: `Missing top-level fields: ${missingFields.join(", ")}` };
    }

    // specific nested checks
    if (!result.risk_assessment.risk_label || !result.risk_assessment.severity) {
        return { valid: false, error: "Missing fields in risk_assessment" };
    }

    // Check pharmacogenomic_profile fields
    // diplotype can be null (for missing gene), so we check property existence, not truthiness for strict null
    if (!result.pharmacogenomic_profile.hasOwnProperty('primary_gene') ||
        !result.pharmacogenomic_profile.hasOwnProperty('diplotype') ||
        !result.pharmacogenomic_profile.hasOwnProperty('phenotype')) {
        return { valid: false, error: "Missing fields in pharmacogenomic_profile" };
    }

    // Check detected_variants is an array
    if (!Array.isArray(result.pharmacogenomic_profile.detected_variants)) {
        return { valid: false, error: "detected_variants must be an array" };
    }

    if (!result.llm_generated_explanation.summary || !result.llm_generated_explanation.mechanism || !result.llm_generated_explanation.clinical_impact) {
        return { valid: false, error: "Missing fields in llm_generated_explanation" };
    }

    return { valid: true };
};

module.exports = { validateSchema };
