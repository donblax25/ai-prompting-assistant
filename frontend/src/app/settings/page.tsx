import React from 'react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Workspace Settings</h1>
      
      <div className="glass-panel p-6 rounded-xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold border-b border-border-subtle pb-2 mb-4">General</h2>
          <label className="block text-sm font-medium text-text-muted mb-1">Workspace Name</label>
          <input type="text" className="input-base max-w-md" defaultValue="My Workspace" />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold border-b border-border-subtle pb-2 mb-4">API Keys</h2>
          <p className="text-sm text-text-muted mb-4">Configure external model providers for execution.</p>
          <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-text-muted mb-1">OpenAI API Key (Creative Reasoning)</label>
               <input type="password" placeholder="sk-..." className="input-base max-w-md" />
             </div>
             <div>
               <label className="block text-sm font-medium text-text-muted mb-1">Anthropic API Key (Faster Reasoning)</label>
               <input type="password" placeholder="sk-ant-..." className="input-base max-w-md" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
