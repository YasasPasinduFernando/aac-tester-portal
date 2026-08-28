export type ChatLocale = "en" | "si" | "ta";

export interface ChatReply {
  id: string;
  text: string;
  href?: string;
  hrefLabel?: string;
}

interface KnowledgeEntry {
  id: string;
  keywords: string[];
  href?: string;
  hrefLabel?: Partial<Record<ChatLocale, string>>;
  answers: Record<ChatLocale, string>;
}

const KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: "join",
    keywords: [
      "join",
      "register",
      "sign in",
      "google",
      "email",
      "tester",
      "onboard",
      "එක්ව",
      "ලියාපදිංචි",
      "சேர",
    ],
    href: "/",
    hrefLabel: { en: "Open join steps", si: "එක්වීමේ පියවර", ta: "சேரும் படிகள்" },
    answers: {
      en: "Use Continue with Google or type the Google Play email on this site. Then join the tester group, tap Check My Access, and install from Play. Signing in with Google does not mean you are already in the group.",
      si: "Continue with Google හෝ Play Store ඊමේල් එක ඇතුළත් කරන්න. ඊළඟට පරීක්ෂක කණ්ඩායමට එක්ව, Check My Access ඔබන්න, Play වෙතින් ස්ථාපනය කරන්න. Google පිවිසුම කණ්ඩායමේ සාමාජිකත්වය නොවේ.",
      ta: "Continue with Google அல்லது Play Store மின்னஞ்சலை உள்ளிடவும். பிறகு சோதனையாளர் குழுவில் சேர்ந்து Check My Access அழுத்தி Play-இல் நிறுவவும். Google உள்நுழைவு குழு உறுப்பினர் ஆகமாட்டாது.",
    },
  },
  {
    id: "group",
    keywords: [
      "group",
      "google groups",
      "aac-sinhala-testers",
      "join group",
      "කණ්ඩායම",
      "குழு",
    ],
    href: "/",
    hrefLabel: { en: "Join from the home page", si: "මුල් පිටුවෙන් එක්වන්න", ta: "முகப்பிலிருந்து சேரவும்" },
    answers: {
      en: "Open the tester group aac-sinhala-testers, tap Join group with the same Google account you use on Play, then come back and tap Check My Access. This site never adds you to the group automatically.",
      si: "aac-sinhala-testers කණ්ඩායම විවෘත කර, Play ගිණුමම භාවිතා කර Join group ඔබන්න. ආපසු Check My Access ඔබන්න. මෙම අඩවිය කණ්ඩායමට ස්වයංක්‍රීයව එක් නොකරයි.",
      ta: "aac-sinhala-testers குழுவைத் திறந்து Play கணக்கையே பயன்படுத்தி Join group அழுத்தவும். திரும்பி Check My Access அழுத்தவும். இந்தத் தளம் உங்களை தானாக குழுவில் சேர்க்காது.",
    },
  },
  {
    id: "play",
    keywords: ["play", "install", "store", "apk", "download", "ස්ථාපන", "நிறுவ", "play store"],
    href: "https://play.google.com/store/apps/details?id=lk.aac.sinhala_tamil_english",
    hrefLabel: { en: "Get it on Google Play", si: "Google Play වෙතින් ලබා ගන්න", ta: "Google Play-இல் பெறவும்" },
    answers: {
      en: "The public Play Store listing is https://play.google.com/store/apps/details?id=lk.aac.sinhala_tamil_english. Closed-test install still needs the tester group plus Check My Access on this site.",
      si: "පොදු Play Store සබැඳිය https://play.google.com/store/apps/details?id=lk.aac.sinhala_tamil_english. Closed test ස්ථාපනයට පරීක්ෂක කණ්ඩායම සහ Check My Access තවම අවශ්‍යයි.",
      ta: "பொது Play Store https://play.google.com/store/apps/details?id=lk.aac.sinhala_tamil_english. Closed test நிறுவலுக்கு சோதனையாளர் குழுவும் Check My Access-உம் இன்னும் தேவை.",
    },
  },
  {
    id: "feedback",
    keywords: ["feedback", "bug", "crash", "report", "ප්‍රතිපෝෂණ", "දෝෂ", "பின்னூட்ட", "பிழை"],
    href: "/feedback",
    hrefLabel: { en: "Send feedback", si: "ප්‍රතිපෝෂණය යවන්න", ta: "பின்னூட்டம் அனுப்பவும்" },
    answers: {
      en: "Use the Feedback page to report bugs, suggestions, usability, or accessibility issues. Include a short description. Screenshots are optional. Feedback is stored privately for the admin.",
      si: "දෝෂ, යෝජනා, භාවිතය හෝ ප්‍රවේශ්‍යතා ගැටලු Feedback පිටුවෙන් යවන්න. කෙටි විස්තරයක් ඇතුළත් කරන්න. තිර රුව අත්‍යවශ්‍ය නැත.",
      ta: "பிழைகள், பரிந்துரைகள், பயன்பாடு அல்லது அணுகல் சிக்கல்களை Feedback பக்கத்தில் அனுப்பவும். சிறு விளக்கம் தேவை. திரைப்பிடிப்பு விருப்பம்.",
    },
  },
  {
    id: "app",
    keywords: [
      "aac",
      "smart aac",
      "app",
      "sinhala",
      "tamil",
      "emotion",
      "camera",
      "offline",
      "යෙදුම",
      "செயலி",
    ],
    href: "/smart-aac",
    hrefLabel: { en: "Open the case study", si: "අධ්‍යයනය විවෘත කරන්න", ta: "ஆய்வைத் திறக்கவும்" },
    answers: {
      en: "AAC Sinhala is an offline-first trilingual AAC app (Sinhala, Tamil, English) with on-device supportive facial expression cues. It is not a diagnostic medical device and is not Ministry of Health approved for clinical use.",
      si: "AAC Sinhala යනු Sinhala, Tamil, English සහිත offline AAC යෙදුමකි. මුහුණේ ඉංගිත ඉඟි උපාංගය තුළම ක්‍රියා කරයි. මෙය රෝග විනිශ්චය උපකරණයක් නොවේ.",
      ta: "AAC Sinhala என்பது சிங்களம், தமிழ், ஆங்கிலம் கொண்ட offline AAC செயலி. முகக் குறிப்புகள் சாதனத்திலேயே இயங்கும். இது நோயறிதல் மருத்துவ சாதனம் அல்ல.",
    },
  },
  {
    id: "qr",
    keywords: ["qr", "scan", "download the qr", "code"],
    href: "/#qr",
    hrefLabel: { en: "Download the QR", si: "QR බාගන්න", ta: "QR பதிவிறக்கவும்" },
    answers: {
      en: "The QR on this site opens https://aac.yasaboy.com/. Use Download the QR on the home page.",
      si: "මෙම අඩවියේ QR එක https://aac.yasaboy.com/ විවෘත කරයි. මුල් පිටුවේ Download the QR භාවිතා කරන්න.",
      ta: "இந்த தளத்தின் QR https://aac.yasaboy.com/ ஐத் திறக்கும். முகப்பில் Download the QR பயன்படுத்தவும்.",
    },
  },
  {
    id: "contact",
    keywords: ["contact", "email", "phone", "yasas", "linkedin", "සම්බන්ධ", "தொடர்பு"],
    href: "/#contact",
    hrefLabel: { en: "Contact details", si: "සම්බන්ධතා", ta: "தொடர்பு" },
    answers: {
      en: "Yasas Pasindu Fernando, Hikkaduwa, Sri Lanka. Email yasas@yasaboy.com, phone +94 77 690 5654. Portfolio: https://portfolio.yasaboy.com/",
      si: "Yasas Pasindu Fernando, හික්කඩුව. ඊමේල් yasas@yasaboy.com, දුරකථන +94 77 690 5654. Portfolio: https://portfolio.yasaboy.com/",
      ta: "Yasas Pasindu Fernando, ஹிக்கடுவை. மின்னஞ்சல் yasas@yasaboy.com, தொலைபேசி +94 77 690 5654. Portfolio: https://portfolio.yasaboy.com/",
    },
  },
  {
    id: "gallery",
    keywords: ["gallery", "photo", "field", "pragathi", "ගැලරි", "தொகுப்பு", "exposure"],
    href: "/gallery",
    hrefLabel: { en: "Open the gallery", si: "ගැලරිය විවෘත කරන්න", ta: "தொகுப்பைத் திறக்கவும்" },
    answers: {
      en: "The gallery and field-exposure photos are from the Smart AAC thesis and Pragathi Centre visit. The visit was exploratory field exposure, not a clinical trial.",
      si: "ගැලරිය සහ ක්ෂේත්‍ර ඡායාරූප Smart AAC නිබන්ධනයෙන් සහ ප්‍රගති මධ්‍යස්ථාන සංචාරයෙනි. මෙය clinical trial එකක් නොවේ.",
      ta: "தொகுப்பும் களப் படங்களும் Smart AAC ஆய்வறிக்கை மற்றும் பிரகதி மைய வருகையிலிருந்து. இது மருத்துவச் சோதனை அல்ல.",
    },
  },
  {
    id: "language",
    keywords: ["language", "sinhala", "tamil", "english", "සිංහල", "தமிழ்", "switch"],
    answers: {
      en: "Use EN / සිං / த in the header to switch this site. The Google Sign-In button stays in Google’s English widget.",
      si: "Header එකේ EN / සිං / த භාවිතා කරන්න. Google Sign-In බොත්තම Google ගේ English widget එකේම තියෙනවා.",
      ta: "Header-இல் EN / සිං / த பயன்படுத்தவும். Google Sign-In பொத்தான் Google-இன் ஆங்கில விட்ஜெட்டிலேயே இருக்கும்.",
    },
  },
];

