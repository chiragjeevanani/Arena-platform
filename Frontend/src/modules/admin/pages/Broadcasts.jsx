import { useCallback, useEffect, useRef, useState } from 'react';
import { Megaphone, ImagePlus, X, Send, Users, History, Bell } from 'lucide-react';
import { listAdminBroadcasts, sendAdminBroadcast, uploadAdminImage } from '../../../services/adminOpsApi';
import { listArenaBroadcasts, sendArenaBroadcast, uploadArenaImage } from '../../../services/arenaStaffApi';

const input = 'w-full px-3 rounded-xl border border-slate-200 bg-[#ffffff] text-[13px] font-semibold text-[#36454F] outline-none focus:border-[#CE2029]';
const label = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1';
const fmtTime = (d) => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const AUDIENCE = {
  customers: ['All customers', 'Everyone who uses the customer app'],
  staff: ['Staff & coaches', 'Arena admins, receptionists and coaches'],
  everyone: ['Everyone', 'Customers and staff'],
};

/** How it will look in the customer's notifications. */
function Preview({ title, message, imageUrl }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-[#ffffff] shadow-sm p-3 flex gap-3" data-testid="broadcast-preview">
      <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0"><Bell size={18} className="text-blue-600" /></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2"><span className="text-[13px] font-black text-[#36454F] truncate">{title || 'Title'}</span><span className="text-[9px] font-bold text-slate-400">Just now</span></div>
        <p className="text-[11px] text-slate-500 whitespace-pre-line mt-0.5">{message || 'Your message…'}</p>
        {imageUrl && <img src={imageUrl} alt="" className="mt-2 rounded-xl w-full max-h-48 object-cover border border-slate-100" />}
      </div>
    </div>
  );
}

/**
 * Send a message to many users' notifications at once (title + text, optional image).
 * channel 'admin' = Super Admin (all users); 'arena' = arena admin (customers + their arena's staff).
 */
