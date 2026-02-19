const fs = require('fs');
const path = require('path');
const { analyzeVCF } = require('./controllers/analysisController');

const runTest = async () => {
    console.log("🧪 Starting PharmaGuard Test Pipeline...");

    // 1. Load VCF
    const vcfPath = path.join(__dirname, 'test/test.vcf');
    if (!fs.existsSync(vcfPath)) {
        console.error("❌ Test VCF not found!");
        process.exit(1);
    }
    const vcfContent = fs.readFileSync(vcfPath, 'utf-8');
    console.log("✅ Loaded test.vcf");

    // 2. Mock Request/Response
    const req = {
        body: {
            vcfContent: vcfContent,
            drugs: ["CODEINE", "CLOPIDOGREL", "WARFARIN"]
        }
    };

    const res = {
        json: (data) => {
            console.log("\n📊 Analysis Results Received:");
            console.log(JSON.stringify(data, null, 2));

            // 3. Validation
            let failures = [];

            // Check count
            if (data.length !== 3) failures.push("Expected 3 results");

            // Check Codeine (CYP2D6 *4/*4 -> PM -> Ineffective)
            const codeine = data.find(d => d.drug === "CODEINE");
            if (codeine) {
                if (codeine.pharmacogenomic_profile.phenotype !== "PM") failures.push("Codeine Phenotype mismatch: Expected PM");
                if (codeine.risk_assessment.risk_label !== "Ineffective") failures.push("Codeine Risk mismatch: Expected Ineffective");
            } else {
                failures.push("Codeine result missing");
            }

            // Check Clopidogrel (CYP2C19 *2/*2 -> PM -> Ineffective)
            const clop = data.find(d => d.drug === "CLOPIDOGREL");
            if (clop) {
                if (clop.pharmacogenomic_profile.phenotype !== "PM") failures.push("Clopi Phenotype mismatch: Expected PM");
                if (clop.risk_assessment.risk_label !== "Ineffective") failures.push("Clopi Risk mismatch: Expected Ineffective");
            }

            // Check Warfarin (CYP2C9 *1 -> NM (implicit *1/*1) -> Safe)
            const warf = data.find(d => d.drug === "WARFARIN");
            if (warf) {
                if (warf.pharmacogenomic_profile.diplotype !== "*1/*1") failures.push(`Warfarin Diplotype mismatch: Expected *1/*1, got ${warf.pharmacogenomic_profile.diplotype}`);
                if (warf.pharmacogenomic_profile.phenotype !== "NM") failures.push("Warfarin Phenotype mismatch: Expected NM");
                if (warf.risk_assessment.risk_label !== "Safe") failures.push("Warfarin Risk mismatch: Expected Safe");
            }

            // Final Report
            if (failures.length > 0) {
                console.error("\n❌ Logic Verification FAILED:");
                failures.forEach(f => console.error(` - ${f}`));
                process.exit(1);
            } else {
                console.log("\n✅ ALL LOGIC CHECKS PASSED!");
                console.log("✅ Schema Validation: Implicitly passed via controller strict check.");
                process.exit(0);
            }
        },
        status: (code) => {
            return {
                json: (err) => {
                    console.error(`\n❌ Request Failed with status ${code}:`);
                    console.error(err);
                    process.exit(1);
                }
            };
        }
    };

    // 4. Run Controller
    try {
        await analyzeVCF(req, res);
    } catch (e) {
        console.error("❌ Uncaught exception:", e);
        process.exit(1);
    }
};

runTest();
