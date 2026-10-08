'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import ToothChartSelector from '@/components/ToothChartSelector';
import type { ApiMe } from '@/lib/types';
import { useLanguage } from '@/components/LanguageProvider';

type Lab = {
  id: number;
  labName: string;
  description: string;
  specialties: string;
  materials: string;
  turnaroundDays: number | null;
  address: string;
  isPreferred: boolean;
};

export default function NewCasePage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [user, setUser] = useState<ApiMe | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLab, setSelectedLab] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [prescription, setPrescription] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isAr = lang === 'ar';

  function setP(field: string, value: string) {
    setPrescription((p) => ({ ...p, [field]: value }));
  }

  useEffect(() => {
    (async () => {
      const me = await fetch('/api/auth/me');
      if (me.ok) setUser(await me.json());
      await loadLabs();
    })();
  }, []);

  async function loadLabs(q = '') {
    const url = q ? `/api/labs?q=${encodeURIComponent(q)}` : '/api/labs';
    const res = await fetch(url);
    if (res.ok) setLabs(await res.json());
  }

  useEffect(() => {
    const t = setTimeout(() => loadLabs(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  function handleFileSelect(selected: FileList | null) {
    if (!selected) return;
    const newFiles = Array.from(selected);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const filtered = newFiles.filter((f) => !existingNames.has(f.name));
      return [...prev, ...filtered];
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLab) {
      return setError(isAr ? 'يرجى اختيار معمل الأسنان.' : 'Please select a dental lab.');
    }
    if (files.length === 0) {
      return setError(
        isAr
          ? 'يرجى رفع ملف مسح ثلاثي الأبعاد واحد على الأقل (.stl أو .ply).'
          : 'Please upload at least one 3D scan file (.stl or .ply).'
      );
    }
    setError('');
    setBusy(true);

    const fd = new FormData();
    fd.set('labUserId', String(selectedLab));
    files.forEach((f) => {
      fd.append('scans', f);
    });
    fd.set('toothNumber', prescription.toothNumber || '');
    fd.set('material', prescription.material || '');
    fd.set('shade', prescription.shade || '');
    fd.set('dueDate', prescription.dueDate || '');
    fd.set('notes', prescription.notes || '');

    try {
      const res = await fetch('/api/cases', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isAr ? 'فشل إرسال الحالة' : 'Failed to create case'));
        setBusy(false);
        return;
      }
      router.push(`/cases/${data.caseId}`);
    } catch {
      setError(isAr ? 'حدث خطأ في الاتصال بالخادم' : 'Network error submitting case');
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <NavBar role={user?.user?.role} name={user?.user?.name} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">
            {isAr ? 'إنشاء حالة أسنان جديدة' : 'New Dental Case'}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {isAr
              ? 'اختر المعمل المعتمد، وارفع ملفات المسح ثلاثي الأبعاد (العلوي، السفلي، العضة)، وأكمل الوصفة السريرية.'
              : 'Select a verified lab partner, attach the 3D scan files (Upper, Lower, Bite), and complete the digital prescription.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Lab Selection Section */}
          <section className="dentrio-card rounded-2xl p-6">
            <h2 className="text-base font-bold text-[var(--text)]">
              {isAr ? '1. اختيار معمل الأسنان' : '1. Choose Dental Lab'}
            </h2>
            <div className="mt-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isAr ? 'البحث عن معمل بالاسم، التخصص، أو الموقع…' : 'Search lab by name, specialty, or location…'}
                className="dentrio-input w-full rounded-xl px-3.5 py-2 text-xs"
              />
            </div>

            <div className="mt-4 max-h-[500px] space-y-2.5 overflow-y-auto pr-1">
              {labs.length === 0 && (
                <p className="py-8 text-center text-xs font-semibold text-[var(--text-muted)]">
                  {isAr ? 'لا توجد معامل مطابقة للبحث.' : 'No laboratories match your query.'}
                </p>
              )}
              {labs.map((lab) => (
                <button
                  key={lab.id}
                  type="button"
                  onClick={() => setSelectedLab(lab.id)}
                  className={
                    'w-full rounded-xl border p-4 text-start transition ' +
                    (selectedLab === lab.id
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)] ring-2 ring-[var(--accent)]'
                      : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]/50')
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--text)]">{lab.labName}</span>
                      {lab.isPreferred && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          ★ {isAr ? 'مفضل' : 'Preferred'}
                        </span>
                      )}
                    </div>
                    {lab.turnaroundDays && (
                      <span className="text-[11px] font-bold text-[var(--accent-light)] font-mono">
                        ⚡ {lab.turnaroundDays} {isAr ? 'أيام عمل' : 'days'}
                      </span>
                    )}
                  </div>
                  {(lab.specialties || lab.materials) && (
                    <p className="mt-1.5 text-xs font-medium text-[var(--text-muted)]">
                      {lab.specialties && <span className="font-semibold text-[var(--text)]">{lab.specialties}</span>}
                      {lab.specialties && lab.materials && <span> · </span>}
                      {lab.materials && <span>{lab.materials}</span>}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Scan & Prescription Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* 3D Scan Multi-File Upload */}
            <section className="dentrio-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[var(--text)]">
                  {isAr ? '2. رفع ملفات المسح ثلاثي الأبعاد والصور' : '2. Upload 3D Intraoral Scans & Photos'}
                </h2>
                <span className="text-[11px] font-mono text-[var(--accent-light)] font-bold">
                  {files.length} {isAr ? 'ملفات مختارة' : 'Selected'}
                </span>
              </div>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {isAr
                  ? 'يمكنك رفع عدة ملفات معاً (الفك العلوي، الفك السفلي، العضة، صور فوتوغرافية للمريض)'
                  : 'Upload multiple files simultaneously (Upper Jaw, Lower Jaw, Bite registration, Clinical photos)'}
              </p>

              {/* Drag & Drop Multi-file Target */}
              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[rgba(42,127,255,0.3)] bg-[var(--bg-elevated)] p-6 text-center transition hover:border-[var(--accent)] hover:bg-[var(--accent-dim)]">
                <input
                  type="file"
                  multiple
                  accept=".stl,.ply,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <div className="flex flex-col items-center">
                  <span className="text-3xl">🦷📁</span>
                  <p className="mt-2 text-sm font-bold text-[var(--text)]">
                    {isAr ? 'اضغط لاختيار ملفات المسح أو اسحبها وأفلتها هنا' : 'Click or drop multiple STL / PLY / Photo files here'}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)] font-mono">
                    .STL, .PLY, .PNG, .JPG (Multi-file upload supported)
                  </p>
                </div>
              </label>

              {/* Uploaded Files List Preview */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                    {isAr ? 'الملفات الجاهزة للإرسال:' : 'Attached Scan Files:'}
                  </span>
                  <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
                    {files.map((f, i) => {
                      const ext = f.name.split('.').pop()?.toLowerCase() || '';
                      const is3D = ['stl', 'ply'].includes(ext);

                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#070A10]/70 px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span>{is3D ? '🦷' : '📷'}</span>
                            <span className="truncate font-semibold text-white">{f.name}</span>
                            <span className="text-[10px] font-mono opacity-60 shrink-0">
                              ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="text-red-400 hover:text-red-300 font-bold px-2 py-0.5"
                            title={isAr ? 'حذف الملف' : 'Remove file'}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* Prescription Form */}
            <section className="dentrio-card rounded-2xl p-6 space-y-5">
              <h2 className="text-base font-bold text-[var(--text)]">
                {isAr ? '3. مواصفات الوصفة السريرية' : '3. Prescription Specifications'}
              </h2>
              
              {/* Interactive Dental Odontogram & Tooth Numbering Chart */}
              <div>
                <ToothChartSelector
                  value={prescription.toothNumber || ''}
                  onChange={(val: string) => setP('toothNumber', val)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {isAr ? 'خامة المعمل المطلوبة' : 'Dental Lab Material Classification'}
                  </label>
                  <select
                    value={prescription.material || ''}
                    onChange={(e) => setP('material', e.target.value)}
                    className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                  >
                    <option value="">{isAr ? 'اختر خامة المعمل…' : 'Select Dental Lab Material…'}</option>
                    
                    <optgroup label="✨ 1. Zirconia & Polycrystalline Ceramics (CAD/CAM)">
                      <option value="Multi-Layer 3D Pro Gradient Zirconia (49%-43% Translucency, 1200-700 MPa)">
                        Multi-Layer 3D Pro Gradient Zirconia (High Esthetic & Strength)
                      </option>
                      <option value="High-Translucent (HT) Monolithic Zirconia (1200 MPa - Posterior)">
                        High-Translucent (HT) Monolithic Zirconia (Posterior Full Contour)
                      </option>
                      <option value="Ultra-Translucent (UT/SHT) Anterior Zirconia (650-900 MPa)">
                        Ultra-Translucent (UT/SHT) Anterior Zirconia (Incisal & Anterior)
                      </option>
                      <option value="High-Strength Opaque Zirconia (Coping / Framework Core)">
                        High-Strength Opaque Zirconia (Framework / Coping Core)
                      </option>
                    </optgroup>

                    <optgroup label="💎 2. Silica-based & Glass Ceramics">
                      <option value="Lithium Disilicate - IPS e.max CAD / Press (500 MPa)">
                        Lithium Disilicate (IPS e.max CAD / Press - Monolithic & Cut-back)
                      </option>
                      <option value="Zirconia-Reinforced Lithium Silicate (VITA SUPRINITY / Celtra)">
                        Zirconia-Reinforced Lithium Silicate (VITA SUPRINITY / Celtra Press)
                      </option>
                      <option value="Feldspathic Layered Porcelain (VITA VM9 / Master Veneers)">
                        Feldspathic Layered Porcelain (Ultra-thin Veneers & Esthetic Layering)
                      </option>
                      <option value="Leucite-Reinforced Glass Ceramic (IPS Empress CAD)">
                        Leucite-Reinforced Glass Ceramic (IPS Empress CAD Inlays/Onlays)
                      </option>
                    </optgroup>

                    <optgroup label="⚙️ 3. Metal-Ceramic & Implant Hybrid Systems">
                      <option value="PFM: Ceramic Fused to Co-Cr Laser-Milled Alloy (Nickel-Free)">
                        PFM (Ceramic Fused to Co-Cr Laser Milled Alloy - Bio Nickel-Free)
                      </option>
                      <option value="Titanium Custom Abutment (Grade 5) + Screw-Retained Zirconia Crown">
                        Titanium Custom Abutment (Grade 5) + Screw-Retained Crown Hybrid
                      </option>
                      <option value="Full Cast Noble / High-Gold Alloy">
                        Full Cast Noble / Semi-Precious High-Gold Alloy
                      </option>
                    </optgroup>

                    <optgroup label="🧪 4. High-Performance Polymers & Temporaries">
                      <option value="Multi-Layer PMMA High-Impact Disc (Long-Term Provisional / All-on-X)">
                        Multi-Layer PMMA Disc (Long-Term Provisional / Full Arch All-on-X)
                      </option>
                      <option value="PEEK / BioHPP (Polyetheretherketone Implant & Framework)">
                        PEEK / BioHPP (Biocompatible Implant Substructure Framework)
                      </option>
                      <option value="3D Printed Micro-hybrid Composite Resin (Permanent Crown & Bridge)">
                        3D Printed Permanent Micro-hybrid Composite Crown Resin
                      </option>
                    </optgroup>

                    <optgroup label="🛡️ 5. Removables & Orthodontic Aligners">
                      <option value="Medical-Grade Multi-Layer Aligner Foil (Polyurethane / PETG)">
                        Medical-Grade Multi-Layer Clear Aligner Foil (Thermoplastic)
                      </option>
                      <option value="Dual-Laminate Hard/Soft Occlusal Nightguard Splint">
                        Dual-Laminate Hard/Soft Occlusal Nightguard Splint
                      </option>
                      <option value="Flexible Thermoplastic Valplast / TCS Unbreakable Resin">
                        Flexible Thermoplastic Valplast / TCS Unbreakable Denture
                      </option>
                      <option value="High-Impact Heat-Cured PMMA Acrylic Full Denture">
                        High-Impact Heat-Cured PMMA Full / Partial Denture Acrylic
                      </option>
                    </optgroup>

                    <option value="Other / Custom Laboratory Material (Specified in Notes)">
                      {isAr ? 'خامة معمل أخرى مخصصة (حددها في الملاحظات)' : 'Other / Custom Laboratory Material (Specify details in Notes)'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {isAr ? 'دليل الألوان VITA 3D & Classical' : 'VITA 3D-MASTER & Classical Shade Guide'}
                  </label>
                  <select
                    value={prescription.shade || ''}
                    onChange={(e) => setP('shade', e.target.value)}
                    className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                  >
                    <option value="">{isAr ? 'اختر درجة اللون…' : 'Select VITA Shade…'}</option>
                    
                    <optgroup label="🌟 Bleached Shades (VITA 3D Bleach & Hollywood White)">
                      <option value="0M1">0M1 (VITA 3D-Master Ultra Bleach)</option>
                      <option value="0M2">0M2 (VITA 3D-Master Light Bleach)</option>
                      <option value="0M3">0M3 (VITA 3D-Master Bleach)</option>
                      <option value="BL1">BL1 (Ivoclar Chromascop Bleach 1)</option>
                      <option value="BL2">BL2 (Ivoclar Chromascop Bleach 2)</option>
                      <option value="BL3">BL3 (Ivoclar Chromascop Bleach 3)</option>
                      <option value="BL4">BL4 (Ivoclar Chromascop Bleach 4)</option>
                    </optgroup>

                    <optgroup label="🔬 VITA Toothguide 3D-MASTER® — Group 1 (Light)">
                      <option value="1M1">1M1</option>
                      <option value="1M2">1M2</option>
                    </optgroup>

                    <optgroup label="🔬 VITA Toothguide 3D-MASTER® — Group 2">
                      <option value="2L1.5">2L1.5 (Yellowish)</option>
                      <option value="2L2.5">2L2.5 (Yellowish)</option>
                      <option value="2M1">2M1 (Medium Neutral)</option>
                      <option value="2M2">2M2 (Medium Neutral)</option>
                      <option value="2M3">2M3 (Medium Neutral)</option>
                      <option value="2R1.5">2R1.5 (Reddish)</option>
                      <option value="2R2.5">2R2.5 (Reddish)</option>
                    </optgroup>

                    <optgroup label="🔬 VITA Toothguide 3D-MASTER® — Group 3">
                      <option value="3L1.5">3L1.5 (Yellowish)</option>
                      <option value="3L2.5">3L2.5 (Yellowish)</option>
                      <option value="3M1">3M1 (Medium Neutral)</option>
                      <option value="3M2">3M2 (Medium Neutral)</option>
                      <option value="3M3">3M3 (Medium Neutral)</option>
                      <option value="3R1.5">3R1.5 (Reddish)</option>
                      <option value="3R2.5">3R2.5 (Reddish)</option>
                    </optgroup>

                    <optgroup label="🔬 VITA Toothguide 3D-MASTER® — Group 4">
                      <option value="4L1.5">4L1.5 (Yellowish)</option>
                      <option value="4L2.5">4L2.5 (Yellowish)</option>
                      <option value="4M1">4M1 (Medium Neutral)</option>
                      <option value="4M2">4M2 (Medium Neutral)</option>
                      <option value="4M3">4M3 (Medium Neutral)</option>
                      <option value="4R1.5">4R1.5 (Reddish)</option>
                      <option value="4R2.5">4R2.5 (Reddish)</option>
                    </optgroup>

                    <optgroup label="🔬 VITA Toothguide 3D-MASTER® — Group 5 (Dark)">
                      <option value="5M1">5M1</option>
                      <option value="5M2">5M2</option>
                      <option value="5M3">5M3</option>
                    </optgroup>

                    <optgroup label="🦷 VITA Classical A-D (Standard A1-D4)">
                      <option value="A1">A1 (Reddish-Brownish Light)</option>
                      <option value="A2">A2 (Reddish-Brownish Universal)</option>
                      <option value="A3">A3 (Reddish-Brownish Standard)</option>
                      <option value="A3.5">A3.5 (Reddish-Brownish Dark)</option>
                      <option value="A4">A4 (Reddish-Brownish Intense)</option>
                      <option value="B1">B1 (Reddish-Yellowish Light)</option>
                      <option value="B2">B2 (Reddish-Yellowish)</option>
                      <option value="B3">B3 (Reddish-Yellowish)</option>
                      <option value="B4">B4 (Reddish-Yellowish)</option>
                      <option value="C1">C1 (Greyish Light)</option>
                      <option value="C2">C2 (Greyish)</option>
                      <option value="C3">C3 (Greyish)</option>
                      <option value="C4">C4 (Greyish Dark)</option>
                      <option value="D2">D2 (Reddish-Grey)</option>
                      <option value="D3">D3 (Reddish-Grey)</option>
                      <option value="D4">D4 (Reddish-Grey)</option>
                    </optgroup>

                    <option value="Multi-Shade Gingiva / Incisal Gradient (Specify in Notes)">
                      {isAr ? 'تدرج لوني متعدد / تخصيص اللثة والحافة القاطعة' : 'Multi-Shade Gingiva / Incisal Gradient (Specify in Notes)'}
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {isAr ? 'تاريخ التسليم المطلوب' : 'Required Due Date'}
                  </label>
                  <input
                    type="date"
                    value={prescription.dueDate || ''}
                    onChange={(e) => setP('dueDate', e.target.value)}
                    className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {isAr ? 'ملاحظات التحضير والحواف السريرية' : 'Clinical & Margin Notes'}
                </label>
                <textarea
                  value={prescription.notes || ''}
                  onChange={(e) => setP('notes', e.target.value)}
                  rows={3}
                  placeholder={
                    isAr
                      ? 'اكتب أي ملاحظات خاصة حول الحواف، مسافة الإطباق، أو نوع التثبيت لمصمم الـ CAD…'
                      : 'Specific margin requirements, contact points, or occlusal notes for the CAD technician…'
                  }
                  className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>
            </section>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs font-bold text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg disabled:opacity-50"
            >
              {busy ? (isAr ? 'جارٍ رفع الملفات وإنشاء الحالة...' : 'Uploading files & creating case…') : (isAr ? 'إرسال الحالة للمعمل' : 'Submit Case to Dental Lab')}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
