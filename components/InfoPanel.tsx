import React from 'react';
import ReactMarkdown from 'react-markdown';
import { SelectionSummary } from '../types';
import { Loader } from './Loader';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

interface InfoPanelProps {
  data: SelectionSummary | null;
  onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:top-0 md:right-0 md:left-auto md:bottom-0 md:w-96 bg-brandDeep/95 backdrop-blur-xl border-t md:border-l border-brandDarkRed/40 shadow-2xl z-50 transition-transform duration-300 ease-in-out p-6 overflow-y-auto max-h-[60vh] md:max-h-screen flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          {data.type === 'activity' && (
            <span className="block text-brandRed font-bold text-xs tracking-widest uppercase mb-1">{data.subtitle || 'Campaign Activity'}</span>
          )}
          <h2 className="text-3xl md:text-4xl font-heading tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-brandRed to-brandLightRed drop-shadow-sm leading-none">
            {data.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 ml-4 bg-brandBlack/50 hover:bg-brandRed border border-brandGrey/30 hover:border-transparent rounded-full transition-colors text-brandGrey hover:text-brandBlack flex-shrink-0"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Stats Grid */}
      {data.stats && data.stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {data.stats.map((stat, idx) => (
            <div key={idx} className="bg-brandBlack/20 p-3 rounded-lg border border-brandWhite/10 hover:border-brandRed/30 transition-colors">
              <div className="text-[10px] uppercase tracking-wider text-brandGrey mb-1 font-bold opacity-70">{stat.label}</div>
              <div className={`text-lg font-heading leading-tight ${stat.className || 'text-brandCream'}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="prose prose-invert prose-sm font-sans flex-grow">
        {data.loading && !data.content ? (
          <div className="mt-10 flex flex-col items-center justify-center space-y-4 text-brandLightRed/70">
            <Loader />
            <p className="font-semibold tracking-wide text-xs uppercase">Consulting Gemini...</p>
          </div>
        ) : (
          <div className="leading-relaxed text-brandCream">
            <ReactMarkdown
              components={{
                strong: ({ node, ...props }) => <span className="text-brandLightRed font-bold" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2 my-4 text-brandCream/90" {...props} />,
                li: ({ node, ...props }) => <li className="pl-1 marker:text-brandRed" {...props} />,
                h1: ({ node, ...props }) => <h3 className="text-xl font-heading text-brandRed mt-4 mb-2" {...props} />,
                h2: ({ node, ...props }) => <h4 className="text-lg font-bold text-brandLightRed mt-4 mb-2" {...props} />,
                h3: ({ node, ...props }) => <h5 className="text-base font-bold text-brandCream mt-3 mb-1" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-brandRed pl-4 italic text-brandGrey my-4" {...props} />,
              }}
            >
              {data.content}
            </ReactMarkdown>
            {data.loading && <span className="inline-block ml-2"><Loader /></span>}
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-brandGrey/20 text-xs text-brandGrey flex justify-between font-mono">
        <span>Powered by JUST RIGHTS FOR CHILDREN</span>
        <span>{data.type === 'country' ? `ID: ${data.id}` : 'Campaign Update'}</span>
      </div>
    </div>
  );
};