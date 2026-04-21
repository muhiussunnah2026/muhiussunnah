import { notFound } from "next/navigation";
import Image from "next/image";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { getSchoolBranding } from "@/lib/schools/branding";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { PrintActions } from "./print-actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: "admission" | "invoice" }>;
};

export default async function StudentPrintPage({ params, searchParams }: PageProps) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const type = sp.type === "invoice" ? "invoice" : "admission";

  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);
  const supabase = await supabaseServer();

  const [sRes, feesRes, brandingRow] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select(`
        id, student_code, name_bn, name_en, name_ar, roll, gender, photo_url,
        blood_group, religion, date_of_birth, admission_date, guardian_phone,
        address_present, address_permanent, previous_school,
        admission_fee, tuition_fee, transport_fee,
        sections ( name, classes ( name_bn ) ),
        student_guardians ( name_bn, phone, relation, is_primary )
      `)
      .eq("id", id)
      .eq("school_id", membership.school_id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("fee_invoices")
      .select("id, invoice_no, total_amount, paid_amount, issue_date, status")
      .eq("student_id", id)
      .order("issue_date", { ascending: false })
      .limit(10),
    getSchoolBranding(membership.school_id),
  ]);
  const { data: s } = sRes;
  const { data: feeInvoices } = feesRes;
  if (!s) notFound();

  const student = s as {
    id: string; student_code: string; name_bn: string; name_en: string | null; name_ar: string | null;
    roll: number | null; gender: string | null; photo_url: string | null;
    blood_group: string | null; religion: string | null; date_of_birth: string | null;
    admission_date: string | null; guardian_phone: string | null;
    address_present: string | null; address_permanent: string | null; previous_school: string | null;
    admission_fee: number | null; tuition_fee: number | null; transport_fee: number | null;
    sections: { name: string; classes: { name_bn: string } } | null;
    student_guardians: { name_bn: string; phone: string | null; relation: string; is_primary: boolean }[];
  };

  const branding = brandingRow as {
    name_bn: string; name_en: string | null; address: string | null; phone: string | null;
    logo_url: string | null;
  } | null;

  return (
    <div className="bg-white text-black print:bg-white min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-6 print:p-0 print:max-w-none">
        <PrintActions />

        {/* Letterhead */}
        <header className="flex items-start gap-5 border-b-2 border-black pb-4">
          {branding?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logo_url}
              alt={branding.name_bn}
              className="size-20 shrink-0 object-contain"
            />
          ) : (
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full border border-black/40 text-2xl font-bold">
              م
            </div>
          )}
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">{branding?.name_bn ?? membership.school_name_bn}</h1>
            {branding?.name_en ? (
              <p className="text-sm text-gray-700 mt-0.5">{branding.name_en}</p>
            ) : null}
            {branding?.address ? (
              <p className="text-sm text-gray-700 mt-0.5">ঠিকানা: {branding.address}</p>
            ) : null}
            {branding?.phone ? (
              <p className="text-xs text-gray-600 mt-0.5">ফোন: {branding.phone}</p>
            ) : null}
          </div>
          {student.photo_url && student.photo_url.trim().length > 0 ? (
            <Image
              src={student.photo_url}
              alt={student.name_bn}
              width={96}
              height={120}
              className="h-28 w-24 shrink-0 rounded border border-black/40 object-cover"
              unoptimized
            />
          ) : (
            // Competitor-style passport-photo placeholder: upright
            // rectangle, thin border, "ছবি" label inside.
            <div className="h-28 w-24 shrink-0 rounded border border-black/50 bg-white flex items-center justify-center text-sm text-gray-600">
              ছবি
            </div>
          )}
        </header>

        <h2 className="mt-5 text-center text-xl font-bold">
          {type === "invoice" ? "ভর্তি ইনভয়েস" : "শিক্ষার্থীর ভর্তি ফরম"}
        </h2>

        {type === "admission" ? (
          <AdmissionDetails student={student} />
        ) : (
          <InvoiceDetails student={student} feeInvoices={feeInvoices ?? []} />
        )}

        {/* Signature row — only on admission form */}
        {type === "admission" ? (
          <div className="mt-12 grid grid-cols-2 gap-8 text-center text-sm">
            <div>
              <div className="mx-auto w-2/3 border-t border-black/70 pt-1">মুহতামিমের স্বাক্ষর</div>
            </div>
            <div>
              <div className="mx-auto w-2/3 border-t border-black/70 pt-1">পরিচালকের স্বাক্ষর</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */

function AdmissionDetails({
  student,
}: {
  student: {
    student_code: string; name_bn: string; name_en: string | null; name_ar: string | null;
    roll: number | null; gender: string | null;
    religion: string | null; date_of_birth: string | null; admission_date: string | null;
    address_present: string | null; address_permanent: string | null;
    blood_group: string | null; previous_school: string | null;
    admission_fee: number | null; tuition_fee: number | null; transport_fee: number | null;
    sections: { name: string; classes: { name_bn: string } } | null;
    student_guardians: { name_bn: string; phone: string | null; relation: string; is_primary: boolean }[];
  };
}) {
  const father = student.student_guardians.find((g) => g.relation === "father");
  const mother = student.student_guardians.find((g) => g.relation === "mother");
  const primary = student.student_guardians.find((g) => g.is_primary);

  return (
    <>
      <Section title="ছাত্রের তথ্য">
        <Row label="শিক্ষার্থী আইডি" value={student.student_code} />
        <Row label="নাম (বাংলা)" value={student.name_bn} />
        {student.name_en ? <Row label="Name (English)" value={student.name_en} /> : null}
        {student.name_ar ? <Row label="নাম (عربي)" value={student.name_ar} /> : null}
        <Row label="শ্রেণি / শাখা" value={student.sections ? `${student.sections.classes.name_bn} — ${student.sections.name}` : "—"} />
        <Row label="রোল" value={student.roll ? <BanglaDigit value={student.roll} /> : "—"} />
        <Row label="জন্ম তারিখ" value={student.date_of_birth ?? "—"} />
        <Row label="লিঙ্গ" value={student.gender === "male" ? "পুরুষ" : student.gender === "female" ? "মহিলা" : "—"} />
        <Row label="ধর্ম" value={student.religion ?? "—"} />
        <Row label="রক্তের গ্রুপ" value={student.blood_group ?? "—"} />
        <Row label="ভর্তির তারিখ" value={student.admission_date ?? "—"} />
      </Section>

      <Section title="ঠিকানা">
        <Row label="বর্তমান ঠিকানা" value={student.address_present ?? "—"} full />
        <Row label="স্থায়ী ঠিকানা" value={student.address_permanent ?? "—"} full />
        <Row label="পূর্ববর্তী বিদ্যালয়" value={student.previous_school ?? "—"} full />
      </Section>

      <Section title="অভিভাবকের তথ্য">
        <Row label="পিতার নাম" value={father?.name_bn ?? "—"} />
        <Row label="পিতার মোবাইল" value={father?.phone ?? "—"} />
        <Row label="মাতার নাম" value={mother?.name_bn ?? "—"} />
        <Row label="মাতার মোবাইল" value={mother?.phone ?? "—"} />
        <Row label="প্রধান অভিভাবক" value={primary ? `${primary.name_bn} (${primary.relation})` : "—"} />
        <Row label="অভিভাবক ফোন" value={primary?.phone ?? "—"} />
      </Section>

      <Section title="ফি তথ্য">
        <Row label="ভর্তি ফি" value={student.admission_fee != null ? <>৳ <BanglaDigit value={student.admission_fee} /></> : "—"} />
        <Row label="মাসিক টিউশন ফি" value={student.tuition_fee != null ? <>৳ <BanglaDigit value={student.tuition_fee} /></> : "—"} />
        <Row label="পরিবহন ফি" value={student.transport_fee != null ? <>৳ <BanglaDigit value={student.transport_fee} /></> : "—"} />
      </Section>
    </>
  );
}

function InvoiceDetails({
  student,
  feeInvoices,
}: {
  student: {
    student_code: string; name_bn: string;
    admission_fee: number | null; tuition_fee: number | null; transport_fee: number | null;
    sections: { name: string; classes: { name_bn: string } } | null;
    admission_date: string | null;
  };
  feeInvoices: Array<{ id: string; invoice_no: string; total_amount: number; paid_amount: number; issue_date: string; status: string }>;
}) {
  const admissionFee = student.admission_fee ?? 0;
  const tuitionFee = student.tuition_fee ?? 0;
  const transportFee = student.transport_fee ?? 0;
  const total = admissionFee + tuitionFee + transportFee;

  return (
    <>
      <Section title="শিক্ষার্থী তথ্য">
        <Row label="শিক্ষার্থী আইডি" value={student.student_code} />
        <Row label="নাম" value={student.name_bn} />
        <Row label="শ্রেণি / শাখা" value={student.sections ? `${student.sections.classes.name_bn} — ${student.sections.name}` : "—"} />
        <Row label="ভর্তির তারিখ" value={student.admission_date ?? "—"} />
      </Section>

      <section className="mt-5 border border-black">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-black text-white">
              <th className="border border-black px-3 py-2 text-start">বিবরণ</th>
              <th className="border border-black px-3 py-2 text-end w-32">পরিমাণ (৳)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black px-3 py-2">ভর্তি ফি</td>
              <td className="border border-black px-3 py-2 text-end tabular-nums"><BanglaDigit value={admissionFee} /></td>
            </tr>
            <tr>
              <td className="border border-black px-3 py-2">মাসিক টিউশন ফি (প্রথম মাস)</td>
              <td className="border border-black px-3 py-2 text-end tabular-nums"><BanglaDigit value={tuitionFee} /></td>
            </tr>
            <tr>
              <td className="border border-black px-3 py-2">পরিবহন ফি</td>
              <td className="border border-black px-3 py-2 text-end tabular-nums"><BanglaDigit value={transportFee} /></td>
            </tr>
            <tr className="bg-gray-100 font-bold">
              <td className="border border-black px-3 py-2">মোট</td>
              <td className="border border-black px-3 py-2 text-end tabular-nums">৳ <BanglaDigit value={total} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {feeInvoices.length > 0 ? (
        <Section title="পূর্ববর্তী ইনভয়েস">
          <table className="col-span-2 w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-black">
                <th className="py-1 text-start">ইনভয়েস</th>
                <th className="py-1 text-start">তারিখ</th>
                <th className="py-1 text-end">মোট</th>
                <th className="py-1 text-end">পরিশোধ</th>
                <th className="py-1 text-end">বাকি</th>
              </tr>
            </thead>
            <tbody>
              {feeInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-black/30">
                  <td className="py-1">{inv.invoice_no}</td>
                  <td className="py-1">{inv.issue_date}</td>
                  <td className="py-1 text-end tabular-nums"><BanglaDigit value={inv.total_amount} /></td>
                  <td className="py-1 text-end tabular-nums"><BanglaDigit value={inv.paid_amount} /></td>
                  <td className="py-1 text-end tabular-nums"><BanglaDigit value={inv.total_amount - inv.paid_amount} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      ) : null}

      <div className="mt-16 grid grid-cols-2 gap-8 text-center text-sm">
        <div>
          <div className="mx-auto w-2/3 border-t border-black/70 pt-1">অভিভাবকের স্বাক্ষর</div>
        </div>
        <div>
          <div className="mx-auto w-2/3 border-t border-black/70 pt-1">হিসাবরক্ষকের স্বাক্ষর</div>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 border-b border-black text-sm font-bold uppercase tracking-wider">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">{children}</div>
    </section>
  );
}

function Row({ label, value, full }: { label: string; value: React.ReactNode; full?: boolean }) {
  return (
    <div className={`flex items-baseline gap-2 ${full ? "col-span-2" : ""} border-b border-black/20 py-1`}>
      <span className="w-40 shrink-0 text-gray-700">{label}</span>
      <span className="font-medium">:</span>
      <span className="flex-1">{value}</span>
    </div>
  );
}
