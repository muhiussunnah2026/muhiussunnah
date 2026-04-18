import "server-only";

/**
 * Smart SMS template generator — uses Anthropic Messages API with a
 * rule-based Bangla fallback when no API key is configured or the request fails.
 */

type Category = "fee_reminder" | "absent_alert" | "exam_reminder" | "result_announce" | "holiday" | "general" | "custom";

const FALLBACKS: Record<Category, string[]> = {
  fee_reminder: [
    "প্রিয় অভিভাবক, {{student_name}} এর {{month}} মাসের ফি ৳{{amount}} এখনো পরিশোধ হয়নি। অনুগ্রহ করে {{due_date}} এর মধ্যে পরিশোধ করুন।",
    "{{student_name}} এর {{month}} মাসের বেতন ৳{{amount}} বকেয়া আছে। দ্রুত পরিশোধ করার অনুরোধ রইল।",
  ],
  absent_alert: [
    "প্রিয় অভিভাবক, {{student_name}} আজ স্কুলে অনুপস্থিত। কারণ জানালে উপকৃত হব।",
    "{{student_name}} আজ ক্লাসে উপস্থিত হয়নি। কুশল জানালে কৃতজ্ঞ থাকব।",
  ],
  exam_reminder: [
    "প্রিয় অভিভাবক, {{student_name}} এর {{exam_name}} পরীক্ষা শুরু {{date}} থেকে। প্রস্তুতি নিশ্চিত করুন।",
    "{{exam_name}} পরীক্ষার রুটিন প্রকাশিত হয়েছে। {{date}} থেকে শুরু।",
  ],
  result_announce: [
    "অভিনন্দন! {{student_name}} {{exam_name}} পরীক্ষায় GPA {{gpa}} অর্জন করেছে। স্কুল পোর্টালে মার্কশীট দেখুন।",
    "{{student_name}} এর {{exam_name}} রেজাল্ট প্রকাশিত। GPA: {{gpa}}। অভিনন্দন!",
  ],
  holiday: [
    "প্রিয় অভিভাবক, {{date}} তারিখে স্কুল বন্ধ থাকবে ({{reason}}) ।",
    "ছুটির ঘোষণা: {{date}} — {{reason}}।",
  ],
  general: [
    "প্রিয় অভিভাবক, {{message}}",
  ],
  custom: [
    "{{message}}",
  ],
};

export async function generateSmsTemplate(args: {
  category: Category;
  context?: string;
  schoolName?: string;
}): Promise<{ body: string; ai: boolean }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    const options = FALLBACKS[args.category] ?? FALLBACKS.general;
    return { body: options[Math.floor(Math.random() * options.length)], ai: false };
  }

  try {
    const categoryBn: Record<Category, string> = {
      fee_reminder: "ফি রিমাইন্ডার",
      absent_alert: "অনুপস্থিতি সতর্কতা",
      exam_reminder: "পরীক্ষার রিমাইন্ডার",
      result_announce: "রেজাল্ট ঘোষণা",
      holiday: "ছুটির নোটিশ",
      general: "সাধারণ নোটিশ",
      custom: "কাস্টম",
    };

    const prompt = `তুমি একটি বাংলাদেশি স্কুল/মাদ্রাসা ম্যানেজমেন্ট সফটওয়্যারের SMS টেমপ্লেট লেখক।
${args.schoolName ? `স্কুলের নাম: ${args.schoolName}` : ""}
Category: ${categoryBn[args.category]}
${args.context ? `Context: ${args.context}` : ""}

একটি পরিষ্কার, সংক্ষিপ্ত বাংলা SMS টেমপ্লেট লিখো। Variables placeholder হিসেবে {{variable_name}} ফরম্যাট ব্যবহার করো (যেমন {{student_name}}, {{amount}}, {{due_date}})।
সর্বোচ্চ ১৬০ অক্ষরে সীমাবদ্ধ রাখো। শুধু টেমপ্লেট বডি ফেরত দাও, কোন ব্যাখ্যা নয়।`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { content?: Array<{ text?: string }> };
    const text = data.content?.[0]?.text?.trim();
    if (!text) throw new Error("Empty response");

    return { body: text, ai: true };
  } catch {
    const options = FALLBACKS[args.category] ?? FALLBACKS.general;
    return { body: options[0], ai: false };
  }
}
