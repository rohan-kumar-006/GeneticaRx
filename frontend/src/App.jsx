import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import DrugSelector from './components/DrugSelector';
import Dashboard from './components/Dashboard';
import ErrorCard from './components/ErrorCard';
import { analyzeVCF } from './services/api';

const App = () => {
  const [vcfFile, setVcfFile] = useState(null);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalysis = async () => {
    // 1. Frontend Validation - missing file
    if (!vcfFile) {
      setError({
        type: "VALIDATION_ERROR",
        message: "Please upload a VCF file.",
        details: "A valid .vcf file is required for analysis."
      });
      return;
    }

    // 2. Frontend Validation - no drugs
    if (!selectedDrugs || selectedDrugs.length === 0) {
      setError({
        type: "NO_DRUG_SELECTED",
        message: "Please select at least one drug.",
        details: null
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await analyzeVCF(vcfFile, selectedDrugs);

      // If we get here, response was OK.
      setResults(data.analysis_results);

    } catch (err) {
      console.error("Analysis Error:", err);

      // Determine if it's a structured backend error
      // The updated api.js throws the JSON object { error_type, message, details } directly from response
      if (err.error_type) {
        setError(err);
      } else if (err.type) {
        setError(err); // Some validation errors might behave this way
      } else {
        // Generic JS/Network Error
        setError({
          type: "INTERNAL_CLIENT_ERROR",
          message: err.message || "An unexpected error occurred.",
          details: "Please check your connection and try again."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVcfFile(null);
    setSelectedDrugs([]);
    setResults(null);
    setError(null);
  };

  // STEP 4: Upload Screen Error Reset
  const handleFileUpload = (file) => {
    setVcfFile(file);
    setError(null); // Clear errors on new file
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white text-sky-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-sky-700">
            GeneticaRx
          </h1>

          <p className="mt-4 text-sky-900/70 text-lg md:text-xl font-medium">
            Pharmacogenomic Risk Prediction System
          </p>

          <div className="mt-6 w-28 h-[3px] mx-auto bg-sky-300 rounded-full opacity-70"></div>
        </header>

        <main>
          {!results ? (
            <div className="max-w-3xl mx-auto animate-fade-in-up">

              <FileUpload
                onFileUpload={handleFileUpload}
              />

              {vcfFile && (
                <>
                  <DrugSelector
                    selectedDrugs={selectedDrugs}
                    setSelectedDrugs={setSelectedDrugs}
                  />

                  {/* STEP 5: Loading Safety */}
                  <button
                    onClick={handleAnalysis}
                    disabled={loading || !selectedDrugs || selectedDrugs.length === 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 flex justify-center items-center ${loading || !selectedDrugs || selectedDrugs.length === 0
                      ? "bg-sky-200 text-sky-500 cursor-not-allowed transform-none shadow-none"
                      : "bg-sky-700 hover:bg-sky-800 text-white hover:shadow-sky-500/30"
                      }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing Genomes...
                      </>
                    ) : (
                      "Analyze Risk Profile"
                    )}
                  </button>
                </>
              )}

              {/* Enhanced Error Display */}
              <ErrorCard error={error} />

            </div>
          ) : (
            <Dashboard results={results} onReset={handleReset} />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-sky-900/40 text-sm">
          <p>GeneticaRx © 2026 • RIFT Hackathon Project</p>
        </footer>

      </div>
    </div>
  );
};

export default App;
