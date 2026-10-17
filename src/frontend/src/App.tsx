
import { ThemeProvider } from "next-themes"

import Page from "./pages/Page";
import { AuthProvider } from "@/components/Auth"
import { useEffect, useState } from "react";
import { BACKEND_BASE_URL } from "./config";



export default function App() {

  const [backendStatus, setBackendStatus] = useState(false)
/*
  useEffect(() => {
    try {
      fetch(`${BACKEND_BASE_URL}/api/generate-204`).then((res) => {
        if (res.ok) {
          setBackendStatus(true)
        }
        else {
          setBackendStatus(false)

        }
      })
    }
    catch (err) {
      setBackendStatus(false)
    }
  }, [])
*/
  return (
    <AuthProvider>
      <div className="flex h-screen w-full">
        <ThemeProvider attribute="class"
          defaultTheme="system"
          enableSystem>
          <Page backendStatus={backendStatus} />


        </ThemeProvider>
      </div>
    </AuthProvider>
  )
}