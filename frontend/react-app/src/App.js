import React, { useEffect } from 'react';
import './App.css';
import Dashboard from './Pages/Home';
import { ThemeProvider } from './components/ui/theme-provider';
import { HashRouter, Routes, Route } from "react-router-dom";
// import CaseDashboard from './Pages/CaseDashboard';

// import IndividualDashboard from './Pages/IndividualDashboard';
import ElectronIntro from './components/ElectronIntro';
import BackendTester from './components/BackendTester';
import UpdateNotification from './components/UpdateNotification';
import { useState } from 'react';
import { SidebarProvider } from './components/ui/sidebar';
import { BreadcrumbProvider, useBreadcrumb } from './contexts/BreadcrumbContext';
import { ReportProvider } from './contexts/ReportContext';


function App() {

  const [showIntro, setShowIntro] = useState(true);

  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      {showIntro && <ElectronIntro onComplete={() => setShowIntro(false)} />}
      <SidebarProvider>
        <HashRouter>
          <BreadcrumbProvider>
            <ReportProvider>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/:defaultTab" element={<Dashboard />} />
                {/* <Route path="/case-dashboard/:caseId/:defaultTab" element={<CaseDashboard />} />
            <Route path="/individual-dashboard/:caseId/:individualId/:defaultTab" element={<IndividualDashboard />} /> */}
                {/* <Route path="/backend-tester" element={<BackendTester />} /> */}
              </Routes>
            </ReportProvider>
          </BreadcrumbProvider>
        </HashRouter>
      </SidebarProvider>
      <UpdateNotification />
    </ThemeProvider>
  );
}

export default App;
