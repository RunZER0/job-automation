"use client";

import React, { useState, DragEvent } from "react";
import { 
  CloudIcon, 
  BoltIcon, 
  SparklesIcon, 
  DocumentTextIcon, 
  PaperAirplaneIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export default function JobCraftAI() {
  const [cv, setCv] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [whichResult, setWhichResult] = useState(""); // "cv" or "cover"
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCv(e.target.files[0]);
      setCurrentStep(2);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCv(e.dataTransfer.files[0]);
      setCurrentStep(2);
    }
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
    if (e.target.value.trim() && cv) {
      setCurrentStep(3);
    }
  };

  const callApi = async (endpoint: string) => {
    if (!cv || !jobDescription) {
      alert("Please upload your CV and enter a job description.");
      return;
    }
    setLoading(true);
    setResult("");
    setWhichResult(endpoint);

    const formData = new FormData();
    formData.append("cv_file", cv);
    formData.append("job_description", jobDescription);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const apiUrl = endpoint === "cv" ? `${apiBase}/cv/tailor` : `${apiBase}/cover-letter/generate`;

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data.tailored_cv || data.cover_letter || "No result");
      setCurrentStep(4);
    } catch (error: any) {
      setResult("Error: " + error.message);
    }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadAsFile = (format: 'pdf' | 'docx') => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${whichResult === 'cv' ? 'tailored-cv' : 'cover-letter'}.${format === 'pdf' ? 'txt' : 'docx'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetProcess = () => {
    setCv(null);
    setJobDescription("");
    setResult("");
    setWhichResult("");
    setCurrentStep(1);
    setCopied(false);
  };

  const StepIndicator = ({ step, title, completed, active }: { step: number, title: string, completed: boolean, active: boolean }) => (
    <div className={`flex items-center space-x-3 transition-all duration-300 ${
      active ? 'scale-105' : completed ? 'opacity-100' : 'opacity-50'
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
        completed 
          ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
          : active 
          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30 animate-pulse' 
          : 'bg-slate-700 text-slate-400 border-2 border-slate-600'
      }`}>
        {completed ? <CheckIcon className="w-5 h-5" /> : step}
      </div>
      <span className={`font-medium transition-colors duration-300 ${
        completed ? 'text-emerald-400' : active ? 'text-cyan-400' : 'text-slate-500'
      }`}>
        {title}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-violet-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-gradient-to-r from-pink-400/10 to-rose-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <BoltIcon className="h-10 w-10 text-cyan-400 drop-shadow-lg" />
              <div className="absolute inset-0 h-10 w-10 text-cyan-400 animate-ping opacity-30">
                <BoltIcon className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              JobCraft AI
            </h1>
          </div>
          <p className="text-lg text-slate-300 max-w-xl mx-auto">
            Transform your career with AI-powered CV tailoring and cover letter generation
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <StepIndicator step={1} title="Upload CV" completed={!!cv} active={currentStep === 1} />
            <StepIndicator step={2} title="Job Description" completed={!!jobDescription.trim()} active={currentStep === 2} />
            <StepIndicator step={3} title="Generate" completed={!!result && !loading} active={currentStep === 3} />
            <StepIndicator step={4} title="Complete" completed={!!result && !loading} active={currentStep === 4} />
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              {/* File Upload Card */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-cyan-500/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-200">Upload Your CV</h3>
                  {cv && <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">✓</div>}
                </div>
                
                <div
                  className={`relative group border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
                    dragActive
                      ? "border-cyan-400 bg-cyan-400/5 scale-105"
                      : cv 
                      ? "border-emerald-400 bg-emerald-400/5"
                      : "border-slate-600 bg-slate-800/30 hover:border-slate-500"
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-center space-y-3">
                    <CloudIcon className={`h-12 w-12 mx-auto transition-colors duration-300 ${
                      dragActive ? "text-cyan-400" : cv ? "text-emerald-400" : "text-slate-400"
                    }`} />
                    <div>
                      <input
                        type="file"
                        accept=".txt,.pdf,.docx"
                        className="hidden"
                        id="cv-upload"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="cv-upload"
                        className={`inline-block px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-300 ${
                          cv 
                          ? "bg-emerald-500 text-white" 
                          : "bg-cyan-500 hover:bg-cyan-400 text-white"
                        }`}
                      >
                        {cv ? `✓ ${cv.name}` : "Choose File"}
                      </label>
                    </div>
                    <p className="text-slate-400 text-xs">
                      Supports PDF, TXT, DOCX
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Description Card */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-purple-500/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <PaperAirplaneIcon className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-200">Job Description</h3>
                  {jobDescription.trim() && <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">✓</div>}
                </div>
                
                <textarea
                  placeholder="Paste the job description here..."
                  rows={6}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 focus:outline-none transition-all duration-300 resize-none"
                  value={jobDescription}
                  onChange={handleJobDescriptionChange}
                />
              </div>

              {/* Action Buttons */}
              {cv && jobDescription.trim() && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => callApi("cv")}
                    disabled={loading}
                    className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {loading && whichResult === "cv" ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Tailoring...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-5 w-5" />
                          Tailor CV
                        </>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => callApi("cover")}
                    disabled={loading}
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {loading && whichResult === "cover" ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <DocumentTextIcon className="h-5 w-5" />
                          Cover Letter
                        </>
                      )}
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {loading && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
                  <div className="text-center space-y-4">
                    <div className="relative inline-block">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
                      <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-cyan-400 opacity-30"></div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-cyan-400">AI is working...</h3>
                      <p className="text-slate-400">This may take a few moments</p>
                    </div>
                  </div>
                </div>
              )}

              {!loading && result && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${whichResult === "cv" ? "bg-cyan-500/20" : "bg-purple-500/20"}`}>
                          {whichResult === "cv" ? (
                            <SparklesIcon className="h-6 w-6 text-cyan-400" />
                          ) : (
                            <DocumentTextIcon className="h-6 w-6 text-purple-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-200">
                            {whichResult === "cv" ? "Your Tailored CV" : "Your Cover Letter"}
                          </h3>
                          <p className="text-sm text-slate-400">Ready to use</p>
                        </div>
                      </div>
                      <button
                        onClick={resetProcess}
                        className="p-2 text-slate-400 hover:text-slate-200 transition-colors duration-200"
                        title="Start Over"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed">
                        {result}
                      </pre>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 border-t border-white/10 bg-slate-800/20">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all duration-200 transform hover:scale-105"
                      >
                        {copied ? (
                          <>
                            <CheckIcon className="h-4 w-4 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => downloadAsFile('docx')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Download TXT
                      </button>
                      
                      <button
                        onClick={() => downloadAsFile('pdf')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Save File
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && !result && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center">
                      <SparklesIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-300 mb-2">Ready to Begin</h3>
                      <p className="text-slate-500 text-sm">
                        Upload your CV and add a job description to get started
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 space-y-4">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1 max-w-32"></div>
            <span className="px-4 text-sm">Powered by AI</span>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1 max-w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}