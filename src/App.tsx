import { RouterProvider } from "react-router-dom"

import { router } from "@/routes"
import { Toaster } from "@/components/ui/sonner"

const App = () => (
  <>
    <RouterProvider router={router} />
    <Toaster />
  </>
)

export default App
