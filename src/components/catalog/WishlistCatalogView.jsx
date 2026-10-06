import React, { useState, useMemo } from 'react';
import { useBooks } from '../../context/BookContext';
import {
  Layers,
  BarChart2,
  Compass,
  Star,
  ExternalLink,
  MessageSquare,
  Building,
  BookOpen,
  Filter,
} from 'lucide-react';
import { normalizeTitle } from '../../utils/dataLoader';
import CatalogAnalytics from './CatalogAnalytics';

export default function WishlistCatalogView() {
  const { wishlistCatalog, searchQuery, setSelectedCatalogBook } = useBooks();
  const { uniqueBooks, lists } = wishlistCatalog;

  const [subTab, setSubTab] = useState('intelligence'); // 'intelligence' (default charts view) | 'stacks' | 'curator'
  const [activeCategoryTier, setActiveCategoryTier] = useState('all'); // 'all' | 'core' | 'genres' | 'publishers' | 'notes'
  const [selectedList, setSelectedList] = useState('all');
  const [minRating, setMinRating] = useState('all');
  const [sortBy, setSortBy] = useState('rating-desc'); // rating-desc, rating-count, pages-asc, year-desc, title-asc

  // Curator filter states
  const [curatorMaxPages, setCuratorMaxPages] = useState(350);
  const [curatorMinRating, setCuratorMinRating] = useState(4.2);
  const [curatorGenre, setCuratorGenre] = useState('all');

  // Group lists by tier
  const genreLists = useMemo(() => (lists || []).filter(l => l.categoryGroup === 'genres'), [lists]);
  const publisherLists = useMemo(() => (lists || []).filter(l => l.categoryGroup === 'publishers'), [lists]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return (uniqueBooks || []).filter(book => {
      // Tier filter
      if (activeCategoryTier === 'core') {
        if (!book.lists.includes('ספרים שאני רוצה לקרוא')) return false;
      } else if (activeCategoryTier === 'genres') {
        if (!book.genres || book.genres.length === 0) return false;
      } else if (activeCategoryTier === 'publishers') {
        if (!book.publishers || book.publishers.length === 0) return false;
      } else if (activeCategoryTier === 'notes') {
        if (!book.personalNote) return false;
      }

      // Specific List filter
      if (selectedList !== 'all') {
        if (!book.lists.includes(selectedList)) return false;
      }

      // Min Rating
      if (minRating !== 'all') {
        const threshold = Number(minRating);
        if (!book.communityRating || book.communityRating < threshold) return false;
      }

      // Search query
      if (searchQuery) {
        const normSearch = normalizeTitle(searchQuery);
        const pool = [
          normalizeTitle(book.title),
          normalizeTitle(book.author),
          normalizeTitle(book.personalNote),
          ...(book.genres || []).map(normalizeTitle),
          ...(book.publishers || []).map(normalizeTitle),
          ...(book.lists || []).map(normalizeTitle),
        ].join(' ');

        if (!pool.includes(normSearch)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating-desc') return (b.communityRating || 0) - (a.communityRating || 0);
      if (sortBy === 'rating-count') return (b.ratingCount || 0) - (a.ratingCount || 0);
      if (sortBy === 'pages-asc') return (a.parsedPages || 9999) - (b.parsedPages || 9999);
      if (sortBy === 'year-desc') return (b.parsedYear || 0) - (a.parsedYear || 0);
      if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '', 'he');
      return 0;
    });
  }, [uniqueBooks, activeCategoryTier, selectedList, minRating, searchQuery, sortBy]);

  // Curator candidates
  const curatorCandidates = useMemo(() => {
    return (uniqueBooks || []).filter(book => {
      if (curatorMinRating && (!book.communityRating || book.communityRating < curatorMinRating)) {
        return false;
      }
      if (curatorMaxPages && book.parsedPages && book.parsedPages > curatorMaxPages) {
        return false;
      }
      if (curatorGenre !== 'all' && (!book.genres || !book.genres.includes(curatorGenre))) {
        return false;
      }
      return true;
    }).sort((a, b) => (b.communityRating || 0) - (a.communityRating || 0));
  }, [uniqueBooks, curatorMaxPages, curatorMinRating, curatorGenre]);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 dark:text-stone-100 flex items-center gap-3">
            <span>קטלוג רשימות סימניה</span>
            <span className="font-sans text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 dark:bg-teal-950/70 text-teal-900 dark:text-teal-300">
              {filteredBooks.length} ספרים
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            40 רשימות קריאה מסווגות • דירוגי קוראים, הוצאות לאור ופילוח סוגות
          </p>
        </div>

        {/* View Switcher - Intelligence / Charts is default and first */}
        <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 self-start sm:self-auto">
          <button
            onClick={() => setSubTab('intelligence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              subTab === 'intelligence'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-500" />
            <span>ניתוח הקטלוג וגרפים</span>
          </button>

          <button
            onClick={() => setSubTab('stacks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              subTab === 'stacks'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>מדפי הרשימות</span>
          </button>

          <button
            onClick={() => setSubTab('curator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              subTab === 'curator'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>בורר הספר הבא</span>
          </button>
        </div>
      </div>

      {/* When in Analytics, show CatalogAnalytics */}
      {subTab === 'intelligence' ? (
        <CatalogAnalytics />
      ) : subTab === 'curator' ? (

        /* The Next Read Curator Tool */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-600" />
              <span>בורר קריאה לפי קריטריונים (Curated Decision Support)</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              סינון מושכל של רשימות ההמתנה לפי עומק, ציון קהילה וז'אנר ללא הגרלות אקראיות
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  ציון קהילה מינימלי: <span className="font-mono text-teal-700 dark:text-teal-400">{curatorMinRating} ⭐</span>
                </label>
                <input
                  type="range"
                  min="3.8"
                  max="4.6"
                  step="0.1"
                  value={curatorMinRating}
                  onChange={e => setCuratorMinRating(Number(e.target.value))}
                  className="w-full accent-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  מספר עמודים מרבי: <span className="font-mono text-teal-700 dark:text-teal-400">עד {curatorMaxPages} עמ'</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="800"
                  step="50"
                  value={curatorMaxPages}
                  onChange={e => setCuratorMaxPages(Number(e.target.value))}
                  className="w-full accent-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  ז'אנר מבוקש
                </label>
                <select
                  value={curatorGenre}
                  onChange={e => setCuratorGenre(e.target.value)}
                  className="w-full text-xs rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                >
                  <option value="all">כל הז'אנרים</option>
                  <option value="עיון">עיון ומדע</option>
                  <option value="סיפורת">סיפורת</option>
                  <option value="השקעות">השקעות וכלכלה</option>
                  <option value="מד״ב">מד״ב ופנטזיה</option>
                  <option value="קלאסיקות">קלאסיקות</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results list */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-stone-500">
              נמצאו {curatorCandidates.length} מועמדים מתאימים:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {curatorCandidates.slice(0, 9).map(book => (
                <div
                  key={book.itemId}
                  onClick={() => setSelectedCatalogBook(book)}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-teal-700/60 transition cursor-pointer flex gap-3.5 group"
                >
                  {book.imageUrl && (
                    <img
                      src={book.imageUrl}
                      alt=""
                      className="w-16 h-24 object-cover rounded-md shadow-xs shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-2 group-hover:text-teal-800 dark:group-hover:text-teal-400">
                        {book.title}
                      </h4>
                      <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{book.author}</p>
                    </div>

                    <div className="mt-2 text-xs flex items-center justify-between text-stone-400">
                      <span className="font-bold text-amber-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {book.communityRating?.toFixed(2)}
                      </span>
                      <span className="font-mono">{book.parsedPages ? `${book.parsedPages} עמ'` : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      ) : (

        /* The Main Stacks View */
        <>
          {/* Stacks Tier Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            
            {/* Tier Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-stone-100 dark:border-stone-800">
              <button
                onClick={() => {
                  setActiveCategoryTier('all');
                  setSelectedList('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeCategoryTier === 'all' && selectedList === 'all'
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                כל הספרים ({uniqueBooks.length})
              </button>

              <button
                onClick={() => {
                  setActiveCategoryTier('core');
                  setSelectedList('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeCategoryTier === 'core'
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                הרשימה הראשית (164)
              </button>

              <button
                onClick={() => {
                  setActiveCategoryTier('genres');
                  setSelectedList('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeCategoryTier === 'genres'
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                לפי ז'אנרים ונושאים
              </button>

              <button
                onClick={() => {
                  setActiveCategoryTier('publishers');
                  setSelectedList('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeCategoryTier === 'publishers'
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                לפי הוצאות לאור
              </button>

              <button
                onClick={() => {
                  setActiveCategoryTier('notes');
                  setSelectedList('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeCategoryTier === 'notes'
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                בעלי הערה אישית מסימניה
              </button>
            </div>

            {/* Sub-list chips when genres or publishers active */}
            {(activeCategoryTier === 'genres' || activeCategoryTier === 'publishers') && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-xs">
                <span className="text-stone-400 font-medium shrink-0">סנן רשימה:</span>
                <button
                  onClick={() => setSelectedList('all')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    selectedList === 'all'
                      ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  הכל בקבוצה זו
                </button>
                {(activeCategoryTier === 'genres' ? genreLists : publisherLists).map(lst => (
                  <button
                    key={lst.listId}
                    onClick={() => setSelectedList(lst.listName)}
                    className={`px-2.5 py-1 rounded-md whitespace-nowrap transition ${
                      selectedList === lst.listName
                        ? 'bg-teal-700 text-white font-bold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    {lst.displayName} ({lst.itemCount})
                  </button>
                ))}
              </div>
            )}

            {/* Secondary Controls: Rating & Sort */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">דירוג קהילה</label>
                <select
                  value={minRating}
                  onChange={e => setMinRating(e.target.value)}
                  className="w-full text-xs rounded-lg py-1.5 px-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                >
                  <option value="all">כל הדירוגים</option>
                  <option value="4.5">⭐ 4.5 ומעלה (יצירות מופת)</option>
                  <option value="4.2">⭐ 4.2 ומעלה (מומלץ במיוחד)</option>
                  <option value="4.0">⭐ 4.0 ומעלה</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">מיון</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full text-xs rounded-lg py-1.5 px-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                >
                  <option value="rating-desc">ציון קהילה (גבוה לנמוך)</option>
                  <option value="rating-count">כמות מדרגים (פופולריות)</option>
                  <option value="pages-asc">אורך הכרך (קצר לארוך)</option>
                  <option value="year-desc">שנת הוצאה (חדש לישן)</option>
                  <option value="title-asc">שם הספר (א-ת)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Book Cards Grid */}
          {filteredBooks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <BookOpen className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-700 dark:text-stone-300">לא נמצאו ספרים בקטגוריה זו</p>
              <p className="text-xs text-stone-400 mt-1">נסה לבחור קטגוריה אחרת</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredBooks.map(book => (
                <div
                  key={book.itemId}
                  onClick={() => setSelectedCatalogBook(book)}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-teal-700/60 dark:hover:border-teal-500/60 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover + Info Row */}
                    <div className="flex gap-3.5">
                      
                      {/* Cover */}
                      <div className="w-20 h-28 sm:w-22 sm:h-30 shrink-0 rounded-md overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs">
                        {book.imageUrl ? (
                          <img
                            src={book.imageUrl}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-102 transition"
                          />
                        ) : (
                          <div className="w-full h-full p-2 flex flex-col justify-between bg-stone-800 text-white">
                            <span className="text-[10px] font-bold line-clamp-3">{book.title}</span>
                            <span className="text-[9px] text-stone-400">{book.author}</span>
                          </div>
                        )}
                      </div>

                      {/* Header details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-snug line-clamp-2 group-hover:text-teal-800 dark:group-hover:text-teal-400 transition">
                          {book.title}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-1">
                          {book.author}
                        </p>

                        {/* Stars */}
                        {book.communityRating ? (
                          <div className="mt-2 flex items-center gap-1.5 text-xs">
                            <div className="flex items-center text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-mono font-bold mr-1 text-stone-900 dark:text-stone-100">
                                {book.communityRating.toFixed(2)}
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-400">
                              ({book.ratingCount})
                            </span>
                          </div>
                        ) : (
                          <span className="mt-2 inline-block text-[11px] text-stone-400">ללא דירוג</span>
                        )}

                        <div className="mt-2 text-[11px] font-mono text-stone-400 flex items-center gap-2">
                          {book.parsedPages && <span>{book.parsedPages} עמ'</span>}
                          {book.parsedYear && <span>{book.parsedYear}</span>}
                        </div>
                      </div>

                    </div>

                    {/* Lists badges */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(book.genres || []).map(g => (
                        <span key={g} className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {g}
                        </span>
                      ))}
                      {(book.publishers || []).slice(0, 2).map(p => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300">
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Personal Note if exists */}
                    {book.personalNote && (
                      <div className="mt-2.5 p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 text-[11px] text-amber-900 dark:text-amber-200">
                        <span className="font-bold ml-1">💡 פתק מסימניה:</span>
                        {book.personalNote}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                    <span className="text-stone-400 text-[11px] truncate max-w-[150px]">
                      {(book.lists || []).slice(0, 1).join(', ')}
                    </span>
                    {book.bookUrl && (
                      <a
                        href={book.bookUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-[11px] text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>סימניה</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
}
