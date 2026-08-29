import type { Locale } from "./ui-copy";

export type GalleryGroupId =
  | "appUi"
  | "architecture"
  | "aiTesting"
  | "clinical"
  | "field"
  | "play";

export type GalleryItemId =
  | "uiHome"
  | "uiCards"
  | "uiEmotion"
  | "architecture"
  | "confusion"
  | "playConsole"
  | "supportLetter"
  | "centreSign"
  | "centreExterior"
  | "field01"
  | "field02"
  | "field03";

export type FieldShotId = "pragathi" | "fieldVisit" | "centre" | "context";

export interface CaseStudyCopy {
  lead: string;
  heroAlt: string;
  metaThesis: string;
  metaStack: string;
  metaLanguages: string;
  thesisValue: string;
  stackValue: string;
  languagesValue: string;
  journeyTitle: string;
  journey: readonly { id: string; title: string; body: string }[];
  whyTitle: string;
  whyP1: string;
  whyP2: string;
  trustTitle: string;
  boundaries: readonly string[];
  clinicalTitle: string;
  clinicalLead: string;
  clinical: readonly { id: string; title: string; body: string }[];
  fieldLead: string;
  fieldVideoFallback: string;
  fieldVideoNote: string;
  inActionTitle: string;
  stackTitle: string;
  aiPipelineTitle: string;
  aiPipelineBody: string;
  modelHonestyTitle: string;
  modelHonestyBody: string;
  galleryLead: string;
  galleryPageLead: string;
  downloadsTitle: string;
  thesisPdf: string;
  eiconPdf: string;
  openGithub: string;
  lessonsTitle: string;
  lessons: readonly string[];
  futureTitle: string;
  future: readonly string[];
  paperTitle: string;
  paperBody: string;
  groups: Record<GalleryGroupId, string>;
  gallery: Record<GalleryItemId, { alt: string; caption: string }>;
  fieldCards: Record<FieldShotId, { title: string; alt: string }>;
}

