"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Code, Copy } from 'lucide-react';

interface HistoryItem {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('prompt_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Prompt History</h1>
        <p className="text-text-muted mt-1">Execution logs and past generations across your workspaces.</p>
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-xl text-text-muted p-12 text-center">
          <MessageSquare size={48} className="mb-4 opacity-20" />
          <p>No execution history found.</p>
          <p className="text-sm">Run a test in the Prompt Builder to see it logged here.</p>
        </div>
      ) : (
        <div className="space-y-6 pb-8">
          {history.map(item => (
            <div key={item.id} className="glass-panel p-5 rounded-xl border border-border-subtle">
              <div className="flex items-center gap-2 text-text-muted text-xs mb-4">
                <Calendar size={14} />
                {new Date(item.timestamp).toLocaleString()}
                <span className="ml-auto inline-flex items-center gap-1 bg-bg-accent/50 px-2 py-0.5 rounded text-brand-400">
                   <Code size={12} /> Execution
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Prompt Sent</h4>
                    <div className="bg-bg-base/50 p-3 rounded-lg border border-border-subtle overflow-y-auto max-h-48 relative group">
                        <pre className="text-xs font-mono whitespace-pre-wrap">{item.prompt}</pre>
                        <button onClick={() => navigator.clipboard.writeText(item.prompt)} className="absolute top-2 right-2 p-1.5 bg-bg-elevated border border-border-subtle rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy size={12} />
                        </button>
                    </div>
                 </div>
                 <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-400 mb-2">AI Response</h4>
                    <div className="bg-bg-base/50 p-3 rounded-lg border border-border-subtle overflow-y-auto max-h-48 relative group">
                        <pre className="text-xs font-mono whitespace-pre-wrap">{item.response}</pre>
                        <button onClick={() => navigator.clipboard.writeText(item.response)} className="absolute top-2 right-2 p-1.5 bg-bg-elevated border border-border-subtle rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy size={12} />
                        </button>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
