import type { FieldShotId, GalleryGroupId, GalleryItemId } from "@shared/case-study-copy";

export interface GalleryItem {
  id: GalleryItemId;
  src: string;
  group: GalleryGroupId;
}

export const SMART_AAC_GALLERY: GalleryItem[] = [
  { id: "uiHome", src: "/images/smart-aac/ui-home.webp", group: "appUi" },
  { id: "uiCards", src: "/images/smart-aac/ui-cards.webp", group: "appUi" },
  { id: "uiEmotion", src: "/images/smart-aac/ui-emotion.webp", group: "appUi" },
  { id: "architecture", src: "/images/smart-aac/system-architecture.webp", group: "architecture" },
  { id: "confusion", src: "/images/smart-aac/confusion-matrix.webp", group: "aiTesting" },
  { id: "playConsole", src: "/images/smart-aac/play-console.webp", group: "play" },
  { id: "supportLetter", src: "/images/smart-aac/support-letter.webp", group: "clinical" },
  { id: "centreSign", src: "/images/smart-aac/centre-sign.webp", group: "clinical" },
  { id: "centreExterior", src: "/images/smart-aac/centre-exterior.webp", group: "clinical" },
  { id: "field01", src: "/images/smart-aac/field-01.webp", group: "field" },
  { id: "field02", src: "/images/smart-aac/field-02.webp", group: "field" },
  { id: "field03", src: "/images/smart-aac/field-03.webp", group: "field" },
];

export const FIELD_EXPOSURE_SHOTS: { id: FieldShotId; src: string }[] = [
  { id: "pragathi", src: "/images/smart-aac/centre-sign.webp" },
  { id: "fieldVisit", src: "/images/smart-aac/field-01.webp" },
  { id: "centre", src: "/images/smart-aac/centre-exterior.webp" },
  { id: "context", src: "/images/smart-aac/field-02.webp" },
];

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

export const PORTFOLIO_MEDIA = {
  fieldVideo: "https://portfolio.yasaboy.com/projects/smart-aac/video/field-exposure-video.mp4",
  fieldPoster: "https://portfolio.yasaboy.com/projects/smart-aac/video/field-exposure-video-poster.webp",
  introVideo: "https://portfolio.yasaboy.com/projects/smart-aac/video/smart-aac-intro.mp4",
  introPoster: "https://portfolio.yasaboy.com/projects/smart-aac/video/smart-aac-intro-poster.webp",
  thesis: "https://portfolio.yasaboy.com/projects/smart-aac/downloads/Smart_AAC_Final_Thesis.pdf",
  eicon: "https://portfolio.yasaboy.com/projects/smart-aac/downloads/EICON2026-FPC21-CameraReady.pdf",
  github: "https://github.com/YasasPasinduFernando/simple_aac_app",
};