const en: CaseStudyCopy = {
  lead: "Offline-first trilingual assistive communication for Sri Lanka, with on-device supportive facial expression recognition. Built as a final-year engineering system.",
  heroAlt: "Smart AAC application interface",
  metaThesis: "Thesis",
  metaStack: "Stack",
  metaLanguages: "Languages",
  thesisValue: "Smart AAC System with Facial Expression Recognition for Autism",
  stackValue: "Flutter, TensorFlow Lite, offline-first",
  languagesValue: "Sinhala, Tamil, English",
  journeyTitle: "The journey",
  journey: [
    {
      id: "problem",
      title: "Problem",
      body: "In Sri Lanka, many children with limited speech need affordable AAC that works in Sinhala, Tamil, and English, offline, on ordinary Android phones. Imported English-first tools are often too expensive or a poor cultural fit.",
    },
    {
      id: "research",
      title: "Research",
      body: "Final-year Software Engineering project (CS6P05ES) at ESOFT Metro Campus. Literature review, caregiver and therapist conversations, and clinical interest from Pragathi Centre / National Hospital Galle shaped the requirements.",
    },
    {
      id: "architecture",
      title: "Architecture",
      body: "Offline-first Flutter client with no backend in the submitted build. Local vocabulary, on-device TensorFlow Lite models, and no camera-frame upload.",
    },
    {
      id: "development",
      title: "Development",
      body: "Core AAC flows plus a supervised camera-expression screen. EfficientNetB0 primary TFLite model with MobileNetV2 fallback.",
    },
    {
      id: "testing",
      title: "Testing",
      body: "TFLite compatibility checks, real-device walkthroughs, Google Play internal testing, and public-dataset model evaluation (52.9% test accuracy; weighted F1 0.54). Anonymous early tester questionnaire n=11. No children recruited for clinical evaluation.",
    },
    {
      id: "impact",
      title: "Impact",
      body: "A working foundation for free or low-cost supportive AAC in Sri Lanka, with a formal letter of support for a future pilot after ethical clearance. Not a diagnostic device and not clinically approved.",
    },
  ],
  whyTitle: "Why it exists",
  whyP1:
    "Children with limited speech need a way to express everyday needs. In Sri Lanka that means Sinhala and Tamil as first-class languages, English where useful, offline use on ordinary phones, and a price families can actually afford.",
  whyP2:
    "The technical contribution is integration: trilingual AAC plus cautious on-device facial expression recognition for observation support. It is not a novel emotion algorithm, and it is not a diagnostic system.",
  trustTitle: "Trust boundaries",
  boundaries: [
    "Not a diagnostic medical device.",
    "Not Ministry of Health approved for clinical use.",
    "Pilot intended only after ethical clearance (Pragathi Centre / National Hospital Galle letter of support).",
    "No claim of production healthcare deployment.",
  ],
  clinicalTitle: "Clinical collaboration",
  clinicalLead:
    "Supportive collaboration with Pragathi Centre / National Hospital Galle. Not clinical approval, not medical certification, and not a deployed medical device.",
  clinical: [
    {
      id: "pragathi",
      title: "Pragathi Centre / National Hospital Galle",
      body: "Formal letter confirming collaboration on the Pragathi AAC App and interest in a future pilot after ethical clearance.",
    },
    {
      id: "karapitiya",
      title: "Karapitiya Teaching Hospital",
      body: "Early discussions and openness during field exposure. Informal feedback from speech-language therapists and parents on the AAC interface.",
    },
    {
      id: "whatIs",
      title: "What this is",
      body: "Clinical interest, design input, and a documented pathway toward a supervised pilot once ethics and health-sector approvals are in place.",
    },
    {
      id: "whatIsNot",
      title: "What this is not",
      body: "Not Ministry of Health approval. Not a completed clinical pilot. Not diagnosis of autism or emotion. No child facial-expression dataset was collected for this thesis.",
    },
  ],
  fieldLead:
    "Understanding the context in which AAC support may be used. This visit was exploratory field exposure rather than a clinical trial or formal clinical validation study.",
  fieldVideoFallback: "Privacy-redacted field-session recording. Faces are obscured; audio is omitted.",
  fieldVideoNote: "Field visit: Pragathi Child Intervention Centre. Video hosted from the public case study.",
  inActionTitle: "Smart AAC in action",
  stackTitle: "Technology stack",
  aiPipelineTitle: "AI pipeline",
  aiPipelineBody:
    "On-device FER through TensorFlow Lite. EfficientNetB0 is primary; MobileNetV2 is the fallback. Gates include face detection, confidence checks, and explicit uncertain states.",
  modelHonestyTitle: "Model honesty",
  modelHonestyBody:
    "Reported public-dataset test accuracy 52.9% (weighted F1 0.54). Useful only as a cautious supportive cue under caregiver supervision.",
  galleryLead: "Figures, screenshots, clinical photos, and testing evidence. Nothing here was invented for the website.",
  galleryPageLead:
    "Thesis figures, Smart AAC screenshots, architecture diagrams, field exposure, and Play Store evidence.",
  downloadsTitle: "Downloads",
  thesisPdf: "Final thesis PDF",
  eiconPdf: "EICON camera-ready",
  openGithub: "Open GitHub",
  lessonsTitle: "Lessons learned",
  lessons: [
    "Mobile deployment constraints belong next to model accuracy from day one.",
    "Caregivers prefer simpler flows over multi-toggle sensory complexity.",
    "Uncertainty states are safer than forced emotion labels.",
    "Clinical pathways move on ethics timelines, not sprint boards.",
  ],
  futureTitle: "Future work",
  future: [
    "Ethical clearance and supervised pilot planning with clinical partners.",
    "Standardised usability work with therapists.",
    "Latency benchmarking on documented low/mid-range devices.",
    "Any Sri Lankan consented facial-expression data only under proper safeguarding.",
  ],
  paperTitle: "Paper track",
  paperBody:
    "Trilingual Offline Smart AAC with On-Device Facial Expression Recognition for Autism in Sri Lanka. Venue: EICON 2026. Paper ID: FPC21. Full paper submitted; camera-ready manuscript prepared. Submission is not the same as acceptance.",
  groups: {
    appUi: "App UI",
    architecture: "Architecture",
    aiTesting: "AI & Testing",
    clinical: "Clinical",
    field: "Field exposure",
    play: "Play & Devices",
  },
  gallery: {
    uiHome: { alt: "Smart AAC home screen", caption: "AAC home / vocabulary flow." },
    uiCards: { alt: "Smart AAC picture cards", caption: "Trilingual communication cards." },
    uiEmotion: { alt: "Smart AAC emotion camera", caption: "Supervised expression observation screen." },
    architecture: {
      alt: "Smart AAC system architecture",
      caption: "Offline Flutter client with on-device TFLite inference.",
    },
    confusion: {
      alt: "Confusion matrix from the thesis",
      caption: "Public-dataset evaluation evidence (supportive cue only).",
    },
    playConsole: {
      alt: "Google Play Console testing evidence",
      caption: "Play testing evidence from the thesis.",
    },
    supportLetter: {
      alt: "Pragathi Centre support letter",
      caption: "Pragathi Centre / National Hospital Galle support letter.",
    },
    centreSign: {
      alt: "Pragathi Child Intervention Centre sign",
      caption: "Pragathi Child Intervention Centre signboard.",
    },
    centreExterior: {
      alt: "Pragathi Child Intervention Centre exterior",
      caption: "Centre exterior from the field visit.",
    },
    field01: {
      alt: "AAC demonstration during field exposure",
      caption: "AAC demonstration during field exposure.",
    },
    field02: { alt: "Field-exposure context", caption: "Field-exposure context." },
    field03: { alt: "Project field visit", caption: "Project field visit." },
  },
  fieldCards: {
    pragathi: {
      title: "Pragathi",
      alt: "Pragathi Child Intervention Centre sign in Sinhala, English, and Tamil",
    },
    fieldVisit: {
      title: "Field visit",
      alt: "Field exposure session showing AAC Sinhala being tried on a phone",
    },
    centre: { title: "Centre", alt: "Pragathi Child Intervention Centre exterior" },
    context: { title: "Context", alt: "Field-exposure context at the centre" },
  },
};