export default function Broadcasts({ channel = 'admin', arenaId = null }) {
  const api = channel === 'arena'
    ? { list: () => listArenaBroadcasts(arenaId), send: (b) => sendArenaBroadcast(b, arenaId), upload: uploadArenaImage }
    : { list: listAdminBroadcasts, send: sendAdminBroadcast, upload: uploadAdminImage };
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [audience, setAudience] = useState('customers');
  const [count, setCount] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [history, setHistory] = useState([]);
  const fileRef = useRef(null);

  const loadHistory = useCallback(async () => { try { setHistory((await api.list()).broadcasts || []); } catch { /* ignore */ } }, [channel, arenaId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void loadHistory(); }, [loadHistory]);
  useEffect(() => {
    let live = true; setCount(null);
    api.send({ title: 'x', message: 'x', audience, preview: true }).then((r) => live && setCount(r.recipients)).catch(() => {});
    return () => { live = false; };
  }, [audience, channel, arenaId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFile = async (e) => {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) { setErr('Choose an image file'); return; }
    if (f.size > 5 * 1024 * 1024) { setErr('The image must be smaller than 5 MB'); return; }
    setUploading(true); setErr('');
    try { const r = await api.upload(f); setImageUrl(r.url); } catch (e2) { setErr(e2.message || 'Upload failed'); } finally { setUploading(false); }
  };
  const testToMe = async () => {
    setBusy(true); setErr(''); setMsg('');
    try { const r = await api.send({ title, message, imageUrl, audience, testToMe: true }); setMsg(`Test sent only to you (${r.sentTo}). Open your notifications (bell, or the customer app) to see how it looks.`); } catch (e2) { setErr(e2.message || 'Could not send the test'); } finally { setBusy(false); }
  };
  const send = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Send "${title}" to ${count ?? 'all'} ${AUDIENCE[audience][0].toLowerCase()}? This can't be undone.`)) return;
    setBusy(true); setErr(''); setMsg('');
    try {
      const r = await api.send({ title, message, imageUrl, audience });
      setMsg(`Sent to ${r.broadcast.recipients} people. It's in their notifications now.`);
      setTitle(''); setMessage(''); setImageUrl('');
      await loadHistory();
    } catch (e2) { setErr(e2.message || 'Could not send'); } finally { setBusy(false); }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl">
      <div className="bg-[#ffffff] rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
        <Megaphone size={20} className="text-[#CE2029]" />
        <div><h1 className="text-[18px] font-black text-[#36454F]">Broadcast Message</h1><p className="text-[12px] text-slate-500">Send a message to everyone's notifications at once — with an optional image (offers, closures, tournaments).</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <form onSubmit={send} className="lg:col-span-3 bg-[#ffffff] rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
          <div><span className={label}>Send to</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Object.entries(AUDIENCE).map(([k, [l, d]]) => (
                <button key={k} type="button" onClick={() => setAudience(k)} className={`text-left rounded-xl border p-2.5 ${audience === k ? 'border-[#CE2029] bg-[#CE2029]/5' : 'border-slate-200 bg-[#ffffff]'}`}>
                  <p className="text-[12px] font-black text-[#36454F]">{l}</p><p className="text-[10px] text-slate-400">{d}</p>
                </button>
              ))}
            </div>
            <p className="text-[11px] font-bold text-slate-500 mt-1.5 flex items-center gap-1"><Users size={12} /> {count === null ? 'Counting…' : `${count} people will get it`}</p>
          </div>
          <div><span className={label}>Title *</span><input aria-label="Broadcast title" className={`${input} h-11`} required maxLength={80} placeholder="e.g. Weekend offer: 20% off evening courts" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><span className={label}>Message * <span className="normal-case tracking-normal font-bold text-slate-300">({message.length}/1000)</span></span><textarea aria-label="Broadcast message" className={`${input} py-2.5 min-h-[120px]`} required maxLength={1000} placeholder="Write the message…" value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <div><span className={label}>Image (optional)</span>
            {imageUrl ? (
              <div className="relative inline-block" data-testid="broadcast-image">
                <img src={imageUrl} alt="" className="h-32 rounded-xl border border-slate-200 object-cover" />
                <button type="button" onClick={() => setImageUrl('')} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#36454F] text-[#ffffff] flex items-center justify-center" title="Remove image"><X size={14} /></button>
              </div>
            ) : (
              <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="h-11 px-4 rounded-xl border-2 border-dashed border-slate-200 text-[12px] font-black text-slate-500 flex items-center gap-2 disabled:opacity-50"><ImagePlus size={16} /> {uploading ? 'Uploading…' : 'Attach image'}</button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden aria-label="Broadcast image file" onChange={onFile} />
          </div>
          {err && <p className="text-[12px] font-bold text-red-600">{err}</p>}
          {msg && <p className="text-[12px] font-bold text-green-700" data-testid="broadcast-sent">{msg}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy || uploading || !title.trim() || !message.trim() || !count} className="h-11 px-6 rounded-xl bg-[#ce2029] text-[#ffffff] text-[13px] font-black flex items-center gap-2 disabled:opacity-40"><Send size={15} /> {busy ? 'Sending…' : `Send${count ? ` to ${count}` : ''}`}</button>
            <button type="button" onClick={testToMe} disabled={busy || uploading || !title.trim() || !message.trim()} className="h-11 px-4 rounded-xl border border-slate-200 bg-[#ffffff] text-[12px] font-black text-slate-600 flex items-center gap-2 disabled:opacity-40"><Bell size={14} /> Send a test to me</button>
          </div>
        </form>
        <div className="lg:col-span-2 space-y-2">
          <span className={label}>Preview (customer's notifications)</span>
          <Preview title={title} message={message} imageUrl={imageUrl} />
        </div>
      </div>

      <div className="bg-[#ffffff] rounded-2xl border border-slate-100 shadow-sm p-4">
        <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1"><History size={13} /> Sent messages</h3>
        {history.length === 0 ? <p className="text-[12px] text-slate-400">Nothing sent yet.</p> : (
          <div className="divide-y divide-slate-100" data-testid="broadcast-history">
            {history.map((b) => (
              <div key={b.id} className="py-2.5 flex gap-3">
                {b.imageUrl ? <img src={b.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover border border-slate-100 shrink-0" /> : <div className="w-14 h-14 rounded-lg bg-slate-50 flex items-center justify-center shrink-0"><Megaphone size={16} className="text-slate-300" /></div>}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-[#36454F]">{b.title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 whitespace-pre-line">{b.message}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{fmtTime(b.createdAt)} · {AUDIENCE[b.audience]?.[0]} · {b.recipients} people{b.sentByName ? ` · by ${b.sentByName}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
