// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("ConfrontoStoricoPreventivi");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("ConfrontoStoricoPreventivi");
import { useState } from "react";
import { Badge, Button, Card, Select, TextInput, usePrototype, useTable } from "../floware";

export default function ConfrontoStoricoPreventivi(props) {__mk();
  const table = useTable(props.pageId);
  const { openDetail } = usePrototype();
  const [ricerca, setRicerca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [intervento, setIntervento] = useState("");
  const [soloConfrontabili, setSoloConfrontabili] = useState("Tutti i gruppi");
  const nomi = ["Fornitore", "Categoria", "Intervento", "Data preventivo", "Importo"];
  if (!table) return null;
  if (nomi.some((nome) => (__mk(), table.column(nome) < 0))) return <Card title="Confronto dello storico"><p>Per il confronto servono le colonne Fornitore, Categoria, Intervento, Data preventivo e Importo.</p></Card>;
  const valuta = (valore) => (__mk(), new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(valore));
  const righe = table.rows.map((riga, indice) => {__mk();
    const testo = table.value(riga, "Importo").trim();
    const importo = Number(testo.replaceAll("€", "").split(".").join("").replace(",", ".").trim());
    return { indice, fornitore: table.value(riga, "Fornitore"), categoria: table.value(riga, "Categoria"), intervento: table.value(riga, "Intervento"), data: table.value(riga, "Data preventivo"), testo, importo, valido: testo !== "" && Number.isFinite(importo) && importo >= 0 };
  });
  const categorie = ["", ...new Set(righe.map((r) => (__mk(), r.categoria)).filter(Boolean))];
  const interventi = ["", ...new Set(righe.filter((r) => (__mk(), !categoria || r.categoria === categoria)).map((r) => (__mk(), r.intervento)).filter(Boolean))];
  const gruppi = righe.filter((r, indice) => (__mk(), righe.findIndex((altra) => (__mk(), altra.categoria === r.categoria && altra.intervento === r.intervento)) === indice)).map((prima) => {__mk();
    const elementi = righe.filter((r) => (__mk(), r.categoria === prima.categoria && r.intervento === prima.intervento)).sort((a, b) => (__mk(), a.valido === b.valido ? a.importo - b.importo : a.valido ? -1 : 1));
    const validi = elementi.filter((r) => (__mk(), r.valido));
    const minimo = validi.length ? validi[0].importo : null;
    const fornitori = new Set(validi.map((r) => (__mk(), r.fornitore)));
    return { categoria: prima.categoria, intervento: prima.intervento, elementi, minimo, confrontabile: fornitori.size > 1 };
  });
  const termine = ricerca.trim().toLowerCase();
  const visibili = gruppi.filter((g) => (__mk(), (!categoria || categoria === g.categoria) && (!intervento || intervento === g.intervento) && (soloConfrontabili !== "Solo confrontabili" || g.confrontabile) && (!termine || [g.categoria, g.intervento, ...g.elementi.map((r) => (__mk(), r.fornitore))].join(" ").toLowerCase().includes(termine))));
  return <Card title="Confronto dello storico">
    <div className="space-y-4 text-(--mk-text)">
      <p className="text-sm text-(--mk-muted)">Confronto per intervento e categoria. Gli scarti sono calcolati rispetto al minimo del gruppo, senza escludere gli altri fornitori durante la ricerca. Dati dimostrativi: il solo prezzo non determina la scelta.</p>
      <div className="grid gap-3 md:grid-cols-2">
        <TextInput label="Cerca intervento, categoria o fornitore" value={ricerca} onChange={setRicerca} placeholder="Cerca nello storico" />
        <Select label="Categoria (voce vuota: tutte)" value={categoria} options={categorie} onChange={(valore) => {__mk(); setCategoria(valore); setIntervento(""); }} />
        <Select label="Intervento (voce vuota: tutti)" value={intervento} options={interventi} onChange={setIntervento} />
        <Select label="Gruppi da mostrare" value={soloConfrontabili} options={["Tutti i gruppi", "Solo confrontabili"]} onChange={setSoloConfrontabili} />
      </div>
      <div className="flex flex-wrap items-center gap-3"><span>{visibili.length} gruppi su {gruppi.length}</span><Button variant="secondary" onClick={() => {__mk(); setRicerca(""); setCategoria(""); setIntervento(""); setSoloConfrontabili("Tutti i gruppi"); }}>Azzera filtri</Button></div>
      {!visibili.length && <p>Nessun confronto corrisponde ai filtri.</p>}
      {visibili.map((g, i) => (__mk(), <div key={i} className="rounded-lg border border-(--mk-border) p-4 space-y-3">
        <h3 className="font-semibold">{g.intervento || "Intervento non indicato"} · {g.categoria || "Categoria non indicata"}</h3>
        <p className="text-sm">{g.minimo === null ? "Nessun importo valido." : "Minimo: " + valuta(g.minimo) + " — " + g.elementi.filter((r) => (__mk(), r.valido && r.importo === g.minimo)).map((r) => (__mk(), r.fornitore)).join(", ")}</p>
        {!g.confrontabile && <p className="text-sm text-(--mk-muted)">Non sono presenti importi validi di almeno due fornitori diversi.</p>}
        <div className="space-y-2">{g.elementi.map((r) => (__mk(), <div key={r.indice} className="flex flex-wrap items-center justify-between gap-3 rounded border border-(--mk-divider) p-3">
          <div><p className="font-medium">{r.fornitore}</p><p className="text-sm text-(--mk-muted)">Data preventivo: {r.data || "Non indicata"}</p></div>
          <div className="text-sm space-y-1"><p>{r.valido ? valuta(r.importo) : "Importo non valido: " + r.testo}</p>{r.valido && g.minimo !== null && (r.importo === g.minimo ? <Badge tone="primary">Importo minimo</Badge> : <p>Scarto: +{valuta(r.importo - g.minimo)}{g.minimo > 0 ? " (+" + ((r.importo - g.minimo) / g.minimo * 100).toFixed(1).replace(".", ",") + "%)" : " (percentuale non calcolabile)"}</p>)}</div>
          <Button variant="secondary" onClick={() => (__mk(), openDetail(props.pageId, r.indice))}>Apri preventivo</Button>
        </div>))}</div>
      </div>))}
    </div>
  </Card>;
}
