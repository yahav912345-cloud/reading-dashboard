import React from 'react';
import { useBooks } from '../../context/BookContext';
import {
  X,
  BookMarked,
  User,
  Building,
  Calendar,
  Globe,
  FileText,
  Tags,
  Sparkles,
} from 'lucide-react';

export default function VolumeDetailModal() {
  const { selectedArchiveBook, setSelectedArchiveBook } = useBooks();

  if (!selectedArchiveBook) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedArchiveBook(null)}
          className="absolute top-5 left-5 p-2 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header layout */}
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          
          {/* Cover or placeholder */}
          <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-book shrink-0">
            {selectedArchiveBook.cover_url ? (
              <img
                src={selectedArchiveBook.cover_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full p-2.5 flex flex-col justify-between bg-stone-900 text-stone-100">
                <span className="text-[10px] font-serif font-bold line-clamp-3 leading-tight">
                  {selectedArchiveBook.canonical_title}
                </span>
                <span className="text-[9px] text-stone-400 font-mono">
                  {selectedArchiveBook.year_read}
                </span>
              </div>
            )}
          </div>

          {/* Titles & Meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                נקרא בשנת {selectedArchiveBook.year_read}
              </span>

              {selectedArchiveBook.is_series && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {selectedArchiveBook.series_name} • כרך {selectedArchiveBook.volume_number || 'סדרה'}
                </span>
              )}

              <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                {selectedArchiveBook.type}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight">
              {selectedArchiveBook.canonical_title}
            </h2>

            {selectedArchiveBook.english_title && (
              <p className="text-xs text-stone-400 italic mt-0.5" dir="ltr">
                {selectedArchiveBook.english_title}
              </p>
            )}

            <p className="text-sm text-stone-600 dark:text-stone-300 font-medium mt-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-stone-400" />
              <span>{selectedArchiveBook.author_hebrew}</span>
              {selectedArchiveBook.author_original && (
                <span className="text-xs text-stone-400 font-normal">({selectedArchiveBook.author_original})</span>
              )}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-stone-200 dark:border-stone-800 text-xs">
          
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50">
            <span className="text-stone-400 font-medium">הוצאה לאור</span>
            <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5 truncate">
              {selectedArchiveBook.publisher || 'לא צוין'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50">
            <span className="text-stone-400 font-medium">מספר עמודים</span>
            <p className="font-mono font-bold text-stone-800 dark:text-stone-200 mt-0.5">
              {selectedArchiveBook.page_count ? `${selectedArchiveBook.page_count} עמודים` : 'לא מתועד'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50">
            <span className="text-stone-400 font-medium">שנת כתיבה מקורית</span>
            <p className="font-mono font-bold text-stone-800 dark:text-stone-200 mt-0.5">
              {selectedArchiveBook.original_pub_year || 'לא צוין'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50">
            <span className="text-stone-400 font-medium">שפת מקור</span>
            <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">
              {selectedArchiveBook.orig_language || 'עברית'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50">
            <span className="text-stone-400 font-medium">תרגום</span>
            <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">
              {selectedArchiveBook.translator || 'מקור'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50">
            <span className="text-stone-400 font-medium">פורמט</span>
            <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">
              {selectedArchiveBook.format || 'ספר מודפס'}
            </p>
          </div>

        </div>

        {/* Genres & Themes */}
        <div className="mt-4 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 space-y-2 text-xs">
          {selectedArchiveBook.genres && selectedArchiveBook.genres.length > 0 && (
            <div>
              <span className="text-stone-400 font-medium ml-2">ז'אנרים:</span>
              <div className="inline-flex flex-wrap gap-1">
                {selectedArchiveBook.genres.map(g => (
                  <span key={g} className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedArchiveBook.themes && selectedArchiveBook.themes.length > 0 && (
            <div>
              <span className="text-stone-400 font-medium ml-2">תמות ונושאים:</span>
              <div className="inline-flex flex-wrap gap-1">
                {selectedArchiveBook.themes.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Personal Notes */}
        {selectedArchiveBook.notes && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 text-xs text-amber-950 dark:text-amber-200">
            <span className="font-bold block mb-1">הערות ורשמים מהקריאה:</span>
            <p className="leading-relaxed font-sans">{selectedArchiveBook.notes}</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            onClick={() => setSelectedArchiveBook(null)}
            className="py-2 px-5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
          >
            סגור
          </button>
        </div>

      </div>
    </div>
  );
}
