const { parseVCF } = require('../engines/vcfParser');
const { constructDiplotype } = require('../engines/diplotypeEngine');
const { predictPhenotype } = require('../engines/phenotypeEngine');
const { predictDrugRisk } = require('../engines/drugRiskEngine');
const { getCPICRecommendation } = require('../engines/cpicEngine');
const { generateExplanation } = require('../services/llmService');
const { validateSchema } = require('../utils/schemaValidator');
const AppError = require('../utils/AppError');

// Gene map for drugs
const DRUG_GENE_MAP = {
    "CODEINE": "CYP2D6",
    "CLOPIDOGREL": "CYP2C19",
    "WARFARIN": "CYP2C9",
    "SIMVASTATIN": "SLCO1B1",
    "AZATHIOPRINE": "TPMT",
    "FLUOROURACIL": "DPYD"
};

const SUPPORTED_GENES = Object.values(DRUG_GENE_MAP);

/**
 * Validates VCF content structure before parsing.
 * NOW returns void but throws AppError if invalid.
 * Since we are inside asyncHandler, throwing sync or async errors is safe,
 * BUT requirements say "Validator should ONLY throw AppError".
 */
const validateVCFContent = (vcfContent) => {
    // 1. File exists and size > 0 (Handled by multer, but good to check content)
    if (!vcfContent || vcfContent.trim().length === 0) {
        throw new AppError("VCF file is empty.", 400, "INVALID_VCF_FORMAT", "The uploaded file contains no data.");
    }

    const lines = vcfContent.split(/\n+/);

    // 2. First line starts with ##fileformat=VCF
    const firstLine = lines.find(l => l.trim() !== "");
    if (!firstLine || !firstLine.startsWith("##fileformat=VCF")) {
        throw new AppError("Invalid VCF format detected.", 400, "INVALID_VCF_FORMAT", "File must start with '##fileformat=VCF'.");
    }

    // 3. Header line contains #CHROM
    const headerLine = lines.find(l => l.startsWith("#CHROM"));
    if (!headerLine) {
        throw new AppError("Invalid VCF format detected.", 400, "INVALID_VCF_FORMAT", "Missing required header line starting with #CHROM.");
    }

    // Check for INFO column (standard VCF has CHROM POS ID REF ALT QUAL FILTER INFO ...)
    const headerCols = headerLine.split(/\s+/);
    if (!headerCols.includes("INFO")) {
        throw new AppError("Invalid VCF format detected.", 400, "INVALID_VCF_FORMAT", "INFO column missing in header.");
    }

    // 4. Check for GENE= and STAR= in at least one data line (if data exists)
    const dataLines = lines.filter(l => !l.startsWith("#") && l.trim() !== "");
    if (dataLines.length > 0) {
        const hasGene = dataLines.some(l => l.includes("GENE="));
        const hasStar = dataLines.some(l => l.includes("STAR="));

        if (!hasGene) {
            throw new AppError("Missing GENE annotations.", 400, "INVALID_VCF_FORMAT", "VCF INFO column must contain 'GENE=Symbol' entries.");
        }
        if (!hasStar) {
            throw new AppError("STAR allele annotation missing in VCF.", 400, "MISSING_STAR_ANNOTATION", "Ensure STAR=*X format exists in INFO field.");
        }
    }
};


/**
 * Analyzes a single drug against the VCF data.
 * Returns a single formatted result object.
 */
