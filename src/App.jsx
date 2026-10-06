import React from 'react';
import { BookProvider, useBooks } from './context/BookContext';
import HeaderNav from './components/HeaderNav';
import LandingHero from './components/landing/LandingHero';
import ReadingArchiveView from './components/archive/ReadingArchiveView';
import WishlistCatalogView from './components/catalog/WishlistCatalogView';
import VolumeDetailModal from './components/modals/VolumeDetailModal';
import CatalogBookModal from './components/modals/CatalogBookModal';
import AddArchiveBookModal from './components/modals/AddArchiveBookModal';
import ExportCenterModal from './components/modals/ExportCenterModal';

function AppContent() {
  const { activeDomain, dataLoaded } = useBooks();

  if (!dataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] dark:bg-[#0c0f17]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-stone-800 dark:border-stone-200 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-serif text-stone-600 dark:text-stone-400">טוען את המאגרים הביבליוגרפיים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] dark:bg-[#0c0f17] text-stone-900 dark:text-stone-100 transition-colors duration-200 font-sans selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-100">
      <HeaderNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeDomain === 'landing' && <LandingHero />}
        {activeDomain === 'archive' && <ReadingArchiveView />}
        {activeDomain === 'catalog' && <WishlistCatalogView />}
      </main>

      <footer className="border-t border-stone-200/80 dark:border-stone-800/80 py-6 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-serif">
            ספריית מצע קריאה • ארכיון ספרים מתועד וקטלוג רשימות סימניה
          </span>
          <span className="font-mono text-[11px] text-stone-500">
            מהדורה ביבליוגרפית 2.5 • עיצוב מערכתי ואטלס ניתוחים מעמיק
          </span>
        </div>
      </footer>

      {/* Global Modals */}
      <VolumeDetailModal />
      <CatalogBookModal />
      <AddArchiveBookModal />
      <ExportCenterModal />
    </div>
  );
}

export default function App() {
  return (
    <BookProvider>
      <AppContent />
    </BookProvider>
  );
}
