import React from 'react';
import { getRiskColor } from '../utils/riskColors';

const RiskCard = ({ result, onClick, isActive }) => {
    const { drug, risk_assessment, pharmacogenomic_profile, timestamp } = result;
    const { risk_label, severity, confidence_score } = risk_assessment;
    const { phenotype, diplotype, primary_gene } = pharmacogenomic_profile;

    const colorClass = getRiskColor(risk_label);

    // Format Timestamp
    const formattedDate = new Date(timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Confidence Percentage
    const confidencePercent = Math.round(confidence_score * 100);

    return (
        <div
            onClick={onClick}
            className={`p-5 rounded-xl border cursor-pointer transition-all shadow-sm hover:shadow-md ${isActive ? 'ring-2 ring-indigo-500 border-transparent transform scale-[1.02]' : 'border-slate-200'
                } ${colorClass.replace("border-", "border-l-4 border-")}`}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-800">{drug}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${colorClass}`}>
                    {risk_label}
                </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">Analyzed at: {formattedDate}</p>

            <div className="text-sm text-slate-600 space-y-2">

                <div className="pt-2 space-y-1">
                    <p><span className="font-medium text-slate-500">Gene:</span> <span className="text-slate-800">{primary_gene}</span></p>
                    <p><span className="font-medium text-slate-500">Phenotype:</span> <span className="text-slate-800">{phenotype} ({diplotype || "N/A"})</span></p>
                    <p><span className="font-medium text-slate-500">Severity:</span> <span className="capitalize text-slate-800">{severity}</span></p>
                </div>
            </div>
        </div>
    );
};

export default RiskCard;
