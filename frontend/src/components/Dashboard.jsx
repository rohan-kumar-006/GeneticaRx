import React, { useState } from 'react';
import RiskCard from './RiskCard';
import ReportView from './ReportView';
import JSONModal from './JSONModal';

const RiskLegend = () => (
    <div className="flex flex-wrap items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm mb-6 text-xs md:text-sm">
        <span className="font-bold text-slate-700 mr-2">Risk Legend:</span>
        <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-500 mr-1.5"></span>
            <span className="text-slate-600">Safe</span>
        </div>
        <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-500 mr-1.5"></span>
            <span className="text-slate-600">Adjust Dosage</span>
        </div>
        <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-100 border border-red-500 mr-1.5"></span>
            <span className="text-slate-600">Toxic/Ineffective</span>
        </div>
        <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-400 mr-1.5"></span>
            <span className="text-slate-600">Unknown</span>
        </div>
    </div>
);

const Dashboard = ({ results, onReset }) => {
    const [activeResultIndex, setActiveResultIndex] = useState(0);
    const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);

    // Defensive check: Ensure results is an array
    const safeResults = Array.isArray(results) ? results : [];

    // Prepare full object for export structure compliance: { analysis_results: [...] }
    const exportData = {
        analysis_results: safeResults
    };

    return (
        <div className="animate-fade-in w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Analysis Results</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsGlobalModalOpen(true)}
                        className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm hover:bg-indigo-100 transition-all disabled:opacity-50"
                        disabled={safeResults.length === 0}
                    >
                        Export Full JSON
                    </button>
                    <button
                        onClick={onReset}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all"
                    >
                        Start New Analysis
                    </button>
                </div>
            </div>

            <RiskLegend />

            {safeResults.length === 0 ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded text-yellow-700 font-bold mb-8">
                    No results found. Please try again.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {safeResults.map((res, idx) => (
                        <RiskCard
                            key={idx}
                            result={res}
                            isActive={idx === activeResultIndex}
                            onClick={() => setActiveResultIndex(idx)}
                        />
                    ))}
                </div>
            )}

            {/* Detailed View for Active Card */}
            {safeResults[activeResultIndex] && (
                <div key={activeResultIndex}>
                    {/* Key forces re-render of ReportView on switch to reset state if needed */}
                    <ReportView result={safeResults[activeResultIndex]} />
                </div>
            )}

            {/* Global JSON Export Modal */}
            <JSONModal
                isOpen={isGlobalModalOpen}
                onClose={() => setIsGlobalModalOpen(false)}
                data={exportData}
            />
        </div>
    );
};

export default Dashboard;
