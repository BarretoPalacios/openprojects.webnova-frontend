import { Outlet } from "react-router";
import Navbar from "./components/layout/Navbar";
import DonationButton from "./components/DonationButton";
import { ToastProvider } from "./components/Toast";

export default function App() {
  return (
    <ToastProvider>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <DonationButton />
    </ToastProvider>
  );
}