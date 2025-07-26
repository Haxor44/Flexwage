import { useEffect, useState } from "react"
import { AuthClient } from "@dfinity/auth-client"

export function useInternetIdentity() {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null)
  const [principal, setPrincipal] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    AuthClient.create().then((client) => {
      setAuthClient(client)
      setIsAuthenticated(client.isAuthenticated())
      if (client.isAuthenticated()) {
        setPrincipal(client.getIdentity().getPrincipal().toText())
      }
    })
  }, [])

  const login = async () => {
    if (!authClient) return
    await authClient.login({
      identityProvider: "https://identity.ic0.app/#authorize",
      onSuccess: () => {
        setIsAuthenticated(true)
        setPrincipal(authClient.getIdentity().getPrincipal().toText())
      },
    })
  }

  const logout = async () => {
    if (!authClient) return
    await authClient.logout()
    setIsAuthenticated(false)
    setPrincipal(null)
  }

  return { isAuthenticated, principal, login, logout }
}
