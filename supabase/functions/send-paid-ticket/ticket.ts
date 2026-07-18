// Module partagé billets Air Comores : génération du PDF e-ticket (pdf-lib)
// et de l'email HTML. Dupliqué à l'identique dans send-paid-ticket/.
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

export interface TicketSegment {
  kind: "ALLER" | "RETOUR";
  routeFrom: string;
  routeTo: string;
  departurePlace: string;
  departureCode: string;
  arrivalPlace: string;
  arrivalCode: string;
  departureDate: string;
  departureTime: string;
  durationMinutes: number;
}

export interface TicketData {
  reference: string;
  contactFullName: string;
  passengerNames: string[];
  segments: TicketSegment[];
  totalPriceKmf: number;
  paymentMethod: "virement" | "mobile_money" | "cash_agence";
  paid: boolean;
}

export const PAYMENT_LABELS: Record<string, string> = {
  virement: "Virement bancaire",
  mobile_money: "Mobile money",
  cash_agence: "Paiement à l'agence",
};

// Coordonnées de paiement : PLACEHOLDERS à remplacer par les vraies données.
export function paymentInstructions(method: string, reference: string): string {
  switch (method) {
    case "virement":
      return `Bénéficiaire : Air Comores · Banque : Exim Banque Comores · IBAN : KM00 0000 0000 0000 0000 · Motif obligatoire : ${reference}`;
    case "mobile_money":
      return `Envoyez le montant au +269 000 00 00 (Huri Money / MVola) · Motif obligatoire : ${reference}`;
    default:
      return `Réglez en espèces à l'agence Air Comores (Moroni centre ou aéroport de Hahaya), au plus tard la veille du départ. Référence : ${reference}`;
  }
}

