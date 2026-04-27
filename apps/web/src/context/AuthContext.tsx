import React, { createContext, useContext, useState, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════
// AuthContext — sistema di autenticazione mock per Marina OS
//
// In produzione: sostituire `login()` con una chiamata al backend
// Node.js (POST /api/auth/login) che restituisce un JWT.
// Il token viene poi salvato in localStorage e incluso in ogni
// richiesta API via header Authorization: Bearer <token>.
//
// I dati utente qui salvati (name, ruolo, iniziali) possono essere
// estratti dal payload del JWT anziché hardcoded.
// ═══════════════════════════════════════════════════════════════

export type Ruolo = 'torre' | 'direzione' | 'ufficio' | 'manutenzione' | 'ormeggiatore'

export interface AuthUser {
  id: string
  nome: string
  email: string
  ruolo: Ruolo
  iniziali: string
  defaultPath: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// ── Utenti mock (solo per sviluppo frontend) ─────────────────────
// Password in chiaro SOLO perché è un mock locale.
// In produzione non esiste nulla di simile nel frontend.
type MockUser = AuthUser & { password: string }

const MOCK_USERS: MockUser[] = [
  {
    id: 'u1',
    nome: 'Marco Belli',
    email: 'torre@marina.it',
    password: 'torre123',
    ruolo: 'torre',
    iniziali: 'MB',
    defaultPath: '/dashboard',
  },
  {
    id: 'u2',
    nome: 'Luca Ferrari',
    email: 'direzione@marina.it',
    password: 'direzione123',
    ruolo: 'direzione',
    iniziali: 'LF',
    defaultPath: '/dashboard',
  },
  {
    id: 'u3',
    nome: 'Sara Ardizzone',
    email: 'ufficio@marina.it',
    password: 'ufficio123',
    ruolo: 'ufficio',
    iniziali: 'SA',
    defaultPath: '/registro',
  },
  {
    id: 'u4',
    nome: 'Paolo Conti',
    email: 'manutenzione@marina.it',
    password: 'manutenzione123',
    ruolo: 'manutenzione',
    iniziali: 'PC',
    defaultPath: '/manutenzioni',
  },
  {
    id: 'u5',
    nome: 'Franco Landi',
    email: 'ormeggiatore@marina.it',
    password: 'ormeggiatore123',
    ruolo: 'ormeggiatore',
    iniziali: 'FL',
    defaultPath: '/dashboard',
  },
]

const STORAGE_KEY = 'marina-os-auth'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
      return null
    }
  })

  // Sincronizza localStorage ogni volta che lo stato user cambia
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = async (email: string, password: string): Promise<void> => {
    // Simula un breve ritardo di rete (300ms) per feedback realistico
    await new Promise(r => setTimeout(r, 300))

    const found = MOCK_USERS.find(
      u =>
        u.email.toLowerCase() === email.toLowerCase().trim() &&
        u.password === password
    )
    if (!found) throw new Error('Email o password non validi')

    // Rimuoviamo la password prima di salvare nello stato
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...authUser } = found
    setUser(authUser)
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook per accedere al contesto di autenticazione.
 * Lancia un errore se usato fuori da AuthProvider.
 */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve essere usato dentro <AuthProvider>')
  return ctx
}
