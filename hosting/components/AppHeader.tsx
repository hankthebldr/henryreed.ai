"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import InterfaceToggle from "./InterfaceToggle";

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const isGUI = pathname?.startsWith("/gui");
  const isTerminal = pathname?.startsWith("/terminal");

  const handleModeChange = (mode: "terminal" | "gui") => {
    if (mode === "gui" && !isGUI) router.push("/gui");
    if (mode === "terminal" && !isTerminal) router.push("/terminal");
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("dc_authenticated");
      sessionStorage.removeItem("dc_user");
    }
    router.push("/");
  };

  const currentUser =
    typeof window !== "undefined"
      ? sessionStorage.getItem("dc_user") || "consultant"
      : "consultant";

  return (
    <header className="bg-gray-900 border-b border-gray-700 p-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/gui" className="text-lg font-bold text-cyan-400">
            Cortex DC Portal
          </Link>
          <div className="text-sm text-gray-400">Domain Consultant Hub</div>
        </div>

        <div className="flex items-center space-x-4">
          <InterfaceToggle
            currentMode={isGUI ? "gui" : "terminal"}
            onModeChange={handleModeChange}
          />

          <nav className="hidden md:flex items-center space-x-3 text-sm">
            <Link
              href="/gui"
              className={`px-2 py-1 rounded border text-gray-300 hover:text-white hover:border-gray-500 transition-colors ${
                isGUI ? "border-cyan-500 text-cyan-400" : "border-gray-600"
              }`}
            >
              GUI
            </Link>
            <Link
              href="/terminal"
              className={`px-2 py-1 rounded border text-gray-300 hover:text-white hover:border-gray-500 transition-colors ${
                isTerminal ? "border-cyan-500 text-cyan-400" : "border-gray-600"
              }`}
            >
              Terminal
            </Link>
            <Link
              href="/docs"
              className={`px-2 py-1 rounded border text-gray-300 hover:text-white hover:border-gray-500 transition-colors ${
                pathname?.startsWith("/docs")
                  ? "border-cyan-500 text-cyan-400"
                  : "border-gray-600"
              }`}
            >
              Docs
            </Link>
          </nav>

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-cyan-400">👤</span>
              <span className="text-gray-300">{currentUser}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-600/30 hover:border-red-500/50 transition-colors text-xs"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

