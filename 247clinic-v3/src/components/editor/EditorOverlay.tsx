'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Save, RotateCcw, Smartphone, Tablet, Monitor, LayoutGrid, Type, MousePointer2 } from 'lucide-react';
import layoutJson from '@/content/home-layout.json';

function getLuminance(hex: string) {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16) / 255) || [1,1,1];
  const a = rgb.map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function getContrast(hex1: string, hex2: string) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// --- Inner Iframe Script ---
function EditorInner() {
  useEffect(() => {
    let selectedEl: HTMLElement | null = null;
    const getSelector = (el: HTMLElement) => {
      let path = [];
      let current = el;
      while (current && current.tagName !== 'SECTION' && current.tagName !== 'BODY') {
        let index = 1;
        let sibling = current.previousElementSibling;
        while (sibling) {
          if (sibling.tagName === current.tagName) index++;
          sibling = sibling.previousElementSibling;
        }
        path.unshift(`${current.tagName.toLowerCase()}:nth-of-type(${index})`);
        current = current.parentElement as HTMLElement;
      }
      if (current && current.tagName === 'SECTION') {
        const id = current.id || current.className.split(' ')[0];
        path.unshift(`section.${id}`);
      }
      return path.join(' > ');
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.editor-ignore')) return;
      target.style.outline = '2px dashed #C00000';
    };
    
    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target !== selectedEl) target.style.outline = '';
    };
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.editor-ignore')) return;
      e.preventDefault();
      e.stopPropagation();
      if (selectedEl && selectedEl !== target) {
        selectedEl.style.outline = '';
        selectedEl.contentEditable = 'false';
      }
      selectedEl = target;
      target.style.outline = '2px solid #C00000';
      
      const isText = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'BUTTON', 'LI'].includes(target.tagName);
      if (isText && !target.isContentEditable) {
        target.contentEditable = 'true';
        target.focus();
        if (!target.dataset.original) target.dataset.original = target.innerText;
      }
      window.parent.postMessage({ type: 'selectElement', selector: getSelector(target), tagName: target.tagName }, '*');
    };
    
    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.isContentEditable) {
        target.contentEditable = 'false';
        const original = target.dataset.original;
        const current = target.innerText;
        if (original && current && original !== current) {
          window.parent.postMessage({ type: 'textEdit', original, current }, '*');
        }
      }
    };

    const handleDrop = async (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const slot = target.closest('.slot, .slot-img') as HTMLElement;
      if (!slot) return;
      e.preventDefault();
      const file = e.dataTransfer?.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const slotName = slot.id || `slot-${Date.now()}`;
      await fetch('http://127.0.0.1:3100/save/image', { method: 'POST', headers: { 'x-slot-name': slotName }, body: file });
      alert(`Saved image to ${slotName}.webp`);
    };

    const handleDragOver = (e: DragEvent) => e.preventDefault();

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick, { capture: true });
    document.addEventListener('blur', handleBlur, { capture: true });
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleClick, { capture: true });
      document.removeEventListener('blur', handleBlur, { capture: true });
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);
  return null;
}

// --- Outer Shell ---
type EditorState = { layout: any; theme: any; texts: any[]; cssRules: string[] };

