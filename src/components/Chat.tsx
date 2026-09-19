'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Msg = {
  id: number;
  senderUserId: number;
  senderName: string;
  body: string | null;
  file: { path: string; name: string } | null;
  isImage: boolean;
  createdAt: string;
  mine: boolean;
};

export default function Chat({ caseId }: { caseId: number }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/cases/${caseId}/messages`);
      if (res.ok) setMessages(await res.json());
    } catch {
      /* ignore */
    }
  }, [caseId]);

  useEffect(() => {
    (async () => {
      await load();
    })();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (messages.length > prevCount.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevCount.current = messages.length;
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !file) return;
    setBusy(true);
    const fd = new FormData();
    fd.set('body', text);
    if (file) fd.set('file', file);
    try {
      const res = await fetch(`/api/cases/${caseId}/messages`, { method: 'POST', body: fd });
      if (res.ok) {
        setText('');
        setFile(null);
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dentrio-card flex h-[500px] flex-col rounded-2xl">
      <div className="border-b border-[var(--border)] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[var(--text)]">
        Case Communication Thread
      </div>
      <div className="flex-1 space-y-3.5 overflow-y-auto p-5">
        {messages.length === 0 && (
          <p className="py-14 text-center text-xs font-semibold text-[var(--text-muted)]">
            No messages yet. Send a note, question, or attachment photo to the lab.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={'flex ' + (m.mine ? 'justify-end' : 'justify-start')}>
            <div
              className={
                'max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs ' +
                (m.mine
                  ? 'bg-[var(--accent)] text-[#090d16] font-semibold shadow-sm'
                  : 'border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text)] font-medium')
              }
            >
              {!m.mine && (
                <p className="mb-1 text-[10px] font-bold text-[var(--text-muted)]">
                  {m.senderName}
                </p>
              )}
              {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}
              {m.file && (
                <a
                  href={`/api/files/${m.file.path}`}
                  target="_blank"
                  rel="noreferrer"
                  className={
                    'mt-1.5 inline-block text-xs font-bold underline ' +
                    (m.mine ? 'text-[#090d16]' : 'text-[var(--accent)]')
                  }
                >
                  {m.isImage ? '📷 View Attached Image' : `📎 ${m.file.name}`}
                </a>
              )}
              {m.isImage && m.file && (
                <img
                  src={`/api/files/${m.file.path}`}
                  alt="attachment"
                  className="mt-2 max-h-44 rounded-lg border border-[var(--border)]"
                />
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="border-t border-[var(--border)] p-3.5">
        {file && (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs text-[var(--text)]">
            <span className="truncate font-semibold">{file.name}</span>
            <button type="button" onClick={() => setFile(null)} className="ml-2 font-bold text-[var(--text-muted)] hover:text-red-400">
              ✕
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)]">
            📎
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type message to dental lab…"
            className="dentrio-input flex-1 rounded-xl px-3.5 py-2 text-xs font-medium"
          />
          <button
            type="submit"
            disabled={busy}
            className="btn-accent rounded-xl px-4 py-2 text-xs font-bold text-[#090d16] disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
