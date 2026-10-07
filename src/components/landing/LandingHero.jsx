import React from 'react';
import { useBooks } from '../../context/BookContext';
import {
  BookMarked,
  Layers,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Library,
  Compass,
  Building,
  Globe2,
  FileText,
  Clock,
  Star,
  BarChart3,
} from 'lucide-react';

export default function LandingHero() {
  const { setActiveDomain, archiveBooks, wishlistCatalog } = useBooks();

  const totalPages = archiveBooks.reduce((acc, b) => acc + (b.page_count || 0), 0);
  const seriesVolumesCount = archiveBooks.filter(b => b.is_series).length;
  const highRatedWishlistCount = wishlistCatalog.uniqueBooks.filter(b => (b.communityRating || 0) >= 4.3).length;

  return (
    <div className="relative -mt-6 sm:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden animate-fadeIn">
      
      {/* Grand Cinematic Hero Section */}
      <div className="relative min-h-[82vh] lg:min-h-[88vh] flex flex-col justify-between text-white">
        
        {/* Background Image with Dark Vignette Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/grand_library_hero.jpg`}
            alt="Grand Library"
            className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.08] scale-[1.02]"
          />
          {/* Multi-layered editorial scrim for ultimate readability and mood */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-[#0c0f17]/75 to-[#0c0f17]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f17]/90 via-[#0c0f17]/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0c0f17]/30 to-[#0c0f17]/90" />
        </div>

        {/* Hero Top Tagline & Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-12 sm:pt-24 pb-8 sm:pb-12 w-full flex-1 flex flex-col justify-center">
          
          <div className="max-w-3xl">
            
            {/* Editorial Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-stone-900/80 border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-mono tracking-widest uppercase mb-4 sm:mb-6 backdrop-blur-md shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>BIBLIOTHECA • כתב עת ביבליוגרפי אישי</span>
            </div>

            {/* Monumental Headline */}
            <h1 className="font-serif font-black text-3xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.08] text-stone-100 drop-shadow-md">
              ספריית מצע קריאה
            </h1>

            <p className="font-sans text-xs sm:text-lg lg:text-xl text-stone-300 mt-3 sm:mt-4 leading-relaxed font-light max-w-2xl text-balance">
              מרחב ביבליוגרפי יוקרתי המפריד לחלוטין בין ארכיון הכרכים שקראת לבין קטלוג היצירות הממתינות לעיונך. כל כרך מתועד, כל סדרה מפוענחת, וכל רשימה מנותחת לעומקה.
            </p>

            {/* Editorial Ribbons / Micro-Stats */}
            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-stone-200/20 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs font-mono text-stone-300">
              <div>
                <span className="block text-stone-400 text-[10px] sm:text-[11px]">כרכים שנקראו</span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-amber-200">{archiveBooks.length}</span>
              </div>
              <div>
                <span className="block text-stone-400 text-[10px] sm:text-[11px]">עמודים מתועדים</span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-amber-200">{totalPages.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-stone-400 text-[10px] sm:text-[11px]">ספרים ברשימות</span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-teal-300">{wishlistCatalog.uniqueBooks.length}</span>
              </div>
              <div>
                <span className="block text-stone-400 text-[10px] sm:text-[11px]">רשימות סימניה</span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-teal-300">{wishlistCatalog.lists.length}</span>
              </div>
            </div>

          </div>

        </div>

        {/* The Two Grand Portals (Interactive Gateway Cards) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pb-12 sm:pb-16 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
            
            {/* Portal Card 1: The Reading Archive */}
            <div
              onClick={() => setActiveDomain('archive')}
              className="group relative p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-stone-900/90 via-stone-900/80 to-[#1c1917]/90 border border-amber-500/30 hover:border-amber-400/80 shadow-2xl backdrop-blur-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors duration-300 shadow-md">
                  <BookMarked className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span className="text-[11px] sm:text-xs font-mono text-amber-300/80 bg-amber-950/60 px-2.5 sm:px-3 py-1 rounded-full border border-amber-800/50">
                  {archiveBooks.length} כרכים מאומתים
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl font-serif font-black text-stone-100 group-hover:text-amber-200 transition-colors">
                ארכיון הקריאה המתועד
              </h2>

              <p className="text-xs sm:text-sm text-stone-300/90 mt-2.5 leading-relaxed font-sans">
                יומן קריאה היסטורי ומפורט: כרכי סדרות מפורקים (HPMOR, קליפטון, סנדמן), ספקטרום עומק ומשקל, טביעת אצבע מו"לית, שפות מקור וציר תקופות כתיבה היסטוריות.
              </p>

              <div className="mt-5 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono text-stone-400">
                <span className="px-2 sm:px-2.5 py-1 rounded-md bg-stone-800/80 border border-stone-700/60">
                  {seriesVolumesCount} כרכי סדרות
                </span>
                <span className="px-2 sm:px-2.5 py-1 rounded-md bg-stone-800/80 border border-stone-700/60">
                  ספקטרום משקל ועומק
                </span>
                <span className="px-2 sm:px-2.5 py-1 rounded-md bg-stone-800/80 border border-stone-700/60">
                  כרייה אוטומטית בהקלדה
                </span>
              </div>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-stone-800 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>כניסה ישירה לאטלס הגרפים והניתוחים</span>
                </div>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Portal Card 2: The Curated Wishlist Catalog */}
            <div
              onClick={() => setActiveDomain('catalog')}
              className="group relative p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-stone-900/90 via-stone-900/80 to-[#0f2420]/90 border border-teal-500/30 hover:border-teal-400/80 shadow-2xl backdrop-blur-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-stone-950 transition-colors duration-300 shadow-md">
                  <Layers className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span className="text-[11px] sm:text-xs font-mono text-teal-300/80 bg-teal-950/60 px-2.5 sm:px-3 py-1 rounded-full border border-teal-800/50">
                  174 ספרים ב-40 רשימות
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl font-serif font-black text-stone-100 group-hover:text-teal-200 transition-colors">
                קטלוג רשימות סימניה
              </h2>

              <p className="text-xs sm:text-sm text-stone-300/90 mt-2.5 leading-relaxed font-sans">
                מדפי הרשימות מסימניה מסווגים לפי סוגות, ז'אנרים והוצאות לאור. כריכות מקוריות, ציוני קהילה, הערות אישיות ובורר קריאה מושכל לפי קריטריונים.
              </p>

              <div className="mt-5 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono text-stone-400">
                <span className="px-2 sm:px-2.5 py-1 rounded-md bg-stone-800/80 border border-stone-700/60">
                  {highRatedWishlistCount} ספרים בדירוג 4.3+ ⭐
                </span>
                <span className="px-2 sm:px-2.5 py-1 rounded-md bg-stone-800/80 border border-stone-700/60">
                  30+ הוצאות לאור
                </span>
                <span className="px-2 sm:px-2.5 py-1 rounded-md bg-stone-800/80 border border-stone-700/60">
                  בורר החלטה מושכל
                </span>
              </div>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-stone-800 flex items-center justify-between text-xs font-bold text-teal-400 group-hover:text-teal-300">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-teal-400" />
                  <span>כניסה ישירה לניתוח הקטלוג והגרפים</span>
                </div>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
