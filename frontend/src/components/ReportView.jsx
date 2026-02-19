import React, { useState } from 'react';
import { getRiskColor } from '../utils/riskColors';
import JSONModal from './JSONModal';

const SectionHeader = ({ title, isOpen, onClick, colorClass }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between group focus:outline-none"
    >
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <span className={`w-1 h-6 rounded mr-3 transition-all ${colorClass}`}></span>
            {title}
        </h3>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
            <svg
                className="w-5 h-5 text-slate-400 group-hover:text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
        </span>
    </button>
);

const ReportView = ({ result }) => {
    const [isCPICOpen, setIsCPICOpen] = useState(false);
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [isJSONModalOpen, setIsJSONModalOpen] = useState(false);

    const {
        drug,
        risk_assessment,
        pharmacogenomic_profile,
        clinical_recommendation,
        llm_generated_explanation,
        quality_metrics
    } = result;

    const riskColor = getRiskColor(risk_assessment.risk_label);

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in mt-6">

                {/* Header */}
                {/* Header */}
                <div className={`p-6 border-b ${riskColor} bg-opacity-10`}>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">

                        {/* Left Side - Title */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                                {drug} Analysis Report
                            </h2>
                            <p className="text-slate-600 font-medium mt-1">
                                {pharmacogenomic_profile.primary_gene} ({pharmacogenomic_profile.diplotype || "Results Pending"}) - {pharmacogenomic_profile.phenotype}
                            </p>
                        </div>

                        {/* Right Side - Actions + Risk */}
                        <div className="flex items-start gap-6">

                            {/* RAW DATA Button */}
                            <button
                                onClick={() => setIsJSONModalOpen(true)}
                                className="px-6 py-3 text-l  font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 shadow-sm transition-all duration-200 self-start"
                            >
                                RAW DATA
                            </button>

                            {/* Risk + Severity */}
                            <div className="flex flex-col items-end">
                                <span
                                    className={`inline-flex items-center justify-center text-lg font-bold px-6 py-2.5 rounded-xl shadow-md border ${riskColor.replace("bg-", "bg-opacity-20 border-")}`}
                                >
                                    {risk_assessment.risk_label.toUpperCase()}
                                </span>

                                <p className="text-xs text-slate-500 mt-2 uppercase tracking-wide font-semibold">
                                    Severity: <span className="text-slate-700">{risk_assessment.severity}</span>
                                </p>
                            </div>

                        </div>
                    </div>
                </div>


                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* CPIC Recommendation (Now Styled Like Clinical Explanation) */}
                    <div className="space-y-4">
                        <section className="bg-blue-50 rounded-xl border border-blue-100 overflow-hidden">
                            <div className="p-4 bg-white border-b border-blue-50">
                                <SectionHeader
                                    title="CPIC Recommendation"
                                    isOpen={isCPICOpen}
                                    onClick={() => setIsCPICOpen(!isCPICOpen)}
                                    colorClass="bg-blue-500"
                                />
                            </div>

                            <div className={`transition-all duration-300 ease-in-out ${isCPICOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-5 space-y-4 bg-blue-50/50">
                                    <div>
                                        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                                            Recommendation
                                        </h4>
                                        <p className="text-sm text-blue-900 leading-relaxed font-medium">
                                            {clinical_recommendation.text}
                                        </p>
                                    </div>

                                    <p className="text-xs text-blue-500 mt-3 text-right font-medium">
                                        Source: {clinical_recommendation.source}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Clinical Explanation */}
                    <div className="space-y-4">
                        <section className="bg-blue-50 rounded-xl border border-blue-100 overflow-hidden">
                            <div className="p-4 bg-white border-b border-blue-50">
                                <SectionHeader
                                    title="Clinical Explanation"
                                    isOpen={isAIOpen}
                                    onClick={() => setIsAIOpen(!isAIOpen)}
                                    colorClass="bg-blue-500"
                                />
                            </div>

                            <div className={`transition-all duration-300 ease-in-out ${isAIOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-5 space-y-4 bg-blue-50/50">
                                    <div>
                                        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                                            Summary
                                        </h4>
                                        <p className="text-sm text-blue-900 leading-relaxed font-medium">
                                            {llm_generated_explanation.summary}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                                            Mechanism
                                        </h4>
                                        <p className="text-sm text-blue-800 leading-relaxed">
                                            {llm_generated_explanation.mechanism}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                                            Clinical Impact
                                        </h4>
                                        <p className="text-sm text-blue-800 leading-relaxed">
                                            {llm_generated_explanation.clinical_impact}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Metrics Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 mt-auto">
                    <details className="cursor-pointer group">
                        <summary className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors list-none flex items-center">
                            <span className="mr-2 transform group-open:rotate-90 transition-transform">▶</span>
                            View Technical Quality Metrics
                        </summary>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                            {Object.entries(quality_metrics).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm"
                                >
                                    <span className="text-slate-600 font-medium capitalize">
                                        {key.replace(/_/g, ' ')}
                                    </span>
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${value
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {value ? "PASS" : "FAIL"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </details>
                </div>
            </div>

            <JSONModal
                isOpen={isJSONModalOpen}
                onClose={() => setIsJSONModalOpen(false)}
                data={result}
            />
        </>
    );
};

export default ReportView;
