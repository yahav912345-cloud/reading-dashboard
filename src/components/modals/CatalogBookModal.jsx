import React from 'react';
import { useBooks } from '../../context/BookContext';
import {
  X,
  Star,
  ExternalLink,
  Building,
  Calendar,
  Layers,
  MessageSquare,
} from 'lucide-react';

export default function CatalogBookModal() {
  const { selectedCatalogBook, setSelectedCatalogBook } = useBooks();

  if (!selectedCatalogBook) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedCatalogBook(null)}
          className="absolute top-5 left-5 p-2 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Layout */}
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          
          {selectedCatalogBook.imageUrl && (
            <img
              src={selectedCatalogBook.imageUrl}
              alt=""
              className="w-24 h-36 object-cover rounded-xl shadow-book shrink-0 border border-stone-200 dark:border-stone-700"
            />
          )}

          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 font-bold mb-2 inline-block">
              קטלוג רשימות סימניה
            </span>

            <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight">
              {selectedCatalogBook.title}
            </h2>

            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {selectedCatalogBook.author}
            </p>

            {selectedCatalogBook.communityRating && (
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                  {selectedCatalogBook.communityRating.toFixed(2)} / 5
                </span>
                <span className="text-stone-400">
                  ({selectedCatalogBook.ratingCount} ביקורות בסימניה)
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-stone-200 dark:border-stone-800 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50">
            <span className="text-stone-400 font-medium">עמודים</span>
            <p className="font-mono font-bold text-stone-800 dark:text-stone-200 mt-0.5">
              {selectedCatalogBook.parsedPages ? `${selectedCatalogBook.parsedPages} עמ'` : 'לא צוין'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50">
            <span className="text-stone-400 font-medium">שנת הוצאה</span>
            <p className="font-mono font-bold text-stone-800 dark:text-stone-200 mt-0.5">
              {selectedCatalogBook.parsedYear || selectedCatalogBook.year || 'לא צוין'}
            </p>
          </div>
        </div>

        {/* Belongs to lists */}
        {selectedCatalogBook.lists && selectedCatalogBook.lists.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 text-xs">
            <span className="text-stone-400 font-medium block mb-1.5">מופיע ברשימות סימניה:</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedCatalogBook.lists.map(lst => (
                <span key={lst} className="px-2 py-0.5 rounded-md bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-600 font-medium">
                  {lst}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Personal note if exists */}
        {selectedCatalogBook.personalNote && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 text-xs text-amber-950 dark:text-amber-200">
            <span className="font-bold block mb-1">הערה אישית בסימניה:</span>
            <p className="leading-relaxed">{selectedCatalogBook.personalNote}</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          {selectedCatalogBook.bookUrl && (
            <a
              href={selectedCatalogBook.bookUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>פתח דף ספר בסימניה</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => setSelectedCatalogBook(null)}
            className="py-2 px-5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
          >
            סגור
          </button>
        </div>

      </div>
    </div>
  );
}
