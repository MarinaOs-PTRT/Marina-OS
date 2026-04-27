import { Tariff } from '../types'

/**
 * SSOT — Calcolo tariffa applicabile in base alla lunghezza barca.
 *
 * Regola del Master File §4 (Calcolo Tariffe):
 *   "La categoria è determinata dalla prima corrispondenza in cui
 *    lunghezza_barca <= lun_max."
 *
 * Algoritmo:
 *   1. Ordina le tariffe in modo crescente per `lunMax`.
 *   2. Restituisce la prima tariffa con `lunghezza <= lunMax`.
 *   3. Se nessuna tariffa è abbastanza grande (barca fuori scala) ritorna
 *      l'ultima tariffa disponibile (la più capiente) come fallback.
 *
 * Guard:
 *   - Se `lunghezza` non è un numero finito o è <= 0  → ritorna `null`.
 *   - Se l'array `tariffe` è vuoto/undefined           → ritorna `null`.
 *
 * Il chiamante DEVE gestire il caso `null` (es. UI che mostra "—" finché
 * l'operatore non inserisce una lunghezza valida).
 *
 * Storia (27 Apr 2026): estratta in shared per chiudere debito DRY —
 * prima esisteva in due copie con piccole differenze fra
 * `Calculator.tsx` e `RegistrazioneTransitiPage.tsx`. Vedi
 * AUDIT_27APR2026.md §7.3 punto 1.
 */
export function getTariffaDaLunghezza(
  tariffe: Tariff[] | undefined | null,
  lunghezza: number
): Tariff | null {
  if (!Number.isFinite(lunghezza) || lunghezza <= 0) return null
  if (!tariffe || tariffe.length === 0) return null
  const sorted = [...tariffe].sort((a, b) => a.lunMax - b.lunMax)
  for (const t of sorted) {
    if (lunghezza <= t.lunMax) return t
  }
  return sorted[sorted.length - 1]
}
