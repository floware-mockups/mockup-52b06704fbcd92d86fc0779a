// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("GiorniScadenzeGare");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("GiorniScadenzeGare");
import { useEffect, useState } from "react";
import { Badge, Card, useTable } from "../floware";

function oggiLocale() {__mk();
  const d = new Date();
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

function leggiData(testo) {__mk();
  const t = testo.trim();
  const parti = t.includes("/") ? t.split("/") : t.split("-");
  if (parti.length !== 3) return null;
  const italiana = t.includes("/");
  const indiceGiorno = italiana ? 0 : 2;
  const indiceAnno = italiana ? 2 : 0;
  const g = Number(parti[indiceGiorno]);
  const m = Number(parti[1]);
  const a = Number(parti[indiceAnno]);
  if (!Number.isInteger(g) || !Number.isInteger(m) || !Number.isInteger(a) || a < 1000 || a > 9999) return null;
  const tempo = Date.UTC(a, m - 1, g);
  const d = new Date(tempo);
  if (d.getUTCFullYear() !== a || d.getUTCMonth() !== m - 1 || d.getUTCDate() !== g) return null;
  return tempo;
}

export default function GiorniScadenzeGare(props) {__mk();
  const table = useTable(props.pageId);
  const [oggi, setOggi] = useState(() => (__mk(), oggiLocale()));
  useEffect(() => {__mk();
    let attivo = true;
    const adesso = new Date();
    const domani = new Date(adesso.getFullYear(), adesso.getMonth(), adesso.getDate() + 1);
    const attesa = Math.max(1000, domani.getTime() - adesso.getTime() + 100);
    setTimeout(() => {__mk(); if (attivo) setOggi(oggiLocale()); }, attesa);
    return () => {__mk(); attivo = false; };
  }, [oggi]);
  if (!table) return null;
  const nomi = ["Fornitore", "Gara", "Data scadenza"];
  if (nomi.some((n) => (__mk(), table.column(n) < 0))) return <Card title="Giorni alle scadenze"><p>Servono le colonne Fornitore, Gara e Data scadenza.</p></Card>;
  const righe = table.rows.map((r, i) => {__mk();
    const data = table.value(r, "Data scadenza");
    const tempo = leggiData(data);
    const giorni = tempo === null ? null : Math.round((tempo - oggi) / 86400000);
    return { i, fornitore: table.value(r, "Fornitore"), gara: table.value(r, "Gara"), data, giorni };
  });
  const scadute = righe.filter((r) => (__mk(), r.giorni !== null && r.giorni < 0)).length;
  return <Card title="Giorni alle scadenze"><div className="space-y-3 text-(--mk-text)">
    <p className="text-sm text-(--mk-muted)">Riferimento: {new Intl.DateTimeFormat("it-IT", { timeZone: "UTC" }).format(new Date(oggi))}. Giorni di calendario rispetto alla data odierna locale; aggiornamento automatico al cambio del giorno. La scadenza odierna vale 0 giorni.</p>
    <div className="flex flex-wrap gap-2"><Badge tone="danger">Scadute: {scadute}</Badge><Badge tone="primary">Oggi: {righe.filter((r) => (__mk(), r.giorni === 0)).length}</Badge><Badge tone="neutral">Future: {righe.filter((r) => (__mk(), r.giorni !== null && r.giorni > 0)).length}</Badge></div>
    {!righe.length ? <p>Nessuna gara registrata.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Fornitore", "Gara", "Data scadenza", "Giorni", "Situazione"].map((n) => (__mk(), <th key={n} scope="col" className="border-b border-(--mk-border) p-2">{n}</th>))}</tr></thead><tbody>{righe.map((r) => (__mk(), <tr key={r.i} className={r.giorni !== null && r.giorni < 0 ? "bg-(--mk-subtle)" : ""}><td className="border-b border-(--mk-divider) p-2">{r.fornitore}</td><td className="border-b border-(--mk-divider) p-2">{r.gara}</td><td className="border-b border-(--mk-divider) p-2">{r.data || "Non indicata"}</td><td className="border-b border-(--mk-divider) p-2">{r.giorni === null ? "Non calcolabili" : r.giorni < 0 ? Math.abs(r.giorni) + " giorni trascorsi" : r.giorni + " giorni rimanenti"}</td><td className="border-b border-(--mk-divider) p-2"><Badge tone={r.giorni === null ? "neutral" : r.giorni < 0 ? "danger" : "primary"}>{r.giorni === null ? "Data assente o non valida" : r.giorni < 0 ? "Scaduta" : r.giorni === 0 ? "Scade oggi" : "In scadenza"}</Badge></td></tr>))}</tbody></table></div>}
    <p className="text-sm text-(--mk-muted)">La situazione è calcolata dalla data e non modifica lo stato della gara. Date ammesse: GG/MM/AAAA e AAAA-MM-GG.</p>
  </div></Card>;
}