const si: CaseStudyCopy = {
  lead: "ශ්‍රී ලංකාව සඳහා offline-first ත්‍රිභාෂා සහායක සන්නිවේදනය, උපාංගය තුළම සහායක මුහුණේ ඉංගිත හඳුනාගැනීම සමඟ. අවසාන වසර ඉංජිනේරු පද්ධතියක් ලෙස ගොඩනගන ලදී.",
  heroAlt: "Smart AAC යෙදුම් අතුරු මුහුණත",
  metaThesis: "නිබන්ධනය",
  metaStack: "තාක්ෂණ තොගය",
  metaLanguages: "භාෂා",
  thesisValue: "ඔටිසම් සඳහා මුහුණේ ඉංගිත හඳුනාගැනීම සහිත Smart AAC පද්ධතිය",
  stackValue: "Flutter, TensorFlow Lite, offline-first",
  languagesValue: "සිංහල, දෙමළ, ඉංග්‍රීසි",
  journeyTitle: "ගමන",
  journey: [
    {
      id: "problem",
      title: "ගැටලුව",
      body: "ශ්‍රී ලංකාවේ සීමිත කථනයක් ඇති බොහෝ දරුවන්ට සිංහල, දෙමළ සහ ඉංග්‍රීසි භාෂාවෙන්, offlineව, සාමාන්‍ය Android දුරකථනවල ක්‍රියා කරන දැරිය හැකි AAC අවශ්‍යයි. ආනයනික ඉංග්‍රීසි-ප්‍රථම මෙවලම් බොහෝ විට මිල අධික හෝ සංස්කෘතිකව නොගැලපේ.",
    },
    {
      id: "research",
      title: "පර්යේෂණය",
      body: "ESOFT Metro Campus හි අවසාන වසර මෘදුකාංග ඉංජිනේරු ව්‍යාපෘතිය (CS6P05ES). සාහිත්‍ය සමාලෝචනය, රැකබලා ගන්නන් සහ චිකිත්සකයන් සමඟ සංවාද, සහ ප්‍රගති මධ්‍යස්ථානය / ගාල්ල ජාතික රෝහලෙන් සායනික උනන්දුව අවශ්‍යතා හැඩගැස්වීය.",
    },
    {
      id: "architecture",
      title: "ගෘහ නිර්මාණය",
      body: "ඉදිරිපත් කළ build එකේ backend නැති offline-first Flutter client එකකි. ස්ථානීය වචන මාලාව, උපාංගය තුළ TensorFlow Lite ආකෘති, සහ කැමරා රාමු උඩුගත නොකිරීම.",
    },
    {
      id: "development",
      title: "සංවර්ධනය",
      body: "මූලික AAC ප්‍රවාහ සහ අධීක්ෂිත කැමරා-ඉංගිත තිරය. EfficientNetB0 ප්‍රධාන TFLite ආකෘතිය; MobileNetV2 උපස්ථය.",
    },
    {
      id: "testing",
      title: "පරීක්ෂණය",
      body: "TFLite අනුකූලතා පරීක්ෂා, සත්‍ය උපාංග walkthrough, Google Play අභ්‍යන්තර පරීක්ෂණය, සහ පොදු දත්ත කට්ටල ඇගයීම (පරීක්ෂණ නිරවද්‍යතාව 52.9%; weighted F1 0.54). නිර්නාමික මුල් පරීක්ෂක ප්‍රශ්නාවලිය n=11. සායනික ඇගයීම සඳහා දරුවන් බඳවා ගත්තේ නැත.",
    },
    {
      id: "impact",
      title: "බලපෑම",
      body: "ශ්‍රී ලංකාවේ නොමිලේ හෝ අඩු මිල සහායක AAC සඳහා ක්‍රියාකාරී පදනමක්, සදාචාර අනුමැතියෙන් පසු අනාගත නියමුවක් සඳහා නිල සහාය ලිපියක් සමඟ. රෝග විනිශ්චය උපකරණයක් නොවේ, සායනිකව අනුමත ද නොවේ.",
    },
  ],
  whyTitle: "ඇයි මෙය තියෙන්නේ",
  whyP1:
    "සීමිත කථනයක් ඇති දරුවන්ට එදිනෙදා අවශ්‍යතා ප්‍රකාශ කිරීමට මාර්ගයක් අවශ්‍යයි. ශ්‍රී ලංකාවේ එයින් අදහස් වන්නේ සිංහල සහ දෙමළ ප්‍රධාන භාෂා ලෙස, ඉංග්‍රීසි ප්‍රයෝජනවත් වන තැන, සාමාන්‍ය දුරකථනවල offline භාවිතය, සහ පවුල්වලට දැරිය හැකි මිලකි.",
  whyP2:
    "තාක්ෂණික දායකත්වය ඒකාබද්ධ කිරීමයි: ත්‍රිභාෂා AAC සහ නිරීක්ෂණ සහාය සඳහා ප්‍රවේශම් සහගත උපාංගය-තුළ මුහුණේ ඉංගිත හඳුනාගැනීම. මෙය නව emotion algorithm එකක් නොවේ, රෝග විනිශ්චය පද්ධතියක් ද නොවේ.",
  trustTitle: "විශ්වාස සීමා",
  boundaries: [
    "රෝග විනිශ්චය වෛද්‍ය උපකරණයක් නොවේ.",
    "සායනික භාවිතය සඳහා සෞඛ්‍ය අමාත්‍යාංශ අනුමැතිය නැත.",
    "සදාචාර අනුමැතියෙන් පසුව පමණක් නියමුවක් අදහස් කෙරේ (ප්‍රගති මධ්‍යස්ථානය / ගාල්ල ජාතික රෝහල සහාය ලිපිය).",
    "නිෂ්පාදන සෞඛ්‍ය සේවා යෙදවීමක් ලෙස ප්‍රකාශ නොකෙරේ.",
  ],
  clinicalTitle: "සායනික සහයෝගීතාව",
  clinicalLead:
    "ප්‍රගති මධ්‍යස්ථානය / ගාල්ල ජාතික රෝහල සමඟ සහායක සහයෝගීතාව. සායනික අනුමැතිය නොවේ, වෛද්‍ය සහතිකය නොවේ, යෙදවූ වෛද්‍ය උපකරණයක් ද නොවේ.",
  clinical: [
    {
      id: "pragathi",
      title: "ප්‍රගති මධ්‍යස්ථානය / ගාල්ල ජාතික රෝහල",
      body: "Pragathi AAC App සහයෝගීතාව තහවුරු කරන නිල ලිපියක් සහ සදාචාර අනුමැතියෙන් පසු අනාගත නියමුවකට උනන්දුව.",
    },
    {
      id: "karapitiya",
      title: "කරපිටිය ශික්ෂණ රෝහල",
      body: "ක්ෂේත්‍ර නිරාවරණය අතරතුර මුල් සංවාද සහ විවෘතභාවය. AAC අතුරු මුහුණත ගැන කථන-භාෂා චිකිත්සකයන් සහ දෙමාපියන්ගෙන් අවිධිමත් ප්‍රතිපෝෂණය.",
    },
    {
      id: "whatIs",
      title: "මෙය කුමක්ද",
      body: "සායනික උනන්දුව, නිර්මාණ ආදානය, සහ සදාචාර හා සෞඛ්‍ය අංශ අනුමැති ලැබුණු පසු අධීක්ෂිත නියමුවක් දෙසට ලේඛනගත මාර්ගයක්.",
    },
    {
      id: "whatIsNot",
      title: "මෙය නොවන්නේ කුමක්ද",
      body: "සෞඛ්‍ය අමාත්‍යාංශ අනුමැතිය නොවේ. අවසන් වූ සායනික නියමුවක් නොවේ. ඔටිසම් හෝ හැඟීම් රෝග විනිශ්චය නොවේ. මෙම නිබන්ධනය සඳහා දරු මුහුණේ ඉංගිත දත්ත කට්ටලයක් රැස් කළේ නැත.",
    },
  ],
  fieldLead:
    "AAC සහාය භාවිතා විය හැකි සන්දර්භය තේරුම් ගැනීම. මෙම සංචාරය සායනික අත්හදා බැලීමක් හෝ විධිමත් සායනික වලංගුකරණ අධ්‍යයනයක් නොව ගවේෂණාත්මක ක්ෂේත්‍ර නිරාවරණයකි.",
  fieldVideoFallback: "පෞද්ගලිකත්වය සඳහා සංස්කරණය කළ ක්ෂේත්‍ර සැසි පටිගත කිරීම. මුහුණු වසා ඇත; ශබ්දය ඉවත් කර ඇත.",
  fieldVideoNote: "ක්ෂේත්‍ර සංචාරය: ප්‍රගති ළමා මැදිහත්වීම් මධ්‍යස්ථානය. වීඩියෝව පොදු අධ්‍යයනයෙන් ධාරණය වේ.",
  inActionTitle: "ක්‍රියාත්මක Smart AAC",
  stackTitle: "තාක්ෂණ තොගය",
  aiPipelineTitle: "AI නල මාර්ගය",
  aiPipelineBody:
    "TensorFlow Lite හරහා උපාංගය තුළ FER. EfficientNetB0 ප්‍රධානයි; MobileNetV2 උපස්ථයයි. දොරටු අතර මුහුණ හඳුනාගැනීම, විශ්වාස පරීක්ෂා, සහ පැහැදිලි අවිනිශ්චිත තත්ත්වයන් ඇත.",
  modelHonestyTitle: "ආකෘති අවංකභාවය",
  modelHonestyBody:
    "පොදු දත්ත කට්ටල පරීක්ෂණ නිරවද්‍යතාව 52.9% (weighted F1 0.54). රැකබලා ගන්නා අධීක්ෂණය යටතේ ප්‍රවේශම් සහායක ඉඟියක් ලෙස පමණක් ප්‍රයෝජනවත්ය.",
  galleryLead: "රූප, තිර රූ, සායනික ඡායාරූප සහ පරීක්ෂණ සාක්ෂි. වෙබ් අඩවිය සඳහා කිසිවක් නිර්මාණය කළේ නැත.",
  galleryPageLead: "නිබන්ධන රූප, Smart AAC තිර රූ, ගෘහ නිර්මාණ රූපසටහන්, ක්ෂේත්‍ර නිරාවරණය සහ Play Store සාක්ෂි.",
  downloadsTitle: "බාගැනීම්",
  thesisPdf: "අවසන් නිබන්ධන PDF",
  eiconPdf: "EICON camera-ready",
  openGithub: "GitHub විවෘත කරන්න",
  lessonsTitle: "ඉගෙන ගත් පාඩම්",
  lessons: [
    "ජංගම යෙදවීමේ සීමා දින එකේ සිටම ආකෘති නිරවද්‍යතාව අසල තිබිය යුතුය.",
    "රැකබලා ගන්නන් බහු-toggle සංවේදී සංකීර්ණත්වයට වඩා සරල ප්‍රවාහ කැමතියි.",
    "බලෙන් දමන හැඟීම් ලේබලවලට වඩා අවිනිශ්චිත තත්ත්වයන් ආරක්ෂිතයි.",
    "සායනික මාර්ග sprint පුවරු මත නොව සදාචාර කාලරාමු මත ගමන් කරයි.",
  ],
  futureTitle: "අනාගත කටයුතු",
  future: [
    "සායනික හවුල්කරුවන් සමඟ සදාචාර අනුමැතිය සහ අධීක්ෂිත නියමු සැලසුම්.",
    "චිකිත්සකයන් සමඟ ප්‍රමිතිගත භාවිතය අධ්‍යයන.",
    "ලේඛනගත අඩු/මධ්‍යම පරාස උපාංග මත ප්‍රමාද මිනුම්.",
    "ශ්‍රී ලාංකික කැමැත්ත ලත් මුහුණේ ඉංගිත දත්ත නිසි ආරක්ෂාව යටතේ පමණි.",
  ],
  paperTitle: "පත්‍රිකා මාර්ගය",
  paperBody:
    "ශ්‍රී ලංකාවේ ඔටිසම් සඳහා උපාංගය-තුළ මුහුණේ ඉංගිත හඳුනාගැනීම සහිත ත්‍රිභාෂා Offline Smart AAC. ස්ථානය: EICON 2026. පත්‍රිකා හැඳුනුම: FPC21. සම්පූර්ණ පත්‍රිකාව ඉදිරිපත් කර ඇත; camera-ready අත්පිටපත සූදානම්ය. ඉදිරිපත් කිරීම පිළිගැනීමට සමාන නොවේ.",
  groups: {
    appUi: "යෙදුම් UI",
    architecture: "ගෘහ නිර්මාණය",
    aiTesting: "AI සහ පරීක්ෂණය",
    clinical: "සායනික",
    field: "ක්ෂේත්‍ර නිරාවරණය",
    play: "Play සහ උපාංග",
  },
  gallery: {
    uiHome: { alt: "Smart AAC මුල් තිරය", caption: "AAC මුල් / වචන මාලා ප්‍රවාහය." },
    uiCards: { alt: "Smart AAC පින්තූර කාඩ්පත්", caption: "ත්‍රිභාෂා සන්නිවේදන කාඩ්පත්." },
    uiEmotion: { alt: "Smart AAC හැඟීම් කැමරාව", caption: "අධීක්ෂිත ඉංගිත නිරීක්ෂණ තිරය." },
    architecture: {
      alt: "Smart AAC පද්ධති ගෘහ නිර්මාණය",
      caption: "උපාංගය තුළ TFLite inference සහිත offline Flutter client.",
    },
    confusion: {
      alt: "නිබන්ධනයෙන් confusion matrix",
      caption: "පොදු දත්ත කට්ටල ඇගයීම් සාක්ෂි (සහායක ඉඟිය පමණි).",
    },
    playConsole: {
      alt: "Google Play Console පරීක්ෂණ සාක්ෂි",
      caption: "නිබන්ධනයෙන් Play පරීක්ෂණ සාක්ෂි.",
    },
    supportLetter: {
      alt: "ප්‍රගති මධ්‍යස්ථාන සහාය ලිපිය",
      caption: "ප්‍රගති මධ්‍යස්ථානය / ගාල්ල ජාතික රෝහල සහාය ලිපිය.",
    },
    centreSign: {
      alt: "ප්‍රගති ළමා මැදිහත්වීම් මධ්‍යස්ථාන පුවරුව",
      caption: "ප්‍රගති ළමා මැදිහත්වීම් මධ්‍යස්ථාන පුවරුව.",
    },
    centreExterior: {
      alt: "ප්‍රගති ළමා මැදිහත්වීම් මධ්‍යස්ථාන බාහිරය",
      caption: "ක්ෂේත්‍ර සංචාරයෙන් මධ්‍යස්ථාන බාහිරය.",
    },
    field01: {
      alt: "ක්ෂේත්‍ර නිරාවරණයේදී AAC ප්‍රදර්ශනය",
      caption: "ක්ෂේත්‍ර නිරාවරණයේදී AAC ප්‍රදර්ශනය.",
    },
    field02: { alt: "ක්ෂේත්‍ර නිරාවරණ සන්දර්භය", caption: "ක්ෂේත්‍ර නිරාවරණ සන්දර්භය." },
    field03: { alt: "ව්‍යාපෘති ක්ෂේත්‍ර සංචාරය", caption: "ව්‍යාපෘති ක්ෂේත්‍ර සංචාරය." },
  },
  fieldCards: {
    pragathi: {
      title: "ප්‍රගති",
      alt: "සිංහල, ඉංග්‍රීසි සහ දෙමළ භාෂාවෙන් ප්‍රගති ළමා මැදිහත්වීම් මධ්‍යස්ථාන පුවරුව",
    },
    fieldVisit: {
      title: "ක්ෂේත්‍ර සංචාරය",
      alt: "දුරකථනයක AAC සිංහල උත්සාහ කරන ක්ෂේත්‍ර නිරාවරණ සැසිය",
    },
    centre: { title: "මධ්‍යස්ථානය", alt: "ප්‍රගති ළමා මැදිහත්වීම් මධ්‍යස්ථාන බාහිරය" },
    context: { title: "සන්දර්භය", alt: "මධ්‍යස්ථානයේ ක්ෂේත්‍ර නිරාවරණ සන්දර්භය" },
  },
};

