"use client";

import { useState } from "react";
import { Card } from "@/components/admin/ui";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

interface ApiResponse {
  status: number; statusText: string; responseTimeMs: number; headers: Record<string, string>; body: string; truncated?: boolean; error?: string;
}
interface HistoryItem { method: string; url: string; status: number; time: number; at: number }

export default function ApiTestingPage() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headersText, setHeadersText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [resp, setResp] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [tab, setTab] = useState<"body" | "headers">("body");

  function parseHeaders(): Record<string, string> {
    const out: Record<string, string> = {};
    headersText.split("\n").forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > 0) out[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    });
    return out;
  }

  async function send() {
    if (!url.trim()) { setErr("Enter a URL."); return; }
    setLoading(true); setErr(null); setResp(null);
    try {
      const res = await fetch("/api/admin/api-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, url: url.trim(), headers: parseHeaders(), body: bodyText || undefined }),
      });
      const d = await res.json();
      if (d.success) {
        setResp(d);
        setHistory((h) => [{ method, url: url.trim(), status: d.status, time: d.responseTimeMs, at: Date.now() }, ...h].slice(0, 12));
      } else {
        setErr(d.error || "Request failed.");
      }
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  }

  function clear() { setUrl(""); setHeadersText(""); setBodyText(""); setResp(null); setErr(null); }

  const statusColor = resp ? (resp.status >= 200 && resp.status < 300 ? "#34d399" : resp.status >= 400 || resp.status === 0 ? "#fb7185" : "#fbbf24") : "#8b8797";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">API Testing</h2>
        <p className="mt-0.5 text-xs text-[#8b8797]">A lightweight request client. Requests run server-side (no CORS). Internal/private addresses are blocked.</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm font-medium text-white outline-none focus:border-[#ec4899]/50">
            {METHODS.map((m) => <option key={m} value={m} className="bg-[#0d0b12]">{m}</option>)}
          </select>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" className="flex-1 rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-[#5a5766] focus:border-[#ec4899]/50" />
          <div className="flex gap-2">
            <button onClick={send} disabled={loading} className="rounded-lg bg-gradient-to-r from-[#ec4899] to-[#a855f7] px-4 py-2 text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-60">{loading ? "Sending..." : "Send"}</button>
            <button onClick={clear} className="rounded-lg border border-white/10 px-3 py-2 text-[12px] text-[#c9c5d6] hover:bg-white/5">Clear</button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] text-[#a5a1b3]">Headers (one per line, Key: Value)</label>
            <textarea value={headersText} onChange={(e) => setHeadersText(e.target.value)} rows={3} placeholder={"Authorization: Bearer ...\nContent-Type: application/json"} className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 font-mono text-[12px] text-white outline-none placeholder:text-[#5a5766] focus:border-[#ec4899]/50" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#a5a1b3]">Request Body</label>
            <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={3} placeholder='{ "key": "value" }' disabled={["GET", "HEAD"].includes(method)} className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 font-mono text-[12px] text-white outline-none placeholder:text-[#5a5766] focus:border-[#ec4899]/50 disabled:opacity-40" />
          </div>
        </div>
      </Card>

      {err && <div className="rounded-xl border border-[#fb7185]/25 bg-[#fb7185]/[0.06] px-4 py-3 text-sm text-[#fb7185]">{err}</div>}

      {resp && (
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-4">
            <span className="text-sm font-bold" style={{ color: statusColor }}>{resp.status || "ERR"} {resp.statusText}</span>
            <span className="text-[12px] text-[#8b8797]">{resp.responseTimeMs}ms</span>
          </div>
          <div className="mb-2 flex gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
            {(["body", "headers"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize ${tab === t ? "bg-[#ec4899]/15 text-[#f472b6]" : "text-[#8b8797] hover:text-white"}`}>{t}</button>
            ))}
          </div>
          {tab === "body" ? (
            <pre className="max-h-[360px] overflow-auto rounded-lg border border-white/[0.06] bg-black/30 p-3 font-mono text-[11px] text-[#c9c5d6]">{resp.body}{resp.truncated ? "\n\n… (truncated)" : ""}</pre>
          ) : (
            <div className="max-h-[360px] overflow-auto rounded-lg border border-white/[0.06] bg-black/30 p-3 font-mono text-[11px]">
              {Object.entries(resp.headers).map(([k, v]) => (
                <div key={k}><span className="text-[#f472b6]">{k}</span><span className="text-[#8b8797]">: </span><span className="text-[#c9c5d6]">{v}</span></div>
              ))}
            </div>
          )}
        </Card>
      )}

      {history.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold text-white">Test History</h3>
          <div className="space-y-1">
            {history.map((h, i) => (
              <button key={i} onClick={() => { setMethod(h.method); setUrl(h.url); }} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-[12px] hover:bg-white/5">
                <span className="w-14 shrink-0 font-mono text-[#f472b6]">{h.method}</span>
                <span className="flex-1 truncate text-[#c9c5d6]">{h.url}</span>
                <span className="shrink-0 font-mono text-[10px]" style={{ color: h.status >= 200 && h.status < 300 ? "#34d399" : "#fb7185" }}>{h.status || "ERR"}</span>
                <span className="shrink-0 text-[10px] text-[#6f6c7d]">{h.time}ms</span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