function EditorShell() {
  const [width, setWidth] = useState('1440px');
  const [history, setHistory] = useState<EditorState[]>([{
    layout: layoutJson,
    theme: { primary: '#C00000', ink: '#111111', surface: '#f9f9f9', fontSize: '16px' },
    texts: [], cssRules: []
  }]);
  const [ptr, setPtr] = useState(0);
  const state = history[ptr];

  const [changes, setChanges] = useState<string>('');
  const [selectedSelector, setSelectedSelector] = useState('');

  const fetchChanges = async () => {
    try {
      const res = await fetch('http://127.0.0.1:3100/changes');
      setChanges(await res.text());
    } catch (e) {}
  };

  useEffect(() => {
    fetchChanges();
    const interval = setInterval(fetchChanges, 2000);
    const onMessage = async (e: MessageEvent) => {
      if (e.data.type === 'selectElement') setSelectedSelector(e.data.selector);
      if (e.data.type === 'textEdit') {
        pushState({ ...state, texts: [...state.texts, { from: e.data.original, to: e.data.current }] });
      }
    };
    window.addEventListener('message', onMessage);
    
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) { setPtr(p => Math.max(0, p - 1)); }
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') { setPtr(p => Math.min(history.length - 1, p + 1)); }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      clearInterval(interval);
      window.removeEventListener('message', onMessage);
      window.removeEventListener('keydown', onKey);
    };
  }, [state, history]);

  const pushState = (newState: EditorState) => {
    const next = history.slice(0, ptr + 1);
    next.push(newState);
    setHistory(next);
    setPtr(next.length - 1);
  };

  const updateSectionStyle = (name: string, prop: string, val: string) => {
    const layout = { ...state.layout, styles: { ...state.layout.styles, [name]: { ...(state.layout.styles?.[name] || {}), [prop]: val } } };
    pushState({ ...state, layout });
  };

  const saveElementCss = (rule: string) => pushState({ ...state, cssRules: [...state.cssRules, rule] });

  const commitChanges = async () => {
    // 1. save layout
    await fetch('http://127.0.0.1:3100/save/layout', { method: 'POST', body: JSON.stringify(state.layout) });
    // 2. save theme
    const themeCss = `:root { --primary: ${state.theme.primary}; --ink: ${state.theme.ink}; --surface: ${state.theme.surface}; font-size: ${state.theme.fontSize}; }`;
    await fetch('http://127.0.0.1:3100/save/css', { method: 'POST', body: JSON.stringify({ file: 'theme-overrides.css', content: themeCss }) });
    // 3. save text edits
    for (const t of state.texts) {
      await fetch('http://127.0.0.1:3100/save/text', { method: 'POST', body: JSON.stringify({ from: t.from, to: t.to }) });
    }
    // 4. save css rules
    for (const r of state.cssRules) {
      await fetch('http://127.0.0.1:3100/save/append-css', { method: 'POST', body: JSON.stringify({ file: 'editor-overrides.css', content: r }) });
    }
    // reset pending edits
    setHistory([state]); setPtr(0);
    fetchChanges();
    const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
    if (iframe) iframe.contentWindow?.location.reload();
  };

  const discardChanges = () => {
    setHistory([history[0]]);
    setPtr(0);
    const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
    if (iframe) iframe.contentWindow?.location.reload();
  };

  const contrast = getContrast(state.theme.primary, state.theme.surface);

  return (
    <div className="fixed inset-0 z-[999999] bg-gray-100 flex font-sans text-sm">
      <div className="w-80 bg-white border-r flex flex-col h-full shadow-lg shrink-0 overflow-y-auto">
        <div className="p-4 bg-[#C00000] text-white flex items-center justify-between">
          <h2 className="font-bold">24/7 Editor</h2>
          <div className="flex gap-2">
            <button title="Undo" onClick={() => setPtr(p => Math.max(0, p - 1))} className="opacity-75 hover:opacity-100 disabled:opacity-30" disabled={ptr === 0}>←</button>
            <button title="Redo" onClick={() => setPtr(p => Math.min(history.length - 1, p + 1))} className="opacity-75 hover:opacity-100 disabled:opacity-30" disabled={ptr === history.length - 1}>→</button>
          </div>
        </div>

        {/* Sections */}
        <div className="p-4 border-b">
          <h3 className="font-bold mb-2 flex items-center gap-2"><LayoutGrid size={14}/> Sections</h3>
          <div className="flex flex-col gap-2">
            {state.layout.order.map((name: string, idx: number) => {
              const styles = state.layout.styles?.[name] || {};
              return (
                <div key={name} className="flex flex-col bg-gray-50 p-2 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className={state.layout.hidden.includes(name) ? 'opacity-50 line-through' : 'font-semibold'}>{name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => {
                        if (idx === 0) return;
                        const order = [...state.layout.order];
                        [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
                        pushState({ ...state, layout: { ...state.layout, order } });
                      }} className="p-1 hover:bg-gray-200 rounded">↑</button>
                      <button onClick={() => {
                        const hidden = state.layout.hidden.includes(name) ? state.layout.hidden.filter((n: string) => n !== name) : [...state.layout.hidden, name];
                        pushState({ ...state, layout: { ...state.layout, hidden } });
                      }} className="p-1 hover:bg-gray-200 rounded text-xs">{state.layout.hidden.includes(name) ? 'Show' : 'Hide'}</button>
                    </div>
                  </div>
                  {!state.layout.hidden.includes(name) && (
                    <div className="text-xs flex flex-col gap-1">
                      <div className="flex justify-between">Top Pad: <input type="text" className="w-16 border rounded px-1" value={styles['--pad-top'] || ''} onChange={e => updateSectionStyle(name, '--pad-top', e.target.value)} /></div>
                      <div className="flex justify-between">Bot Pad: <input type="text" className="w-16 border rounded px-1" value={styles['--pad-bottom'] || ''} onChange={e => updateSectionStyle(name, '--pad-bottom', e.target.value)} /></div>
                      <div className="flex justify-between">Scale: <input type="number" step="0.1" className="w-16 border rounded px-1" value={styles['--heading-scale'] || '1'} onChange={e => updateSectionStyle(name, '--heading-scale', e.target.value)} /></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-gray-500 mb-2">Add Section</h4>
            <div className="flex gap-2">
              <button onClick={() => pushState({ ...state, layout: { ...state.layout, order: [...state.layout.order, `TextImg-${Date.now()}`] } })} className="px-2 py-1 bg-gray-100 rounded border hover:bg-gray-200 text-xs">Text+Img</button>
              <button onClick={() => pushState({ ...state, layout: { ...state.layout, order: [...state.layout.order, `FullImg-${Date.now()}`] } })} className="px-2 py-1 bg-gray-100 rounded border hover:bg-gray-200 text-xs">Full Img</button>
              <button onClick={() => pushState({ ...state, layout: { ...state.layout, order: [...state.layout.order, `LogoRow-${Date.now()}`] } })} className="px-2 py-1 bg-gray-100 rounded border hover:bg-gray-200 text-xs">Logos</button>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="p-4 border-b">
          <h3 className="font-bold mb-2 flex items-center gap-2"><Type size={14}/> Theme & Typography</h3>
          {contrast < 4.5 && <p className="text-red-500 text-[10px] mb-2 font-bold">Warning: Primary vs Surface contrast is {contrast.toFixed(2)} (under 4.5:1)</p>}
          <div className="flex flex-col gap-2 text-xs">
             <div className="flex justify-between">Primary: <input type="color" value={state.theme.primary} onChange={e => pushState({...state, theme: {...state.theme, primary: e.target.value}})} /></div>
             <div className="flex justify-between">Ink: <input type="color" value={state.theme.ink} onChange={e => pushState({...state, theme: {...state.theme, ink: e.target.value}})} /></div>
             <div className="flex justify-between">Surface: <input type="color" value={state.theme.surface} onChange={e => pushState({...state, theme: {...state.theme, surface: e.target.value}})} /></div>
             <div className="flex justify-between">Base Font: <input type="text" className="w-16 border rounded px-1" value={state.theme.fontSize} onChange={e => pushState({...state, theme: {...state.theme, fontSize: e.target.value}})} /></div>
          </div>
          <button className="w-full mt-4 py-2 bg-gray-100 border rounded hover:bg-gray-200 text-xs" onClick={() => {
             pushState({...state, theme: { primary: '#C00000', ink: '#111111', surface: '#f9f9f9', fontSize: '16px' }});
          }}>Reset to Brand</button>
        </div>

        {/* Selected Element */}
        {selectedSelector && (
          <div className="p-4 border-b bg-blue-50">
            <h3 className="font-bold mb-2 flex items-center gap-2"><MousePointer2 size={14}/> Element CSS</h3>
            <p className="text-[10px] text-gray-500 mb-2 break-all">{selectedSelector}</p>
            <div className="flex gap-2">
              <button onClick={() => saveElementCss(`${selectedSelector} { display: none !important; }`)} className="px-2 py-1 bg-white rounded border text-xs">Hide</button>
              <button onClick={() => saveElementCss(`${selectedSelector} { text-align: center !important; }`)} className="px-2 py-1 bg-white rounded border text-xs">Center</button>
            </div>
          </div>
        )}

        {/* Pending Changes & Server Log */}
        <div className="p-4 border-b">
           <h3 className="font-bold mb-2">Pending Changes ({ptr})</h3>
           <div className="flex gap-2 mb-2">
             <button onClick={commitChanges} className="flex-1 py-1 bg-green-600 text-white rounded text-xs">Save</button>
             <button onClick={discardChanges} className="flex-1 py-1 bg-gray-300 rounded text-xs">Discard</button>
           </div>
        </div>

        <div className="p-4 flex-1">
          <h3 className="font-bold mb-2">Server Log</h3>
          <pre className="text-[10px] text-gray-500 whitespace-pre-wrap">{changes || 'No changes yet'}</pre>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-4 h-full bg-gray-200">
        <div className="bg-white p-2 rounded-lg shadow flex gap-2 mb-4">
          <button onClick={() => setWidth('375px')} className={`p-2 rounded ${width === '375px' ? 'bg-gray-100' : ''}`}><Smartphone size={16}/></button>
          <button onClick={() => setWidth('768px')} className={`p-2 rounded ${width === '768px' ? 'bg-gray-100' : ''}`}><Tablet size={16}/></button>
          <button onClick={() => setWidth('1440px')} className={`p-2 rounded ${width === '1440px' ? 'bg-gray-100' : ''}`}><Monitor size={16}/></button>
        </div>
        <div className="bg-white shadow-2xl overflow-hidden rounded transition-all duration-300" style={{ width, height: '100%' }}>
          {/* We pass a hash of pending state so the iframe can theoretically react to it if needed, but since it's just visual we might not inject CSS dynamically, but this is a simple local editor so it's ok. */}
          <iframe id="preview-frame" src="?edit=1&iframe=1" className="w-full h-full border-0" />
        </div>
      </div>
    </div>
  );
}

export default function EditorOverlay() {
  const [mode, setMode] = useState<'shell' | 'inner' | 'none'>('none');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      if (search.get('edit') === '1') {
        if (search.get('iframe') === '1') {
          setMode('inner');
        } else {
          setMode('shell');
          document.body.style.overflow = 'hidden';
          const main = document.getElementById('main');
          if (main) main.style.display = 'none';
        }
      }
    }
  }, []);

  if (mode === 'inner') return <EditorInner />;
  if (mode === 'shell') return createPortal(<EditorShell />, document.body);
  return null;
}
