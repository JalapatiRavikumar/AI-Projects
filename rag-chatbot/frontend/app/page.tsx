'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message { id: string; role: 'user' | 'assistant'; content: string; sources?: Source[]; timestamp: number; followUps?: string[]; }
interface Conversation { id: string; name: string; messages: Message[]; createdAt: number; updatedAt: number; starred: boolean; }
interface Source { fileName: string; page?: number; score?: number; }
interface UploadedFile { id: string; name: string; status: string; uploadedAt: number; chunkCount?: number; vectorCount?: number; }
interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }
interface AppNotif { id: string; text: string; read: boolean; time: number; }

async function streamSSE(url: string, body: object, onChunk: (t: string) => void, onSources?: (s: Source[]) => void) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const reader = res.body?.getReader(); const decoder = new TextDecoder(); let buf = '';
  while (true) {
    const { done, value } = await reader!.read(); if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n'); buf = lines.pop() ?? '';
    for (const line of lines) { const t = line.trim(); if (!t.startsWith('data: ')) continue; const raw = t.slice(6); if (raw === '[DONE]') break; try { const d = JSON.parse(raw); if (d.content) onChunk(d.content); if (d.sources && onSources) onSources(d.sources); } catch (_) {} }
  }
}

const I18N: Record<string, Record<string, string>> = {
  en: { newChat:'New Chat', history:'History', favorites:'Favorites', search:'Search chats...', settings:'Settings', help:'Help', logout:'Sign Out', send:'Send', placeholder:'Ask about your documents...', noChats:'No conversations yet', addPaper:'+ Add Research Paper', compare:'Compare Docs', summarize:'Summarize', clear:'Clear Chat', export:'Export', welcome:'What would you like to research?', followUp:'Follow-up suggestions', regenerate:'Regenerate', share:'Share', feedback:'Feedback', theme:'Theme', language:'Language', fullscreen:'Full Screen', zoom:'Text Size', notifications:'Notifications', profile:'Profile', documents:'Documents', refresh:'Refresh' },
  hi: { newChat:'नई चैट', history:'इतिहास', favorites:'पसंदीदा', search:'खोजें...', settings:'सेटिंग्स', help:'सहायता', logout:'लॉग आउट', send:'भेजें', placeholder:'प्रश्न पूछें...', noChats:'कोई बातचीत नहीं', addPaper:'+ पेपर जोड़ें', compare:'तुलना', summarize:'सारांश', clear:'साफ करें', export:'निर्यात', welcome:'आप क्या जानना चाहते हैं?', followUp:'अनुवर्ती प्रश्न', regenerate:'पुनः उत्पन्न', share:'साझा', feedback:'प्रतिक्रिया', theme:'थीम', language:'भाषा', fullscreen:'पूर्ण स्क्रीन', zoom:'आकार', notifications:'सूचनाएं', profile:'प्रोफ़ाइल', documents:'दस्तावेज़', refresh:'रीफ्रेश' },
  es: { newChat:'Nueva Chat', history:'Historial', favorites:'Favoritos', search:'Buscar...', settings:'Ajustes', help:'Ayuda', logout:'Cerrar sesión', send:'Enviar', placeholder:'Pregunta sobre tus documentos...', noChats:'Sin conversaciones', addPaper:'+ Agregar Documento', compare:'Comparar', summarize:'Resumir', clear:'Limpiar', export:'Exportar', welcome:'¿Qué deseas investigar?', followUp:'Preguntas de seguimiento', regenerate:'Regenerar', share:'Compartir', feedback:'Comentarios', theme:'Tema', language:'Idioma', fullscreen:'Pantalla completa', zoom:'Tamaño', notifications:'Notificaciones', profile:'Perfil', documents:'Documentos', refresh:'Actualizar' },
};

