/**
 * Hook para gerenciar o perfil do usuário
 * Salva automaticamente nome, email e foto do Google
 */

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useLocalStorage } from "./use-local-storage"

export interface UserProfile {
  name: string | null
  email: string | null
  image: string | null
  id?: string
}

const STORAGE_KEY = "devfinance_user_profile"

export function useUserProfile() {
  const { data: session, status } = useSession()
  const [storedProfile, setStoredProfile] = useLocalStorage<UserProfile | null>(
    STORAGE_KEY,
    null
  )
  const [profile, setProfile] = useState<UserProfile | null>(storedProfile)

  // Sincronizar com a sessão do NextAuth quando o usuário faz login
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const newProfile: UserProfile = {
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
        id: session.user.id || undefined,
      }

      // Atualizar apenas se houver mudanças
      if (
        !storedProfile ||
        storedProfile.name !== newProfile.name ||
        storedProfile.email !== newProfile.email ||
        storedProfile.image !== newProfile.image
      ) {
        setStoredProfile(newProfile)
        setProfile(newProfile)
      } else {
        setProfile(storedProfile)
      }
    } else if (status === "unauthenticated") {
      // Limpar perfil quando deslogar
      setStoredProfile(null)
      setProfile(null)
    } else {
      // Usar perfil salvo enquanto carrega
      setProfile(storedProfile)
    }
  }, [session, status, storedProfile, setStoredProfile])

  return {
    profile,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  }
}

