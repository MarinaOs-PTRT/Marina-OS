// ═══════════════════════════════════════════════
// COSTANTI CONDIVISE — Marina OS
// ═══════════════════════════════════════════════

export const MESI_IT = [
  'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
  'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'
] as const

export const GIORNI_IT = [
  'Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'
] as const

export const PONTILI = [
  'Pontile Alfa',
  'Pontile Bravo',
  'Pontile Charlie',
  'Pontile Delta',
  'Pontile Golf',
  'Transito West',
] as const

export const BERTH_STATUS_LABELS: Record<string, string> = {
  libero: 'Libero',
  occupato_socio: 'Socio presente',
  socio_assente: 'Socio assente',
  socio_assente_lungo: 'Socio assente (lungo)',
  occupato_transito: 'Transito',
  transito_assente: 'Transito assente',
  occupato_affittuario: 'Affittuario',
  affittuario_assente: 'Affittuario assente',
  in_cantiere: 'In cantiere',
  bunker: 'Al distributore',
  riservato: 'Riservato',
}

// ─────────────────────────────────────────────────────────────
// BERTH_STATUS_HEX — Single Source of Truth per i colori stato posto
// ─────────────────────────────────────────────────────────────
// Regola progettuale: OGNI stato ha un colore distinguibile a colpo
// d'occhio. Valori hex espliciti, non CSS var, perché MarinaMap inietta
// l'SVG via dangerouslySetInnerHTML e applica il colore con
// setAttribute('style', 'fill: ...') — in quel contesto le CSS var
// vengono risolte dal browser ma dipendono dal cascade del parent SVG,
// meno affidabile. Con hex diretti la resa è identica ovunque.
//
// Se in futuro servirà un tema scuro, aggiungere BERTH_STATUS_HEX_DARK
// e un hook useBerthColor() che sceglie in base al tema attivo.
export const BERTH_STATUS_HEX: Record<string, string> = {
  libero:                '#86efac',  // Verde chiaro — disponibile
  occupato_socio:        '#2E6CBC',  // Blu — Design System: socio
  socio_assente:         '#BA7517',  // Ambra — socio fuori temporaneamente
  socio_assente_lungo:   '#a8a29e',  // Grigio — assenza prolungata
  occupato_transito:     '#0d9488',  // Teal — transito attivo (distinto da libero)
  transito_assente:      '#fbbf24',  // Giallo — transito fuori temporaneamente
  occupato_affittuario:  '#7c3aed',  // Viola — affittuario attivo
  affittuario_assente:   '#c084fc',  // Viola chiaro — affittuario fuori
  in_cantiere:           '#A32D2D',  // Rosso — blocco (cantiere/alaggio)
  riservato:             '#f97316',  // Arancio — riservato (prenotazione)
  bunker:                '#ca8a04',  // Giallo ocra — al bunker
}

// Alias retro-compatibile: mantenuto il nome BERTH_STATUS_COLOR per non
// rompere i consumer esistenti (BoatList, Omnibar). È la stessa mappa
// di BERTH_STATUS_HEX — qualsiasi modifica va fatta SOLO in BERTH_STATUS_HEX.
export const BERTH_STATUS_COLOR: Record<string, string> = BERTH_STATUS_HEX

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  entrata: '↑ Entrata',
  uscita: '↓ Uscita',
  uscita_temporanea: '↓ Uscita (Gita)',
  uscita_definitiva: '↓ Partenza Definitiva',
  spostamento: '⇄ Spostamento',
  cantiere: '⚙ Cantiere',
  bunker: '⛽ Bunker',
}

export const MOVEMENT_TYPE_CLASS: Record<string, string> = {
  entrata: 'pill-green',
  uscita: 'pill-amber',
  uscita_temporanea: 'pill-amber',
  uscita_definitiva: 'pill-red',
  spostamento: 'pill-purple',
  cantiere: 'pill-red',
  bunker: 'pill-amber',
}

export const SCENARIO_LABELS: Record<string, string> = {
  socio: 'Socio',
  transito: 'Transito',
  affittuario: 'Affittuario',
}

export const MODULE_NAV = [
  { path: '/dashboard',    label: 'Dashboard Torre',           icon: '🏢', role: 'torre' },
  { path: '/registrazione-transiti', label: 'Registrazione Transiti', icon: '📋', role: 'torre' },
  { path: '/registro',     label: 'Registro Movimenti',        icon: '📋', role: 'torre' },
  { path: '/mappa',        label: 'Mappa Porto',               icon: '🗺️', role: 'torre' },
  { path: '/arrivi',       label: 'Arrivi Previsti',           icon: '⚓', role: 'torre' },
  { path: '/manutenzioni', label: 'Manutenzioni',              icon: '🔧', role: 'torre' },
  { path: '/clienti',      label: 'Anagrafica Clienti',        icon: '👤', role: 'direzione' },
  { path: '/soci',         label: 'Soci e Assegnazioni',       icon: '🏅', role: 'direzione' },
  { path: '/tariffe',      label: 'Tariffe e Fatturazione',    icon: '💶', role: 'direzione' },
  { path: '/reportistica', label: 'Reportistica',              icon: '📊', role: 'direzione' },
  { path: '/utenti',       label: 'Gestione Utenti',           icon: '🔑', role: 'direzione' },
  { path: '/notifiche',    label: 'Centro Notifiche',          icon: '🔔', role: 'torre' },
] as const
