// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("PercorsoFornitore");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("PercorsoFornitore");
import { useState } from "react";
import { Badge, Button, Card, Dialog, Field, Select, TextInput, usePrototype, useTable } from "../floware";

export default function PercorsoFornitore(props) {__mk();
  const table = useTable(props.pageId);
  const { notify } = usePrototype();
  const [aperto, setAperto] = useState(false);
  const [passo, setPasso] = useState(1);
  const [indice, setIndice] = useState(-1);
  const [originale, setOriginale] = useState("");
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("Lavori");
  const [zona, setZona] = useState("");
  const [distanza, setDistanza] = useState("");
  const [esito, setEsito] = useState("No");
  const [errore, setErrore] = useState("");
  const colonne = ["Fornitore", "Categoria", "Zona", "Distanza", "Iscrizione MEPA", "Stato"];
  if (!table) return null;
  if (colonne.some((c) => (__mk(), table.column(c) < 0))) return <Card title="Inserimento guidato"><p>Per il percorso servono le colonne Fornitore, Categoria, Zona, Distanza, Iscrizione MEPA e Stato.</p></Card>;
  const avvia = (i) => {__mk();
    setIndice(i);
    const n = i < 0 ? "" : table.value(i, "Fornitore");
    setOriginale(n);
    setNome(n);
    setCategoria(i < 0 ? "Lavori" : table.value(i, "Categoria"));
    setZona(i < 0 ? "" : table.value(i, "Zona"));
    setDistanza(i < 0 ? "" : table.value(i, "Distanza"));
    setEsito("No");
    setPasso(1);
    setErrore("");
    setAperto(true);
  };
  const salva = () => {__mk();
    if (!nome.trim() || !categoria.trim() || !zona.trim() || !["No", "Da verificare"].includes(esito)) {
      setErrore("Completa denominazione, categoria, zona ed esito.");
      return;
    }
    if (indice >= 0 && (!table.rows[indice] || table.value(indice, "Fornitore") !== originale || table.value(indice, "Iscrizione MEPA") !== "No")) {
      setErrore("La riga è cambiata. Chiudi il percorso e seleziona di nuovo il fornitore.");
      return;
    }
    if (indice < 0 && table.rows.some((r) => (__mk(), table.value(r, "Fornitore").trim().toLowerCase() === nome.trim().toLowerCase()))) {
      setErrore("Questa denominazione è già presente nell’elenco. Usa la riga esistente.");
      return;
    }
    const dati = { "Fornitore": nome.trim(), "Categoria": categoria.trim(), "Zona": zona.trim(), "Distanza": distanza.trim(), "Iscrizione MEPA": esito, "Stato": "Da verificare" };
    if (indice < 0) table.addRow(dati);
    else colonne.forEach((c) => (__mk(), table.setCell(indice, c, dati[c])));
    setAperto(false);
    notify("Fornitore salvato in memoria. Iscrizione MEPA: " + esito + ". Nessuna iscrizione completata.");
  };
  const nonIscritti = table.rows.map((r, i) => ((__mk(), { i, nome: table.value(r, "Fornitore"), iscrizione: table.value(r, "Iscrizione MEPA") }))).filter((r) => (__mk(), r.iscrizione === "No"));
  return <Card title="Fornitore non iscritto: percorso guidato">
    <div className="space-y-3 text-(--mk-text)">
      <p className="text-sm text-(--mk-muted)">Prepara la scheda nell’elenco locale. Questo percorso non effettua l’iscrizione al MEPA. Usa solo dati inventati.</p>
      <Button onClick={() => (__mk(), avvia(-1))}>Nuovo fornitore non iscritto</Button>
      {nonIscritti.map((r) => (__mk(), <div key={r.i} className="flex flex-wrap items-center justify-between gap-2 border-t border-(--mk-divider) pt-2"><span>{r.nome} · Iscrizione: No</span><Button variant="secondary" onClick={() => (__mk(), avvia(r.i))}>Avvia percorso</Button></div>))}
    </div>
    {aperto && <Dialog title="Scheda guidata del fornitore" onClose={() => (__mk(), setAperto(false))} footer={<><Button variant="secondary" onClick={() => (__mk(), setAperto(false))}>Annulla</Button>{passo > 1 && <Button variant="secondary" onClick={() => {__mk(); setErrore(""); setPasso(passo - 1); }}>Indietro</Button>}{passo < 3 ? <Button disabled={passo === 1 && (!nome.trim() || !categoria.trim() || !zona.trim())} onClick={() => {__mk(); setErrore(""); setPasso(passo + 1); }}>Avanti</Button> : <Button onClick={salva}>Conferma e salva nell’elenco</Button>}</>}>
      <div className="space-y-4">
        <Badge tone="primary">Passaggio {passo} di 3 · {passo === 1 ? "Dati" : passo === 2 ? "Verifica" : "Riepilogo"}</Badge>
        <div className="h-2 rounded bg-(--mk-subtle)" role="progressbar" aria-label="Avanzamento del percorso" aria-valuemin={0} aria-valuemax={3} aria-valuenow={passo}><div className="h-2 rounded bg-(--mk-primary)" style={{ width: passo === 1 ? "33%" : passo === 2 ? "66%" : "100%" }} /></div>
        {passo === 1 && <><p>Denominazione, categoria e zona sono obbligatorie.</p><TextInput label="Denominazione inventata" value={nome} onChange={setNome} /><Select label="Categoria" value={categoria} options={[...new Set([categoria, "Lavori", "Servizi", "Beni"])].filter(Boolean)} onChange={setCategoria} /><TextInput label="Zona inventata" value={zona} onChange={setZona} /><TextInput label="Distanza facoltativa (es. 12 km)" value={distanza} onChange={setDistanza} /><p className="text-sm text-(--mk-muted)">La distanza serve alla ricerca, non all’iscrizione.</p></>}
        {passo === 2 && <><p>L’iscrizione non risulta verificata. Scegli come registrarla nell’elenco.</p><Select label="Iscrizione MEPA da salvare" value={esito} options={["No", "Da verificare"]} onChange={setEsito} /><p className="text-sm">«No» mantiene il fornitore come non iscritto. «Da verificare» indica un controllo ancora necessario. Nessuna opzione certifica l’iscrizione.</p></>}
        {passo === 3 && <><Field label="Operazione">{indice < 0 ? "Nuova scheda" : "Aggiornamento scheda esistente"}</Field><Field label="Fornitore">{nome}</Field><Field label="Categoria">{categoria}</Field><Field label="Zona">{zona}</Field><Field label="Distanza">{distanza || "Non indicata"}</Field><Field label="Iscrizione MEPA">{esito}</Field><Field label="Stato della scheda">Da verificare</Field><p>La conferma salva solo la scheda in memoria. L’iscrizione MEPA non è completata né verificata.</p></>}
        {errore && <p role="alert" className="text-(--mk-danger)">{errore}</p>}
      </div>
    </Dialog>}
  </Card>;
}
