'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import Viewer3D from '@/components/Viewer3D';

type Msg = {
  id: number;
  senderUserId: number;
  senderName: string;
  body: string | null;
  file: { path: string; name: string } | null;
  isImage: boolean;
  isAudio: boolean;
  createdAt: string;
  mine: boolean;
};

// ─── Custom In-Page Voice Note Audio Player ──────────────────────────
function AudioPlayer({ src, isMine }: { src: string; isMine: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };

    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTo = (Number(e.target.value) / 100) * (audioRef.current.duration || 0);
    audioRef.current.currentTime = seekTo;
    setProgress(Number(e.target.value));
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !Number.isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`mt-2 flex items-center gap-3 rounded-xl p-2.5 transition ${
      isMine
        ? 'bg-black/15 text-[#090d16]'
        : 'bg-[#070A10]/80 text-white border border-[rgba(42,127,255,0.25)]'
    }`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play / Pause Toggle Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition shadow-md ${
          isMine
            ? 'bg-[#070A10] text-[var(--accent-light)] hover:scale-105'
            : 'bg-[var(--accent)] text-white hover:scale-105'
        }`}
      >
        <span className="text-sm font-black">{isPlaying ? '⏸' : '▶'}</span>
      </button>

      {/* Scrubber & Audio Wave Simulation */}
      <div className="flex-1">
        <div className="flex items-center gap-1 mb-1">
          <input
            type="range"
            min="0"
            max="100"
            value={progress || 0}
            onChange={handleSeek}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[var(--border)] accent-[var(--accent)]"
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono opacity-80 font-bold">
          <span>{formatTime(currentTime)}</span>
          <span>🎙️ {duration ? formatTime(duration) : 'Voice Note'}</span>
        </div>
      </div>
    </div>
  );
}

// ─── STL / 3D File Card with Three-Dots Menu (Open / Download) ───────
function StlAttachmentCard({
  file,
  isMine,
  isAr,
  onOpen3D,
}: {
  file: { path: string; name: string };
  isMine: boolean;
  isAr: boolean;
  onOpen3D: (url: string, title: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className={`relative mt-2 flex items-center justify-between gap-3 rounded-xl p-3 border transition ${
      isMine
        ? 'bg-black/10 border-black/20 text-[#090d16]'
        : 'bg-[#070A10]/80 border-[rgba(42,127,255,0.25)] text-white'
    }`}>
      {/* 3D File Info */}
      <div
        onClick={() => onOpen3D(`/api/files/${file.path}`, file.name)}
        className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 group"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-dim)] text-lg text-[var(--accent)] group-hover:scale-105 transition">
          🦷
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold group-hover:underline">{file.name}</p>
          <span className="text-[10px] font-mono text-[var(--accent-light)] font-semibold">
            3D STL / PLY Model
          </span>
        </div>
      </div>

      {/* Three-Dots Menu Toggle Button */}
      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition ${
            isMine
              ? 'hover:bg-black/20 text-[#090d16]'
              : 'hover:bg-[#123B6B]/40 text-white'
          }`}
          title={isAr ? 'خيارات الملف' : 'File Options'}
        >
          ⋮
        </button>

        {/* Floating Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 bottom-full mb-1 z-30 w-48 overflow-hidden rounded-xl border border-[rgba(42,127,255,0.3)] bg-[#0E1B2A] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in duration-150">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onOpen3D(`/api/files/${file.path}`, file.name);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-xs font-bold text-white hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)] transition"
            >
              <span>👁️</span>
              <span>{isAr ? 'معاينة 3D في الصفحة' : 'Open 3D Preview'}</span>
            </button>

            <a
              href={`/api/files/${file.path}`}
              download={file.name}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-xs font-bold text-white hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)] transition"
            >
              <span>⬇️</span>
              <span>{isAr ? 'تحميل ملف الـ STL' : 'Download STL File'}</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Case Chat Thread ───────────────────────────────────────────
export default function Chat({ caseId }: { caseId: number }) {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  // In-page 3D Modal Inspector state
  const [modal3D, setModal3D] = useState<{ url: string; title: string } | null>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);

  const isAr = lang === 'ar';

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
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (messages.length > prevCount.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevCount.current = messages.length;
  }, [messages]);

  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  function handleFileSelect(selected: FileList | null) {
    if (!selected) return;
    const newFiles = Array.from(selected);
    setAttachedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const filtered = newFiles.filter((f) => !existingNames.has(f.name));
      return [...prev, ...filtered];
    });
  }

  function removeAttachedFile(index: number) {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && attachedFiles.length === 0) return;
    setBusy(true);

    const fd = new FormData();
    if (text.trim()) fd.set('body', text.trim());
    attachedFiles.forEach((file) => {
      fd.append('files', file);
    });

    try {
      const res = await fetch(`/api/cases/${caseId}/messages`, { method: 'POST', body: fd });
      if (res.ok) {
        setText('');
        setAttachedFiles([]);
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  // Start Browser Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      alert(
        isAr
          ? 'يرجى السماح بالوصول إلى الميكروفون لتسجيل الرسائل الصوتية.'
          : 'Please allow microphone access to record voice notes.'
      );
    }
  };

  // Stop Recording and Send Audio File
  const stopAndSendRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, {
        type: 'audio/webm',
      });

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setBusy(true);
      const fd = new FormData();
      fd.append('files', audioFile);
      fd.set('body', isAr ? '🎙️ رسالة صوتية' : '🎙️ Voice Note');

      try {
        const res = await fetch(`/api/cases/${caseId}/messages`, { method: 'POST', body: fd });
        if (res.ok) {
          await load();
        }
      } finally {
        setBusy(false);
      }
    };

    mediaRecorderRef.current.stop();
  };

  // Cancel Recording
  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    setRecordingDuration(0);
    audioChunksRef.current = [];
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
      <div className="dentrio-card flex h-[520px] flex-col rounded-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[var(--text)]">
          <span>{isAr ? 'محادثة وتواصل الحالة' : 'Case Communication Thread'}</span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--accent-light)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {isAr ? 'متصل' : 'Live'}
          </span>
        </div>

        {/* Message List */}
        <div className="flex-1 space-y-3.5 overflow-y-auto p-5">
          {messages.length === 0 && (
            <p className="py-14 text-center text-xs font-semibold text-[var(--text-muted)]">
              {isAr
                ? 'لا توجد رسائل حتى الآن. أرسل استفساراً، ملاحظات سريرية، ملفات STL أو تسجيلاً صوتياً.'
                : 'No messages yet. Send a note, clinical clarification, STL files, or voice notes.'}
            </p>
          )}

          {messages.map((m) => {
            const isStl =
              m.file &&
              (m.file.name.toLowerCase().endsWith('.stl') ||
                m.file.name.toLowerCase().endsWith('.ply'));

            return (
              <div key={m.id} className={'flex ' + (m.mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={
                    'max-w-[85%] rounded-2xl px-4 py-3 text-xs shadow-md ' +
                    (m.mine
                      ? 'bg-[var(--accent)] text-[#090d16] font-semibold'
                      : 'border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text)] font-medium')
                  }
                >
                  {!m.mine && (
                    <p className="mb-1 text-[10px] font-bold opacity-75">
                      {m.senderName}
                    </p>
                  )}

                  {/* Text Body */}
                  {m.body && <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>}

                  {/* Audio Player for Voice Notes (Plays in-page) */}
                  {m.isAudio && m.file && (
                    <AudioPlayer src={`/api/files/${m.file.path}`} isMine={m.mine} />
                  )}

                  {/* 3D STL / PLY Attachment with Three-Dots Menu (Open / Download) */}
                  {isStl && m.file && (
                    <StlAttachmentCard
                      file={m.file}
                      isMine={m.mine}
                      isAr={isAr}
                      onOpen3D={(url, title) => setModal3D({ url, title })}
                    />
                  )}

                  {/* Image Preview */}
                  {m.isImage && m.file && (
                    <div className="mt-2">
                      <a href={`/api/files/${m.file.path}`} target="_blank" rel="noreferrer">
                        <img
                          src={`/api/files/${m.file.path}`}
                          alt="attachment"
                          className="max-h-52 rounded-xl border border-[var(--border)] object-cover hover:opacity-90 transition"
                        />
                      </a>
                    </div>
                  )}

                  {/* Generic Non-STL Document Attachment */}
                  {!m.isAudio && !m.isImage && !isStl && m.file && (
                    <a
                      href={`/api/files/${m.file.path}`}
                      target="_blank"
                      rel="noreferrer"
                      className={
                        'mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold underline ' +
                        (m.mine ? 'bg-black/10 text-[#090d16]' : 'bg-[#070A10]/60 text-[var(--accent)]')
                      }
                    >
                      <span>📎</span> {m.file.name}
                    </a>
                  )}

                  <p className="mt-1 text-end text-[9px] font-mono opacity-60">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Input Bar / Voice Recorder */}
        <div className="border-t border-[var(--border)] p-3.5 bg-[#0E1B2A]/70">
          {/* Attached Files List Preview */}
          {attachedFiles.length > 0 && !isRecording && (
            <div className="mb-2.5 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {attachedFiles.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-lg border border-[rgba(42,127,255,0.25)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs text-white"
                >
                  <span className="truncate max-w-[150px] font-semibold">📎 {f.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachedFile(i)}
                    className="ml-1 text-red-400 hover:text-red-300 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Live Audio Recording State */}
          {isRecording ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/40 bg-red-950/30 p-2.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5">
                <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
                <span className="font-mono text-xs font-bold text-red-400">
                  {formatTimer(recordingDuration)}
                </span>
                <span className="text-xs font-semibold text-white/90">
                  {isAr ? 'جارٍ تسجيل الصوت...' : 'Recording voice note…'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="rounded-lg border border-red-500/30 bg-[#070A10] px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20"
                  title={isAr ? 'إلغاء التسجيل' : 'Cancel'}
                >
                  ✕ {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={stopAndSendRecording}
                  className="btn-accent rounded-lg px-4 py-1.5 text-xs font-bold text-white shadow-md flex items-center gap-1.5"
                >
                  <span>🚀</span> {isAr ? 'إرسال' : 'Send Audio'}
                </button>
              </div>
            </div>
          ) : (
            /* Normal Typing & Multi-Attachment Action Bar */
            <form onSubmit={send} className="flex items-center gap-2">
              {/* Multi-File Attachment Button */}
              <label
                title={isAr ? 'إرفاق ملفات متعددة (STL، صور، PDF)' : 'Attach multiple files (STL, images, PDF)'}
                className="cursor-pointer rounded-xl border border-[rgba(42,127,255,0.25)] bg-[var(--bg-elevated)] p-2.5 text-xs font-bold text-[var(--text-muted)] hover:text-white transition hover:border-[var(--accent)]"
              >
                📎
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </label>

              {/* Voice Record Button */}
              <button
                type="button"
                onClick={startRecording}
                title={isAr ? 'تسجيل رسالة صوتية' : 'Record voice note'}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(42,127,255,0.25)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--accent-light)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] transition"
              >
                🎙️
              </button>

              {/* Message Input */}
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  isAr
                    ? 'اكتب رسالة أو أرفق عدة ملفات أو سجل صوتاً…'
                    : 'Type message, attach files, or record voice note…'
                }
                className="dentrio-input flex-1 rounded-xl px-3.5 py-2.5 text-xs font-medium bg-[#070A10]"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={busy || (!text.trim() && attachedFiles.length === 0)}
                className="btn-accent rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-40"
              >
                {isAr ? 'إرسال' : 'Send'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* In-Page Interactive 3D STL Inspector Modal */}
      {modal3D && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-[rgba(42,127,255,0.3)] bg-[#0E1B2A] text-[var(--text)] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl">🦷</span>
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-md">{modal3D.title}</h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">
                    {isAr ? 'معاينة ثلاثية الأبعاد تفاعلية في الصفحة' : 'In-Page Interactive 3D STL Inspector'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={modal3D.url}
                  download={modal3D.title}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-accent rounded-xl px-4 py-1.5 text-xs font-bold text-white shadow-md flex items-center gap-1.5"
                >
                  <span>⬇️</span>
                  <span>{isAr ? 'تحميل STL' : 'Download'}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setModal3D(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[#070A10] text-[var(--text-muted)] hover:text-white hover:border-[var(--accent)]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal 3D Viewport */}
            <div className="p-4">
              <Viewer3D url={modal3D.url} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
