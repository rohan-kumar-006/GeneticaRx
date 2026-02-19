import React from 'react';

const DRUGS = [
    "CODEINE",
    "CLOPIDOGREL",
    "WARFARIN",
    "SIMVASTATIN",
    "AZATHIOPRINE",
    "FLUOROURACIL"
];

const DrugSelector = ({ selectedDrugs, setSelectedDrugs }) => {
    const handleToggle = (drug) => {
        if (selectedDrugs.includes(drug)) {
            setSelectedDrugs(selectedDrugs.filter(d => d !== drug));
        } else {
            setSelectedDrugs([...selectedDrugs, drug]);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-200 mb-6">
            <h3 className="text-lg font-semibold mb-5 text-sky-700 tracking-wide">
                Select Drugs for Analysis
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {DRUGS.map((drug) => {
                    const isSelected = selectedDrugs.includes(drug);

                    return (
                        <button
                            key={drug}
                            onClick={() => handleToggle(drug)}
                            className={`p-3 rounded-xl text-sm font-semibold transition-all duration-200 transform ${isSelected
                                    ? "bg-sky-700 text-white shadow-md hover:bg-sky-800"
                                    : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                                }`}
                        >
                            {drug}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DrugSelector;
