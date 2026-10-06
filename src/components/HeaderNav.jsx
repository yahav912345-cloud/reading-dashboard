import React from 'react';
import { useBooks } from '../context/BookContext';
import {
  Library,
  BookMarked,
  Layers,
  Search,
  PlusCircle,
  Download,
  Sun,
  Moon,
  Home,
} from 'lucide-react';

export default function HeaderNav() {
  const {
    activeDomain,
    setActiveDomain,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    archiveBooks,
    wishlistCatalog,
    setIsAddArchiveBookOpen,
    setIsExportOpen,
  } = useBooks();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 dark:border-stone-800 bg-[#fdfbf7]/95 dark:bg-[#0c0f17]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main top bar */}
        <div className="flex items-center justify-between h-18 gap-3 py-3">
          
          {/* Brand mark (Clicking takes user back to Landing Hero) */}
          <button
            onClick={() => {
              setActiveDomain('landing');
              setSearchQuery('');
            }}
            className="flex items-center gap-3 shrink-0 text-right group transition"
            title="חזרה לשער הראשי"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-black text-lg tracking-tight text-stone-900 dark:text-stone-100 leading-none group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                ספריית מצע קריאה
              </div>
              <p className="text-[11px] font-sans font-medium text-stone-500 dark:text-stone-400 mt-1">
                The Literary Repository & Stacks
              </p>
            </div>
          </button>

          {/* Central Domain Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-stone-200/70 dark:bg-stone-800/80 border border-stone-300/50 dark:border-stone-700/60 shadow-inner">
            
            {/* Landing button */}
            <button
              onClick={() => {
                setActiveDomain('landing');
                setSearchQuery('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeDomain === 'landing'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="שער ראשי"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">שער ראשי</span>
            </button>

            {/* Reading Archive */}
            <button
              onClick={() => {
                setActiveDomain('archive');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeDomain === 'archive'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <BookMarked className="w-4 h-4 text-amber-700 dark:text-amber-500" />
              <span>ארכיון הקריאה</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-normal">
                {archiveBooks.length}
              </span>
            </button>

            {/* Wishlist Catalog */}
            <button
              onClick={() => {
                setActiveDomain('catalog');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeDomain === 'catalog'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-700 dark:text-teal-500" />
              <span>קטלוג סימניה</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-normal">
                {wishlistCatalog.uniqueBooks.length}
              </span>
            </button>
          </div>

          {/* Quick Search & Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* Search Input (visible when inside Archive or Catalog) */}
            {activeDomain !== 'landing' && (
              <div className="relative hidden md:block w-44 lg:w-60">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={
                    activeDomain === 'archive'
                      ? 'חיפוש בארכיון שנקרא...'
                      : 'חיפוש ברשימות סימניה...'
                  }
                  className="w-full pr-8 pl-3 py-1.5 text-xs rounded-lg bg-stone-100/90 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900 dark:text-stone-100 placeholder-stone-400 font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Add Book Action in Archive */}
            {activeDomain === 'archive' && (
              <button
                onClick={() => setIsAddArchiveBookOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 transition shadow-xs"
                title="רישום ספר חדש בארכיון"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">רישום ספר</span>
              </button>
            )}

            {/* Export modal trigger */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
              title="ייצוא נתונים"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ייצוא</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 transition"
              title={theme === 'dark' ? 'מצב יום' : 'מצב לילה'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

          </div>

        </div>

      </div>
    </header>
  );
}
