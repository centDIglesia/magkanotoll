import { tollPlazas } from "@/utils/tollData";

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY ?? "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

const buildTollContext = () => {
  const lines: string[] = [];
  for (const [key, ew] of Object.entries(tollPlazas)) {
    lines.push(
      `${ew.fullName} (${key}): region=${ew.region}, ${ew.kilometers}km, ` +
        `speed=${ew.speedLimit.minKph}-${ew.speedLimit.maxKph}kph, ` +
        `plazas=[${ew.plazaList.map((p) => p.name).join(", ")}]`,
    );
  }
  return lines.join("\n");
};

const SYSTEM_PROMPT = `Ikaw si TollBot, ang friendly na assistant ng MagkanoToll app para sa mga expressway toll sa Pilipinas.

Narito ang lahat ng expressway data na alam mo:
${buildTollContext()}

Mga patakaran mo:
- Sumagot sa Taglish (mix ng Tagalog at English) — friendly, casual, at helpful
- Kung tinatanong ang toll amount, sabihin na gamitin ang calculator sa app para sa exact na halaga dahil depende ito sa entry/exit plaza at vehicle class
- Kung tinatanong ang expressway info (speed limit, plazas, region), sagutin agad gamit ang data sa itaas
- Para sa RFID: NLEX, SCTEX, TPLEX, NLEX Connector, Harbor Link = EasyTrip; SLEX, STAR Tollway, CALAX, CAVITEX, MCX, Skyway, NAIAX = Autosweep
- Maging maigsi — 2-4 sentences lang kung pwede
- Huwag mag-hallucinate ng toll amounts — sabihin palagi na gamitin ang calculator para sa exact na halaga
- Kung hindi related sa toll/expressway, i-redirect pabalik sa topic`;

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export function resetChat() {}

export async function sendMessage(
  userMessage: string,
  history: ChatMessage[],
): Promise<string> {
  if (!GEMINI_KEY) throw new Error("Gemini API key is not configured.");

  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    { role: "model", parts: [{ text: "Sige, naiintindihan ko. Handa na akong tumulong!" }] },
    ...history.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    const safeMsg = String(err?.error?.message ?? `HTTP ${res.status}`).replace(/[\r\n]/g, " ");
    console.error("Gemini error:", safeMsg);
    throw new Error(safeMsg);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}
