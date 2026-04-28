# Promemoria Sviluppi Frontend / UX / UI
*Lista delle funzionalità e miglioramenti da implementare nell'applicazione lato client (indipendentemente dal backend).*
*Ultimo aggiornamento: 28 Apr 2026*

**Legenda:**
- ✅ Implementato
- 🔶 Parziale / In progress
- ⬜ Da fare

---

## 1. Sicurezza e Accessi

- ✅ **Schermata di Login:** `LoginPage` con hero foto del porto, form email/password, credenziali di test, persistenza `localStorage["marina-os-auth"]`. `AuthProvider` wrappa tutta l'app. `ProtectedRoute` blocca le rotte non autenticate. *(28 Apr 2026)*
- ✅ **UI basata sui Ruoli (RBAC — menu):** Sidebar filtra `MODULE_NAV` per `allowedRoles` del ruolo loggato. 5 ruoli: Torre, Direzione, Ufficio, Manutenzione, Ormeggiatore. Logout con redirect a `/login`. *(28 Apr 2026)*
- ⬜ **RBAC avanzato:** Oltre al menu, bloccare singoli bottoni e sezioni di pagina per ruoli non autorizzati (es. bottone "Forza tariffa" solo per Direzione, sezione Cassa non visibile all'Ormeggiatore).

---

## 2. Navigazione e Dettaglio Dati (Drill-down)

- ⬜ **Scheda Dettaglio Cliente/Socio:** Creare pagine specifiche (es. `/clienti/:id`) per visualizzare in un'unica schermata anagrafica, barche possedute, storico movimenti, fatturazione e documenti.
- ⬜ **Scheda Dettaglio Barca:** Storico completo degli spostamenti e delle manutenzioni legate a una singola imbarcazione.

---

## 3. Gestione Documentale

- ⬜ **Upload File (UI):** Componente drag-and-drop per caricare documenti d'identità, libretti e assicurazioni.
- ⬜ **Visualizzatore PDF/Immagini:** Preview integrata dei documenti caricati senza dover uscire dall'app.

---

## 4. Tabelle Avanzate e Gestione Dati Massivi

- ⬜ **Paginazione:** Evitare il rendering di tutte le righe contemporaneamente nelle liste lunghe (Registro, Clienti).
- ⬜ **Ordinamento Dinamico:** Possibilità di cliccare sulle intestazioni delle colonne per ordinare i dati.
- ⬜ **Filtri Multipli:** Combinare più criteri di ricerca (es. ricerca per periodo + tipologia + stato).
- ⬜ **Esportazione Dati:** Pulsanti per scaricare le tabelle in formato CSV/Excel o PDF.

---

## 5. UI Mappa Interattiva

- ✅ **Mappa SVG interattiva con colori per stato:** `MarinaMap` con `BERTH_STATUS_HEX` come SSOT. Click su un posto → `BerthDetailDrawer` con dettagli + link a `/torre?posto=XXX`.
- ✅ **Integrazione Dashboard:** Mappa come centrale operativa (50% larghezza), affiancata dalla Plancia (meteo + consegne turno). *(DashboardPage refactor 25 Apr 2026)*
- ⬜ **Drag & Drop:** Trascinare le barche da un posto all'altro per generare rapidamente uno "Spostamento".
- ⬜ **Menu Contestuale (Click Destro):** Aprire un menu rapido su un posto barca per azioni immediate (Registra Uscita, Segnala Guasto, Dettaglio Posto).

---

## 6. Feedback ed Error Handling

- 🔶 **Sistema di Notifiche Globali (Toast):** `NotifichePage` con notifiche auto-emesse e auto-risolte (es. Transiti pendenti, Autorizzazioni mancanti). Manca ancora il componente Toast "a comparsa" bottom-right per feedback immediato post-azione (es. dopo un click "Conferma Entrata").
- 🔶 **Validazione Form Avanzata:** Warning dimensionali non bloccanti implementati nel tab Spostamento (confronto lunghezza/pescaggio vs. lunMax/profondita del posto). Manca la validazione generica con highlight rosso dei campi mancanti negli altri form.

---

## 7. Dashboard e Analitica

- ✅ **KPI Visivi:** `DashboardKpiPanel` con 4 cards (Transiti in porto / Affittuari attivi / Posti liberi / In cantiere). Il KPI "In cantiere" è cliccabile e apre `CantierePanel` con la lista barche. *(27 Apr 2026)*
- ⬜ **Grafici (Charts):** Integrare Recharts per mostrare andamenti storici, previsioni di arrivo e statistiche di fatturazione.

---

## 8. Ottimizzazione Dispositivi

- 🔶 **Responsive Design (Tablet/Mobile):** Media query presente per la Dashboard (collasso a colonna sotto 1280px/900px). Manca un passaggio sistematico su tutte le pagine operative (TorrePage 3 colonne, Registro, Clienti) per uso pratico su iPad in banchina.
- ✅ **Dark Mode:** Doppio tema implementato — "Porto mattutino" (chiaro) e "Porto notte" stile Linear/Supabase (scuro). ThemeSwitcher in sidebar, persistenza `localStorage["marina-os-theme"]`, rispetta `prefers-color-scheme` al primo avvio. *(25 Apr 2026)*

---

## 9. Architettura e Qualità (aggiunto Apr 2026)

*Sezione aggiunta per tracciare gli upgrade infrastrutturali al frontend.*

- ✅ **Refactor M-02 TorrePage:** `useTorreForm` hook SSOT (business logic centralizzata), `SearchDropdown` riusabile con coordinatore "one-at-a-time", pagina dedicata `/torre` a 3 colonne. *(25 Apr 2026)*
- ✅ **Modello v3 GlobalState:** Refactor stato globale con entità `stays`, `cantieri`, `autorizzazioni`, `barche`, `posti`, `clienti`. State machine per berths. *(27 Apr 2026)*
- ✅ **Auto-selezione posto transito (M-08):** Algoritmo `getTariffaDaLunghezza` in `@shared/utils` + chip suggerito (posto più piccolo compatibile) nella TorrePage. *(27 Apr 2026)*
- ✅ **Flusso Tempo 1 / Tempo 2:** Torre crea anagrafica scheletro → notifica auto-emessa → Ufficio completa via `/completa-registrazione/:boatId`. *(27 Apr 2026)*
- ✅ **Flusso Affittuario senza autorizzazione:** Modale bloccante + placeholder + alert Direzione. *(Apr 2026)*
- ⬜ **Pulizia file morti:** `CantierePage.tsx`, `CantierePage.css`, `OperativeShortcuts.tsx`, `MovementTable.tsx`, `BoatList.tsx`, `KpiCard.tsx`, `QuickMovementPanel.tsx` — componenti orfani da rimuovere nel prossimo cleanup.
- ⬜ **Test unitari (hook + utils):** Nessuna copertura di test su `useTorreForm`, `getTariffaDaLunghezza`, `registraEntrata` e la state machine. Priorità alta prima del backend reale.
