// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("ConfrontoStoricoPreventivi");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("ConfrontoStoricoPreventivi");
import { useState } from "react";
import { Badge, Button, Card, Select, TextInput, usePrototype, useTable } from "../floware";

function giorno(testo) {__mk();
  const parti = testo.split("/");
  if (parti.length !== 3) return "";
  const [g, m, a] = parti;
  const iso = a + "-" + (m.length === 1 ? "0" + m : m) + "-" + (g.length === 1 ? "0" + g : g);
  const data = new Date(iso);
  return Number.isFinite(data.getTime()) && data.toISOString().slice(0, 10) === iso ? iso : "";
}

export default function ConfrontoStoricoPreventivi(props) {__mk();
  const table = useTable(props.pageId);
  const { openDetail } = usePrototype();
  const [ricerca, setRicerca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [intervento, setIntervento] = useState("");
  const [riferimento, setRiferimento] = useState("");
  const [periodo, setPeriodo] = useState("365");
  if (!table) return null;
  const nomi = ["Fornitore", "Categoria", "Intervento", "Data preventivo", "Importo", "Esito affidamento"];
  if (nomi.some((n) => (__mk(), table.column(n) < 0))) return <Card title="Confronto dello storico"><p>Servono le colonne: {nomi.join(", ")}.</p></Card>;
  const euro = (n) => (__mk(), new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n));
  const righe = table.rows.map((r, i) => {__mk();
    const testo = table.value(r, "Importo").trim();
    const prezzo = Number(testo.replaceAll("€", "").split(".").join("").replace(",", ".").trim());
    return { i, fornitore: table.value(r, "Fornitore"), categoria: table.value(r, "Categoria"), intervento: table.value(r, "Intervento"), data: table.value(r, "Data preventivo"), giorno: giorno(table.value(r, "Data preventivo")), esito: table.value(r, "Esito affidamento").trim(), prezzo, valido: testo !== "" && Number.isFinite(prezzo) && prezzo >= 0 };
  });
  const ultima = righe.map((r) => (__mk(), r.giorno)).filter(Boolean).sort().reverse()[0] || "";
  const fine = riferimento || ultima;
  const tempo = fine ? new Date(fine).getTime() : 0;
  const inizio = tempo - Number(periodo) * 86400000;
  const storico = righe.filter((r) => (__mk(), r.esito === "Affidato"));
  const recente = (r) => (__mk(), Boolean(r.giorno && fine && r.giorno <= fine && new Date(r.giorno).getTime() >= inizio));
  const categorie = ["", ...new Set(righe.map((r) => (__mk(), r.categoria)).filter(Boolean))];
  const interventi = ["", ...new Set(righe.filter((r) => (__mk(), !categoria || r.categoria === categoria)).map((r) => (__mk(), r.intervento)).filter(Boolean))];
  const gruppi = righe.filter((r, i) => (__mk(), righe.findIndex((x) => (__mk(), x.intervento === r.intervento)) === i)).map((r) => {__mk();
    const elementi = righe.filter((x) => (__mk(), x.intervento === r.intervento));
    const validi = elementi.filter((x) => (__mk(), x.valido));
    const minimo = validi.length ? validi.reduce((n, x) => (__mk(), Math.min(n, x.prezzo)), validi[0].prezzo) : null;
    return { titolo: r.intervento, elementi, minimo, confrontabile: new Set(validi.map((x) => (__mk(), x.fornitore))).size > 1 };
  });
  const termine = ricerca.trim().toLowerCase();
  const visibili = gruppi.filter((g) => (__mk(), (!intervento || g.titolo === intervento) && (!categoria || g.elementi.some((r) => (__mk(), r.categoria === categoria))) && (!termine || [g.titolo, ...g.elementi.map((r) => (__mk(), r.fornitore))].join(" ").toLowerCase().includes(termine))));
  return <Card title="Confronto dello storico"><div className="space-y-4 text-(--mk-text)">
    <p>Prezzo e rotazione sono letti insieme, senza punteggi né graduatorie. Meno affidamenti recenti suggeriscono di valutare un maggiore coinvolgimento, non un diritto all’affidamento.</p>
    <div className="grid gap-3 md:grid-cols-2">
      <TextInput label="Cerca intervento o fornitore" value={ricerca} onChange={setRicerca} />
      <Select label="Categoria (vuoto: tutte)" value={categoria} options={categorie} onChange={(v) => {__mk(); setCategoria(v); setIntervento(""); }} />
      <Select label="Intervento (vuoto: tutti)" value={intervento} options={interventi} onChange={setIntervento} />
      <Select label="Finestra recente in giorni" value={periodo} options={["90", "180", "365"]} onChange={setPeriodo} />
      <TextInput label="Data di riferimento (vuoto: ultima data disponibile)" type="date" value={riferimento} onChange={setRiferimento} />
    </div>
    <div className="rounded border border-(--mk-border) p-3 text-sm space-y-2">
      <p>Riferimento: {fine || "non disponibile"}. Recente: ultimi {periodo} giorni, estremi inclusi. Conta solo l’esito esatto «Affidato»; altri esiti non provano un affidamento.</p>
      <p>Non è disponibile la data di affidamento: si usa la data preventivo come approssimazione. Le date mancanti o successive al riferimento non entrano nei conteggi recenti.</p>
      <p>Minimo e scarti usano tutti i prezzi validi dello stesso intervento, indipendentemente dai filtri e dall’esito. Verificare omogeneità delle prestazioni e condizioni economiche. Ogni riga affidata conta una volta; eventuali duplicati vanno verificati.</p>
    </div>
    {!visibili.length && <p>Nessun confronto disponibile.</p>}
    {visibili.map((g, i) => (__mk(), <div key={i} className="space-y-3 rounded border border-(--mk-border) p-3">
      <h3 className="font-semibold">{g.titolo || "Intervento non indicato"}</h3>
      <p>Minimo: {g.minimo === null ? "non disponibile" : euro(g.minimo)}. {!g.confrontabile && "Confronto tra fornitori insufficiente."}</p>
      {g.elementi.map((r) => {__mk();
        const tutti = storico.filter((x) => (__mk(), x.fornitore === r.fornitore));
        const stesso = tutti.filter((x) => (__mk(), x.intervento === r.intervento));
        const recenti = tutti.filter(recente);
        const locali = stesso.filter(recente);
        const date = tutti.map((x) => (__mk(), x.giorno)).filter(Boolean).sort().reverse();
        return <div key={r.i} className="space-y-2 border-t border-(--mk-divider) pt-3 text-sm">
          <p className="font-semibold">{r.fornitore} · {r.categoria}</p>
          <p>Preventivo: {r.data || "data assente"} · Esito: {r.esito || "non indicato"}</p>
          <p>{r.valido ? euro(r.prezzo) : "Importo non valido"}{r.valido && g.minimo !== null && " · Scarto: +" + euro(r.prezzo - g.minimo) + (g.minimo > 0 ? " (+" + ((r.prezzo - g.minimo) / g.minimo * 100).toFixed(1).replace(".", ",") + "%)" : " · Percentuale non calcolabile")}</p>
          <Badge tone={recenti.length ? "primary" : "neutral"}>{recenti.length ? "Affidamenti recenti presenti" : "Nessun affidamento recente rilevato"}</Badge>
          <p>Fornitore: {tutti.length} affidamenti registrati, {recenti.length} recenti. Stesso intervento: {stesso.length} registrati, {locali.length} recenti.</p>
          <p>Ultima data preventivo con esito Affidato: {date[0] || "non disponibile"}. Affidamenti senza data valida: {tutti.filter((x) => (__mk(), !x.giorno)).length}.</p>
          <Button variant="secondary" onClick={() => (__mk(), openDetail(props.pageId, r.i))}>Apri preventivo</Button>
        </div>;
      })}
    </div>))}
    <p className="text-sm text-(--mk-muted)">Dati inventati e storico limitato: assenza di affidamenti registrati non significa assenza di rapporti precedenti. La decisione richiede istruttoria, verifica dei requisiti e motivazione; nessun esito viene modificato.</p>
  </div></Card>;
}