const FALLBACK: Record<ChatLocale, string> = {
  en: "I can help with joining the tester group, Play Store install, feedback, the Smart AAC case study, the QR, and contact. Ask one of those, or open the home page join steps.",
  si: "පරීක්ෂක කණ්ඩායම, Play Store, ප්‍රතිපෝෂණය, Smart AAC අධ්‍යයනය, QR, සම්බන්ධතා ගැන උදව් කළ හැකිය. මුල් පිටුවේ එක්වීමේ පියවරත් බලන්න.",
  ta: "சோதனையாளர் குழு, Play Store, பின்னூட்டம், Smart AAC ஆய்வு, QR, தொடர்பு ஆகியவற்றில் உதவ முடியும். முகப்பின் சேரும் படிகளையும் பாருங்கள்.",
};

function score(query: string, entry: KnowledgeEntry): number {
  const q = query.toLowerCase();
  let points = 0;
  for (const word of entry.keywords) {
    if (q.includes(word.toLowerCase())) points += 2;
  }
  return points;
}

export function answerChat(query: string, locale: ChatLocale): ChatReply {
  const trimmed = query.trim();
  if (!trimmed) {
    return { id: "empty", text: FALLBACK[locale] };
  }
  let best = KNOWLEDGE[0];
  let bestScore = 0;
  for (const entry of KNOWLEDGE) {
    const next = score(trimmed, entry);
    if (next > bestScore) {
      best = entry;
      bestScore = next;
    }
  }
  if (bestScore < 2) {
    return { id: "fallback", text: FALLBACK[locale] };
  }
  return {
    id: best.id,
    text: best.answers[locale],
    href: best.href,
    hrefLabel: best.hrefLabel?.[locale] ?? best.hrefLabel?.en,
  };
}

export const CHAT_SUGGESTIONS: Record<ChatLocale, string[]> = {
  en: ["How do I join?", "Play Store install", "Send feedback", "What is Smart AAC?"],
  si: ["කොහොමද එක්වෙන්නේ?", "Play Store ස්ථාපනය", "ප්‍රතිපෝෂණය", "Smart AAC මොකක්ද?"],
  ta: ["எப்படி சேர்வது?", "Play Store நிறுவல்", "பின்னூட்டம்", "Smart AAC என்றால் என்ன?"],
};
