import { jsPDF } from "jspdf";
import { sectionLabels, type CvData } from "@/lib/cv";
import {
  DEFAULT_TEMPLATE,
  accentHex,
  densityFactor,
  type TemplateSection,
  type TemplateSettings,
} from "@/lib/cv-template";

const PAGE_W = 595.28;
const PAGE_H = 841.89;

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

/**
 * ATS-safe layout: single column, no tables, no graphics behind text, standard
 * font, real selectable text, plain section headings.
 *
 * The CV must always fit on ONE page — recruiters and ATS screens discard
 * multi-page exports — so the layout is rendered at progressively tighter
 * scales until it fits.
 */
function renderCv(cv: CvData, language: string, scale: number, settings: TemplateSettings) {
  const labels = sectionLabels(language);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const font = settings.font;
  const compact = settings.template === "compact";
  const band = settings.template === "band";
  const density = densityFactor(settings.density) * (compact ? 0.94 : 1);
  const s = scale * density;

  const margin = Math.max(30, (compact ? 46 : 54) * (0.7 + 0.3 * scale));
  const line = (compact ? 12 : 13) * s;
  const maxW = PAGE_W - margin * 2;
  const bottom = PAGE_H - margin;
  const [ar, ag, ab] = hexToRgb(accentHex(settings.accent));
  let y = margin;
  let overflow = false;

  const room = (needed = line) => {
    if (y + needed > bottom) {
      overflow = true;
      return false;
    }
    return true;
  };

  const text = (
    value: string,
    size: number,
    style: "normal" | "bold",
    gap = line,
    width = maxW,
  ) => {
    if (!value) return;
    doc.setFont(font, style);
    doc.setFontSize(size * s);
    doc.setTextColor(17, 17, 17);
    for (const item of doc.splitTextToSize(value, width) as string[]) {
      if (!room(gap)) return;
      doc.text(item, margin, y);
      y += gap;
    }
  };

  const heading = (label: string) => {
    y += (compact ? 6 : 8) * s;
    if (!room(20 * s)) return;
    doc.setFont(font, "bold");
    doc.setFontSize((compact ? 10 : 11) * s);
    doc.setTextColor(ar, ag, ab);
    doc.text(label.toUpperCase(), margin, y);
    doc.setTextColor(17, 17, 17);
    y += 5 * s;
    doc.setDrawColor(ar, ag, ab);
    doc.line(margin, y, PAGE_W - margin, y);
    y += (compact ? 11 : 13) * s;
  };

  // Header
  const photo = settings.showPhoto && cv.photoUrl.startsWith("data:image") ? cv.photoUrl : "";
  const photoSize = 62 * s;
  const headerW = photo ? maxW - photoSize - 14 : maxW;

  if (band) {
    const bandTop = margin - 22 * s;
    const bandHeight = (photo ? photoSize + 26 * s : 82 * s);
    doc.setFillColor(244, 245, 247);
    doc.rect(0, Math.max(0, bandTop), PAGE_W, bandHeight, "F");
  }

  const headerTop = y;
  text(cv.fullName, band ? 20 : 19, "bold", 22 * s, headerW);
  if (cv.headline) text(cv.headline, 11, "normal", 15 * s, headerW);
  const contact = [cv.email, cv.phone, cv.location].filter(Boolean).join("  |  ");
  if (contact) text(contact, 9.5, "normal", 13 * s, headerW);
  const links = cv.linkItems.length
    ? cv.linkItems
        .filter((item) => item.url.trim())
        .map((item) => (item.label ? `${item.label}: ${item.url}` : item.url))
        .join("  |  ")
    : cv.links;
  if (links) text(links, 9.5, "normal", 13 * s, headerW);

  if (photo) {
    try {
      doc.addImage(
        cv.photoUrl,
        "JPEG",
        PAGE_W - margin - photoSize,
        headerTop - 12 * s,
        photoSize,
        photoSize,
      );
    } catch {
      // An unreadable photo must never break the export.
    }
    y = Math.max(y, headerTop - 12 * s + photoSize + 6 * s);
  }

  const renderSection = (section: TemplateSection) => {
    if (section === "summary" && cv.summary) {
      heading(labels.summary);
      text(cv.summary, 10, "normal");
      return;
    }
    if (section === "experience" && cv.experiences.length) {
      heading(labels.experience);
      for (const exp of cv.experiences) {
        text([exp.title, exp.company].filter(Boolean).join(" — "), 10.5, "bold", 14 * s);
        const meta = [exp.location, [exp.start, exp.end].filter(Boolean).join(" – ")]
          .filter(Boolean)
          .join("  |  ");
        if (meta) text(meta, 9, "normal", 12 * s);
        for (const bullet of exp.bullets) {
          doc.setFont(font, "normal");
          doc.setFontSize(10 * s);
          doc.setTextColor(17, 17, 17);
          const lines = doc.splitTextToSize(bullet, maxW - 14) as string[];
          for (const [index, item] of lines.entries()) {
            if (!room()) break;
            doc.text(index === 0 ? `• ${item}` : item, margin + (index === 0 ? 0 : 14), y);
            y += line;
          }
        }
        y += 6 * s;
      }
      return;
    }
    if (section === "education" && cv.education.length) {
      heading(labels.education);
      for (const edu of cv.education) {
        text([edu.degree, edu.school].filter(Boolean).join(" — "), 10.5, "bold", 14 * s);
        const meta = [edu.start, edu.end].filter(Boolean).join(" – ");
        if (meta) text(meta, 9, "normal", 12 * s);
        if (edu.details) text(edu.details, 10, "normal");
        y += 6 * s;
      }
      return;
    }
    if (section === "skills" && cv.skills.length) {
      heading(labels.skills);
      text(cv.skills.join(", "), 10, "normal");
    }
  };

  for (const section of settings.sectionOrder) renderSection(section);

  return { doc, overflow };
}

export function downloadCvPdf(
  cv: CvData,
  filename: string,
  language: string = "en",
  settings: TemplateSettings = DEFAULT_TEMPLATE,
) {
  let result = renderCv(cv, language, 1, settings);
  for (let scale = 0.96; result.overflow && scale >= 0.6; scale -= 0.04) {
    result = renderCv(cv, language, scale, settings);
  }
  result.doc.save(filename);
  return { fits: !result.overflow };
}

const MARGIN = 54;

export function downloadLetterPdf(letter: string, name: string, filename: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = MARGIN;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  if (name) {
    doc.text(name, MARGIN, y);
    y += 26;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  for (const paragraph of letter.split(/\n{2,}/)) {
    for (const line of doc.splitTextToSize(paragraph.trim(), PAGE_W - MARGIN * 2) as string[]) {
      if (y > PAGE_H - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }
      doc.text(line, MARGIN, y);
      y += 15;
    }
    y += 10;
  }
  doc.save(filename);
}
