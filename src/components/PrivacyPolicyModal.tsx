'use client';

import React from 'react';
import { useLanguage } from '@/components/LanguageProvider';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const { lang } = useLanguage();

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-[rgba(42,127,255,0.3)] bg-[#0E1B2A] text-[var(--text)] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📜</span>
            <h2 className="text-lg font-bold text-white">
              {isAr ? 'سياسة الخصوصية واتفاقية معالجة البيانات — Dentrio' : 'Dentrio Global Privacy Policy & Data Processing Agreement'}
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[#070A10] text-[var(--text-muted)] hover:text-white hover:border-[var(--accent)]"
          >
            ✕
          </button>
        </div>

        {/* Modal Body with Scrollable Text */}
        <div className="flex-1 overflow-y-auto p-6 text-xs leading-relaxed text-[var(--text-muted)] space-y-4 select-text font-sans">
          {isAr ? (
            <>
              <p className="text-sm font-semibold text-white">
                سياسة الخصوصية العالمية لمنصة Dentrio — آخر تحديث: 2026
              </p>
              <p>
                تُقر شركة Dentrio والشركات التابعة لها بأن حماية المعلومات والبيانات الشخصية هي إحدى أهم التزاماتنا القانونية والمهنية. نحن نحترم حقك في الخصوصية ونلتزم بجميع القوانين واللوائح المعمول بها لحماية البيانات الطبية والسريرية.
              </p>

              <h3 className="text-sm font-bold text-white pt-2">1. جمع واستخدام البيانات والمعلومات الشخصية</h3>
              <p>
                نجمع المعلومات الضرورية لتشغيل مسار عمل طب الأسنان الرقمي:
              </p>
              <ul className="list-disc pr-5 space-y-1">
                <li><strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني، رقم الهاتف المكون من 11 رقماً، وكلمة المرور المشفرة.</li>
                <li><strong>بيانات الحالات السريرية:</strong> المسحات الرقمية ثلاثية الأبعاد (STL/PLY)، كود الحالة، بيانات الوصفة الطبية، والملاحظات المتبادلة بين العيادة والمعمل.</li>
                <li><strong>بيانات المعامل والعيادات:</strong> اسم المنشأة، التخصصات، الموقع الجغرافي أو رابط خرائط Google Maps لتسهيل الربط اللوجستي.</li>
              </ul>

              <h3 className="text-sm font-bold text-white pt-2">2. حماية خصوصية بيانات المرضى والماسحات ثلاثية الأبعاد</h3>
              <p>
                تُعامل جميع الماسحات والبيانات الطبية المرفوعة بأعلى درجات التشفير والحماية (TLS 1.2 و AES-256). لا يتم مشاركة البيانات السريرية مع أي أطراف غير مصرح لها. عند تكليف شركات الشحن والتوصيل، يحصل المندوب على كود الحالة والعناوين فقط دون أي وصول للملفات الطبية أو مسحات المريض.
              </p>

              <h3 className="text-sm font-bold text-white pt-2">3. اتفاقية معالجة البيانات (DPA) والامتثال للـ GDPR و HIPAA</h3>
              <p>
                تعمل منصة Dentrio كمعالج بيانات (Data Processor) وفقاً لتعليمات الطبيب أو المعمل (Data Controller). يلتزم المستخدم بضمان حصوله على الأساس القانوني وموافقة المريض قبل رفع أي بيانات أو مسحات سريرية.
              </p>

              <h3 className="text-sm font-bold text-white pt-2">4. أمن وسرية المعلومات</h3>
              <p>
                نطبق أعلى المعايير التقنية والأمنية المعترف بها دولياً لضمان عدم تسريب أو فقدان أي بيانات، مع تشفير كامل لكلمات المرور وقواعد البيانات والنسخ الاحتياطي المستمر.
              </p>

              <h3 className="text-sm font-bold text-white pt-2">5. حقوق المستخدم</h3>
              <p>
                يحق لك في أي وقت الوصول إلى بياناتك، وتحديثها، وتعديلها، أو طلب تصدير وحذف حسابك وبياناتك من خلال إعدادات المنصة أو التواصل مع الدعم الفني.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-white">
                Dentrio Global Privacy Policy & Data Processing Agreement — Last updated: 2026
              </p>
              <p>
                Dentrio Tech and its affiliated entities acknowledge that the protection of personal and clinical information is one of our most significant legal and ethical obligations. We respect your right to privacy and value our relationship with dental practices, laboratories, and logistics partners by strictly complying with applicable privacy and data protection laws.
              </p>

              <h3 className="text-sm font-bold text-white pt-2">1. Collection and Use of Information</h3>
              <p>
                Dentrio collects information strictly required to orchestrate digital dental workflows:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account Information:</strong> Name, verified email address, 11-digit phone number, and securely hashed passwords.</li>
                <li><strong>Case & Clinical Data:</strong> 3D digital intraoral scans (STL/PLY), Case IDs, structured prescriptions, shade, tooth annotations, and communication files exchanged between clinics and labs.</li>
                <li><strong>Facility Details:</strong> Practice/Lab name, specialties, and Google Maps location for courier routing.</li>
              </ul>

              <h3 className="text-sm font-bold text-white pt-2">2. Patient Privacy & 3D Scan Protection</h3>
              <p>
                All data transmitted to and stored within Dentrio is encrypted using industry-standard TLS 1.2 and AES-256 protocols. Couriers and shipping partners receive only Case IDs and delivery addresses, ensuring patient clinical data and scans remain strictly confidential and protected.
              </p>

              <h3 className="text-sm font-bold text-white pt-2">3. Data Processing Agreement (DPA), GDPR & HIPAA Alignment</h3>
              <p>
                Dentrio acts as a Data Processor pursuant to your instructions as a Data Controller. Dental practices confirm that appropriate patient consent has been obtained prior to uploading clinical scans and restorative requests.
              </p>

              <h3 className="text-sm font-bold text-white pt-2">4. Data Security & Technical Measures</h3>
              <p>
                We implement state-of-the-art pseudonymization, access control mechanisms, encrypted transit channels, and continuous integrity audits to ensure maximum uptime and zero data leakage.
              </p>

              <h3 className="text-sm font-bold text-white pt-2">5. User Rights & Data Portability</h3>
              <p>
                You retain full rights to access, rectify, export, or request deletion of your account and associated records in accordance with global data protection standards.
              </p>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[var(--border)] px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-accent rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md"
          >
            {isAr ? 'فهمت وموافق' : 'I Understand & Agree'}
          </button>
        </div>
      </div>
    </div>
  );
}
