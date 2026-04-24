// ⚠️ DEPRECATO (24 Apr 2026)
// Questa pagina era codice morto: la rotta `/movimento` non è mai stata
// registrata nel router e l'unico navigate verso di essa (Omnibar) era
// un fallback mai eseguito. Inoltre usava `addMovimento` (API legacy)
// che non validava gli stati e hardcodava scenario='transito',
// rischiando di distruggere la proprietà dei soci sui loro posti.
//
// L'unico punto d'ingresso per i movimenti è ora il `QuickMovementPanel`
// in Dashboard. Il file può essere cancellato fisicamente al prossimo
// giro di pulizia (insieme alla cartella `modules/movimento/`).
//
// Vedi: audit_state_machine_24apr2026 nella memoria del progetto.

export {}
