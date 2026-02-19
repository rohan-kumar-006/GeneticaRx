const fs = require('fs');
const path = require('path');

// Load phenotype table
let phenotypeTable = {};
try {
    const dataPath = path.join(__dirname, '../data/phenotypeTable.json');
    const rawData = fs.readFileSync(dataPath);
    phenotypeTable = JSON.parse(rawData);
} catch (error) {
    console.error("Error loading phenotype table:", error);
}

/**
 * Predicts phenotype from diplotype for a specific gene.
 * @param {string} gene - Gene symbol (e.g., CYP2D6)
 * @param {string} diplotype - Diplotype string (e.g., *1/*4)
 * @returns {string} - Phenotype (e.g., IM, PM, NM, Unknown)
 */
const predictPhenotype = (gene, diplotype) => {
    if (!phenotypeTable[gene]) {
        console.warn(`Gene ${gene} not found in phenotype table.`);
        return "Unknown";
    }

    const geneMappings = phenotypeTable[gene];

    // Direct lookup
    if (geneMappings[diplotype]) {
        return geneMappings[diplotype];
    }

    // Try reverse order lookup if not found (though *1/*4 should be canonical if sorted)
    // e.g. *4/*1 -> Check table for *4/*1. If table has *1/*4, we might miss it if sorting failed or table is weird.
    // Ideally diplotype is already sorted.

    // Check if table contains reverse
    const parts = diplotype.split('/');
    if (parts.length === 2) {
        const reverseDip = `${parts[1]}/${parts[0]}`;
        if (geneMappings[reverseDip]) {
            return geneMappings[reverseDip];
        }
    }

    // Fallback: If not found -> Unknown
    return "Unknown";
};

module.exports = { predictPhenotype };
