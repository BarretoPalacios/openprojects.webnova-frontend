import { Outlet } from "react-router";
import Navbar from "./components/layout/Navbar";
import { ToastProvider } from "./components/Toast";

export default function App() {
  return (
    <ToastProvider>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </ToastProvider>
  );
}