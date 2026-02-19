/**
 * Constructs diplotype from a list of star alleles.
 * Enforces sorting rule: *1/*4 NOT *4/*1
 */
const constructDiplotype = (variants) => {
    // Helper: Strict STAR Normalization (Re-implemented for safety consistency)
    const normalizeStar = (rawStar) => {
        if (!rawStar) return "*1"; // Fallback safety
        let value = rawStar.trim().toUpperCase();
        value = value.replace(/\s+/g, "");
        value = value.replace(/^\*+/, "");
        value = "*" + value;
        return value;
    };

    // 1. Extract star alleles and Ensure Normalization
    let alleles = variants.map(v => normalizeStar(v.star));

    // 2. Fallback Logic: STRICTLY only if 0 alleles found
    if (alleles.length === 0) {
        // No variants detected -> *1/*1
        return "*1/*1";
    }

    // Spec Rule: "If 1 allele -> assume homozygous (*X/*X)"
    if (alleles.length === 1) {
        alleles.push(alleles[0]);
    }

    // If > 2 alleles, we take the first two (simplification step)
    if (alleles.length > 2) {
        alleles = alleles.slice(0, 2);
    }

    // 3. Sorting Guarantee (Natural Sort)
    // Using localeCompare with numeric: true handles *1 vs *4 vs *10 correctly
    alleles.sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    // 4. Reconstruct
    return alleles.join("/");
};

module.exports = { constructDiplotype };
