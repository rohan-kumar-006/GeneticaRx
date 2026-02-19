import React from 'react';

const ErrorCard = ({ error }) => {
    if (!error) return null;

    // Determine Logic for styling based on error_type
    // Validation error → Amber, Unsupported gene → Blue-gray, Internal error → Soft red
    let borderColor = 'border-red-500';
    let bgColor = 'bg-red-50';
    let textColor = 'text-red-800';
    let icon = '⚠️';

    if (error.type === 'INVALID_VCF_FORMAT' || error.type === 'MISSING_STAR_ANNOTATION' || error.type === 'VALIDATION_ERROR' || error.type === 'NO_DRUG_SELECTED') {
        borderColor = 'border-amber-500';
        bgColor = 'bg-amber-50';
        textColor = 'text-amber-900';
        icon = '⚠️';
    } else if (error.type === 'UNSUPPORTED_GENE') {
        borderColor = 'border-slate-400';
        bgColor = 'bg-slate-100';
        textColor = 'text-slate-800';
        icon = 'ℹ️';
    } else {
        // Internal Error or Default
        borderColor = 'border-red-400';
        bgColor = 'bg-red-50';
        textColor = 'text-red-900';
        icon = '❌';
    }

    return (
        <div className={`mt-6 p-4 rounded-lg shadow-sm border-l-4 ${borderColor} ${bgColor} animate-fade-in`}>
            <div className="flex items-start">
                <div className="flex-shrink-0 text-xl mr-3">{icon}</div>
                <div>
                    <h3 className={`font-bold text-sm uppercase tracking-wide mb-1 ${textColor}`}>
                        {error.type ? error.type.replace(/_/g, ' ') : "Analysis Failed"}
                    </h3>
                    <div className={`text-base font-medium mb-1 ${textColor}`}>
                        {error.message}
                    </div>
                    {error.details && (
                        <p className={`text-sm opacity-80 mt-1 ${textColor}`}>
                            {error.details}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorCard;
