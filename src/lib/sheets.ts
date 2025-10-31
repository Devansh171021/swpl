declare interface ImportMetaEnv {
  VITE_SHEET_CSV_URL?: string;
  VITE_GOOGLE_API_KEY?: string;
  VITE_GOOGLE_SHEET_ID?: string;
  VITE_GOOGLE_SHEET_RANGE?: string;
}
declare interface ImportMeta {
  env: ImportMetaEnv;
}
export interface SheetPlayerRow {
  id: string;
  name: string;
  role: "Batsman" | "Bowler" | "Allrounder" | "Wicket Keeper" | string;
  category?: string;
  basePrice: number;
  imageUrl?: string;
}

function parseNumber(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export async function loadPlayersFromGoogleSheet(): Promise<SheetPlayerRow[]> {
  // Preferred: CSV publish URL via env: VITE_SHEET_CSV_URL
  const csvUrl = import.meta.env.VITE_SHEET_CSV_URL as string | undefined;
  if (csvUrl) {
    const res = await fetch(csvUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);
    const text = await res.text();
    return parseCsv(text);
  }

  // Alternative: Google Sheets API v4 if API key and sheet ID are provided
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
  const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID as string | undefined;
  const range = import.meta.env.VITE_GOOGLE_SHEET_RANGE as string | undefined; // e.g., "Players!A1:F"
  if (apiKey && sheetId && range) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
      range,
    )}?key=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`);
    const data = (await res.json()) as { values?: string[][] };
    if (!data.values || data.values.length === 0) return [];
    const [header, ...rows] = data.values;
    return rows.map((r) => rowArrayToPlayer(header, r)).filter(Boolean) as SheetPlayerRow[];
  }

  // If no config present, return empty and let caller fallback
  return [];
}

function rowArrayToPlayer(header: string[], row: string[]): SheetPlayerRow | null {
  const idx = (key: string) => header.findIndex((h) => h.toLowerCase() === key.toLowerCase());
  const get = (key: string) => {
    const i = idx(key);
    return i >= 0 ? row[i] ?? "" : "";
  };
  const id = get("id") || cryptoRandomId();
  const name = get("name");
  const role = normalizeRole((get("role") || get("category") || "").trim());
  const category = get("category");
  const basePrice = parseNumber(get("basePrice") || get("base price"));
  const imageUrl = normalizeDriveImageUrl(get("imageUrl") || get("image") || get("photo"));
  if (!name) return null;
  return { id, name, role, category, basePrice, imageUrl };
}

function parseCsv(csv: string): SheetPlayerRow[] {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const row = splitCsvLine(line);
    return rowArrayToPlayer(header, row);
  }).filter(Boolean) as SheetPlayerRow[];
}

function splitCsvLine(line: string): string[] {
  // Simple CSV parse (handles quotes)
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result.map((s) => s.trim());
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buf = new Uint8Array(8);
    crypto.getRandomValues(buf);
    return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(36).slice(2);
}

function normalizeRole(input: string): string {
  const r = input.toLowerCase().replace(/\s+/g, " ").trim();
  if (!r) return "Unknown";
  if (r === "all rounder" || r === "all-rounder") return "Allrounder";
  if (r === "wicket keeper" || r === "wicket-keeper") return "Wicket Keeper";
  if (r === "batsman") return "Batsman";
  if (r === "bowler") return "Bowler";
  return input;
}

function normalizeDriveImageUrl(url?: string): string | undefined {
  if (!url) return url;
  // Supports formats like https://drive.google.com/open?id=FILE_ID or uc?id=FILE_ID
  const openMatch = url.match(/[?&]id=([^&#]+)/);
  if (openMatch && openMatch[1]) {
    const id = openMatch[1];
    return `https://drive.google.com/uc?export=view&id=${id}`;
  }
  return url;
}


