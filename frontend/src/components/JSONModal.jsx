import React, { useState } from 'react';

const JSONModal = ({ isOpen, onClose, data }) => {
    const [copyStatus, setCopyStatus] = useState("Copy JSON");

    if (!isOpen) return null;

    const formattedJSON = JSON.stringify(data, null, 2);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(formattedJSON);
            setCopyStatus("Copied!");
            setTimeout(() => setCopyStatus("Copy JSON"), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
            setCopyStatus("Error");
        }
    };

    const handleDownload = () => {
        const blob = new Blob([formattedJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `geneticarx_result_${data.patient_id || 'export'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800">Raw Analysis Data (JSON)</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 bg-slate-50 font-mono text-xs text-slate-700">
                    <pre>{formattedJSON}</pre>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-white flex justify-end space-x-3 rounded-b-xl">
                    <button
                        onClick={handleCopy}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors border ${copyStatus === "Copied!"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                            }`}
                    >
                        {copyStatus}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm hover:shadow"
                    >
                        Download JSON
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JSONModal;
