"use client";

import React, { useState } from 'react';
import { Play, Loader2, GitMerge } from 'lucide-react';

export default function SplitTestPage() {
  const [variantA, setVariantA] = useState('Act as a pirate. Explain quantum computing.');
  const [variantB, setVariantB] = useState('Act as a university professor. Explain quantum computing.');
  
  const [responseA, setResponseA] = useState<string | null>(null);
  const [responseB, setResponseB] = useState<string | null>(null);
  
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async () => {
    if (!variantA || !variantB) return;
    setIsRunning(true);
    setResponseA(null);
    setResponseB(null);

    const execute = async (promptText: string) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/prompts/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt_text: promptText })
        });
        const data = await res.json();
        return data.success ? data.data.response : `Error: ${data.error}`;
      } catch (err) {
        return "Failed to connect to backend.";
      }
    };

    const [resA, resB] = await Promise.all([execute(variantA), execute(variantB)]);
    
    setResponseA(resA);
    setResponseB(resB);
    setIsRunning(false);
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">A/B Testing</h1>
          <p className="text-text-muted mt-1">Compare prompt variants side-by-side using real data.</p>
        </div>
        <button onClick={runTest} disabled={isRunning} className="btn-primary flex items-center gap-2 px-6">
          {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
          {isRunning ? "Running..." : "Run Split Test"}
        </button>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
        {/* VARIANT A */}
        <div className="flex flex-col gap-4">
          <div className="glass-panel p-4 rounded-xl flex flex-col">
            <h3 className="font-bold text-brand-400 mb-3 flex items-center gap-2">
               <span className="bg-brand-500/20 px-2 py-0.5 rounded text-xs">Variant A</span>
            </h3>
            <textarea 
               value={variantA}
               onChange={(e) => setVariantA(e.target.value)}
               className="w-full h-32 bg-bg-base border border-border-subtle rounded-lg p-3 text-sm focus:outline-none resize-none"
               placeholder="Enter first prompt variant..."
            />
          </div>
          
          <div className="glass-panel p-4 rounded-xl flex-1 flex flex-col min-h-[300px]">
             <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">AI Response A</h4>
             <div className="flex-1 bg-bg-base/50 rounded-lg border border-border-subtle p-4 overflow-y-auto">
                {isRunning ? (
                    <div className="flex items-center gap-2 text-brand-400 text-sm"><Loader2 size={14} className="animate-spin" /> Generating response...</div>
                ) : responseA ? (
                    <pre className="text-sm font-mono whitespace-pre-wrap text-text-base">{responseA}</pre>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                        <GitMerge size={32} className="mb-2" />
                        <p className="text-sm">Awaiting execution...</p>
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* VARIANT B */}
        <div className="flex flex-col gap-4">
          <div className="glass-panel p-4 rounded-xl flex flex-col">
            <h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
               <span className="bg-yellow-500/20 px-2 py-0.5 rounded text-xs text-yellow-400">Variant B</span>
            </h3>
            <textarea 
               value={variantB}
               onChange={(e) => setVariantB(e.target.value)}
               className="w-full h-32 bg-bg-base border border-border-subtle rounded-lg p-3 text-sm focus:outline-none resize-none"
               placeholder="Enter second prompt variant..."
            />
          </div>
          
          <div className="glass-panel p-4 rounded-xl flex-1 flex flex-col min-h-[300px]">
             <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">AI Response B</h4>
             <div className="flex-1 bg-bg-base/50 rounded-lg border border-border-subtle p-4 overflow-y-auto">
                {isRunning ? (
                    <div className="flex items-center gap-2 text-yellow-400 text-sm"><Loader2 size={14} className="animate-spin" /> Generating response...</div>
                ) : responseB ? (
                    <pre className="text-sm font-mono whitespace-pre-wrap text-text-base">{responseB}</pre>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                        <GitMerge size={32} className="mb-2" />
                        <p className="text-sm">Awaiting execution...</p>
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
