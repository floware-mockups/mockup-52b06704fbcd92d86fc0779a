// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("TempisticaStipula");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("TempisticaStipula");
import { useEffect, useState } from "react";
import { Card, Field, Select, TextInput, useTable } from "../floware";

function dataValida(testo) {__mk();
  const t = testo.trim();
  const italiana = t.includes("/");
  const p = italiana ? t.split("/") : t.split("-");
  if (p.length !== 3) return null;
  const indiceAnno = italiana ? 2 : 0;
  const indiceGiorno = italiana ? 0 : 2;
  const a = Number(p[indiceAnno]);
  const m = Number(p[1]);
  const g = Number(p[indiceGiorno]);
  if (!Number.isInteger(a) || !Number.isInteger(m) || !Number.isInteger(g) || a < 1000 || a > 9998) return null;
  const d = new Date(Date.UTC(a, m - 1, g));
  if (d.getUTCFullYear() !== a || d.getUTCMonth() !== m - 1 || d.getUTCDate() !== g) return null;
  return d;
}

function formato(d) {__mk();
  const g = String(d.getUTCDate());
  const m = String(d.getUTCMonth() + 1);
  return (g.length === 1 ? "0" + g : g) + "/" + (m.length === 1 ? "0" + m : m) + "/" + d.getUTCFullYear();
}

function stipula(testo) {__mk();
  const d = dataValida(testo);
  if (!d) return "";
  d.setUTCDate(d.getUTCDate() + 30);
  return formato(d);
}

export default function TempisticaStipula(props) {__mk();
  const table = useTable(props.pageId);
  const [scelta, setScelta] = useState("");
  useEffect(() => {__mk();
    if (!table || table.column("Data trattativa di gara") < 0 || table.column("Data stipula prevista") < 0) return;
    table.rows.forEach((r, i) => {__mk();
      const testo = table.value(r, "Data trattativa di gara");
      const prevista = stipula(testo);
      if (prevista && table.value(r, "Data stipula prevista") !== prevista) table.setCell(i, "Data stipula prevista", prevista);
    });
  }, [table]);
  if (!table) return null;
  if (["Pratica", "Data trattativa di gara", "Data stipula prevista"].some((n) => (__mk(), table.column(n) < 0))) return <Card title="Tempistica di stipula"><p>Servono le colonne Pratica, Data trattativa di gara e Data stipula prevista.</p></Card>;
  const opzioni = table.rows.map((r, i) => (__mk(), String(i + 1) + " · " + table.value(r, "Pratica")));
  const indice = opzioni.indexOf(scelta);
  const testo = indice >= 0 ? table.value(indice, "Data trattativa di gara") : "";
  const d = dataValida(testo);
  const iso = d ? d.toISOString().slice(0, 10) : "";
  const prevista = stipula(testo);
  const aggiorna = (v) => {__mk();
    if (indice < 0) return;
    const nuova = dataValida(v);
    table.setCell(indice, "Data trattativa di gara", nuova ? formato(nuova) : v);
    table.setCell(indice, "Data stipula prevista", stipula(v));
  };
  return <Card title="Tempistica di stipula del contratto"><div className="space-y-3 text-(--mk-text)">
    <p className="text-sm text-(--mk-muted)">Seleziona una pratica già presente, anche appena aggiunta dal form, e indica la data di trattativa. Le modifiche aggiornano la tabella e restano in memoria.</p>
    {!opzioni.length ? <p>Aggiungi prima una pratica.</p> : <>
      <Select label="Pratica da aggiornare" value={indice >= 0 ? scelta : ""} options={["", ...opzioni]} onChange={setScelta} />
      {indice >= 0 && <div className="grid gap-3 md:grid-cols-2">
        <TextInput label="Data trattativa di gara" type="date" value={iso} onChange={aggiorna} />
        <Field label="Data stipula prevista · calcolo automatico">{prevista || "Da calcolare"}</Field>
        {testo && !d && <p role="alert" className="text-(--mk-danger)">Data non valida. Scegli una data valida per calcolare la stipula.</p>}
        {!testo && <p className="text-sm text-(--mk-muted)">L’eventuale stipula già in tabella non è ancora verificata rispetto alla trattativa.</p>}
      </div>}
    </>}
    <p className="text-sm text-(--mk-muted)">Regola: data trattativa + 30 giorni di calendario, inclusi sabati, domeniche e festivi, senza slittamenti. La data di sopralluogo non viene usata. Con una trattativa valida la stipula viene sempre ricalcolata; cancellando la data da questo riquadro si svuota anche la stipula.</p>
  </div></Card>;
}
