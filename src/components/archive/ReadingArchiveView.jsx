import React, { useState, useMemo } from 'react';
import { useBooks } from '../../context/BookContext';
import {
  BookMarked,
  LayoutGrid,
  Table as TableIcon,
  BarChart3,
  Bookmark,
  Calendar,
  Building,
  User,
  Clock,
  Sparkles,
  FileText,
  Filter,
} from 'lucide-react';
import { normalizeTitle } from '../../utils/dataLoader';
import ArchiveAnalyticsAtlas from './ArchiveAnalyticsAtlas';

export default function ReadingArchiveView() {
  const { archiveBooks, searchQuery, setSelectedArchiveBook } = useBooks();

  const [subTab, setSubTab] = useState('analytics'); // 'analytics' (default) | 'shelf' | 'ledger'
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState('all'); // 'all' | 'series_only' | 'standalone_only'
  const [selectedPublisher, setSelectedPublisher] = useState('all');
  const [sortBy, setSortBy] = useState('year-desc'); // year-desc, year-asc, title-asc, pages-desc

  // Unique values for filters
  const years = useMemo(() => {
    return Array.from(new Set(archiveBooks.map(b => b.year_read).filter(Boolean))).sort((a, b) => b - a);
  }, [archiveBooks]);

  const publishers = useMemo(() => {
    const list = archiveBooks.map(b => (b.publisher || '').replace(/\(.*?\)/g, '').trim()).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [archiveBooks]);

  // Year counts
  const yearCounts = useMemo(() => {
    const counts = {};
    archiveBooks.forEach(b => {
      counts[b.year_read] = (counts[b.year_read] || 0) + 1;
    });
    return counts;
  }, [archiveBooks]);

  // Filtered & sorted books
  const filteredBooks = useMemo(() => {
    return archiveBooks.filter(book => {
      // Year filter
      if (selectedYear !== 'all' && book.year_read !== Number(selectedYear)) {
        return false;
      }
      // Type filter
      if (selectedType !== 'all' && book.type !== selectedType) {
        return false;
      }
      // Series filter
      if (selectedSeriesFilter === 'series_only' && !book.is_series) return false;
      if (selectedSeriesFilter === 'standalone_only' && book.is_series) return false;

      // Publisher filter
      if (selectedPublisher !== 'all') {
        const pub = (book.publisher || '').replace(/\(.*?\)/g, '').trim();
        if (pub !== selectedPublisher) return false;
      }

      // Search query
      if (searchQuery) {
        const normSearch = normalizeTitle(searchQuery);
        const pool = [
          normalizeTitle(book.canonical_title),
          normalizeTitle(book.input_title),
          normalizeTitle(book.english_title),
          normalizeTitle(book.author_hebrew),
          normalizeTitle(book.author_original),
          normalizeTitle(book.series_name),
          normalizeTitle(book.translator),
          normalizeTitle(book.publisher),
          ...(book.genres || []).map(normalizeTitle),
          ...(book.themes || []).map(normalizeTitle),
          normalizeTitle(book.notes),
        ].join(' ');

        if (!pool.includes(normSearch)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'year-desc') return (b.year_read || 0) - (a.year_read || 0);
      if (sortBy === 'year-asc') return (a.year_read || 0) - (b.year_read || 0);
      if (sortBy === 'title-asc') return (a.canonical_title || '').localeCompare(b.canonical_title || '', 'he');
      if (sortBy === 'pages-desc') return (b.page_count || 0) - (a.page_count || 0);
      return 0;
    });
  }, [archiveBooks, selectedYear, selectedType, selectedSeriesFilter, selectedPublisher, searchQuery, sortBy]);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Editorial Sub-Navigation & Perspective Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        
        {/* Title & Counts */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 dark:text-stone-100 flex items-center gap-3">
            <span>ארכיון הקריאה המתועד</span>
            <span className="font-sans text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300">
              {filteredBooks.length} כרכים
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            רישום מלא של ספרים וסדרות שנקראו • סיווג ביבליוגרפי, תמות וספקטרום עמודים
          </p>
        </div>

        {/* View Perspective Selector - Charts is default and first */}
        <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 self-start sm:self-auto">
          <button
            onClick={() => setSubTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              subTab === 'analytics'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500" />
            <span>אטלס ניתוח קריאה (גרפים)</span>
          </button>

          <button
            onClick={() => setSubTab('shelf')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              subTab === 'shelf'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>מדף הספרים והסדרות</span>
          </button>

          <button
            onClick={() => setSubTab('ledger')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              subTab === 'ledger'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>לדג'ר ביבליוגרפי</span>
          </button>
        </div>

      </div>

      {/* When in Analytics view, show Atlas directly */}
      {subTab === 'analytics' ? (
        <ArchiveAnalyticsAtlas />
      ) : (
        <>
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            
            {/* Year Pills Navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-semibold text-stone-400 ml-1 shrink-0 font-sans">שנת קריאה:</span>
              <button
                onClick={() => setSelectedYear('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedYear === 'all'
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                כל השנים ({archiveBooks.length})
              </button>
              {years.map(yr => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(String(yr))}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    selectedYear === String(yr)
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  {yr} ({yearCounts[yr] || 0})
                </button>
              ))}
            </div>

            {/* Dropdown Filters (Type, Series, Publisher, Sort) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
              
              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">סוגה</label>
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="w-full text-xs rounded-lg py-1.5 px-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                >
                  <option value="all">כל הסוגות</option>
                  <option value="פרוזה">פרוזה (סיפורת)</option>
                  <option value="עיון">עיון ומדע</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">סדרות וכרכים</label>
                <select
                  value={selectedSeriesFilter}
                  onChange={e => setSelectedSeriesFilter(e.target.value)}
                  className="w-full text-xs rounded-lg py-1.5 px-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                >
                  <option value="all">הכל (סדרות ובודדים)</option>
                  <option value="series_only">סדרות וכרכים בלבד</option>
                  <option value="standalone_only">כרכים בודדים בלבד</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">הוצאה לאור</label>
                <select
                  value={selectedPublisher}
                  onChange={e => setSelectedPublisher(e.target.value)}
                  className="w-full text-xs rounded-lg py-1.5 px-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                >
                  <option value="all">כל ההוצאות</option>
                  {publishers.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">מיון</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full text-xs rounded-lg py-1.5 px-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                >
                  <option value="year-desc">שנת קריאה (חדש לישן)</option>
                  <option value="year-asc">שנת קריאה (ישן לחדש)</option>
                  <option value="title-asc">שם הספר (א-ת)</option>
                  <option value="pages-desc">מספר עמודים (מהארוך לקצר)</option>
                </select>
              </div>

            </div>

          </div>

          {/* Book Content (Shelf vs Ledger) */}
          {filteredBooks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <BookMarked className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-700 dark:text-stone-300">לא נמצאו כרכים מתאימים בארכיון</p>
              <p className="text-xs text-stone-400 mt-1">נסה לשנות את הסינונים</p>
            </div>
          ) : subTab === 'shelf' ? (
            
            /* The Editorial Shelf Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredBooks.map(book => (
                <div
                  key={book.book_id}
                  onClick={() => setSelectedArchiveBook(book)}
                  className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-amber-700/60 dark:hover:border-amber-500/60 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    
                    {/* Top status bar: Year & Series badge */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                        {book.year_read}
                      </span>

                      {book.is_series && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60">
                          כרך {book.volume_number || 'סדרה'}
                        </span>
                      )}
                    </div>

                    {/* Cover / Spine mini visual */}
                    <div className="flex gap-3 mb-3">
                      {book.cover_url ? (
                        <img
                          src={book.cover_url}
                          alt=""
                          className="w-14 h-20 object-cover rounded-md shadow-xs shrink-0 border border-stone-200 dark:border-stone-700"
                        />
                      ) : (
                        <div className="w-14 h-20 rounded-md bg-stone-800 dark:bg-stone-700 text-stone-300 flex flex-col justify-center items-center p-1.5 shrink-0 text-center">
                          <BookMarked className="w-4 h-4 text-amber-500 mb-1" />
                          <span className="text-[8px] font-mono leading-none line-clamp-2">{book.canonical_title}</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 leading-snug line-clamp-2 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition">
                          {book.canonical_title}
                        </h3>

                        {book.english_title && (
                          <p className="text-[11px] text-stone-400 font-sans italic line-clamp-1 mt-0.5" dir="ltr">
                            {book.english_title}
                          </p>
                        )}

                        <div className="mt-2 text-xs font-medium text-stone-600 dark:text-stone-400 line-clamp-1">
                          {book.author_hebrew}
                        </div>
                      </div>
                    </div>

                    {/* Series context if present */}
                    {book.is_series && book.series_name && (
                      <div className="text-[11px] text-amber-900/80 dark:text-amber-200/80 mb-2 font-medium">
                        מתוך הסדרה: <span className="font-semibold">{book.series_name}</span>
                      </div>
                    )}

                    {/* Discrete Genres & Themes */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(book.genres || []).slice(0, 2).map(g => (
                        <span key={g} className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {g}
                        </span>
                      ))}
                      {(book.themes || []).slice(0, 1).map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Personal Notes preview */}
                    {book.notes && (
                      <p className="mt-3 text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 italic">
                        "{book.notes}"
                      </p>
                    )}

                  </div>

                  {/* Card Footer: Publisher & Pages */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
                    <span className="truncate max-w-[120px]" title={book.publisher}>
                      {book.publisher}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      {book.page_count ? (
                        <span>{book.page_count} עמ'</span>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>

          ) : (

            /* The High-Density Ledger Table */
            <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 font-bold border-b border-stone-200 dark:border-stone-700">
                    <tr>
                      <th className="py-3 px-4">שנת קריאה</th>
                      <th className="py-3 px-4">שם הכרך (קנוני)</th>
                      <th className="py-3 px-4">מחבר</th>
                      <th className="py-3 px-4">סדרה / כרך</th>
                      <th className="py-3 px-4">הוצאה לאור</th>
                      <th className="py-3 px-4">סוגה</th>
                      <th className="py-3 px-4">ז'אנרים</th>
                      <th className="py-3 px-4">שפת מקור</th>
                      <th className="py-3 px-4">עמודים</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {filteredBooks.map(book => (
                      <tr
                        key={book.book_id}
                        onClick={() => setSelectedArchiveBook(book)}
                        className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40 transition cursor-pointer"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-stone-900 dark:text-stone-100">
                          {book.year_read}
                        </td>
                        <td className="py-3 px-4 font-serif font-bold text-stone-900 dark:text-stone-100">
                          {book.canonical_title}
                        </td>
                        <td className="py-3 px-4 text-stone-700 dark:text-stone-300">
                          {book.author_hebrew}
                        </td>
                        <td className="py-3 px-4 text-stone-500">
                          {book.is_series ? (
                            <span className="font-medium text-amber-800 dark:text-amber-400">
                              {book.series_name || ''} ({book.volume_number ? `כרך ${book.volume_number}` : ''})
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                          {book.publisher}
                        </td>
                        <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                          {book.type}
                        </td>
                        <td className="py-3 px-4 text-stone-500 max-w-xs truncate">
                          {(book.genres || []).join(', ')}
                        </td>
                        <td className="py-3 px-4 text-stone-500">
                          {book.orig_language}
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-700 dark:text-stone-300">
                          {book.page_count ? `${book.page_count}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          )}
        </>
      )}

    </div>
  );
}
