export const SMART_AAC_META = {
  thesis: "Smart AAC System with Facial Expression Recognition for Autism",
  stack: "Flutter, TensorFlow Lite, offline-first",
  languages: "Sinhala, Tamil, English",
};

export const SMART_AAC_JOURNEY = [
  {
    title: "Problem",
    body: "In Sri Lanka, many children with limited speech need affordable AAC that works in Sinhala, Tamil, and English, offline, on ordinary Android phones. Imported English-first tools are often too expensive or a poor cultural fit.",
  },
  {
    title: "Research",
    body: "Final-year Software Engineering project (CS6P05ES) at ESOFT Metro Campus. Literature review, caregiver and therapist conversations, and clinical interest from Pragathi Centre / National Hospital Galle shaped the requirements.",
  },
  {
    title: "Architecture",
    body: "Offline-first Flutter client with no backend in the submitted build. Local vocabulary, on-device TensorFlow Lite models, and no camera-frame upload.",
  },
  {
    title: "Development",
    body: "Core AAC flows plus a supervised camera-expression screen. EfficientNetB0 primary TFLite model with MobileNetV2 fallback.",
  },
  {
    title: "Testing",
    body: "TFLite compatibility checks, real-device walkthroughs, Google Play internal testing, and public-dataset model evaluation (52.9% test accuracy; weighted F1 0.54). Anonymous early tester questionnaire n=11. No children recruited for clinical evaluation.",
  },
  {
    title: "Impact",
    body: "A working foundation for free or low-cost supportive AAC in Sri Lanka, with a formal letter of support for a future pilot after ethical clearance. Not a diagnostic device and not clinically approved.",
  },
] as const;

export const SMART_AAC_BOUNDARIES = [
  "Not a diagnostic medical device.",
  "Not Ministry of Health approved for clinical use.",
  "Pilot intended only after ethical clearance (Pragathi Centre / National Hospital Galle letter of support).",
  "No claim of production healthcare deployment.",
];

export const SMART_AAC_CLINICAL = {
  title: "Clinical collaboration",
  lead: "Supportive collaboration with Pragathi Centre / National Hospital Galle. Not clinical approval, not medical certification, and not a deployed medical device.",
  points: [
    {
      title: "Pragathi Centre / National Hospital Galle",
      body: "Formal letter confirming collaboration on the Pragathi AAC App and interest in a future pilot after ethical clearance.",
    },
    {
      title: "Karapitiya Teaching Hospital",
      body: "Early discussions and openness during field exposure. Informal feedback from speech-language therapists and parents on the AAC interface.",
    },
    {
      title: "What this is",
      body: "Clinical interest, design input, and a documented pathway toward a supervised pilot once ethics and health-sector approvals are in place.",
    },
    {
      title: "What this is not",
      body: "Not Ministry of Health approval. Not a completed clinical pilot. Not diagnosis of autism or emotion. No child facial-expression dataset was collected for this thesis.",
    },
  ],
};

export const SMART_AAC_STACK = [
  "Flutter / Dart",
  "TensorFlow Lite",
  "EfficientNetB0 (primary)",
  "MobileNetV2 (fallback)",
  "Offline-first local storage",
  "Sinhala / Tamil / English TTS",
  "Android release APK",
  "Google Play testing",
] as const;

export type GalleryGroup = "App UI" | "Architecture" | "AI & Testing" | "Clinical" | "Field exposure" | "Play & Devices";

export interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
  group: GalleryGroup;
}

export const SMART_AAC_GALLERY: GalleryItem[] = [
  {
    src: "/images/smart-aac/ui-home.webp",
    alt: "Smart AAC home screen",
    caption: "AAC home / vocabulary flow.",
    group: "App UI",
  },
  {
    src: "/images/smart-aac/ui-cards.webp",
    alt: "Smart AAC picture cards",
    caption: "Trilingual communication cards.",
    group: "App UI",
  },
  {
    src: "/images/smart-aac/ui-emotion.webp",
    alt: "Smart AAC emotion camera",
    caption: "Supervised expression observation screen.",
    group: "App UI",
  },
  {
    src: "/images/smart-aac/system-architecture.webp",
    alt: "Smart AAC system architecture",
    caption: "Offline Flutter client with on-device TFLite inference.",
    group: "Architecture",
  },
  {
    src: "/images/smart-aac/confusion-matrix.webp",
    alt: "Confusion matrix from the thesis",
    caption: "Public-dataset evaluation evidence (supportive cue only).",
    group: "AI & Testing",
  },
  {
    src: "/images/smart-aac/play-console.webp",
    alt: "Google Play Console testing evidence",
    caption: "Play testing evidence from the thesis.",
    group: "Play & Devices",
  },
  {
    src: "/images/smart-aac/support-letter.webp",
    alt: "Pragathi Centre support letter",
    caption: "Pragathi Centre / National Hospital Galle support letter.",
    group: "Clinical",
  },
  {
    src: "/images/smart-aac/centre-sign.webp",
    alt: "Pragathi Child Intervention Centre sign",
    caption: "Pragathi Child Intervention Centre signboard.",
    group: "Clinical",
  },
  {
    src: "/images/smart-aac/centre-exterior.webp",
    alt: "Pragathi Child Intervention Centre exterior",
    caption: "Centre exterior from the field visit.",
    group: "Clinical",
  },
  {
    src: "/images/smart-aac/field-01.webp",
    alt: "AAC demonstration during field exposure",
    caption: "AAC demonstration during field exposure.",
    group: "Field exposure",
  },
  {
    src: "/images/smart-aac/field-02.webp",
    alt: "Field-exposure context",
    caption: "Field-exposure context.",
    group: "Field exposure",
  },
  {
    src: "/images/smart-aac/field-03.webp",
    alt: "Project field visit",
    caption: "Project field visit.",
    group: "Field exposure",
  },
];

export const FIELD_EXPOSURE_SHOTS = [
  {
    src: "/images/smart-aac/centre-sign.webp",
    alt: "Pragathi Child Intervention Centre sign in Sinhala, English, and Tamil",
    title: "Pragathi",
  },
  {
    src: "/images/smart-aac/field-01.webp",
    alt: "Field exposure session showing AAC Sinhala being tried on a phone",
    title: "Field visit",
  },
  {
    src: "/images/smart-aac/centre-exterior.webp",
    alt: "Pragathi Child Intervention Centre exterior",
    title: "Centre",
  },
  {
    src: "/images/smart-aac/field-02.webp",
    alt: "Field-exposure context at the centre",
    title: "Context",
  },
] as const;

export const PORTFOLIO_MEDIA = {
  fieldVideo: "https://portfolio.yasaboy.com/projects/smart-aac/video/field-exposure-video.mp4",
  fieldPoster: "https://portfolio.yasaboy.com/projects/smart-aac/video/field-exposure-video-poster.webp",
  introVideo: "https://portfolio.yasaboy.com/projects/smart-aac/video/smart-aac-intro.mp4",
  introPoster: "https://portfolio.yasaboy.com/projects/smart-aac/video/smart-aac-intro-poster.webp",
  thesis: "https://portfolio.yasaboy.com/projects/smart-aac/downloads/Smart_AAC_Final_Thesis.pdf",
  eicon: "https://portfolio.yasaboy.com/projects/smart-aac/downloads/EICON2026-FPC21-CameraReady.pdf",
  github: "https://github.com/YasasPasinduFernando/simple_aac_app",
};
