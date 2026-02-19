import React, { useRef, useState } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const FileUpload = ({ onFileUpload }) => {
    const [fileName, setFileName] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const processFile = (file) => {
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            alert("File must be less than 5MB.");
            return;
        }

        if (file.name.toLowerCase().endsWith('.vcf')) {
            setFileName(file.name);
            onFileUpload(file);
        } else {
            alert("Please upload a valid .vcf file");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    return (
        <div
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 mb-6 text-center hover:border-indigo-500 transition-colors bg-white cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".vcf"
            />
            <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-indigo-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {fileName ? (
                    <p className="text-lg font-medium text-emerald-600">Uploaded: {fileName}</p>
                ) : (
                    <>
                        <p className="text-lg font-medium text-slate-700">Drag & drop VCF file here</p>
                        <p className="text-sm text-slate-500 mt-1">or click to browse</p>
                        <p className="text-xs text-slate-400 mt-2">Add file of size &lt;5Mb</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