const ta: CaseStudyCopy = {
  lead: "இலங்கைக்கான offline-first மும்மொழி உதவித் தொடர்பு, சாதனத்திலேயே துணை முகக்குறிப்பு அறிதலுடன். இறுதி ஆண்டு பொறியியல் அமைப்பாக உருவாக்கப்பட்டது.",
  heroAlt: "Smart AAC செயலி இடைமுகம்",
  metaThesis: "ஆய்வறிக்கை",
  metaStack: "தொழில்நுட்ப அடுக்கு",
  metaLanguages: "மொழிகள்",
  thesisValue: "ஆட்டிசத்திற்கான முகக்குறிப்பு அறிதலுடன் Smart AAC அமைப்பு",
  stackValue: "Flutter, TensorFlow Lite, offline-first",
  languagesValue: "சிங்களம், தமிழ், ஆங்கிலம்",
  journeyTitle: "பயணம்",
  journey: [
    {
      id: "problem",
      title: "சிக்கல்",
      body: "இலங்கையில் வரையறுக்கப்பட்ட பேச்சு உள்ள பல குழந்தைகளுக்கு சிங்களம், தமிழ், ஆங்கிலத்தில், offline ஆக, சாதாரண Android தொலைபேசிகளில் இயங்கும் மலிவு AAC தேவை. இறக்குமதி ஆங்கில-முதல் கருவிகள் பெரும்பாலும் விலை உயர்ந்தவை அல்லது பண்பாட்டுப் பொருத்தம் குறைவு.",
    },
    {
      id: "research",
      title: "ஆய்வு",
      body: "ESOFT Metro Campus இல் இறுதி ஆண்டு மென்பொருள் பொறியியல் திட்டம் (CS6P05ES). இலக்கிய மதிப்பாய்வு, பராமரிப்பாளர் மற்றும் சிகிச்சையாளர் உரையாடல்கள், பிரகதி மையம் / காலி தேசிய மருத்துவமனையின் மருத்துவ ஆர்வம் தேவைகளை வடிவமைத்தன.",
    },
    {
      id: "architecture",
      title: "கட்டமைப்பு",
      body: "சமர்ப்பிக்கப்பட்ட build-இல் backend இல்லாத offline-first Flutter client. உள்ளூர் சொற்களஞ்சியம், சாதனத்திலேயே TensorFlow Lite மாதிரிகள், கேமரா சட்டக பதிவேற்றம் இல்லை.",
    },
    {
      id: "development",
      title: "உருவாக்கம்",
      body: "முதன்மை AAC ஓட்டங்கள் மற்றும் மேற்பார்வை கேமரா-குறிப்பு திரை. EfficientNetB0 முதன்மை TFLite மாதிரி; MobileNetV2 காப்பு.",
    },
    {
      id: "testing",
      title: "சோதனை",
      body: "TFLite இணக்கச் சோதனைகள், உண்மையான சாதன நடைமுறைகள், Google Play உள் சோதனை, பொதுத் தரவுத்தொகுப்பு மதிப்பீடு (சோதனை துல்லியம் 52.9%; weighted F1 0.54). பெயரில்லா ஆரம்ப சோதனையாளர் கேள்வித்தாள் n=11. மருத்துவ மதிப்பீட்டிற்கு குழந்தைகள் சேர்க்கப்படவில்லை.",
    },
    {
      id: "impact",
      title: "தாக்கம்",
      body: "இலங்கையில் இலவச அல்லது குறைந்த கட்டண துணை AAC-க்கான செயல்படும் அடித்தளம், நெறிமுறை அனுமதிக்குப் பின் எதிர்கால முன்னோடிக்கு அதிகாரப்பூர்வ ஆதரவுக் கடிதத்துடன். நோயறிதல் சாதனம் அல்ல; மருத்துவ அனுமதியும் இல்லை.",
    },
  ],
  whyTitle: "ஏன் இது உள்ளது",
  whyP1:
    "வரையறுக்கப்பட்ட பேச்சு உள்ள குழந்தைகளுக்கு அன்றாடத் தேவைகளை வெளிப்படுத்த ஒரு வழி தேவை. இலங்கையில் அது சிங்களம் மற்றும் தமிழை முதன்மை மொழிகளாக, பயனுள்ள இடத்தில் ஆங்கிலம், சாதாரண தொலைபேசிகளில் offline பயன்பாடு, குடும்பங்கள் தாங்கக்கூடிய விலை.",
  whyP2:
    "தொழில்நுட்பப் பங்களிப்பு ஒருங்கிணைப்பு: மும்மொழி AAC மற்றும் கவனிப்பு ஆதரவுக்கான எச்சரிக்கையான சாதனத்திலேயே முகக்குறிப்பு அறிதல். இது புதிய emotion algorithm அல்ல, நோயறிதல் அமைப்பும் அல்ல.",
  trustTitle: "நம்பிக்கை எல்லைகள்",
  boundaries: [
    "நோயறிதல் மருத்துவ சாதனம் அல்ல.",
    "மருத்துவப் பயன்பாட்டிற்கு சுகாதார அமைச்சக அனுமதி இல்லை.",
    "நெறிமுறை அனுமதிக்குப் பிறகே முன்னோடி திட்டம் (பிரகதி மையம் / காலி தேசிய மருத்துவமனை ஆதரவுக் கடிதம்).",
    "உற்பத்தி சுகாதாரப் பயன்பாடு என உரிமை கோரப்படவில்லை.",
  ],
  clinicalTitle: "மருத்துவ ஒத்துழைப்பு",
  clinicalLead:
    "பிரகதி மையம் / காலி தேசிய மருத்துவமனையுடன் துணை ஒத்துழைப்பு. மருத்துவ அனுமதி அல்ல, மருத்துவச் சான்றிதழ் அல்ல, பயன்படுத்தப்பட்ட மருத்துவ சாதனம் அல்ல.",
  clinical: [
    {
      id: "pragathi",
      title: "பிரகதி மையம் / காலி தேசிய மருத்துவமனை",
      body: "Pragathi AAC App ஒத்துழைப்பை உறுதிப்படுத்தும் அதிகாரப்பூர்வ கடிதம் மற்றும் நெறிமுறை அனுமதிக்குப் பின் எதிர்கால முன்னோடிக்கு ஆர்வம்.",
    },
    {
      id: "karapitiya",
      title: "கரப்பிட்டி கற்பித்தல் மருத்துவமனை",
      body: "கள வெளிப்பாட்டின் போது ஆரம்ப உரையாடல்கள் மற்றும் திறந்த தன்மை. AAC இடைமுகம் குறித்து பேச்சு-மொழி சிகிச்சையாளர்கள் மற்றும் பெற்றோரின் முறைசாரா பின்னூட்டம்.",
    },
    {
      id: "whatIs",
      title: "இது என்ன",
      body: "மருத்துவ ஆர்வம், வடிவமைப்பு உள்ளீடு, நெறிமுறை மற்றும் சுகாதாரத் துறை அனுமதிகள் கிடைத்த பின் மேற்பார்வை முன்னோடி நோக்கிய ஆவணப்படுத்தப்பட்ட பாதை.",
    },
    {
      id: "whatIsNot",
      title: "இது என்ன அல்ல",
      body: "சுகாதார அமைச்சக அனுமதி அல்ல. முடிந்த மருத்துவ முன்னோடி அல்ல. ஆட்டிசம் அல்லது உணர்ச்சி நோயறிதல் அல்ல. இந்த ஆய்வறிக்கைக்காக குழந்தை முகக்குறிப்பு தரவுத்தொகுப்பு சேகரிக்கப்படவில்லை.",
    },
  ],
  fieldLead:
    "AAC ஆதரவு பயன்படுத்தப்படக்கூடிய சூழலைப் புரிந்துகொள்ளல். இந்த வருகை மருத்துவச் சோதனை அல்லது முறைசார் மருத்துவச் சரிபார்ப்பு ஆய்வு அல்ல; ஆய்வுக் கள வெளிப்பாடு.",
  fieldVideoFallback: "தனியுரிமைக்காக திருத்தப்பட்ட கள அமர்வு பதிவு. முகங்கள் மறைக்கப்பட்டுள்ளன; ஒலி நீக்கப்பட்டுள்ளது.",
  fieldVideoNote: "கள வருகை: பிரகதி குழந்தை தலையீட்டு மையம். காணொளி பொது ஆய்விலிருந்து வழங்கப்படுகிறது.",
  inActionTitle: "செயல்பாட்டில் Smart AAC",
  stackTitle: "தொழில்நுட்ப அடுக்கு",
  aiPipelineTitle: "AI குழாய்",
  aiPipelineBody:
    "TensorFlow Lite வழியாக சாதனத்திலேயே FER. EfficientNetB0 முதன்மை; MobileNetV2 காப்பு. வாயில்களில் முக அறிதல், நம்பிக்கைச் சோதனைகள், தெளிவான நிச்சயமற்ற நிலைகள் உள்ளன.",
  modelHonestyTitle: "மாதிரி நேர்மை",
  modelHonestyBody:
    "பொதுத் தரவுத்தொகுப்பு சோதனை துல்லியம் 52.9% (weighted F1 0.54). பராமரிப்பாளர் மேற்பார்வையில் எச்சரிக்கையான துணைக் குறிப்பாக மட்டுமே பயனுள்ளது.",
  galleryLead: "படங்கள், திரைப்பிடிப்புகள், மருத்துவப் புகைப்படங்கள், சோதனைச் சான்றுகள். இணையதளத்திற்காக எதுவும் உருவாக்கப்படவில்லை.",
  galleryPageLead:
    "ஆய்வறிக்கை படங்கள், Smart AAC திரைப்பிடிப்புகள், கட்டமைப்பு வரைபடங்கள், கள வெளிப்பாடு, Play Store சான்றுகள்.",
  downloadsTitle: "பதிவிறக்கங்கள்",
  thesisPdf: "இறுதி ஆய்வறிக்கை PDF",
  eiconPdf: "EICON camera-ready",
  openGithub: "GitHub திறக்கவும்",
  lessonsTitle: "கற்ற பாடங்கள்",
  lessons: [
    "மொபைல் பயன்பாட்டுக் கட்டுப்பாடுகள் முதல் நாளிலிருந்தே மாதிரி துல்லியத்திற்கு அருகில் இருக்க வேண்டும்.",
    "பராமரிப்பாளர்கள் பல-toggle உணர்வு சிக்கலுக்குப் பதில் எளிய ஓட்டங்களை விரும்புகிறார்கள்.",
    "கட்டாய உணர்ச்சி லேபிள்களை விட நிச்சயமற்ற நிலைகள் பாதுகாப்பானவை.",
    "மருத்துவ பாதைகள் sprint பலகைகளில் அல்ல, நெறிமுறை காலக்கெடுவில் நகரும்.",
  ],
  futureTitle: "எதிர்காலப் பணி",
  future: [
    "மருத்துவ பங்காளிகளுடன் நெறிமுறை அனுமதி மற்றும் மேற்பார்வை முன்னோடி திட்டமிடல்.",
    "சிகிச்சையாளர்களுடன் தரப்படுத்தப்பட்ட பயன்பாட்டு ஆய்வு.",
    "ஆவணப்படுத்தப்பட்ட குறைந்த/நடுத்தர தர சாதனங்களில் தாமத அளவீடு.",
    "இலங்கை ஒப்புதல் பெற்ற முகக்குறிப்பு தரவு உரிய பாதுகாப்புடன் மட்டுமே.",
  ],
  paperTitle: "ஆய்வுக் கட்டுரைப் பாதை",
  paperBody:
    "இலங்கையில் ஆட்டிசத்திற்கான சாதனத்திலேயே முகக்குறிப்பு அறிதலுடன் மும்மொழி Offline Smart AAC. இடம்: EICON 2026. கட்டுரை அடையாளம்: FPC21. முழுக் கட்டுரை சமர்ப்பிக்கப்பட்டது; camera-ready கையெழுத்துப் பிரதி தயார். சமர்ப்பிப்பு ஏற்பு அல்ல.",
  groups: {
    appUi: "செயலி UI",
    architecture: "கட்டமைப்பு",
    aiTesting: "AI & சோதனை",
    clinical: "மருத்துவம்",
    field: "கள வெளிப்பாடு",
    play: "Play & சாதனங்கள்",
  },
  gallery: {
    uiHome: { alt: "Smart AAC முகப்புத் திரை", caption: "AAC முகப்பு / சொற்களஞ்சிய ஓட்டம்." },
    uiCards: { alt: "Smart AAC பட அட்டைகள்", caption: "மும்மொழி தொடர்பு அட்டைகள்." },
    uiEmotion: { alt: "Smart AAC உணர்ச்சி கேமரா", caption: "மேற்பார்வை குறிப்பு கவனிப்புத் திரை." },
    architecture: {
      alt: "Smart AAC அமைப்புக் கட்டமைப்பு",
      caption: "சாதனத்திலேயே TFLite inference கொண்ட offline Flutter client.",
    },
    confusion: {
      alt: "ஆய்வறிக்கையிலிருந்து confusion matrix",
      caption: "பொதுத் தரவுத்தொகுப்பு மதிப்பீட்டுச் சான்று (துணைக் குறிப்பு மட்டும்).",
    },
    playConsole: {
      alt: "Google Play Console சோதனைச் சான்று",
      caption: "ஆய்வறிக்கையிலிருந்து Play சோதனைச் சான்று.",
    },
    supportLetter: {
      alt: "பிரகதி மைய ஆதரவுக் கடிதம்",
      caption: "பிரகதி மையம் / காலி தேசிய மருத்துவமனை ஆதரவுக் கடிதம்.",
    },
    centreSign: {
      alt: "பிரகதி குழந்தை தலையீட்டு மையப் பலகை",
      caption: "பிரகதி குழந்தை தலையீட்டு மையப் பலகை.",
    },
    centreExterior: {
      alt: "பிரகதி குழந்தை தலையீட்டு மைய வெளிப்புறம்",
      caption: "கள வருகையிலிருந்து மைய வெளிப்புறம்.",
    },
    field01: {
      alt: "கள வெளிப்பாட்டின் போது AAC செயல்விளக்கம்",
      caption: "கள வெளிப்பாட்டின் போது AAC செயல்விளக்கம்.",
    },
    field02: { alt: "கள வெளிப்பாட்டுச் சூழல்", caption: "கள வெளிப்பாட்டுச் சூழல்." },
    field03: { alt: "திட்டக் கள வருகை", caption: "திட்டக் கள வருகை." },
  },
  fieldCards: {
    pragathi: {
      title: "பிரகதி",
      alt: "சிங்களம், ஆங்கிலம், தமிழில் பிரகதி குழந்தை தலையீட்டு மையப் பலகை",
    },
    fieldVisit: {
      title: "கள வருகை",
      alt: "தொலைபேசியில் AAC Sinhala முயற்சிக்கப்படும் கள வெளிப்பாட்டு அமர்வு",
    },
    centre: { title: "மையம்", alt: "பிரகதி குழந்தை தலையீட்டு மைய வெளிப்புறம்" },
    context: { title: "சூழல்", alt: "மையத்தில் கள வெளிப்பாட்டுச் சூழல்" },
  },
};

export const CASE_STUDY: Record<Locale, CaseStudyCopy> = { en, si, ta };
