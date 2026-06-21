"use client";
import { useState } from "react";

interface Props {
  matchId: number;
  fanName: string | null;
  initial?: string; // "h-a"
  homeName: string;
  awayName: string;
}

export default function PredictionRow({ matchId, fanName, initial, homeName, awayName }: Props) {
  const [h, setH] = useState(initial ? initial.split("-")[0] : "");
  const [a, setA] = useState(initial ? initial.split("-")[1] : "");
  const [saved, setSaved] = useState(Boolean(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!fanName) {
    return (
      <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
        Pick your team (top-right) to predict scores
      </p>
    );
  }

  async function save() {
    const hn = parseInt(h, 10);
    const an = parseInt(a, 10);
    if (Number.isNaN(hn) || Number.isNaN(an)) {
      setError("Enter both scores");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fanName, matchId, home: hn, away: an }),
    });
    if (res.ok) {
      setSaved(true);
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Failed to save");
    }
    setSaving(false);
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-gray-400 hidden sm:inline">{homeName}</span>
        <input
          type="number"
          min={0}
          max={99}
          value={h}
          onChange={(e) => { setH(e.target.value); setSaved(false); }}
          className="w-11 text-center py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <span className="text-gray-400 font-bold">–</span>
        <input
          type="number"
          min={0}
          max={99}
          value={a}
          onChange={(e) => { setA(e.target.value); setSaved(false); }}
          className="w-11 text-center py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <span className="text-xs text-gray-400 hidden sm:inline">{awayName}</span>
        <button
          onClick={save}
          disabled={saving}
          className={`ml-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            saved
              ? "bg-green-100 text-green-700"
              : "bg-green-600 text-white hover:bg-green-700"
          } disabled:opacity-50`}
        >
          {saving ? "…" : saved ? "Saved ✓" : "Predict"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 text-center mt-1">{error}</p>}
    </div>
  );
}
