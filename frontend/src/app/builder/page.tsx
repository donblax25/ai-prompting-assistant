"use client";

import React, { useState, useEffect } from 'react';
import { Settings2, ScanSearch, CheckCircle2, ChevronDown, ChevronRight, Copy, Play, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BuilderPage() {
  const [templateName, setTemplateName] = useState('Untitled Prompt');
  const [templateDesc, setTemplateDesc] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const [blocks, setBlocks] = useState({
    role: '',
    task: '',
    context: '',
    constraints: '',
    output_format: ''
  });

  const [expanded, setExpanded] = useState({
    role: true,
    task: true,
    context: true,
    constraints: true,
    output_format: true
  });

  const [scoreData, setScoreData] = useState<{ scores: any, suggestions: string[] } | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const toggleAccordion = (key: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [activeField, setActiveField] = useState<string | null>(null);

  // Debounced autocomplete fetcher
  useEffect(() => {
    if (!activeField) return;
    const text = blocks[activeField as keyof typeof blocks];
    if (text.trim().length < 10) {
       setSuggestions(prev => ({ ...prev, [activeField]: '' }));
       return;
    }
    
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/prompts/autocomplete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ block_type: activeField, current_text: text })
        });
        const data = await res.json();
        if (data.success && data.data.suggestion) {
          setSuggestions(prev => ({ ...prev, [activeField]: data.data.suggestion }));
        } else {
          setSuggestions(prev => ({ ...prev, [activeField]: '' }));
        }
      } catch (err) {
        console.error(err);
      }
    }, 800);

    return () => clearTimeout(delayDebounce);
  }, [blocks, activeField]);

  const handleTextChange = (key: keyof typeof blocks, val: string) => {
    setBlocks(prev => ({ ...prev, [key]: val }));
    setSuggestions(prev => ({ ...prev, [key]: '' })); // Clear suggestion on type
  };

  const acceptSuggestion = (key: keyof typeof blocks) => {
    if (suggestions[key]) {
       setBlocks(prev => ({ ...prev, [key]: prev[key] + (prev[key].endsWith(' ') ? '' : ' ') + suggestions[key] }));
       setSuggestions(prev => ({ ...prev, [key]: '' }));
    }
  };

  const compiledPrompt = `
${blocks.role ? `### Role\n${blocks.role}\n` : ''}
${blocks.task ? `### Task\n${blocks.task}\n` : ''}
${blocks.context ? `### Context\n${blocks.context}\n` : ''}
${blocks.constraints ? `### Constraints\n${blocks.constraints}\n` : ''}
${blocks.output_format ? `### Output Format\n${blocks.output_format}\n` : ''}
  `.trim();

  const handleScore = async () => {
    if (!compiledPrompt) return;
    setIsScoring(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/prompts/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_text: compiledPrompt })
      });
      const data = await res.json();
      if (data.success) {
        setScoreData(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setIsScoring(false);
  };

  const handleAutoFix = async () => {
    if (!compiledPrompt) return;
    setIsFixing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/prompts/auto-fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_prompt: compiledPrompt })
      });
      const data = await res.json();
      if (data.success && data.data.blocks) {
        setBlocks(data.data.blocks);
        setScoreData(null); // Reset score since prompt changed
      }
    } catch (err) {
      console.error(err);
    }
    setIsFixing(false);
  };

  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [previewTab, setPreviewTab] = useState<'prompt' | 'response'>('prompt');

  const handleExecute = async () => {
    if (!compiledPrompt) return;
    setIsExecuting(true);
    setPreviewTab('response'); // auto switch tab
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/prompts/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_text: compiledPrompt })
      });
      const data = await res.json();
      if (data.success) {
        setAiResponse(data.data.response);
        // Log to history
        const historyItem = {
          id: Date.now().toString(),
          prompt: compiledPrompt,
          response: data.data.response,
          timestamp: new Date().toISOString()
        };
        const prevHistory = localStorage.getItem('prompt_history');
        const historyList = prevHistory ? JSON.parse(prevHistory) : [];
        localStorage.setItem('prompt_history', JSON.stringify([historyItem, ...historyList]));
      } else {
        setAiResponse("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      setAiResponse("Failed to connect to backend server.");
    }
    setIsExecuting(false);
  };

  const handleSaveTemplate = () => {
    const tmpl = {
      id: Date.now().toString(),
      name: templateName || 'Untitled Prompt',
      description: templateDesc,
      compiledPrompt: compiledPrompt
    };
    const prev = localStorage.getItem('prompt_templates');
    const existing = prev ? JSON.parse(prev) : [];
    localStorage.setItem('prompt_templates', JSON.stringify([...existing, tmpl]));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  let totalScore = 0;
  if (scoreData) {
      const s = scoreData.scores;
      totalScore = ((s.role || 0) + (s.task || 0) + (s.context || 0) + (s.constraints || 0)) * 2.5; // Out of 100
  }

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden">
      {/* Left Column: Editor */}
      <div className="flex-1 flex flex-col lg:h-full bg-bg-base overflow-y-auto w-full max-w-4xl mx-auto p-4 lg:p-6">
        
        {/* Template Header */}
        <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <input 
              type="text" 
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Untitled Prompt" 
              className="text-2xl lg:text-3xl font-bold bg-transparent border-none text-text-base focus:outline-none focus:ring-0 placeholder-text-muted mb-2 w-full"
            />
            <input 
              type="text" 
              value={templateDesc}
              onChange={(e) => setTemplateDesc(e.target.value)}
              placeholder="Add a description for this template..."
              className="text-sm lg:text-base text-text-muted bg-transparent border-none focus:outline-none focus:ring-0 w-full"
            />
          </div>
          <button onClick={handleSaveTemplate} className="btn-secondary whitespace-nowrap">
            {isSaved ? "Saved!" : "Save Template"}
          </button>
        </div>

        {/* RTCCO Accordions */}
        <div className="space-y-3 lg:space-y-4 mb-8 lg:mb-0">
          {[
            { key: 'role', label: 'Role', desc: 'Who is the AI acting as?' },
            { key: 'task', label: 'Task', desc: 'What is the core objective?' },
            { key: 'context', label: 'Context', desc: 'Background information or variables (use {{var}})' },
            { key: 'constraints', label: 'Constraints', desc: 'Strict rules the AI must follow.' },
            { key: 'output_format', label: 'Output Format', desc: 'How should the response be formatted?' }
          ].map((section) => {
            const k = section.key as keyof typeof blocks;
            const isExp = expanded[k];
            const hasContent = blocks[k]?.trim().length > 0;
            
            return (
              <div key={section.key} className="glass-panel rounded-xl overflow-hidden transition-all">
                <button 
                  onClick={() => toggleAccordion(k)}
                  className="w-full flex items-center justify-between p-3 lg:p-4 hover:bg-bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 lg:gap-3">
                    {isExp ? <ChevronDown size={18} className="text-text-muted" /> : <ChevronRight size={18} className="text-text-muted" />}
                    <div className="flex flex-col items-start text-left">
                      <span className="font-semibold text-text-base flex items-center gap-2 text-sm lg:text-base">
                        {section.label}
                        {hasContent && !isExp && <CheckCircle2 size={14} className="text-brand-500" />}
                      </span>
                      <span className="text-xs text-text-muted hidden sm:inline-block">{section.desc}</span>
                    </div>
                  </div>
                </button>
                
                {isExp && (
                  <div className="p-3 lg:p-4 pt-0 border-t border-border-subtle/50 bg-bg-accent/20 relative">
                    <textarea 
                      value={blocks[k] || ''}
                      onChange={(e) => handleTextChange(k, e.target.value)}
                      onFocus={() => setActiveField(k)}
                      onBlur={() => setTimeout(() => setActiveField(null), 200)}
                      onKeyDown={(e) => {
                         if (e.key === 'Tab' && suggestions[k]) {
                           e.preventDefault();
                           acceptSuggestion(k);
                         }
                      }}
                      placeholder={`Enter ${section.label.toLowerCase()} here...`}
                      className="w-full min-h-[100px] bg-transparent resize-y text-sm text-text-base focus:outline-none py-2 lg:py-3 z-10 relative"
                    />
                    {/* Ghost Text Overlay */}
                    {activeField === k && suggestions[k] && (
                       <div 
                         className="absolute top-0 left-0 w-full h-full p-3 lg:p-4 pt-0 pointer-events-none overflow-hidden" 
                         style={{ paddingTop: '12px' }} /* Align roughly with textarea padding */
                       >
                         <span className="text-sm font-mono opacity-0 whitespace-pre-wrap">{blocks[k]}</span>
                         <span className="text-sm font-mono text-brand-500/50 whitespace-pre-wrap ml-1">{suggestions[k]} (Tab to accept)</span>
                       </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Column: Preview & Engine */}
      <div className="w-full lg:w-[400px] bg-bg-elevated border-t lg:border-t-0 lg:border-l border-border-subtle flex flex-col lg:h-full shrink-0">
        
        {/* Score Card */}
        <div className="p-4 lg:p-6 border-b border-border-subtle">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-semibold flex items-center gap-2 text-sm lg:text-base">
               <ScanSearch size={18} className="text-brand-400" />
               Optimization Engine
             </h3>
             <button onClick={handleScore} disabled={isScoring} className="text-xs bg-brand-500/10 text-brand-400 px-2 py-1 rounded font-medium hover:bg-brand-500/20 transition-colors disabled:opacity-50 flex items-center gap-1">
               {isScoring && <Loader2 size={12} className="animate-spin" />} Analyze
             </button>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 lg:w-16 lg:h-16 rounded-full border-4 border-border-subtle flex items-center justify-center shrink-0">
                 <span className="text-lg lg:text-xl font-bold">{scoreData ? totalScore : '--'}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Clarity Score</p>
                <p className="text-xs text-text-muted mt-1 hidden sm:block">
                   {scoreData ? "AI evaluation complete." : "Click Analyze to evaluate prompt formatting."}
                </p>
              </div>
           </div>
           
           {scoreData && scoreData.suggestions && scoreData.suggestions.length > 0 && (
               <div className="mt-4 p-3 bg-brand-500/10 rounded-md border border-brand-500/20">
                   <h4 className="text-xs font-semibold text-brand-400 mb-2 uppercase tracking-wide">Suggestions</h4>
                   <ul className="text-xs text-text-base space-y-1 list-disc pl-4">
                       {scoreData.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                   </ul>
                   <button onClick={handleAutoFix} disabled={isFixing} className="mt-3 w-full btn-primary text-xs py-1.5 flex justify-center items-center gap-2">
                       {isFixing && <Loader2 size={12} className="animate-spin" />} ✨ Auto-Fix Prompt
                   </button>
               </div>
           )}
        </div>

        {/* Live Preview */}
        <div className="flex-1 flex flex-col p-4 lg:p-6 min-h-[300px] lg:min-h-0 overflow-y-auto">
           <div className="flex items-center gap-4 mb-4 border-b border-border-subtle pb-2">
             <button 
                onClick={() => setPreviewTab('prompt')}
                className={cn("text-xs font-semibold uppercase tracking-wider pb-2 border-b-2 -mb-[9px] transition-colors", previewTab === 'prompt' ? "text-brand-400 border-brand-400" : "text-text-muted border-transparent hover:text-text-base")}
             >
                Compiled Prompt
             </button>
             <button 
                onClick={() => setPreviewTab('response')}
                className={cn("text-xs font-semibold uppercase tracking-wider pb-2 border-b-2 -mb-[9px] transition-colors", previewTab === 'response' ? "text-brand-400 border-brand-400" : "text-text-muted border-transparent hover:text-text-base")}
             >
                AI Response
             </button>
           </div>
           
           <div className="flex-1 bg-bg-base border border-border-subtle rounded-lg p-3 lg:p-4 font-mono text-xs whitespace-pre-wrap overflow-y-auto relative h-[250px] lg:h-auto">
             {previewTab === 'prompt' && (
                <span className="text-text-muted">{compiledPrompt || "Your compiled prompt will appear here once you start typing."}</span>
             )}
             {previewTab === 'response' && (
                <span className="text-text-base">
                   {isExecuting ? (
                       <span className="flex items-center gap-2 text-brand-400"><Loader2 size={14} className="animate-spin" /> Generating response...</span>
                   ) : aiResponse ? (
                       aiResponse
                   ) : (
                       <span className="text-text-muted">Click "Run Test" to execute the prompt and see the AI response here.</span>
                   )}
                </span>
             )}
           </div>
        </div>
        
        {/* Action Bar */}
        <div className="p-4 lg:p-6 border-t border-border-subtle grid grid-cols-2 gap-3 bg-bg-base/50 mt-auto">
           <button className="btn-secondary flex items-center justify-center gap-2 text-sm py-2 lg:py-1.5" onClick={() => navigator.clipboard.writeText(compiledPrompt)}>
             <Copy size={16} /> Copy
           </button>
           <button onClick={handleExecute} disabled={isExecuting || !compiledPrompt} className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 text-sm py-2 lg:py-1.5">
             {isExecuting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />} 
             {isExecuting ? "Running..." : "Run Test"}
           </button>
        </div>

      </div>
    </div>
  );
}