export default function Home() {
  const { data: session } = useSession();
  const uid = (session?.user as any)?.id || 'anon';
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [citation, setCitation] = useState<{ fileName: string; page: number } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifs, setNotifs] = useState<AppNotif[]>([]);
  const [dark, setDark] = useState(true);
  const [nav, setNav] = useState<'history'|'favorites'|'search'|'docs'>('history');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelected, setCompareSelected] = useState<string[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [lang, setLang] = useState('en');
  const [fullscreen, setFullscreen] = useState(false);
  const [histSearch, setHistSearch] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const t = (k: string) => (I18N[lang] || I18N.en)[k] || k;
  const activeConv = convs.find(c => c.id === activeId);
  const msgs = activeConv?.messages || [];
  const readyFiles = files.filter(f => f.status === 'ready');
  const totalChunks = readyFiles.reduce((s, f) => s + (f.chunkCount || 0), 0);
  const unread = notifs.filter(n => !n.read).length;
  const canRegen = msgs.length >= 2 && msgs[msgs.length-1]?.role === 'assistant' && !loading;
  const filteredConvs = convs.filter(c => !histSearch || c.name.toLowerCase().includes(histSearch.toLowerCase()) || c.messages.some(m => m.content.toLowerCase().includes(histSearch.toLowerCase())));

  useEffect(() => { const dm=localStorage.getItem('dark'),fs=localStorage.getItem('fs'),lg=localStorage.getItem('lang'); if(dm!==null)setDark(dm==='1'); if(fs)setFontSize(+fs); if(lg)setLang(lg); }, []);
  useEffect(() => { localStorage.setItem('dark', dark?'1':'0'); }, [dark]);
  useEffect(() => { localStorage.setItem('fs', String(fontSize)); document.documentElement.style.fontSize=fontSize+'px'; }, [fontSize]);
  useEffect(() => { localStorage.setItem('lang', lang); }, [lang]);
  useEffect(() => { if(!session?.user)return; const s=localStorage.getItem(`convs_${uid}`); if(s){const cs=JSON.parse(s);setConvs(cs);if(cs.length)setActiveId(cs[0].id);} }, [session]);
  useEffect(() => { if(session?.user&&convs.length)localStorage.setItem(`convs_${uid}`,JSON.stringify(convs)); }, [convs]);
  useEffect(() => { if(session?.user)fetchFiles(); }, [session]);
  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}); }, [msgs]);
  useEffect(() => { if(renamingId)renameRef.current?.focus(); }, [renamingId]);
  useEffect(() => {
    if(!files.some(f=>f.status==='processing'))return;
    const iv=setInterval(async()=>{
      try {
        const r=await fetch(`http://localhost:5000/api/files/${uid}`);const d=await r.json();const nf:UploadedFile[]=d.files||[];
        nf.forEach(f=>{const old=files.find(p=>p.id===f.id);if(old?.status==='processing'&&f.status==='ready'){toast(`"${f.name}" is ready!`);addNotif(`"${f.name}" processed`);}});
        setFiles(nf);
      } catch (err) {
        console.error("Failed to fetch processing status:", err);
      }
    },3000);
    return ()=>clearInterval(iv);
  },[files]);

  const toast = useCallback((msg:string,type:Toast['type']='success')=>{const id=Date.now().toString();setToasts(p=>[...p,{id,message:msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3000);},[]);
  const addNotif = useCallback((text:string)=>{setNotifs(p=>[{id:Date.now().toString(),text,read:false,time:Date.now()},...p]);},[]);
  const fetchFiles = async()=>{try{const r=await fetch(`http://localhost:5000/api/files/${uid}`);const d=await r.json();setFiles(d.files||[]);}catch{}};
  const newChat=()=>{const id=Date.now().toString();setConvs(p=>[{id,name:`Chat ${p.length+1}`,messages:[],createdAt:Date.now(),updatedAt:Date.now(),starred:false},...p]);setActiveId(id);setCitation(null);};
  const deleteConv=(id:string)=>{if(!confirm('Delete this conversation?'))return;setConvs(p=>p.filter(c=>c.id!==id));if(activeId===id){const r=convs.filter(c=>c.id!==id);setActiveId(r[0]?.id||null);}toast('Conversation deleted');};
  const starConv=(id:string)=>setConvs(p=>p.map(c=>c.id===id?{...c,starred:!c.starred}:c));
  const updateMsgs=(id:string,fn:(p:Message[])=>Message[])=>setConvs(p=>p.map(c=>c.id===id?{...c,messages:fn(c.messages),updatedAt:Date.now()}:c));
  const autoName=(id:string,label:string)=>setConvs(p=>p.map(c=>c.id===id&&c.name.startsWith('Chat ')?{...c,name:label.slice(0,38)}:c));

  const runStream=async(url:string,body:object,label:string)=>{
    let cid=activeId;
    if(!cid){const id=Date.now().toString();setConvs(p=>[{id,name:label.slice(0,38),messages:[],createdAt:Date.now(),updatedAt:Date.now(),starred:false},...p]);setActiveId(id);cid=id;}
    const msgId=Date.now().toString();
    updateMsgs(cid,p=>[...p,{id:`${msgId}_u`,role:'user',content:label,timestamp:Date.now()},{id:msgId,role:'assistant',content:'',sources:[],timestamp:Date.now()}]);
    setLoading(true);let finalContent='';
    try{
      await streamSSE(url,body,text=>{finalContent+=text;updateMsgs(cid!,p=>p.map(m=>m.id===msgId?{...m,content:m.content+text}:m));},sources=>updateMsgs(cid!,p=>p.map(m=>m.id===msgId?{...m,sources}:m)));
      autoName(cid!,label);
      try{const fr=await fetch('http://localhost:5000/api/followup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:label,answer:finalContent})});const fd=await fr.json();if(fd.questions?.length)updateMsgs(cid!,p=>p.map(m=>m.id===msgId?{...m,followUps:fd.questions}:m));}catch{}
    }catch{toast('Request failed','error');}finally{setLoading(false);}
  };

  const sendMsg=async()=>{if(!input.trim()||loading)return;const msg=input;setInput('');await runStream('http://localhost:5000/api/chat',{message:msg,userId:uid},msg);};
  const summarize=async(n:string)=>{toast('Summarizing...','info');await runStream('http://localhost:5000/api/summarize',{fileName:n,userId:uid},`Summarize: ${n}`);};
  const compare=async()=>{if(compareSelected.length<2){toast('Select 2 docs','error');return;}const ns=[...compareSelected];setCompareMode(false);setCompareSelected([]);await runStream('http://localhost:5000/api/compare',{fileNames:ns,userId:uid},`Compare: "${ns[0]}" vs "${ns[1]}"`);};
  const regenerate=async()=>{if(!activeId||!canRegen)return;const la=[...msgs].reverse().find(m=>m.role==='assistant');const lu=[...msgs].reverse().find(m=>m.role==='user');if(!la||!lu)return;updateMsgs(activeId,p=>p.filter(m=>m.id!==la.id));await runStream('http://localhost:5000/api/chat',{message:lu.content,userId:uid},lu.content);};
  const clearChat=()=>{if(!activeId||!confirm('Clear this chat?'))return;updateMsgs(activeId,()=>[]);setCitation(null);toast('Chat cleared');};
  const shareChat=()=>{if(!activeConv)return;navigator.clipboard.writeText(activeConv.messages.map(m=>`${m.role.toUpperCase()}: ${m.content}`).join('\n\n')).then(()=>toast('Copied to clipboard!'));};
  const exportChat=()=>{if(!activeConv)return;const md=`# ${activeConv.name}\n\n`+activeConv.messages.map(m=>`**${m.role.toUpperCase()}**\n\n${m.content}`).join('\n\n---\n\n');const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([md],{type:'text/markdown'})),download:`${activeConv.name}.md`});a.click();toast('Exported!');};
  const toggleFS=()=>{if(!document.fullscreenElement){document.documentElement.requestFullscreen();setFullscreen(true);}else{document.exitFullscreen();setFullscreen(false);}};
  const deleteFile=async(id:string,name:string)=>{if(!confirm(`Delete "${name}"?`))return;const r=await fetch(`http://localhost:5000/api/files/${id}`,{method:'DELETE'});if(r.ok){fetchFiles();setCitation(null);toast(`Deleted "${name}"`);} };
  const uploadFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(!file)return;const fd=new FormData();fd.append('file',file);fd.append('userId',uid);setFiles(p=>[...p,{id:'tmp',name:file.name,status:'processing',uploadedAt:Date.now()}]);toast(`Uploading "${file.name}"...`,'info');addNotif(`Uploading "${file.name}"...`);try{await fetch('http://localhost:5000/api/upload',{method:'POST',body:fd});fetchFiles();}catch{toast('Upload failed','error');fetchFiles();}e.target.value='';};

  const D=dark;
  const T={root:D?'bg-gray-950 text-white':'bg-slate-50 text-gray-900',nav:D?'bg-gray-900 border-gray-800':'bg-white border-gray-200',panel:D?'bg-gray-900 border-gray-800':'bg-white border-gray-200',card:D?'bg-gray-800/60 border-gray-700 hover:border-gray-600':'bg-gray-50 border-gray-200 hover:border-gray-300',input:D?'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500':'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-400',hover:D?'hover:bg-gray-800':'hover:bg-gray-100',div:D?'border-gray-800':'border-gray-200',sec:D?'text-gray-400':'text-gray-500',pri:D?'text-white':'text-gray-900',msgA:D?'bg-gray-900 border border-gray-700':'bg-white border border-gray-200 shadow-sm',drop:D?'bg-gray-900 border-gray-700 shadow-2xl':'bg-white border-gray-200 shadow-2xl',active:D?'border-blue-600 bg-blue-600/10':'border-blue-400 bg-blue-50'};

  if(!session) return (
    <div className={`h-screen flex items-center justify-center ${D?'bg-gradient-to-br from-gray-950 via-slate-900 to-blue-950':'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className={`w-full max-w-md mx-4 p-10 rounded-3xl border text-center space-y-7 ${D?'bg-gray-900/90 border-gray-800 backdrop-blur-xl':'bg-white/95 border-gray-200 shadow-2xl'}`}>
        <div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">🧠</div>
          <h1 className={`text-3xl font-bold mb-2 ${T.pri}`}>Research AI</h1>
          <p className={`text-sm ${T.sec}`}>Upload papers, ask questions, get grounded AI answers.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['📄 Upload any PDF','🔍 Ask anything','📋 Summarize docs','⚖️ Compare papers','📌 View citations','💾 Saved history'].map((f,i)=>(
            <div key={i} className={`text-xs p-2 rounded-lg border text-left ${D?'border-gray-700 bg-gray-800/50 text-gray-300':'border-gray-200 bg-gray-50 text-gray-600'}`}>{f}</div>
          ))}
        </div>
        <button onClick={()=>signIn('google')} className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
        <button onClick={()=>setDark(d=>!d)} className={`text-xs ${T.sec} hover:text-blue-400`}>{D?'☀️ Light Mode':'🌙 Dark Mode'}</button>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen font-sans overflow-hidden ${T.root}`} style={{fontSize:`${fontSize}px`}}>
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t=>(<div key={t.id} className={`px-4 py-2.5 rounded-xl shadow-2xl text-sm font-semibold text-white ${t.type==='success'?'bg-green-600':t.type==='error'?'bg-red-500':'bg-blue-600'}`}>{t.message}</div>))}
      </div>

      {/* Left icon nav */}
      <nav className={`w-14 flex flex-col items-center border-r py-3 gap-0.5 shrink-0 ${T.nav}`}>
        <button onClick={newChat} title={t('newChat')} className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-xl mb-2 hover:scale-105 transition-transform shadow-md">🧠</button>
        {([['💬','history',t('history')],['⭐','favorites',t('favorites')],['🔍','search',t('search')],['📁','docs',t('documents')]] as [string,string,string][]).map(([icon,key,label])=>(
          <button key={key} onClick={()=>{setNav(key as any);setShowSidebar(true);}} title={label} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${nav===key&&showSidebar?(D?'bg-blue-600/25 text-blue-400 ring-1 ring-blue-600/40':'bg-blue-100 text-blue-600'):`${T.sec} ${T.hover}`}`}>{icon}</button>
        ))}
        <div className="flex-1"/>
        <div className="relative">
          <button onClick={()=>setShowNotifs(s=>!s)} title={t('notifications')} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${T.sec} ${T.hover} relative`}>
            🔔{unread>0&&<span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">{unread}</span>}
          </button>
        </div>
        <button onClick={()=>setShowHelp(true)} title={t('help')} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${T.sec} ${T.hover}`}>❓</button>
        <button onClick={()=>setShowSettings(s=>!s)} title={t('settings')} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${showSettings?'text-blue-400 bg-blue-600/20':`${T.sec} ${T.hover}`}`}>⚙️</button>
        <button onClick={()=>setShowProfile(s=>!s)} title={t('profile')} className="mt-1 mb-0.5">
          {session.user?.image?<img src={session.user.image} alt="avatar" className="w-9 h-9 rounded-full ring-2 ring-blue-500"/>:<div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-sm font-bold text-white">{session.user?.name?.[0]}</div>}
        </button>
      </nav>

      {/* Left panel */}
      {showSidebar&&(
        <aside className={`w-72 flex flex-col border-r shrink-0 ${T.panel}`}>
          <div className={`flex items-center justify-between px-4 py-3 border-b ${T.div}`}>
            <span className="font-semibold text-sm">{nav==='history'&&`💬 ${t('history')}`}{nav==='favorites'&&`⭐ ${t('favorites')}`}{nav==='search'&&`🔍 ${t('search')}`}{nav==='docs'&&`📁 ${t('documents')}`}</span>
            <button onClick={()=>setShowSidebar(false)} className={`text-xs p-1 rounded ${T.sec} ${T.hover}`}>✕</button>
          </div>
          {(nav==='history'||nav==='favorites')&&(<div className="p-3 pb-2"><button onClick={newChat} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md">+ {t('newChat')}</button></div>)}
          {(nav==='history'||nav==='search')&&(<div className="px-3 pb-2"><input value={histSearch} onChange={e=>setHistSearch(e.target.value)} placeholder={t('search')} className={`w-full px-3 py-2 rounded-lg text-sm border outline-none ${T.input}`}/></div>)}
          {nav==='docs'&&(
            <div className="px-3 pt-2 pb-2 space-y-2">
              <button onClick={()=>fileRef.current?.click()} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">{t('addPaper')}</button>
              <input ref={fileRef} type="file" onChange={uploadFile} className="hidden" accept=".pdf"/>
              <button onClick={fetchFiles} className={`w-full py-2 rounded-xl text-xs font-medium border ${D?'border-gray-700 text-gray-400 hover:bg-gray-800':'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>🔄 {t('refresh')}</button>
              {readyFiles.length>=2&&(<button onClick={()=>{setCompareMode(c=>!c);setCompareSelected([]);}} className={`w-full py-2 rounded-xl text-sm font-medium border ${compareMode?'bg-purple-600 border-purple-500 text-white':D?'border-gray-700 text-gray-300 hover:bg-gray-800':'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{compareMode?`✕ Cancel`:`⚖️ ${t('compare')}`}</button>)}
              {compareMode&&compareSelected.length===2&&(<button onClick={compare} disabled={loading} className="w-full py-2.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50">▶ Run Comparison</button>)}
              {readyFiles.length>0&&(<div className={`px-3 py-1.5 rounded-lg text-xs border ${D?'bg-blue-950/40 text-blue-300 border-blue-900':'bg-blue-50 text-blue-700 border-blue-100'}`}>📚 {readyFiles.length} paper{readyFiles.length!==1?'s':''} · {totalChunks} chunks</div>)}
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
            {(nav==='history'||nav==='search')&&(filteredConvs.length===0?(<div className={`text-center py-10 text-sm ${T.sec}`}><p className="text-3xl mb-3">💬</p><p>{t('noChats')}</p><button onClick={newChat} className="mt-2 text-blue-400 text-xs hover:text-blue-300">+ {t('newChat')}</button></div>):filteredConvs.map(c=>(
              <div key={c.id} onClick={()=>{setActiveId(c.id);setCitation(null);}} className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${c.id===activeId?T.active:T.card}`}>
                {renamingId===c.id?(<input ref={renameRef} value={renameVal} onChange={e=>setRenameVal(e.target.value)} onBlur={()=>{if(renameVal.trim())setConvs(p=>p.map(x=>x.id===c.id?{...x,name:renameVal.trim()}:x));setRenamingId(null);}} onKeyDown={e=>{if(e.key==='Enter')renameRef.current?.blur();if(e.key==='Escape')setRenamingId(null);}} onClick={e=>e.stopPropagation()} className={`w-full text-sm px-1 py-0.5 rounded border outline-none ${T.input}`}/>):(<div className={`text-sm font-medium truncate pr-14 ${T.pri}`}>{c.name}</div>)}
                <div className={`text-[10px] mt-0.5 ${T.sec}`}>{new Date(c.updatedAt).toLocaleDateString()} · {c.messages.length} msg{c.messages.length!==1?'s':''}</div>
                <div className="absolute top-2.5 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e=>{e.stopPropagation();starConv(c.id);}} className={`p-1 rounded text-xs ${c.starred?'text-yellow-400':T.sec} hover:text-yellow-400`}>{c.starred?'⭐':'☆'}</button>
                  <button onClick={e=>{e.stopPropagation();setRenamingId(c.id);setRenameVal(c.name);}} className={`p-1 rounded text-xs ${T.sec} hover:text-blue-400`}>✏️</button>
                  <button onClick={e=>{e.stopPropagation();deleteConv(c.id);}} className={`p-1 rounded text-xs ${T.sec} hover:text-red-400`}>🗑️</button>
                </div>
              </div>
            )))}
            {nav==='favorites'&&(convs.filter(c=>c.starred).length===0?(<div className={`text-center py-10 text-sm ${T.sec}`}><p className="text-3xl mb-3">⭐</p><p>No favorites yet.</p><p className="text-xs mt-1">Star a chat to save it here.</p></div>):convs.filter(c=>c.starred).map(c=>(<div key={c.id} onClick={()=>{setActiveId(c.id);setCitation(null);}} className={`p-3 rounded-xl border cursor-pointer transition-all ${c.id===activeId?T.active:T.card}`}><div className={`text-sm font-medium truncate ${T.pri}`}>{c.name}</div><div className={`text-[10px] mt-0.5 ${T.sec}`}>{new Date(c.updatedAt).toLocaleDateString()}</div></div>)))}
            {nav==='docs'&&(files.length===0?(<div className={`text-center py-8 text-sm ${T.sec}`}><p className="text-3xl mb-2">📄</p><p>No papers yet.</p></div>):files.map(f=>(
              <div key={f.id} onClick={()=>compareMode&&f.status==='ready'&&setCompareSelected(p=>p.includes(f.name)?p.filter(n=>n!==f.name):p.length<2?[...p,f.name]:p)} className={`group p-3 rounded-xl border relative transition-all ${compareMode&&f.status==='ready'?'cursor-pointer':''} ${compareSelected.includes(f.name)?'border-purple-500 bg-purple-600/20':T.card}`}>
                <div className={`text-sm font-medium truncate pr-5 ${T.pri}`}>{f.name}</div>
                <div className="text-[10px] mt-1 font-semibold">{f.status==='processing'?<span className="text-yellow-400 animate-pulse">⚡️ Processing...</span>:f.status==='ready'?<span className="text-green-400">✅ {f.chunkCount} chunks</span>:<span className="text-red-400">❌ Error</span>}</div>
                {f.status==='ready'&&!compareMode&&(<div className="flex gap-1.5 mt-2"><button onClick={e=>{e.stopPropagation();summarize(f.name);}} disabled={loading} className={`flex-1 py-1 text-xs rounded-lg font-medium disabled:opacity-40 ${D?'bg-gray-700 hover:bg-gray-600 text-gray-300':'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>📋 {t('summarize')}</button><button onClick={e=>{e.stopPropagation();deleteFile(f.id,f.name);}} className={`px-2 py-1 text-xs rounded-lg ${D?'bg-gray-700 hover:bg-red-900/50 text-gray-400 hover:text-red-400':'bg-gray-200 hover:bg-red-100 text-gray-400 hover:text-red-500'}`}>🗑️</button></div>)}
                {compareSelected.includes(f.name)&&<span className="absolute top-3 right-3 text-purple-400 font-bold">✓</span>}
              </div>
            )))}
          </div>
        </aside>
      )}

      {/* Main chat */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className={`flex items-center justify-between px-4 py-2.5 border-b shrink-0 ${T.nav}`}>
          <div className="flex items-center gap-2">
            {!showSidebar&&<button onClick={()=>setShowSidebar(true)} className={`p-2 rounded-lg ${T.sec} ${T.hover}`}>☰</button>}
            <h1 className={`text-sm font-bold truncate max-w-[200px] ${T.pri}`}>{activeConv?.name||'Research AI'}</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={newChat} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${D?'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30':'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>+ {t('newChat')}</button>
            {canRegen&&<button onClick={regenerate} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${T.sec} ${T.hover}`}>🔄 {t('regenerate')}</button>}
            {msgs.length>0&&<button onClick={shareChat} className={`p-2 rounded-lg ${T.sec} ${T.hover}`} title={t('share')}>📤</button>}
            {msgs.length>0&&<button onClick={exportChat} className={`p-2 rounded-lg ${T.sec} ${T.hover}`} title={t('export')}>⬇️</button>}
            <button onClick={fetchFiles} className={`p-2 rounded-lg ${T.sec} ${T.hover}`} title={t('refresh')}>🔄</button>
            <button onClick={()=>setFontSize(s=>Math.max(11,s-1))} className={`px-2 py-1 rounded text-xs ${T.sec} ${T.hover}`}>A-</button>
            <button onClick={()=>setFontSize(s=>Math.min(20,s+1))} className={`px-2 py-1 rounded text-xs ${T.sec} ${T.hover}`}>A+</button>
            <div className="relative">
              <button onClick={()=>setShowLang(s=>!s)} className={`px-2 py-1.5 rounded-lg text-xs font-medium ${T.sec} ${T.hover}`}>🌐 {lang.toUpperCase()}</button>
              {showLang&&(<div className={`absolute right-0 top-9 rounded-xl border z-50 py-1 w-36 ${T.drop}`}>{([['en','🇺🇸 English'],['hi','🇮🇳 Hindi'],['es','🇪🇸 Español']] as [string,string][]).map(([code,label])=>(<button key={code} onClick={()=>{setLang(code);setShowLang(false);}} className={`w-full text-left px-3 py-1.5 text-xs ${T.hover} ${lang===code?'text-blue-400 font-semibold':T.sec}`}>{label}</button>))}</div>)}
            </div>
            <button onClick={toggleFS} className={`p-2 rounded-lg ${T.sec} ${T.hover}`} title={t('fullscreen')}>{fullscreen?'⊡':'⛶'}</button>
            <button onClick={()=>setDark(d=>!d)} className={`p-2 rounded-lg ${T.sec} ${T.hover}`}>{D?'☀️':'🌙'}</button>
            <button onClick={()=>setShowFeedback(true)} className={`p-2 rounded-lg ${T.sec} ${T.hover}`}>💬</button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {msgs.length===0?(
            <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto space-y-8">
              <div><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">🔬</div><h2 className={`text-2xl font-bold mb-2 ${T.pri}`}>{t('welcome')}</h2><p className={`text-sm ${T.sec}`}>Go to 📁 Documents to upload papers, then ask anything below.</p></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {['What are the main findings?','Summarize the introduction','What methodology was used?','What are the key conclusions?'].map((s,i)=>(<button key={i} onClick={()=>setInput(s)} className={`p-4 rounded-xl border text-sm text-left transition-all hover:scale-[1.02] ${D?'border-gray-700 bg-gray-900 hover:bg-gray-800 text-gray-300':'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'}`}>{s}</button>))}
              </div>
            </div>
          ):msgs.map(m=>(
            <div key={m.id} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 relative group ${m.role==='user'?'bg-blue-600 text-white':T.msgA}`}>
                <div className={`text-[10px] mb-1.5 ${m.role==='user'?'text-blue-200':T.sec}`}>{new Date(m.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                {m.role==='assistant'&&m.content&&(<button onClick={()=>{navigator.clipboard.writeText(m.content);toast('Copied!');}} className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md ${D?'bg-gray-700 hover:bg-gray-600 text-gray-300':'bg-gray-100 hover:bg-gray-200 text-gray-600'}`} title="Copy"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>)}
                {m.content===''&&loading&&m.role==='assistant'?(<div className="flex gap-1.5 items-center h-5"><div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"/><div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"/><div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"/></div>):(<article className={`prose prose-sm max-w-none ${m.role==='user'||D?'prose-invert':''}`}><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown></article>)}
                {m.sources&&m.sources.length>0&&(
                  <div className={`mt-4 pt-4 border-t ${D?'border-gray-700':'border-gray-200'}`}>
                    <p className={`text-[10px] uppercase font-bold mb-2 tracking-wider ${T.sec}`}>📌 Citations</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.sources.map((s,i)=>(<button key={i} onClick={()=>setCitation(prev=>prev?.page===s.page&&prev?.fileName===s.fileName?null:{fileName:s.fileName,page:s.page!})} className={`px-2.5 py-1 rounded-lg text-[11px] border transition-all ${citation?.page===s.page&&citation?.fileName===s.fileName?'bg-blue-600 border-blue-400 text-white':D?'bg-gray-800 border-gray-600 text-blue-300 hover:border-blue-500':'bg-gray-100 border-gray-300 text-blue-600 hover:border-blue-400'}`}>📄 {s.fileName.replace('.pdf','')} · p.{s.page}</button>))}
                    </div>
                    {citation&&m.sources.some(s=>s.page===citation.page&&s.fileName===citation.fileName)&&(
                      <div className={`mt-3 rounded-xl border overflow-hidden ${D?'border-gray-700':'border-gray-200'}`}>
                        <div className={`p-2.5 text-[10px] flex justify-between border-b ${D?'bg-gray-800 border-gray-700':'bg-gray-50 border-gray-200'}`}><span className={`font-bold uppercase ${T.sec}`}>📌 {citation.fileName} · Page {citation.page}</span><button onClick={()=>setCitation(null)} className="hover:text-red-400">✕ Close</button></div>
                        <object data={`http://localhost:5000/uploads/${citation.fileName}#page=${citation.page}&toolbar=0&navpanes=0`} type="application/pdf" className="w-full h-[500px] bg-white"><div className="p-6 text-center"><a href={`http://localhost:5000/uploads/${citation.fileName}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm">Open PDF in new tab →</a></div></object>
                      </div>
                    )}
                  </div>
                )}
                {m.role==='assistant'&&m.followUps&&m.followUps.length>0&&m.content&&(
                  <div className={`mt-4 pt-4 border-t ${D?'border-gray-700':'border-gray-200'}`}>
                    <p className={`text-[10px] uppercase font-bold mb-2 tracking-wider ${T.sec}`}>💡 {t('followUp')}</p>
                    <div className="flex flex-col gap-1.5">{m.followUps.map((q,i)=>(<button key={i} onClick={()=>setInput(q)} disabled={loading} className={`text-left text-xs px-3 py-2 rounded-lg border transition-all hover:scale-[1.005] disabled:opacity-50 ${D?'border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-300':'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'}`}>{q}</button>))}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={endRef}/>
        </div>

        {/* Input bar */}
        <div className={`px-5 py-4 border-t shrink-0 ${T.nav}`}>
          <div className="max-w-4xl mx-auto">
            {msgs.length>0&&(<div className="flex justify-end gap-2 mb-2">{canRegen&&<button onClick={regenerate} className={`text-xs px-2.5 py-1 rounded-lg ${T.sec} ${T.hover}`}>🔄 {t('regenerate')}</button>}<button onClick={clearChat} className={`text-xs px-2.5 py-1 rounded-lg ${D?'text-gray-500 hover:text-red-400 hover:bg-gray-800':'text-gray-400 hover:text-red-500 hover:bg-gray-100'}`}>🗑️ {t('clear')}</button></div>)}
            <div className="flex gap-3">
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendMsg()} placeholder={t('placeholder')} className={`flex-1 rounded-xl px-4 py-3 outline-none border transition-colors ${T.input}`}/>
              <button onClick={sendMsg} disabled={loading||!input.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-6 rounded-xl font-bold transition-all">{loading?'...':t('send')}</button>
            </div>
          </div>
        </div>
      </main>

      {/* Settings panel */}
      {showSettings&&(
        <aside className={`w-72 flex flex-col border-l shrink-0 ${T.panel}`}>
          <div className={`flex items-center justify-between px-4 py-3 border-b ${T.div}`}><span className="font-semibold text-sm">⚙️ {t('settings')}</span><button onClick={()=>setShowSettings(false)} className={`text-xs p-1 rounded ${T.sec} ${T.hover}`}>✕</button></div>
          <div className="p-4 space-y-5 overflow-y-auto flex-1">
            <div><p className={`text-xs font-bold uppercase tracking-wider mb-2 ${T.sec}`}>{t('theme')}</p><div className="flex gap-2"><button onClick={()=>setDark(true)} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${D?'bg-blue-600 text-white border-blue-500':'border-gray-700 text-gray-400'}`}>🌙 Dark</button><button onClick={()=>setDark(false)} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${!D?'bg-blue-600 text-white border-blue-500':'border-gray-700 text-gray-400'}`}>☀️ Light</button></div></div>
            <div><p className={`text-xs font-bold uppercase tracking-wider mb-2 ${T.sec}`}>{t('zoom')} ({fontSize}px)</p><div className="flex items-center gap-2"><button onClick={()=>setFontSize(s=>Math.max(11,s-1))} className={`w-9 h-9 rounded-lg font-bold ${D?'bg-gray-800 text-gray-300 hover:bg-gray-700':'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>A-</button><input type="range" min={11} max={20} value={fontSize} onChange={e=>setFontSize(+e.target.value)} className="flex-1 accent-blue-500"/><button onClick={()=>setFontSize(s=>Math.min(20,s+1))} className={`w-9 h-9 rounded-lg font-bold ${D?'bg-gray-800 text-gray-300 hover:bg-gray-700':'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>A+</button></div></div>
            <div><p className={`text-xs font-bold uppercase tracking-wider mb-2 ${T.sec}`}>{t('language')}</p>{([['en','🇺🇸 English'],['hi','🇮🇳 Hindi'],['es','🇪🇸 Español']] as [string,string][]).map(([code,label])=>(<button key={code} onClick={()=>setLang(code)} className={`w-full text-left px-3 py-2 mb-1 rounded-lg text-sm border ${lang===code?'border-blue-500 bg-blue-600/20 text-blue-400':D?'border-gray-700 text-gray-300 hover:bg-gray-800':'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{label}</button>))}</div>
            <div><p className={`text-xs font-bold uppercase tracking-wider mb-2 ${T.sec}`}>{t('profile')}</p><div className={`p-3 rounded-xl border flex gap-3 items-center ${D?'border-gray-700 bg-gray-800/40':'border-gray-200 bg-gray-50'}`}>{session.user?.image&&<img src={session.user.image} alt="avatar" className="w-10 h-10 rounded-full"/>}<div><p className={`font-semibold text-sm ${T.pri}`}>{session.user?.name}</p><p className={`text-xs ${T.sec} truncate`}>{session.user?.email}</p></div></div></div>
            <button onClick={toggleFS} className={`w-full py-2 rounded-xl text-sm font-medium border ${D?'border-gray-700 text-gray-300 hover:bg-gray-800':'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>⛶ {t('fullscreen')}</button>
            <button onClick={()=>{setShowSettings(false);setShowFeedback(true);}} className={`w-full py-2 rounded-xl text-sm font-medium border ${D?'border-gray-700 text-gray-300 hover:bg-gray-800':'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>💬 {t('feedback')}</button>
            <button onClick={()=>signOut()} className="w-full py-2 rounded-xl text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10">🚪 {t('logout')}</button>
          </div>
        </aside>
      )}

      {/* Notifications */}
      {showNotifs&&(<div className={`fixed top-16 left-14 w-80 rounded-2xl border z-50 overflow-hidden ${T.drop}`}><div className={`flex items-center justify-between px-4 py-3 border-b ${T.div}`}><span className="font-semibold text-sm">🔔 {t('notifications')}</span><div className="flex gap-2"><button onClick={()=>setNotifs(p=>p.map(n=>({...n,read:true})))} className={`text-xs ${T.sec} hover:text-blue-400`}>Mark all read</button><button onClick={()=>setShowNotifs(false)} className={`text-xs ${T.sec}`}>✕</button></div></div><div className="max-h-80 overflow-y-auto">{notifs.length===0?<div className={`text-center py-8 text-sm ${T.sec}`}>No notifications</div>:notifs.map(n=>(<div key={n.id} className={`px-4 py-3 border-b text-sm ${T.div} ${!n.read?(D?'bg-blue-950/30':'bg-blue-50'):''}`}><p className={T.pri}>{n.text}</p><p className={`text-[10px] mt-0.5 ${T.sec}`}>{new Date(n.time).toLocaleTimeString()}</p></div>))}</div></div>)}

      {/* Profile menu */}
      {showProfile&&(<div className={`fixed bottom-16 left-2 w-64 rounded-2xl border z-50 py-2 ${T.drop}`}><div className={`px-4 py-3 border-b ${T.div}`}><p className={`font-semibold text-sm ${T.pri}`}>{session.user?.name}</p><p className={`text-xs ${T.sec} truncate`}>{session.user?.email}</p></div><div className="px-2 pt-1 pb-1"><button onClick={()=>{setShowProfile(false);setShowSettings(true);}} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${T.hover} ${T.sec}`}>⚙️ {t('settings')}</button><button onClick={()=>{setShowProfile(false);setShowFeedback(true);}} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${T.hover} ${T.sec}`}>💬 {t('feedback')}</button><button onClick={()=>{setShowProfile(false);setShowHelp(true);}} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${T.hover} ${T.sec}`}>❓ {t('help')}</button><hr className={`my-1 ${T.div}`}/><button onClick={()=>signOut()} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10">🚪 {t('logout')}</button></div></div>)}

      {/* Help modal */}
      {showHelp&&(<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={()=>setShowHelp(false)}><div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 ${D?'bg-gray-900 border-gray-700':'bg-white border-gray-200'}`} onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h2 className={`text-xl font-bold ${T.pri}`}>❓ {t('help')}</h2><button onClick={()=>setShowHelp(false)} className={T.sec}>✕</button></div><div className="space-y-3 max-h-96 overflow-y-auto">{[['📁 Add a Paper','Click the 📁 Documents icon, then click + Add Research Paper to upload any PDF.'],['💬 New Chat','Click the 🧠 logo at top of the left nav, or + New Chat button.'],['📋 Summarize','In Documents panel, click Summarize next to any ready paper.'],['⚖️ Compare','In Documents, click Compare Docs, select 2 papers, then Run Comparison.'],['💡 Follow-ups','After each answer, click any suggested follow-up question to continue.'],['🔄 Regenerate','Click Regenerate to get a fresh answer for your last question.'],['⭐ Favorites','Hover over a conversation and click ☆ to star it.'],['✏️ Rename','Hover over a conversation and click ✏️ to rename it inline.'],['⬇️ Export','Click ⬇️ in the top bar to download the chat as Markdown.']].map(([title,desc])=>(<div key={title} className={`p-3 rounded-xl border ${D?'border-gray-700 bg-gray-800/40':'border-gray-200 bg-gray-50'}`}><p className={`font-semibold text-sm mb-0.5 ${T.pri}`}>{title}</p><p className={`text-xs leading-relaxed ${T.sec}`}>{desc}</p></div>))}</div></div></div>)}

      {/* Feedback modal */}
      {showFeedback&&(<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={()=>setShowFeedback(false)}><div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 ${D?'bg-gray-900 border-gray-700':'bg-white border-gray-200'}`} onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h2 className={`text-xl font-bold ${T.pri}`}>💬 {t('feedback')}</h2><button onClick={()=>setShowFeedback(false)} className={T.sec}>✕</button></div><p className={`text-sm ${T.sec}`}>How is your experience with Research AI?</p><div className="flex justify-center gap-5 text-4xl">{['😞','😐','😊','😍'].map((e,i)=>(<button key={i} onClick={()=>{toast('Thanks for your feedback! 🙏');setShowFeedback(false);}} className="hover:scale-125 transition-transform">{e}</button>))}</div><textarea value={feedbackText} onChange={e=>setFeedbackText(e.target.value)} placeholder="Any suggestions? (optional)" rows={3} className={`w-full px-3 py-2 rounded-xl border text-sm resize-none outline-none ${T.input}`}/><button onClick={()=>{toast('Feedback submitted! 🙏');setShowFeedback(false);setFeedbackText('');}} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl">Submit Feedback</button></div></div>)}

      {(showProfile||showNotifs||showLang)&&<div className="fixed inset-0 z-40" onClick={()=>{setShowProfile(false);setShowNotifs(false);setShowLang(false);}}/>}
    </div>
  );
}
