'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { KpiCardsGrid } from './KpiCardsGrid';
import { ParsingProgress } from './ParsingProgress';
import { UploadModal } from './UploadModal';
import { SettingsModal } from './SettingsModal';
import { AuditModal } from './AuditModal';
import { useData } from '../context/DataContext';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    metrics,
    isProcessing,
    handleUploadSuccess,
    isUploadOpen,
    setIsUploadOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isAuditOpen,
    setIsAuditOpen
  } = useData();

  const pathname = usePathname();
  const isDashboard = pathname === '/';

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAFBFF] text-[#111827] flex font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden p-6 sm:p-8 bg-[#FAFBFF]">
        <Header />

        {isDashboard && metrics && <KpiCardsGrid metrics={metrics} />}

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {isProcessing ? <ParsingProgress /> : children}
        </div>
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => window.location.reload()}
      />

      <AuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />
    </div>
  );
};
