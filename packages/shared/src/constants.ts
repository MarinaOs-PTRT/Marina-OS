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
}

export const BERTH_STATUS_COLOR: Record<string, string> = {
  libero: 'var(--green)',
  occupato_socio: 'var(--accent)',
  socio_assente: 'var(--text3)',
  socio_assente_lungo: 'var(--text3)',
  occupato_transito: 'var(--teal)',
  transito_assente: 'var(--text3)',
  occupato_affittuario: 'var(--purple)',
  affittuario_assente: 'var(--text3)',
  in_cantiere: 'var(--red)',
}

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  entrata: '↑ Entrata',
  uscita: '↓ Uscita',
  spostamento: '⇄ Spostamento',
  cantiere: '⚙ Cantiere',
}

export const MOVEMENT_TYPE_CLASS: Record<string, string> = {
  entrata: 'pill-green',
  uscita: 'pill-amber',
  spostamento: 'pill-purple',
  cantiere: 'pill-red',
}

export const SCENARIO_LABELS: Record<string, string> = {
  socio: 'Socio',
  transito: 'Transito',
  affittuario: 'Affittuario',
}

export const MODULE_NAV = [
  { path: '/dashboard',    label: 'Dashboard Torre',           icon: '🏢', role: 'torre' },
  { path: '/movimento',    label: 'Registra Movimento',        icon: '⇅',  role: 'torre' },
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
