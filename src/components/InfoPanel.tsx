import React from 'react';
import ReactMarkdown from 'react-markdown';
import { SelectionSummary } from '../types';
import { Loader } from './Loader';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

const JustRightsLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 451.57 320.72" className="h-[60px] w-auto inline-block align-middle ml-2">
    <path fill="#cf3035" d="M.45 284.12h50.82v36.6H.45zM432.1 284.12h18.35v36.6H432.1z" />
    <path fill="#01164d" d="M48.66 2.79v88.89c0 13.31-.14 21.87-.41 25.67-.27 3.81-1.53 7.24-3.75 10.31-2.23 3.07-5.24 5.19-9.05 6.37-3.8 1.18-9.54 1.77-17.2 1.77H.93v-23.25c2.08.16 3.59.25 4.52.25 2.46 0 4.41-.6 5.83-1.81 1.42-1.2 2.24-2.68 2.46-4.44.22-1.75.33-5.15.33-10.19V2.79h34.59ZM140.67 2.79v88.89c0 10.08-.33 17.16-.99 21.24-.66 4.08-2.6 8.27-5.83 12.57-3.23 4.3-7.49 7.56-12.77 9.78-5.29 2.22-11.52 3.33-18.69 3.33-7.94 0-14.95-1.31-21.03-3.94-6.08-2.63-10.63-6.05-13.64-10.27-3.01-4.22-4.79-8.67-5.34-13.35-.55-4.68-.82-14.53-.82-29.53V2.79h34.59v99.73c0 5.81.31 9.52.94 11.13.63 1.62 1.9 2.42 3.82 2.42 2.19 0 3.6-.89 4.23-2.67.63-1.78.94-5.98.94-12.61V2.79h34.59ZM227.34 43.05h-32.12v-9.86c0-4.6-.41-7.53-1.23-8.79-.82-1.26-2.19-1.89-4.11-1.89-2.08 0-3.66.85-4.72 2.55s-1.6 4.27-1.6 7.73c0 4.44.6 7.78 1.8 10.03 1.15 2.25 4.4 4.96 9.77 8.13 15.4 9.14 25.09 16.64 29.09 22.5 4 5.86 6 15.31 6 28.34 0 9.48-1.11 16.46-3.33 20.95-2.22 4.49-6.5 8.26-12.86 11.3-6.35 3.04-13.75 4.56-22.18 4.56-9.26 0-17.16-1.75-23.7-5.26-6.55-3.5-10.83-7.97-12.86-13.39-2.03-5.42-3.04-13.12-3.04-23.08v-8.71h32.12v16.18c0 4.98.45 8.19 1.36 9.61.9 1.42 2.51 2.14 4.81 2.14s4.01-.9 5.13-2.71c1.12-1.81 1.68-4.49 1.68-8.05 0-7.83-1.07-12.95-3.2-15.36-2.19-2.41-7.59-6.43-16.18-12.08-8.6-5.7-14.29-9.83-17.09-12.4-2.79-2.57-5.11-6.13-6.94-10.68-1.84-4.55-2.75-10.35-2.75-17.42 0-10.19 1.3-17.63 3.9-22.35 2.6-4.71 6.8-8.39 12.61-11.05 5.8-2.66 12.82-3.98 21.03-3.98 8.98 0 16.64 1.45 22.96 4.35 6.33 2.9 10.52 6.56 12.57 10.97 2.05 4.41 3.08 11.9 3.08 22.47v5.26ZM310.73 2.79v26.62h-20.54v106.39h-34.59V29.41h-20.46V2.79h75.58ZM0 141.3h23.29c15.52 0 26.03.6 31.53 1.8 5.5 1.2 9.98 4.26 13.44 9.18 3.46 4.92 5.2 12.78 5.2 23.56 0 9.85-1.22 16.46-3.67 19.85-2.45 3.39-7.27 5.42-14.46 6.09 6.51 1.62 10.89 3.78 13.13 6.49 2.24 2.71 3.63 5.2 4.18 7.46.55 2.27.82 8.51.82 18.72v33.37H42.9v-42.04c0-6.77-.53-10.97-1.6-12.58-1.07-1.61-3.87-2.42-8.4-2.42v57.04H0v-126.51Zm32.9 21.65v28.13c3.7 0 6.29-.51 7.78-1.52s2.23-4.31 2.23-9.88v-6.96c0-4.01-.72-6.64-2.15-7.89-1.43-1.25-4.05-1.88-7.85-1.88ZM118.29 141.3v126.51h-32.9V141.3h32.9ZM206.18 187.88h-32.9v-11.49c0-7.24-.31-11.77-.94-13.6-.62-1.82-2.11-2.74-4.45-2.74-2.03 0-3.41.78-4.14 2.34-.73 1.56-1.09 5.57-1.09 12.03v60.72c0 5.68.36 9.42 1.09 11.21.73 1.8 2.19 2.7 4.38 2.7 2.4 0 4.02-1.02 4.88-3.05.86-2.03 1.29-5.99 1.29-11.88v-15h-6.64v-19.22h38.52v67.91h-20.67l-3.04-9.06c-2.24 3.91-5.07 6.84-8.48 8.79-3.42 1.95-7.44 2.93-12.08 2.93-5.53 0-10.7-1.34-15.52-4.02-4.82-2.68-8.48-6-10.99-9.96-2.5-3.96-4.07-8.11-4.69-12.46-.62-4.35-.94-10.87-.94-19.57v-37.59c0-12.08.65-20.86 1.95-26.33 1.3-5.47 5.04-10.48 11.21-15.04 6.17-4.56 14.16-6.84 23.95-6.84s17.63 1.98 23.99 5.94c6.36 3.96 10.5 8.66 12.42 14.1 1.93 5.44 2.89 13.35 2.89 23.72v5.47ZM293.76 141.3v126.51h-32.9v-53.14h-9.85v53.14h-32.9V141.3h32.9v45.24h9.85V141.3h32.9ZM372.44 141.3v25.32h-19.54v101.2h-32.9v-101.2h-19.46V141.3h71.89ZM448.84 179.59h-30.55v-9.38c0-4.38-.39-7.16-1.17-8.36-.78-1.2-2.08-1.8-3.91-1.8-1.98 0-3.48.81-4.49 2.42-1.02 1.62-1.52 4.07-1.52 7.35 0 4.22.57 7.4 1.71 9.54 1.09 2.14 4.19 4.72 9.3 7.74 14.64 8.69 23.87 15.83 27.67 21.4 3.8 5.58 5.7 14.56 5.7 26.96 0 9.01-1.05 15.66-3.17 19.93-2.11 4.27-6.19 7.85-12.23 10.75-6.04 2.89-13.08 4.34-21.1 4.34-8.8 0-16.32-1.67-22.54-5-6.23-3.33-10.3-7.58-12.23-12.74-1.93-5.16-2.89-12.48-2.89-21.96v-8.28h30.55v15.39c0 4.74.43 7.79 1.29 9.14.86 1.36 2.38 2.03 4.57 2.03s3.82-.86 4.88-2.58c1.07-1.72 1.6-4.27 1.6-7.66 0-7.45-1.02-12.32-3.05-14.61-2.08-2.29-7.22-6.12-15.39-11.49-8.18-5.42-13.6-9.35-16.25-11.8-2.66-2.45-4.86-5.83-6.6-10.16-1.75-4.32-2.62-9.85-2.62-16.57 0-9.69 1.24-16.77 3.71-21.25 2.47-4.48 6.47-7.98 12-10.51 5.52-2.53 12.19-3.79 20-3.79 8.54 0 15.82 1.38 21.84 4.14 6.02 2.76 10 6.24 11.96 10.43 1.95 4.19 2.93 11.32 2.93 21.37v5ZM65.87 319.33v-34.08h22.9v5.81H72.5v8.78h13.54v5.38H72.5v14.11h-6.62ZM108.78 319.57c-2.5 0-4.76-.48-6.79-1.44-2.03-.96-3.78-2.26-5.23-3.91-1.46-1.65-2.58-3.5-3.38-5.57-.8-2.06-1.2-4.18-1.2-6.36s.42-4.44 1.27-6.5c.85-2.06 2.02-3.9 3.5-5.52 1.49-1.62 3.25-2.9 5.28-3.84 2.03-.94 4.26-1.42 6.7-1.42s4.71.5 6.74 1.49c2.03.99 3.77 2.32 5.21 3.98s2.56 3.52 3.36 5.57c.8 2.05 1.2 4.16 1.2 6.34s-.42 4.39-1.25 6.46c-.83 2.06-1.99 3.9-3.48 5.52-1.49 1.62-3.25 2.89-5.28 3.82-2.03.93-4.25 1.39-6.65 1.39Zm-9.88-17.28c0 1.47.22 2.9.67 4.27.45 1.38 1.1 2.6 1.94 3.67.85 1.07 1.89 1.92 3.12 2.54 1.23.62 2.63.94 4.2.94s3.02-.33 4.27-.98 2.29-1.54 3.12-2.64c.83-1.1 1.46-2.33 1.9-3.7.43-1.36.65-2.73.65-4.1 0-1.47-.23-2.89-.7-4.25-.46-1.36-1.12-2.58-1.97-3.65-.85-1.07-1.89-1.92-3.12-2.54-1.23-.62-2.62-.94-4.15-.94-1.63 0-3.06.33-4.3.98-1.23.66-2.26 1.53-3.1 2.62-.83 1.09-1.46 2.3-1.9 3.65s-.65 2.72-.65 4.13ZM131.87 319.33v-34.08h15.07c1.57 0 3.02.32 4.34.96 1.33.64 2.48 1.5 3.46 2.59.98 1.09 1.73 2.3 2.26 3.65.53 1.34.79 2.72.79 4.13s-.25 2.82-.74 4.15-1.21 2.49-2.14 3.48c-.93.99-2.02 1.76-3.26 2.3l7.78 12.82h-7.3l-7.01-11.42h-6.62v11.42h-6.62Zm6.62-17.24h8.3c.83 0 1.57-.25 2.21-.74.64-.5 1.15-1.16 1.54-1.99.38-.83.58-1.76.58-2.78 0-1.09-.22-2.04-.67-2.86-.45-.82-1.02-1.46-1.7-1.94-.69-.48-1.43-.72-2.23-.72h-8.02v11.04ZM175.93 302c0-2.08.38-4.12 1.13-6.12.75-2 1.85-3.82 3.29-5.47 1.44-1.65 3.2-2.96 5.28-3.94 2.08-.98 4.45-1.46 7.1-1.46 3.14 0 5.85.69 8.14 2.06s3.99 3.17 5.11 5.38l-5.09 3.5c-.58-1.28-1.33-2.3-2.26-3.05-.93-.75-1.92-1.28-2.98-1.58-1.06-.3-2.1-.46-3.12-.46-1.66 0-3.11.34-4.34 1.01-1.23.67-2.26 1.55-3.1 2.64-.83 1.09-1.45 2.3-1.85 3.65s-.6 2.69-.6 4.03c0 1.5.24 2.95.72 4.34.48 1.39 1.16 2.62 2.04 3.7s1.94 1.92 3.17 2.54c1.23.62 2.58.94 4.06.94 1.06 0 2.13-.17 3.22-.53 1.09-.35 2.1-.91 3.02-1.68.93-.77 1.65-1.76 2.16-2.98l5.42 3.12c-.67 1.7-1.77 3.14-3.29 4.32-1.52 1.18-3.22 2.08-5.11 2.69-1.89.61-3.76.91-5.62.91-2.43 0-4.66-.5-6.67-1.51-2.02-1.01-3.75-2.35-5.21-4.03-1.46-1.68-2.59-3.57-3.41-5.66-.82-2.1-1.22-4.22-1.22-6.36ZM240.93 285.25v34.08h-6.58v-14.54h-15.46v14.54h-6.62v-34.08h6.62v13.78h15.46v-13.78h6.58ZM249.37 319.33v-34.08h6.62v34.08h-6.62ZM264.44 319.33v-34.08h6.62v28.27h17.38v5.81h-24ZM293.82 319.33v-34.08h12.38c3.71 0 6.82.76 9.31 2.28 2.5 1.52 4.37 3.57 5.62 6.14 1.25 2.58 1.87 5.43 1.87 8.57 0 3.46-.69 6.46-2.06 9.02-1.38 2.56-3.32 4.54-5.83 5.95-2.51 1.41-5.48 2.11-8.9 2.11h-12.38Zm22.51-17.09c0-2.21-.4-4.15-1.2-5.83-.8-1.68-1.95-2.99-3.46-3.94-1.5-.94-3.33-1.42-5.47-1.42h-5.76v22.46h5.76c2.18 0 4.02-.49 5.52-1.46 1.5-.98 2.65-2.32 3.43-4.03s1.18-3.64 1.18-5.78ZM329.53 319.33v-34.08h15.07c1.57 0 3.02.32 4.34.96 1.33.64 2.48 1.5 3.46 2.59.98 1.09 1.73 2.3 2.26 3.65.53 1.34.79 2.72.79 4.13s-.25 2.82-.74 4.15-1.21 2.49-2.14 3.48c-.93.99-2.02 1.76-3.26 2.3l7.78 12.82h-7.3l-7.01-11.42h-6.62v11.42h-6.62Zm6.63-17.24h8.3c.83 0 1.57-.25 2.21-.74.64-.5 1.15-1.16 1.54-1.99.38-.83.58-1.76.58-2.78 0-1.09-.22-2.04-.67-2.86-.45-.82-1.02-1.46-1.7-1.94-.69-.48-1.43-.72-2.23-.72h-8.02v11.04ZM386.46 313.52v5.81h-23.66v-34.08h23.23v5.81h-16.61v8.21h14.35v5.38h-14.35v8.88h17.04ZM399.61 297.44v21.89h-6.62v-34.08h5.28l17.62 22.46v-22.42h6.62v34.03h-5.52l-17.38-21.89Z" />
  </svg>
);

