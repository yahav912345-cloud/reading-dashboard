import React, { useState, useEffect } from 'react';
import { useBooks } from '../../context/BookContext';
import {
  X,
  PlusCircle,
  Sparkles,
  BookMarked,
  Search,
  Check,
  Loader2,
} from 'lucide-react';
import { fetchBookMetadata } from '../../utils/bookSearchApi';

export default function AddArchiveBookModal() {
  const { isAddArchiveBookOpen, setIsAddArchiveBookOpen, addArchiveBook } = useBooks();

  // Form states
  const [titleInput, setTitleInput] = useState('');
  const [canonicalTitle, setCanonicalTitle] = useState('');
  const [englishTitle, setEnglishTitle] = useState('');
  const [authorHebrew, setAuthorHebrew] = useState('');
  const [authorOriginal, setAuthorOriginal] = useState('');
  const [translator, setTranslator] = useState('');
  const [publisher, setPublisher] = useState('');
  const [yearRead, setYearRead] = useState(new Date().getFullYear());
  const [origPubYear, setOrigPubYear] = useState('');
  const [hebrewEditionYear, setHebrewEditionYear] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [bookType, setBookType] = useState('פרוזה');
  const [genres, setGenres] = useState('');
  const [themes, setThemes] = useState('');
  const [isSeries, setIsSeries] = useState(false);
  const [seriesName, setSeriesName] = useState('');
  const [volumeNumber, setVolumeNumber] = useState('');
  const [origLanguage, setOrigLanguage] = useState('עברית');
  const [format, setFormat] = useState('ספר מודפס');
  const [coverUrl, setCoverUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-mining search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [autoMinedApplied, setAutoMinedApplied] = useState(false);

  // Debounced auto-mining lookup on title change
  useEffect(() => {
    if (!titleInput || titleInput.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await fetchBookMetadata(titleInput);
        setSearchResults(results);
      } catch (err) {
        console.warn('Metadata lookup error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [titleInput]);

  if (!isAddArchiveBookOpen) return null;

  // Apply mined metadata from a candidate
  const handleApplyCandidate = (candidate) => {
    setCanonicalTitle(candidate.title || titleInput);
    if (candidate.authors) setAuthorHebrew(candidate.authors);
    if (candidate.publisher) setPublisher(candidate.publisher);
    if (candidate.publishedYear) {
      setOrigPubYear(candidate.publishedYear);
      setHebrewEditionYear(candidate.publishedYear);
    }
    if (candidate.pageCount) setPageCount(candidate.pageCount);
    if (candidate.coverUrl) setCoverUrl(candidate.coverUrl);
    if (candidate.language) setOrigLanguage(candidate.language);
    if (candidate.categories && candidate.categories.length) {
      setGenres(candidate.categories.join(', '));
    }
    setAutoMinedApplied(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canonicalTitle && !titleInput) return;

    addArchiveBook({
      input_title: titleInput.trim(),
      canonical_title: (canonicalTitle || titleInput).trim(),
      english_title: englishTitle.trim() || null,
      author_hebrew: authorHebrew.trim() || 'לא ידוע',
      author_original: authorOriginal.trim() || null,
      translator: translator.trim() || null,
      publisher: publisher.trim() || 'לא צוין',
      year_read: Number(yearRead) || new Date().getFullYear(),
      original_pub_year: origPubYear ? Number(origPubYear) : null,
      hebrew_edition_year: hebrewEditionYear ? Number(hebrewEditionYear) : null,
      page_count: pageCount ? Number(pageCount) : null,
      type: bookType,
      genres: genres ? genres.split(',').map(s => s.trim()).filter(Boolean) : ['כללי'],
      themes: themes ? themes.split(',').map(s => s.trim()).filter(Boolean) : [],
      is_series: isSeries,
      series_name: isSeries ? seriesName.trim() : null,
      volume_number: isSeries && volumeNumber ? Number(volumeNumber) : null,
      orig_language: origLanguage,
      format: format,
      cover_url: coverUrl.trim() || null,
      notes: notes.trim(),
    });

    setIsAddArchiveBookOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAddArchiveBookOpen(false)}
          className="absolute top-5 left-5 p-2 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center shadow-xs">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
              רישום כרך חדש בארכיון הקריאה
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              הזנת כותרת מפעילה כריית נתונים אוטומטית (Google Books API)
            </p>
          </div>
        </div>

        {/* Step 1: Title input with automatic metadata auto-mining */}
        <div className="mb-6 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
          <label className="block text-xs font-serif font-bold text-stone-800 dark:text-stone-200 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>הזן שם ספר להפעלת כריית נתונים אוטומטית:</span>
            </span>
            {isSearching && (
              <span className="flex items-center gap-1 text-[11px] font-sans text-amber-700 dark:text-amber-400 font-normal">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>כורה מטא-דאטה...</span>
              </span>
            )}
          </label>

          <input
            type="text"
            value={titleInput}
            onChange={e => {
              setTitleInput(e.target.value);
              if (!canonicalTitle) setCanonicalTitle(e.target.value);
            }}
            placeholder="הקלד שם ספר בעברית או באנגלית..."
            className="w-full rounded-xl py-2 px-3 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 font-medium text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-stone-400"
          />

          {/* Mining candidates suggestions */}
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2">
              <span className="text-[11px] font-mono text-stone-500 block">
                נמצאו תוצאות בכרייה אוטומטית — לחץ למילוי מיידי:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.slice(0, 3).map((res, i) => (
                  <button
                    key={res.id || i}
                    type="button"
                    onClick={() => handleApplyCandidate(res)}
                    className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-right hover:border-amber-600 text-xs transition flex gap-2.5 items-center group"
                  >
                    {res.coverUrl && (
                      <img src={res.coverUrl} alt="" className="w-8 h-11 object-cover rounded shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-bold font-serif truncate text-stone-900 dark:text-stone-100 group-hover:text-amber-700">
                        {res.title}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate">
                        {res.authors} {res.publishedYear ? `(${res.publishedYear})` : ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {autoMinedApplied && (
            <div className="mt-2 text-[11px] text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>נתוני הכרייה מולאו בהצלחה! באפשרותך לערוך או להשלים ידנית.</span>
            </div>
          )}
        </div>

        {/* Step 2: Detailed fields form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                שם קנוני בעברית *
              </label>
              <input
                type="text"
                required
                value={canonicalTitle}
                onChange={e => setCanonicalTitle(e.target.value)}
                className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                שם באנגלית (אם קיים)
              </label>
              <input
                type="text"
                value={englishTitle}
                onChange={e => setEnglishTitle(e.target.value)}
                className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-medium"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                מחבר בעברית
              </label>
              <input
                type="text"
                value={authorHebrew}
                onChange={e => setAuthorHebrew(e.target.value)}
                className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                מחבר במקור
              </label>
              <input
                type="text"
                value={authorOriginal}
                onChange={e => setAuthorOriginal(e.target.value)}
                className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-medium"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                מתרגם
              </label>
              <input
                type="text"
                value={translator}
                onChange={e => setTranslator(e.target.value)}
                className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                הוצאה לאור
              </label>
              <input
                type="text"
                value={publisher}
                onChange={e => setPublisher(e.target.value)}
                className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                שנת קריאה *
              </label>
              <input
                type="number"
                min="2010"
                max="2035"
                value={yearRead}
                onChange={e => setYearRead(e.target.value)}
                className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                שנת כתיבה מקורית
              </label>
              <input
                type="number"
                value={origPubYear}
                onChange={e => setOrigPubYear(e.target.value)}
                className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                מספר עמודים
              </label>
              <input
                type="number"
                min="1"
                value={pageCount}
                onChange={e => setPageCount(e.target.value)}
                className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-medium"
              />
            </div>
          </div>

          {/* Series toggle & details */}
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isSeriesCheck"
                checked={isSeries}
                onChange={e => setIsSeries(e.target.checked)}
                className="w-4 h-4 rounded text-stone-900 focus:ring-stone-400"
              />
              <label htmlFor="isSeriesCheck" className="font-semibold text-stone-800 dark:text-stone-200 cursor-pointer">
                הכרך הוא חלק מסדרה (Series Volume)
              </label>
            </div>

            {isSeries && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">שם הסדרה</label>
                  <input
                    type="text"
                    value={seriesName}
                    onChange={e => setSeriesName(e.target.value)}
                    placeholder="למשל: דברי ימי קליפטון"
                    className="w-full rounded-lg py-1.5 px-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">מספר כרך</label>
                  <input
                    type="number"
                    min="1"
                    value={volumeNumber}
                    onChange={e => setVolumeNumber(e.target.value)}
                    placeholder="למשל: 4"
                    className="w-full rounded-lg py-1.5 px-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                סוגה (פרוזה / עיון)
              </label>
              <select
                value={bookType}
                onChange={e => setBookType(e.target.value)}
                className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
              >
                <option value="פרוזה">פרוזה (סיפורת)</option>
                <option value="עיון">עיון ומדע</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                שפת מקור
              </label>
              <select
                value={origLanguage}
                onChange={e => setOrigLanguage(e.target.value)}
                className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
              >
                <option value="עברית">עברית</option>
                <option value="אנגלית">אנגלית</option>
                <option value="רוסית">רוסית</option>
                <option value="צרפתית">צרפתית</option>
                <option value="גרמנית">גרמנית</option>
                <option value="הולנדית">הולנדית</option>
                <option value="ספרדית">ספרדית</option>
                <option value="פולנית">פולנית</option>
                <option value="אחר">אחר</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                פורמט קריאה
              </label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value)}
                className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
              >
                <option value="ספר מודפס">ספר מודפס</option>
                <option value="דיגיטלי / קינדל">דיגיטלי / קינדל</option>
                <option value="קריאה ברשת">קריאה ברשת</option>
                <option value="אודיו / שמע">אודיו / שמע</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                ז'אנרים (מופרדים בפסיקים)
              </label>
              <input
                type="text"
                value={genres}
                onChange={e => setGenres(e.target.value)}
                placeholder="מדע בדיוני, פנטזיה, היסטוריה..."
                className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
                תמות ורעיונות מרכזיים (מופרדים בפסיקים)
              </label>
              <input
                type="text"
                value={themes}
                onChange={e => setThemes(e.target.value)}
                placeholder="רציונליות, אתיקה, כלכלה התנהגותית..."
                className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-600 dark:text-stone-300 mb-1">
              הערות ורשמים אישיים
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="רשמים אישיים, ציטוט או הקשר..."
              className="w-full rounded-xl py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 resize-none font-sans"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900 transition shadow-xs"
            >
              שמור כרך בארכיון הקריאה
            </button>
            <button
              type="button"
              onClick={() => setIsAddArchiveBookOpen(false)}
              className="py-2.5 px-5 rounded-xl text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
            >
              ביטול
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
