import React, { useState } from 'react';
import { FollowUpTemplate, PatientOutcome } from './types';
import { DEFAULT_TEMPLATES } from './constants';
import { Copy, Check, Search, X, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatient?: PatientOutcome;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ isOpen, onClose, selectedPatient }) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = DEFAULT_TEMPLATES.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.content.toLowerCase().includes(search.toLowerCase())
  );

  const replacePlaceholders = (content: string) => {
    if (!selectedPatient) return content;
    return content
      .replace(/\[Patient Name\]/g, selectedPatient.patientName)
      .replace(/\[Doctor Name\]/g, selectedPatient.doctor)
      .replace(/\[Date\]/g, format(new Date(selectedPatient.date), 'dd MMM yyyy'));
  };

  const handleCopy = (template: FollowUpTemplate) => {
    const text = replacePlaceholders(template.content);
    navigator.clipboard.writeText(text);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-clinic-blue text-white">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Template Library
            </h2>
            {selectedPatient && (
              <p className="text-blue-50 text-xs mt-1">
                Personalizing for: <span className="font-semibold">{selectedPatient.patientName}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-teal/20 focus:border-clinic-teal outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="border border-slate-100 rounded-xl p-4 hover:border-clinic-teal/30 transition-all bg-slate-50/50 group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{template.title}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    template.category === 'Consult Only' ? 'bg-amber-100 text-amber-700' :
                    template.category === 'No Show' ? 'bg-rose-100 text-rose-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {template.category}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(template)}
                  className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-medium ${
                    copiedId === template.id 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-clinic-teal hover:text-clinic-teal'
                  }`}
                >
                  {copiedId === template.id ? (
                    <><Check className="w-3 h-3" /> Copied</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy Text</>
                  )}
                </button>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "{replacePlaceholders(template.content)}"
              </p>
            </div>
          ))}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No templates found matching your search.
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
            Click "Copy Text" to copy the personalized message to your clipboard
          </p>
        </div>
      </div>
    </div>
  );
};
