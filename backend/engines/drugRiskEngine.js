const fs = require('fs');
const path = require('path');

// Load risk table
let riskTable = {};
try {
    const dataPath = path.join(__dirname, '../data/drugRiskTable.json');
    const rawData = fs.readFileSync(dataPath);
    riskTable = JSON.parse(rawData);
} catch (error) {
    console.error("Error loading drug risk table:", error);
}

/**
 * Predicts risk from Phenotype and Drug.
 * @param {string} drug - Drug name
 * @param {string} phenotype - Phenotype (e.g., PM, IM)
 * @returns {object} - { risk_label }
 */
const predictDrugRisk = (drug, phenotype) => {
    // 1. Validate inputs
    if (!riskTable[drug]) {
        return { risk_label: "Unknown" };
    }

    const drugRisks = riskTable[drug];

    // 2. Lookup
    let riskLabel = drugRisks[phenotype] || "Unknown";

    // Note: Severity is NOT inferred here. 
    // It must be derived strictly from CPIC guidelines in the controller/cpicEngine.

    return { risk_label: riskLabel };
};

module.exports = { predictDrugRisk };
