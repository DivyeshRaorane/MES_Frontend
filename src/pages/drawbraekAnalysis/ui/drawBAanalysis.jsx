import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';

const { 
  ChevronDown, 
  Send, 
  Edit, 
  RefreshCcw, 
  Home,
  Sparkles,
  Loader2,
  AlertCircle
} = Lucide;

import FormField from '../../../components/formInputs';

// API Configuration
const apiKey = ""; // Provided by environment



const DrawBrakAnalysis=()=> {
  const [formData, setFormData] = useState({
    fiberId: '',
    breakLen: '',
    tension: '',
    mainBreakType: '',
    subReason: '',
    remark: ''
  });
  
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const pendingIds = [
    "TEFC21081044", "TEF322227062", "TEF522026022", "TEFB22119021", "TEF223134096", "TEF423278081", "TEF423277100", "TEF423289023", "TEF523361010",
    "TEF523388022", "TEF523127081", "TEF523349072", "TEF523349073", "TEF523323108", "TEF523329091", "TA2A22125052", "TA2A22127053", "TEF423006072",
    "TEF623020250", "TEF623248040", "TEF623032050", "TA2A22136105", "TEF623046062", "TEF623490030", "TEF723007040", "TEF423074022", "TEF423028010"
  ];

  // --- Gemini API Call for Break Analysis ---
  const performAiAnalysis = async () => {
    if (!formData.mainBreakType && !formData.remark) {
      return;
    }

    setIsAnalyzing(true);
    let retries = 0;
    const maxRetries = 5;

    const runQuery = async () => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `As a fiber optics manufacturing expert, analyze this Draw Break report:
                Fiber ID: ${formData.fiberId}
                Break Length: ${formData.breakLen}
                Tension: ${formData.tension}
                Main Break Type: ${formData.mainBreakType}
                Remark: ${formData.remark}
                
                Provide a JSON response with:
                1. "diagnosis": Short technical summary.
                2. "suggestion": Actionable step to reduce these breaks.
                3. "severity": (Low/Medium/High)`
              }]
            }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (!response.ok) throw new Error('API failed');
        const data = await response.json();
        const result = JSON.parse(data.candidates[0].content.parts[0].text);
        setAiAnalysis(result);
      } catch (error) {
        if (retries < maxRetries) {
          retries++;
          const delay = Math.pow(2, retries) * 1000;
          setTimeout(runQuery, delay);
        } else {
          setAiAnalysis({ diagnosis: "Failed to connect to AI engine.", suggestion: "Please check your network and try again.", severity: "N/A" });
        }
      } finally {
        setIsAnalyzing(false);
      }
    };

    runQuery();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
      {/* Header Area */}
      <div className="bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm rounded-t-lg">
        <h1 className="text-sm font-black text-blue-900 uppercase tracking-wider">
          Draw Break Analysis
        </h1>
        <div className="flex gap-2">
          <button className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-3 py-1 rounded transition-colors">Submit</button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded transition-colors">Modify</button>
          <button className="bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded transition-colors">Reset</button>
          <button className="bg-rose-700 hover:bg-rose-800 text-white text-[10px] font-bold px-3 py-1 rounded transition-colors">Home</button>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="bg-white p-4 shadow-sm border-x border-b rounded-b-lg mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3 mb-6">
          <FormField label="Fiber ID" value={formData.fiberId} onChange={handleInputChange('fiberId')} />
          <FormField label="DT No." />
          <FormField label="Break Len" value={formData.breakLen} onChange={handleInputChange('breakLen')} />
          <FormField label="CM Len" />
          <FormField label="Power" />
          <FormField label="Draw Seq." />
          <FormField label="Tension" value={formData.tension} onChange={handleInputChange('tension')} />
          <FormField label="Break Type" />
          <FormField label="Category" />
          <FormField label="Remark" value={formData.remark} onChange={handleInputChange('remark')} />
          <FormField label="Brk Collected By" />
          <FormField label="Fiber Passed By" />
          <FormField label="Perform Loaded By" />
          <FormField label="Line Started From" />
          <FormField label="Entry Done By" />
        </div>

        <hr className="my-4 border-slate-100" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
          <FormField label="Main Break Type" type="select" options={["Particle", "Neckdown", "Cladding", "Surface"]} value={formData.mainBreakType} onChange={handleInputChange('mainBreakType')} />
          <FormField label="Sub Reason" type="select" options={["Internal Bubble", "External Scratch"]} />
          <FormField label="Next Sub Reason" type="select" options={["N-Sub 1", "N-Sub 2"]} />
          <FormField label="Dist From Periphery" />
          <FormField label="Particle Size" />
          <FormField label="Flaw Size" />
          <FormField label="BSA Remark" />
          <FormField label="BSA Done By" type="select" options={["N-Sub 1", "N-Sub 2"]}/>
        </div>

        {/* AI Analysis Section */}
       {/* <div className="mt-6 border-t pt-4">
          {!aiAnalysis && !isAnalyzing ? (
            <button 
              onClick={performAiAnalysis}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
            >
              <Sparkles size={14} />
              ✨ Run AI Diagnostic Analysis
            </button>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-blue-700 text-xs font-bold">
                  <Sparkles size={14} />
                  AI DIAGNOSTIC REPORT
                </div>
                <button onClick={() => setAiAnalysis(null)} className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase">Clear</button>
              </div>
              
              {isAnalyzing ? (
                <div className="flex items-center gap-3 py-2 text-blue-600 text-xs italic">
                  <Loader2 size={16} className="animate-spin" />
                  Gemini is analyzing the draw break pattern...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Diagnosis</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{aiAnalysis?.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Recommended Action</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{aiAnalysis?.suggestion}</p>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                      aiAnalysis?.severity === 'High' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      Priority: {aiAnalysis?.severity}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>*/}
      </div>

      {/* Footer Section: BSA Pending IDs */}
      <div className="bg-white p-4 shadow-sm border rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3 border-b pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-blue-600 uppercase">BSA Pending ID's</h2>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
              {pendingIds.length}
            </span>
          </div>

          <div className="relative max-w-xs w-full">
            <input 
              type="text" 
              placeholder="✨ Describe IDs..." 
              className="w-full text-[10px] border border-slate-200 rounded-full pl-8 pr-4 py-1.5 focus:border-indigo-400 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Sparkles className="absolute left-2.5 top-1.5 text-indigo-400" size={12} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-1">
          {pendingIds.map((id, index) => (
            <div 
              key={index} 
              className={`cursor-pointer text-[10px] font-medium py-1 px-2 rounded border text-center transition-all truncate ${
                searchQuery && id.toLowerCase().includes(searchQuery.toLowerCase())
                ? "bg-indigo-600 text-white border-indigo-700 scale-105 z-10 shadow-md"
                : "bg-slate-100 text-rose-600 border-slate-200 hover:bg-slate-200"
              }`}
              title={id}
            >
              {id}
            </div>
          ))}
        </div>
      </div>
      
      
    </div>
  );
}

export default DrawBrakAnalysis