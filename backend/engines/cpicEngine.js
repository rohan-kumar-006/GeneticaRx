const fs = require('fs');
const path = require('path');

// Load CPIC guidelines
let cpicData = {};
try {
    const dataPath = path.join(__dirname, '../data/cpicGuidelines.json');
    const rawData = fs.readFileSync(dataPath);
    cpicData = JSON.parse(rawData);
} catch (error) {
    console.error("Error loading CPIC data:", error);
}

/**
 * Retrieves CPIC recommendation.
 * @param {string} drug 
 * @param {string} phenotype 
 * @returns {object} - { recommendation, risk, severity, gene }
 */
const getCPICRecommendation = (drug, phenotype) => {
    if (!cpicData[drug]) {
        return {
            recommendation: "No CPIC guideline available for this drug.",
            risk: "Unknown",
            severity: "low",
            gene: "Unknown"
        };
    }

    const drugData = cpicData[drug];
    const mappings = drugData.mappings;
    const gene = drugData.gene;

    if (mappings[phenotype]) {
        return { ...mappings[phenotype], gene };
    }

    // Try normalization if needed (PM vs Poor) - Though tables should align
    // Map short codes to long if needed, or vice-versa
    const normalizationMap = {
        "PM": "Poor",
        "IM": "Intermediate",
        "NM": "Normal",
        "RM": "Rapid",
        "UM": "Ultrarapid"
    };

    const longName = normalizationMap[phenotype];
    if (longName && mappings[longName]) {
        return { ...mappings[longName], gene };
    }

    return {
        recommendation: "Phenotype not found in CPIC guidelines.",
        risk: "Unknown",
        severity: "low",
        gene: gene
    };
};

module.exports = { getCPICRecommendation };
