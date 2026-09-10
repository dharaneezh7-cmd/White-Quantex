import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HydratedRouter } from "react-router/dom"

const root = document.getElementById("root")
if (!root) throw new Error("Root element not found")

createRoot(root).render(
  <StrictMode>
    <HydratedRouter />
  </StrictMode>
)