/** Espace normal comme séparateur de milliers (WinAnsi-safe pour le PDF). */
export function formatKmf(n: number): string {
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} KMF`;
}

export function formatDateFr(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const VERT = rgb(0.043, 0.478, 0.231);
const VERT_DEEP = rgb(0.027, 0.361, 0.173);
const JAUNE = rgb(1, 0.776, 0.118);
const CREME = rgb(0.961, 0.969, 0.961);
const INK = rgb(0.086, 0.129, 0.102);
const GRIS = rgb(0.29, 0.34, 0.31);

export async function generateTicketPdf(data: TicketData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const wrap = (text: string, size: number, maxWidth: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const attempt = line ? `${line} ${word}` : word;
      if (reg.widthOfTextAtSize(attempt, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = attempt;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  // Bandeau liseré drapeau
  const bands: [ReturnType<typeof rgb>, number][] = [
    [JAUNE, 0],
    [rgb(1, 1, 1), 1],
    [rgb(0.808, 0.067, 0.149), 2],
    [rgb(0.184, 0.435, 0.749), 3],
  ];
  for (const [color, i] of bands) {
    page.drawRectangle({ x: (595 / 4) * i, y: 836, width: 595 / 4, height: 6, color });
  }

  // En-tête vert
  page.drawRectangle({ x: 0, y: 776, width: 595, height: 60, color: VERT });
  page.drawText("AIR COMORES", { x: 40, y: 798, size: 22, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Billet électronique", { x: 430, y: 802, size: 11, font: reg, color: rgb(1, 1, 1) });

  // Bandeau statut
  const statusText = data.paid
    ? "BILLET DÉFINITIF — PAIEMENT CONFIRMÉ"
    : "RÉSERVATION PROVISOIRE — EN ATTENTE DE PAIEMENT";
  page.drawRectangle({
    x: 0,
    y: 742,
    width: 595,
    height: 34,
    color: data.paid ? rgb(0.883, 0.95, 0.9) : rgb(1, 0.95, 0.78),
  });
  page.drawText(statusText, {
    x: 40,
    y: 753,
    size: 12,
    font: bold,
    color: data.paid ? VERT_DEEP : rgb(0.48, 0.36, 0),
  });

  // Référence
  page.drawText("RÉFÉRENCE DE RÉSERVATION", { x: 40, y: 712, size: 8, font: bold, color: GRIS });
  page.drawText(data.reference, { x: 40, y: 688, size: 24, font: bold, color: INK });
  page.drawText(`Contact : ${data.contactFullName}`, { x: 330, y: 692, size: 10, font: reg, color: GRIS });

  // Segments
  let y = 660;
  for (const seg of data.segments) {
    page.drawRectangle({
      x: 40,
      y: y - 92,
      width: 515,
      height: 92,
      color: CREME,
      borderColor: VERT,
      borderWidth: 1,
    });
    page.drawText(seg.kind, { x: 56, y: y - 24, size: 9, font: bold, color: VERT });
    page.drawText(`${seg.routeFrom}  »  ${seg.routeTo}`, {
      x: 56,
      y: y - 44,
      size: 16,
      font: bold,
      color: INK,
    });
    page.drawText(
      `${seg.departurePlace} (${seg.departureCode})  »  ${seg.arrivalPlace} (${seg.arrivalCode})`,
      { x: 56, y: y - 60, size: 9, font: reg, color: GRIS },
    );
    page.drawText(
      `${formatDateFr(seg.departureDate)} · Départ ${seg.departureTime} · Durée ${seg.durationMinutes} min`,
      { x: 56, y: y - 78, size: 10, font: reg, color: INK },
    );
    y -= 104;
  }

  // Passagers
  page.drawText("PASSAGERS", { x: 40, y: y - 8, size: 8, font: bold, color: GRIS });
  let py = y - 26;
  data.passengerNames.forEach((name, i) => {
    page.drawText(`${String(i + 1).padStart(2, "0")}   ${name}`, {
      x: 40,
      y: py,
      size: 11,
      font: reg,
      color: INK,
    });
    py -= 16;
  });

  // Total + paiement
  py -= 10;
  page.drawLine({ start: { x: 40, y: py }, end: { x: 555, y: py }, thickness: 0.7, color: VERT });
  py -= 22;
  page.drawText(`TOTAL : ${formatKmf(data.totalPriceKmf)}`, {
    x: 40,
    y: py,
    size: 14,
    font: bold,
    color: VERT_DEEP,
  });
  page.drawText(`Mode de paiement : ${PAYMENT_LABELS[data.paymentMethod]}`, {
    x: 330,
    y: py + 1,
    size: 10,
    font: reg,
    color: GRIS,
  });

  // Instructions si non payé
  if (!data.paid) {
    py -= 30;
    page.drawText("COMMENT CONFIRMER VOTRE VOL", { x: 40, y: py, size: 8, font: bold, color: GRIS });
    py -= 16;
    const lines = wrap(paymentInstructions(data.paymentMethod, data.reference), 10, 515);
    for (const line of lines) {
      page.drawText(line, { x: 40, y: py, size: 10, font: reg, color: INK });
      py -= 14;
    }
    py -= 6;
    const incitation = wrap(
      "Votre place est réservée. Ce billet devient définitif dès validation de votre paiement — vous recevrez alors votre e-ticket final par email.",
      10,
      515,
    );
    for (const line of incitation) {
      page.drawText(line, { x: 40, y: py, size: 10, font: italic, color: VERT_DEEP });
      py -= 14;
    }
  }

  // Pied
  page.drawRectangle({ x: 0, y: 0, width: 595, height: 46, color: VERT_DEEP });
  page.drawText("Fiers de nos îles, heureux de vous y emmener.", {
    x: 40,
    y: 18,
    size: 10,
    font: italic,
    color: rgb(1, 1, 1),
  });
  page.drawText("Présentez-vous 45 min avant le départ, pièce d'identité en main.", {
    x: 320,
    y: 18,
    size: 8,
    font: reg,
    color: rgb(1, 1, 1),
  });

  return doc.save();
}

export function buildTicketEmailHtml(data: TicketData): string {
  const statusBlock = data.paid
    ? `<span style="display:inline-block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#0b7a3b;font-weight:bold;">Paiement confirmé — billet définitif</span>
       <h1 style="margin:8px 0 0;font-size:24px;color:#16211a;">Bon voyage !</h1>`
    : `<span style="display:inline-block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7a5c00;font-weight:bold;">Réservation enregistrée — en attente de paiement</span>
       <h1 style="margin:8px 0 0;font-size:24px;color:#16211a;">Karibu ! Plus qu'une étape.</h1>`;

  const segmentsHtml = data.segments
    .map(
      (seg) => `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #0b7a3b;border-radius:10px;margin-top:10px;">
        <tr><td style="padding:14px 18px;">
          <span style="font-size:10px;font-weight:bold;letter-spacing:2px;color:#0b7a3b;">${seg.kind}</span><br/>
          <span style="font-size:17px;font-weight:bold;color:#16211a;">${seg.routeFrom} → ${seg.routeTo}</span><br/>
          <span style="font-size:12px;color:#4a5750;">${seg.departurePlace} (${seg.departureCode}) → ${seg.arrivalPlace} (${seg.arrivalCode})</span><br/>
          <span style="font-size:13px;color:#16211a;">${formatDateFr(seg.departureDate)} · Départ ${seg.departureTime} · ${seg.durationMinutes} min</span>
        </td></tr>
      </table>`,
    )
    .join("");

  const passengersHtml = data.passengerNames
    .map(
      (name, i) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #eceeec;font-size:13px;color:#16211a;">${String(i + 1).padStart(2, "0")} — ${name}</td></tr>`,
    )
    .join("");

  const paymentBlock = data.paid
    ? `<p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#4a5750;">
         Votre billet définitif est en pièce jointe. Présentez-le (imprimé ou sur téléphone)
         à l'embarquement, avec une pièce d'identité, 45 minutes avant le départ.
       </p>`
    : `<div style="margin-top:16px;background:#fff3c9;border-radius:10px;padding:14px 18px;">
         <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#7a5c00;">
           Comment confirmer votre vol — ${PAYMENT_LABELS[data.paymentMethod]}
         </p>
         <p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:#16211a;">
           ${paymentInstructions(data.paymentMethod, data.reference)}
         </p>
         <p style="margin:10px 0 0;font-size:12px;line-height:1.6;color:#4a5750;">
           Votre place est réservée. Dès validation de votre paiement, vous recevrez
           automatiquement votre <strong>billet définitif</strong> par email.
         </p>
       </div>`;

  return `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f5f7f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;">
        <tr><td style="height:6px;background:linear-gradient(to right,#ffc61e 0 25%,#ffffff 25% 50%,#ce1126 50% 75%,#2f6fbf 75% 100%);"></td></tr>
        <tr><td style="background:#0b7a3b;padding:20px 28px;">
          <span style="color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:2px;">AIR COMORES</span>
        </td></tr>
        <tr><td style="padding:26px 28px 6px;">
          ${statusBlock}
          <p style="margin:6px 0 0;font-size:13px;color:#4a5750;">
            Référence : <strong style="color:#16211a;">${data.reference}</strong>
          </p>
        </td></tr>
        <tr><td style="padding:10px 28px;">${segmentsHtml}</td></tr>
        <tr><td style="padding:6px 28px;">
          <span style="font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#4a5750;">Passagers</span>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">${passengersHtml}</table>
        </td></tr>
        <tr><td style="padding:14px 28px 26px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#4a5750;">Total</td>
              <td style="font-size:18px;font-weight:bold;color:#0b7a3b;text-align:right;">${formatKmf(data.totalPriceKmf)}</td>
            </tr>
          </table>
          ${paymentBlock}
        </td></tr>
        <tr><td style="background:#075c2c;padding:16px 28px;">
          <span style="font-size:12px;color:#ffc61e;font-style:italic;">Fiers de nos îles, heureux de vous y emmener.</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
