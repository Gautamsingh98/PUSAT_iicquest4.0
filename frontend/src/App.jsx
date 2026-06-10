import React, { useState } from "react";
import FormLead from "./components/FormLead";

export default function App() {
  const [showLeadMenu, setShowLeadMenu] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 shadow-xl hidden md:block">
        <h2 className="text-2xl font-bold mb-8">AI CRM</h2>

        <ul className="space-y-4">

          {/* Dashboard */}
          <li>
            <button
              onClick={() => setActivePage("dashboard")}
              className={`w-full text-left ${
                activePage === "dashboard"
                  ? "text-blue-400 font-semibold"
                  : "hover:text-blue-300"
              }`}
            >
              Dashboard
            </button>
          </li>

          {/* Leads Dropdown */}
          <li>
            <button
              onClick={() => setShowLeadMenu(!showLeadMenu)}
              className="flex items-center justify-between w-full text-left hover:text-blue-300"
            >
              <span>Leads</span>
              <span>{showLeadMenu ? "▲" : "▼"}</span>
            </button>

            {showLeadMenu && (
              <ul className="ml-4 mt-3 space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setActivePage("uploadVoice")}
                    className={`w-full text-left ${
                      activePage === "uploadVoice"
                        ? "text-blue-400 font-semibold"
                        : "hover:text-blue-300"
                    }`}
                  >
                    Upload Voice
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* Other Sidebar Items */}
          <li>
            <button
              onClick={() => setActivePage("uploads")}
              className="hover:text-blue-300"
            >
              Uploads
            </button>
          </li>

          <li>
            <button
              onClick={() => setActivePage("analytics")}
              className="hover:text-blue-300"
            >
              Analytics
            </button>
          </li>

          <li>
            <button
              onClick={() => setActivePage("settings")}
              className="hover:text-blue-300"
            >
              Settings
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">

        {/* Dashboard */}
        {activePage === "dashboard" && (
          <div>
            <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
            <p className="text-gray-600">
              Welcome to AI CRM Dashboard.
            </p>
          </div>
        )}

        {/* Upload Voice Page */}
        {activePage === "uploadVoice" && (
          <FormLead />
        )}

        {/* Uploads */}
        {activePage === "uploads" && (
          <div>
            <h1 className="text-4xl font-bold mb-4">Uploads</h1>
            <p className="text-gray-600">
              Upload history will appear here.
            </p>
          </div>
        )}

        {/* Analytics */}
        {activePage === "analytics" && (
          <div>
            <h1 className="text-4xl font-bold mb-4">Analytics</h1>
            <p className="text-gray-600">
              Analytics dashboard coming soon.
            </p>
          </div>
        )}

        {/* Settings */}
        {activePage === "settings" && (
          <div>
            <h1 className="text-4xl font-bold mb-4">Settings</h1>
            <p className="text-gray-600">
              Configure your CRM settings here.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}