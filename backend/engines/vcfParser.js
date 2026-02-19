const fs = require('fs');

/**
 * Parses VCF file content to extract variants for specific genes.
 * @param {string} vcfContent - The format VCF file string
 * @returns {object} - Map of Gene -> Array of extracted variants {star, rs, gene}
 */
const parseVCF = (vcfContent) => {
    // 1. Normalize Line Endings (Remove CRLF artifacts)
    const normalizedContent = vcfContent.replace(/\r/g, "");

    // 2. Robust Line Splitting
    const lines = normalizedContent.split(/\n+/);

    const geneVariants = {};

    // Initialize supported genes
    const TARGET_GENES = ["CYP2D6", "CYP2C19", "CYP2C9", "SLCO1B1", "TPMT", "DPYD"];
    TARGET_GENES.forEach(gene => geneVariants[gene] = []);

    let parsingSuccess = false;

    // Helper: Strict STAR Normalization
    const normalizeStar = (rawStar) => {
        if (!rawStar) return null;
        // 1. Trim whitespace and Uppercase
        let value = rawStar.trim().toUpperCase();
        // 2. Remove internal whitespace
        value = value.replace(/\s+/g, "");
        // 3. Remove existing * prefixes to ensure clean state
        value = value.replace(/^\*+/, "");
        // 4. Add single * prefix
        value = "*" + value;
        return value;
    };

    for (const line of lines) {
        // 4. Proper Header Skipping
        if (!line || line.startsWith("#") || line.trim() === "") continue;

        // 3. Robust Column Splitting (Tabs OR Spaces)
        const cols = line.trim().split(/\s+/);

        // 5. Safe INFO Extraction
        if (cols.length < 8) continue; // Malformed line

        const info = cols[7]; // INFO is column 8 (index 7)

        // 6. Robust INFO Parsing
        const infoFields = {};
        info.split(";").forEach(field => {
            const parts = field.split("=");
            if (parts.length >= 2) {
                const key = parts[0].trim().toUpperCase(); // Normalize Key to Uppercase
                const value = parts[1].trim();
                if (key && value) {
                    infoFields[key] = value;
                }
            }
        });

        // Safe extraction
        const gene = infoFields["GENE"] ? infoFields["GENE"].toUpperCase() : null; // Normalize Gene Name
        const rawStar = infoFields["STAR"];
        const rs = infoFields["RS"];

        if (gene && rawStar && TARGET_GENES.includes(gene)) {
            // FIX: Strict Normalization
            const star = normalizeStar(rawStar);

            if (star) {
                geneVariants[gene].push({ gene, star, rs });
                // 7. Parsing Success Logic - True if AT LEAST ONE valid variant found
                parsingSuccess = true;
            }
        }
    }

    return { geneVariants, parsingSuccess };
};

module.exports = { parseVCF };
