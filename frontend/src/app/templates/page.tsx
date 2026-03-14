"use client";

import React, { useState, useEffect } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  compiledPrompt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('prompt_templates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  }, []);

  const saveTemplates = (newTemplates: Template[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('prompt_templates', JSON.stringify(newTemplates));
  };

  const addTemplate = () => {
    const newTemplates = [...templates, {
      id: Date.now().toString(),
      name: 'New Template',
      description: 'Description here...',
      compiledPrompt: '### Role\n\n### Task\n\n### Context\n\n### Constraints\n\n### Output Format\n'
    }];
    saveTemplates(newTemplates);
  };

  const deleteTemplate = (id: string) => {
    saveTemplates(templates.filter(t => t.id !== id));
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Template Library</h1>
          <p className="text-text-muted mt-1">Discover, save, and manage your reusable prompts.</p>
        </div>
        <button onClick={addTemplate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Template
        </button>
      </div>
      
      {templates.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-xl text-text-muted">
          <p>No templates created yet. Click "New Template" to start.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
          {templates.map(tmpl => (
            <div key={tmpl.id} className="glass-panel p-5 rounded-xl flex flex-col h-64">
              <h3 className="font-bold text-lg text-text-base mb-1">{tmpl.name}</h3>
              <p className="text-sm text-text-muted mb-4 line-clamp-2">{tmpl.description}</p>
              
              <div className="flex-1 bg-bg-base/50 p-3 rounded-lg border border-border-subtle overflow-hidden relative group">
                  <pre className="text-xs text-text-base font-mono whitespace-pre-wrap truncate">
                      {tmpl.compiledPrompt}
                  </pre>
              </div>

              <div className="flex items-center justify-between mt-4">
                 <button onClick={() => deleteTemplate(tmpl.id)} className="p-2 text-text-muted hover:text-red-400 bg-bg-base rounded-md border border-border-subtle transition-colors">
                    <Trash2 size={16} />
                 </button>
                 <button onClick={() => navigator.clipboard.writeText(tmpl.compiledPrompt)} className="btn-secondary flex items-center gap-2 text-xs py-1.5 px-3">
                    <Copy size={14} /> Copy Prompt
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