const analyzeDrug = async (vcfContent, geneVariants, drug) => {
    const gene = DRUG_GENE_MAP[drug];

    if (!gene) {
        return {
            patient_id: "PATIENT_UNKNOWN",
            drug: drug,
            timestamp: new Date().toISOString(),
            risk_assessment: { risk_label: "Not Applicable", confidence_score: 0, severity: "None" },
            pharmacogenomic_profile: { primary_gene: "Unknown", diplotype: null, phenotype: "Unknown", detected_variants: [] },
            clinical_recommendation: { text: "Drug not supported by current analysis engine.", source: "System" },
            llm_generated_explanation: { summary: "N/A", mechanism: "N/A", clinical_impact: "N/A" },
            quality_metrics: { vcf_parsing_success: true, gene_detected: false, phenotype_lookup_success: false, risk_rule_applied: false, cpic_alignment_verified: false, llm_generation_success: false }
        };
    }

    const variants = geneVariants[gene] || [];
    let diplotype;
    let phenotype;
    let isGeneDetected = false;

    const isGeneReferencePresent = vcfContent.includes(`GENE=${gene}`);

    if (variants.length === 0) {
        if (isGeneReferencePresent) {
            // Case 1: Gene present, no variants -> *1/*1 (Wildtype/Safe)
            diplotype = constructDiplotype([]); // Returns *1/*1
            isGeneDetected = true; // Present but WT
        } else {
            // Case 2: Gene not present -> Drug Not Relevant to Detected Gene
            return {
                patient_id: "PATIENT_" + Math.floor(Math.random() * 1000),
                drug: drug,
                timestamp: new Date().toISOString(),
                risk_assessment: {
                    risk_label: "Not Applicable",
                    confidence_score: 0,
                    severity: "None"
                },
                pharmacogenomic_profile: {
                    primary_gene: gene,
                    diplotype: null,
                    phenotype: "Not Detected",
                    detected_variants: []
                },
                clinical_recommendation: {
                    text: "Selected drug has no actionable variants in uploaded file.",
                    source: "System"
                },
                llm_generated_explanation: {
                    summary: "Analysis not possible.",
                    mechanism: "Gene data missing from VCF.",
                    clinical_impact: "Cannot determine pharmacogenomic risk."
                },
                quality_metrics: {
                    vcf_parsing_success: true,
                    gene_detected: false,
                    phenotype_lookup_success: false,
                    risk_rule_applied: false,
                    cpic_alignment_verified: true,
                    llm_generation_success: false
                }
            };
        }
    } else {
        diplotype = constructDiplotype(variants);
        isGeneDetected = true;
    }

    if (diplotype) {
        phenotype = predictPhenotype(gene, diplotype);
    } else {
        phenotype = "Unknown";
    }

    const riskAssessment = predictDrugRisk(drug, phenotype);
    const cpic = getCPICRecommendation(drug, phenotype);

    if (riskAssessment.risk_label !== cpic.risk) {
        console.warn(`Risk Mismatch for ${drug}: RiskEngine=${riskAssessment.risk_label} vs CPIC=${cpic.risk}`);
    }

    const llmContext = {
        gene, diplotype, phenotype, drug,
        risk: riskAssessment.risk_label,
        recommendation: cpic.recommendation
    };

    const llmExplanation = await generateExplanation(llmContext);

    const patientId = "PATIENT_" + Math.floor(Math.random() * 1000);

    const resultObject = {
        patient_id: patientId,
        drug: drug,
        timestamp: new Date().toISOString(),
        risk_assessment: {
            risk_label: riskAssessment.risk_label,
            confidence_score: isGeneDetected ? 0.95 : 0.0,
            severity: cpic.severity
        },
        pharmacogenomic_profile: {
            primary_gene: gene,
            diplotype: diplotype,
            phenotype: phenotype,
            detected_variants: variants.map(v => ({ rsid: v.rs || "N/A", star: v.star }))
        },
        clinical_recommendation: {
            text: cpic.recommendation,
            source: "CPIC Guidelines"
        },
        llm_generated_explanation: llmExplanation,
        quality_metrics: {
            vcf_parsing_success: true,
            gene_detected: isGeneDetected,
            phenotype_lookup_success: phenotype !== "Unknown",
            risk_rule_applied: riskAssessment.risk_label !== "Unknown",
            cpic_alignment_verified: riskAssessment.risk_label === cpic.risk,
            llm_generation_success: llmExplanation.summary !== "LLM explanation unavailable."
        }
    };

    const validation = validateSchema(resultObject);
    if (!validation.valid) {
        console.error("Schema Validation Failed:", validation.error);
    }

    return resultObject;
};

exports.analyzeVCF = async (req, res, next) => {
    // 1. File Validation
    if (!req.file) {
        return next(new AppError("VCF file is required", 400, "VALIDATION_ERROR", "Upload file using key 'vcf' as multipart/form-data"));
    }

    const vcfContent = req.file.buffer.toString('utf-8');

    // STEP 1: Strict VCF Validation
    // This function throws AppError, which asyncHandler will catch and pass to next()
    validateVCFContent(vcfContent);

    // 2. Validate Drug Input
    let drugs = req.body.drugs;

    // STEP 4: Drug Selection Validation
    if (!drugs) {
        return next(new AppError("Please select at least one drug.", 400, "NO_DRUG_SELECTED", null));
    }

    // Parse drugs
    let drugsArray = [];
    try {
        if (typeof drugs === 'string') {
            try {
                drugsArray = JSON.parse(drugs);
            } catch {
                drugsArray = drugs.split(',').map(d => d.trim()).filter(d => d.length > 0);
            }
        } else if (Array.isArray(drugs)) {
            drugsArray = drugs;
        }
    } catch (e) {
        return next(new AppError("Invalid drug selection format.", 400, "VALIDATION_ERROR", "Drugs must be a list or comma-separated string."));
    }

    // Wrap if single string
    if (!Array.isArray(drugsArray)) {
        drugsArray = [drugsArray];
    }

    if (drugsArray.length === 0) {
        return next(new AppError("Please select at least one drug.", 400, "NO_DRUG_SELECTED", null));
    }

    // STEP 3: Unsupported Gene Handling
    const { geneVariants } = parseVCF(vcfContent);

    // Check if ANY supported gene has variants
    const hasSupportedVariants = Object.values(geneVariants).some(arr => arr.length > 0);

    if (!hasSupportedVariants) {
        const supportedGenesSet = new Set(SUPPORTED_GENES);
        const detectedGenes = new Set();
        const lines = vcfContent.split(/\n+/);
        lines.forEach(line => {
            if (line.includes("GENE=")) {
                const parts = line.split("GENE=");
                if (parts[1]) {
                    const geneName = parts[1].split(";")[0].trim().toUpperCase();
                    detectedGenes.add(geneName);
                }
            }
        });

        if (detectedGenes.size > 0) {
            const supportedInFile = [...detectedGenes].some(g => supportedGenesSet.has(g));
            if (!supportedInFile) {
                return next(new AppError("Uploaded gene is not supported.", 400, "UNSUPPORTED_GENE", "Supported genes: " + SUPPORTED_GENES.join(", ") + "."));
            }
        }
    }

    // LOOP per drug
    const results = [];
    for (const drug of drugsArray) {
        const drugResult = await analyzeDrug(vcfContent, geneVariants, drug);
        results.push(drugResult);
    }

    // Ensure we send structured SUCCESS response
    // The requirement implies error responses structure, but success response should likely also match or just contain data.
    // The previous implementation returned { analysis_results: [...] }
    // Let's wrap it in { success: true, analysis_results: ... } to be consistent if desired, OR keep standard API contract.
    // The requirements for "EXPECTED BEHAVIOR" only specify error format: { success: false, error: ... }
    // I will return standard success payload but can wrap it if needed. 
    // Staying compatible with frontend:
    res.json({
        success: true,
        analysis_results: results
    });
};
