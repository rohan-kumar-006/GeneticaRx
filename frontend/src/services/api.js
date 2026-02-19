const API_URL = "http://localhost:5000/api";

export const analyzeVCF = async (file, drugs) => {
    try {
        const formData = new FormData();
        formData.append("vcf", file);
        formData.append("drugs", JSON.stringify(drugs));

        const response = await fetch(`${API_URL}/analyze`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            // New Format: { success: false, error: { type, message, details } }
            if (data.error) {
                // Return the inner error object directly so frontend sees { type, message, details }
                throw data.error;
            } else {
                throw new Error("Unknown error occurred");
            }
        }

        // New Success Format: { success: true, analysis_results: [...] }
        if (!data.success || !data.analysis_results) {
            console.warn("API response structure unexpected, returning empty array.");
            return { analysis_results: [] };
        }

        return data;

    } catch (error) {
        console.error("API Service Error:", error);
        throw error;
    }
};