interface InfoPanelProps {
  data: SelectionSummary | null;
  onClose: () => void;
  onAction?: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ data, onClose, onAction }) => {
  if (!data) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:top-0 md:right-0 md:left-auto md:bottom-0 md:w-96 bg-brandDeep/95 backdrop-blur-xl border-t md:border-l border-brandDarkRed/40 shadow-2xl z-50 transition-transform duration-300 ease-in-out p-6 overflow-y-auto max-h-[60vh] md:max-h-screen flex flex-col">
      {/* Featured Image */}
      {data.image && (
        <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-brandWhite/10 aspect-video relative group">
          <img
            src={data.image}
            alt={data.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brandBlack/60 to-transparent opacity-60"></div>
        </div>
      )}

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
            stat.isAction ? (
              <button
                key={idx}
                className="bg-brandRed hover:bg-brandLightRed/90 p-3 rounded-lg border border-transparent transition-all hover:scale-[1.02] active:scale-95 shadow-lg group flex flex-col items-start justify-center cursor-pointer animate-attention"
                onClick={() => onAction?.()}
              >
                <div className="text-[10px] uppercase tracking-wider text-brandBlack/70 mb-1 font-bold">{stat.label}</div>
                <div className="text-lg font-heading leading-tight font-bold text-white flex items-center gap-1.5">
                  {stat.icon && <i className={`bx ${stat.icon}`}></i>}
                  {stat.value}
                </div>
              </button>
            ) : (
              <div key={idx} className="bg-brandBlack/20 p-3 rounded-lg border border-brandWhite/10 hover:border-brandRed/30 transition-colors">
                <div className="text-[10px] uppercase tracking-wider text-brandGrey mb-1 font-bold opacity-70">{stat.label}</div>
                <div className={`text-lg font-heading leading-tight flex items-center gap-1.5 ${stat.className || 'text-brandCream'}`}>
                  {stat.icon && <i className={`bx ${stat.icon} opacity-70`}></i>}
                  {stat.value}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      <div className="prose prose-invert prose-sm font-sans flex-grow">
        {data.loading && !data.content ? (
          <div className="mt-10 flex flex-col items-center justify-center space-y-4 text-brandLightRed/70">
            <Loader />
            <p className="font-semibold tracking-wide text-xs uppercase flex items-center gap-2">
              <i className='bx bx-sparkles animate-pulse'></i>
              Consulting Gemini...
            </p>
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
                hr: ({ node, ...props }) => <hr className="border-brandGrey/20 my-6" {...props} />,
                p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
              }}
            >
              {data.content}
            </ReactMarkdown>
            {data.loading && <span className="inline-block ml-2"><Loader /></span>}
          </div>
        )}
      </div>

      {/* External Link Button */}
      {data.link && (
        <div className="mt-6">
          <a
            href={data.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center w-full gap-2 bg-brandBlack/40 hover:bg-brandBlue text-brandBlue hover:text-white border border-brandBlue/30 hover:border-transparent py-3 px-4 rounded-lg transition-all duration-300 font-bold tracking-wide uppercase text-sm"
          >
            <span>{data.link.text}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
              <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-brandGrey/20 text-xs text-brandGrey flex justify-between font-mono">
        <span>Powered by <JustRightsLogo /></span>
        <span>{data.type === 'country' ? `ID: ${data.id}` : 'Campaign Update'}</span>
      </div>
    </div>
  );
};