export const riskColors = {
    "Safe": "bg-green-100 text-green-800 border-green-200",
    "Adjust Dosage": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Toxic": "bg-red-100 text-red-800 border-red-200",
    "Ineffective": "bg-red-100 text-red-800 border-red-200",
    "Unknown": "bg-gray-100 text-gray-800 border-gray-200"
};

export const getRiskColor = (label) => {
    return riskColors[label] || riskColors["Unknown"];
};
