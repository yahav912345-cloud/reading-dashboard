import React, { useState } from 'react';
import { useBooks } from '../../context/BookContext';
import {
  X,
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  CheckCircle,
  RotateCcw,
  BookMarked,
  Layers,
} from 'lucide-react';
import {
  exportArchiveToExcel,
  exportCatalogToExcel,
  exportToJSON,
  exportToCSV,
} from '../../utils/exportUtils';

export default function ExportCenterModal() {
  const {
    isExportOpen,
    setIsExportOpen,
    archiveBooks,
    wishlistCatalog,
    handleResetData,
  } = useBooks();

  const [feedbackMsg, setFeedbackMsg] = useState('');

  if (!isExportOpen) return null;

  const notify = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg('');
      setIsExportOpen(false);
    }, 1500);
  };

  // Archive exports
  const handleArchiveExcel = () => {
    exportArchiveToExcel(archiveBooks, 'reading_archive_verified');
    notify('קובץ Excel של ארכיון הקריאה הורד בהצלחה!');
  };

  const handleArchiveJSON = () => {
    exportToJSON({ books: archiveBooks, total: archiveBooks.length }, 'books_read_database');
    notify('קובץ JSON של ארכיון הקריאה הורד!');
  };

  const handleArchiveCSV = () => {
    exportToCSV(archiveBooks, 'books_read_database');
    notify('קובץ CSV של ארכיון הקריאה הורד!');
  };

  // Catalog exports
  const handleCatalogExcel = () => {
    exportCatalogToExcel(wishlistCatalog.uniqueBooks, wishlistCatalog.lists, 'wishlist_catalog_simania');
    notify('קובץ Excel של קטלוג סימניה הורד בהצלחה!');
  };

  const handleCatalogJSON = () => {
    exportToJSON(wishlistCatalog, 'simania_reading_lists');
    notify('קובץ JSON של קטלוג סימניה הורד!');
  };

  const handleCatalogCSV = () => {
    exportToCSV(wishlistCatalog.uniqueBooks, 'simania_books_to_read');
    notify('קובץ CSV של קטלוג סימניה הורד!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={() => setIsExportOpen(false)}
          className="absolute top-5 left-5 p-2 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center shadow-xs">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
              ייצוא נתונים נפרד (Data Exports)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              הורדת מאגרים עצמאיים בפורמט Excel, JSON ו-CSV
            </p>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* 2 Dedicated Sections */}
        <div className="space-y-4 text-xs">
          
          {/* Section 1: Reading Archive */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
            <div className="flex items-center justify-between font-serif font-bold text-stone-900 dark:text-stone-100">
              <span className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-amber-700" />
                <span>ארכיון הקריאה ({archiveBooks.length} כרכים)</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleArchiveExcel}
                className="py-2 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-600 transition font-medium text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                onClick={handleArchiveJSON}
                className="py-2 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-600 transition font-medium text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1.5"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>JSON</span>
              </button>
              <button
                onClick={handleArchiveCSV}
                className="py-2 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-600 transition font-medium text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-stone-600" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Section 2: Wishlist Catalog */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
            <div className="flex items-center justify-between font-serif font-bold text-stone-900 dark:text-stone-100">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-700" />
                <span>קטלוג רשימות סימניה ({wishlistCatalog.uniqueBooks.length} ספרים)</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleCatalogExcel}
                className="py-2 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-teal-600 transition font-medium text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                onClick={handleCatalogJSON}
                className="py-2 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-teal-600 transition font-medium text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1.5"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>JSON</span>
              </button>
              <button
                onClick={handleCatalogCSV}
                className="py-2 px-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-teal-600 transition font-medium text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-stone-600" />
                <span>CSV</span>
              </button>
            </div>
          </div>

        </div>

        {/* Reset */}
        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <button
            onClick={handleResetData}
            className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>איפוס לנתוני מקור</span>
          </button>

          <button
            onClick={() => setIsExportOpen(false)}
            className="py-2 px-5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
          >
            סגור
          </button>
        </div>

      </div>
    </div>
  );
}
