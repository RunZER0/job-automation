"use client";
import { useState, DragEvent } from "react";
import { CloudIcon, BoltIcon, SparklesIcon, DocumentTextIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const [cv, setCv] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [whichResult, setWhichResult] = useState(""); // "cv" or "cover"
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCv(e.target.files[0]);
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

    const apiUrl =
      endpoint === "cv"
        ? "http://localhost:8000/cv/tailor"
        : "http://localhost:8000/cover-letter/generate";

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data.tailored_cv || data.cover_letter || "No result");
    } catch (error: any) {
      setResult("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-violet-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-12 px-4">
        {/* Main Container */}
        <div className="w-full max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="relative">
                <BoltIcon className="h-12 w-12 text-cyan-400 drop-shadow-lg" />
                <div className="absolute inset-0 h-12 w-12 text-cyan-400 animate-ping opacity-30">
                  <BoltIcon className="h-12 w-12" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                JobCraft AI
              </h1>
            </div>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Transform your career with AI-powered CV tailoring and cover letter generation
            </p>
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <SparklesIcon className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-medium">Powered by Advanced AI</span>
              <SparklesIcon className="h-5 w-5 animate-pulse" />
            </div>
          </div>

          {/* Main Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
            
            {/* File Upload Section */}
            <div className="mb-10">
              <label className="block text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-cyan-400" />
                Upload Your CV
              </label>
              <div
                className={`relative group border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                  dragActive
                    ? "border-cyan-400 bg-cyan-400/5 scale-105"
                    : cv 
                    ? "border-emerald-400 bg-emerald-400/5"
                    : "border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <CloudIcon className={`h-16 w-16 mx-auto transition-colors duration-300 ${
                      dragActive ? "text-cyan-400" : cv ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-300"
                    }`} />
                    {dragActive && (
                      <div className="absolute inset-0 h-16 w-16 text-cyan-400 animate-ping opacity-50">
                        <CloudIcon className="h-16 w-16" />
                      </div>
                    )}
                  </div>
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
                      className={`inline-block px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        cv 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25" 
                        : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/25"
                      }`}
                    >
                      {cv ? `✓ ${cv.name}` : "Choose File"}
                    </label>
                  </div>
                  <p className="text-slate-400 text-sm">
                    {dragActive ? "Drop your file here" : "Supports PDF, TXT, DOCX • Drag & drop or click to browse"}
                  </p>
                </div>
              </div>
            </div>

            {/* Job Description Section */}
            <div className="mb-10">
              <label className="block text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <PaperAirplaneIcon className="h-5 w-5 text-purple-400" />
                Job Description
              </label>
              <div className="relative">
                <textarea
                  placeholder="Paste the job description here and watch the magic happen..."
                  rows={8}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-2xl p-6 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 focus:outline-none transition-all duration-300 resize-none backdrop-blur-sm"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <button
                onClick={() => callApi("cv")}
                disabled={loading}
                className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-white text-lg py-4 px-8 rounded-2xl font-bold shadow-lg shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-3">
                  {loading && whichResult === "cv" ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Crafting Your CV...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-6 w-6 group-hover:animate-pulse" />
                      Tailor My CV
                    </>
                  )}
                </div>
              </button>

              <button
                onClick={() => callApi("cover")}
                disabled={loading}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-400 hover:via-pink-400 hover:to-rose-400 text-white text-lg py-4 px-8 rounded-2xl font-bold shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-3">
                  {loading && whichResult === "cover" ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Generating Letter...
                    </>
                  ) : (
                    <>
                      <DocumentTextIcon className="h-6 w-6 group-hover:animate-pulse" />
                      Generate Cover Letter
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-4 text-cyan-400">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent"></div>
                      <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border-2 border-cyan-400 opacity-30"></div>
                    </div>
                    <span className="text-lg font-semibold animate-pulse">
                      AI is working its magic...
                    </span>
                  </div>
                </div>
              )}

              {!loading && result && (
                <div className="backdrop-blur-sm bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-shrink-0">
                      {whichResult === "cv" ? (
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                          <SparklesIcon className="h-6 w-6 text-cyan-400" />
                        </div>
                      ) : (
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <DocumentTextIcon className="h-6 w-6 text-purple-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-200">
                      {whichResult === "cv" ? "Your Tailored CV" : "Your Cover Letter"}
                    </h3>
                    <div className="flex-1"></div>
                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full">
                      ✓ Ready
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
                    <pre className="whitespace-pre-wrap text-slate-300 font-mono text-sm leading-relaxed overflow-x-auto">
                      {result}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 space-y-4">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1"></div>
              <span className="px-4 text-sm">Crafted with AI Excellence</span>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1"></div>
            </div>
            <p className="text-sm text-slate-600">
              &copy; {new Date().getFullYear()} JobCraft AI • Powered by Next.js & OpenAI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}