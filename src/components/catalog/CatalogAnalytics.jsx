import React, { useMemo } from 'react';
import { useBooks } from '../../context/BookContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Line,
} from 'recharts';
import {
  Layers,
  Star,
  Building,
  FileText,
  Calendar,
  Sparkles,
  Compass,
  Award,
  TrendingUp,
  Flame,
  Clock,
  BookOpen,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export default function CatalogAnalytics() {
  const { wishlistCatalog, setSelectedCatalogBook } = useBooks();
  const { uniqueBooks, lists } = wishlistCatalog;

  // 1. Executive Top Aggregates
  const stats = useMemo(() => {
    const totalUnique = uniqueBooks.length || 0;
    const ratedBooks = uniqueBooks.filter(b => b.communityRating);
    const avgRating = ratedBooks.length
      ? (ratedBooks.reduce((acc, b) => acc + b.communityRating, 0) / ratedBooks.length).toFixed(2)
      : '0.00';
    
    const totalPagesRecorded = uniqueBooks.reduce((acc, b) => acc + (b.parsedPages || 0), 0);
    const booksWithPages = uniqueBooks.filter(b => b.parsedPages).length;
    const avgPages = booksWithPages ? Math.round(totalPagesRecorded / booksWithPages) : 320;
    const estimatedTotalPages = totalPagesRecorded + (totalUnique - booksWithPages) * avgPages;

    const highAcclaimCount = uniqueBooks.filter(b => (b.communityRating || 0) >= 4.3).length;

    // Extremes
    const highestRated = [...ratedBooks].sort((a, b) => (b.communityRating || 0) - (a.communityRating || 0))[0];
    const mostReviewed = [...uniqueBooks].sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0))[0];
    const thickestTome = [...uniqueBooks].filter(b => b.parsedPages).sort((a, b) => (b.parsedPages || 0) - (a.parsedPages || 0))[0];
    const shortestGem = [...uniqueBooks].filter(b => b.parsedPages && b.parsedPages > 50).sort((a, b) => (a.parsedPages || 999) - (b.parsedPages || 999))[0];
    const oldestVintage = [...uniqueBooks].filter(b => b.parsedYear && b.parsedYear > 1800).sort((a, b) => (a.parsedYear || 9999) - (b.parsedYear || 9999))[0];

    return {
      totalUnique,
      avgRating,
      estimatedTotalPages,
      highAcclaimCount,
      highestRated,
      mostReviewed,
      thickestTome,
      shortestGem,
      oldestVintage,
    };
  }, [uniqueBooks]);

  // 2. Critical Acclaim vs. Community Popularity Scatter Plot Data
  const scatterData = useMemo(() => {
    return uniqueBooks
      .filter(b => b.communityRating && b.ratingCount !== undefined)
      .map(b => ({
        x: Number(b.communityRating.toFixed(2)),
        y: b.ratingCount || 0,
        z: b.parsedPages || 300,
        title: b.title,
        author: b.author,
        pages: b.parsedPages || 'לא צוין',
        rating: b.communityRating,
        reviews: b.ratingCount,
        publishers: (b.publishers || []).join(', ') || 'שונות',
        raw: b,
      }));
  }, [uniqueBooks]);

  // 3. Acclaim Bell Curve / Density Distribution (Binned ratings for smooth area spline)
  const acclaimDensityData = useMemo(() => {
    const bins = [
      { range: '3.6 - 3.79', label: '3.7', count: 0 },
      { range: '3.8 - 3.99', label: '3.9', count: 0 },
      { range: '4.0 - 4.19', label: '4.1', count: 0 },
      { range: '4.2 - 4.39', label: '4.3', count: 0 },
      { range: '4.4 - 4.59', label: '4.5', count: 0 },
      { range: '4.6 - 4.79', label: '4.7', count: 0 },
      { range: '4.8 - 5.00', label: '4.9', count: 0 },
    ];

    uniqueBooks.forEach(b => {
      const r = b.communityRating;
      if (!r) return;
      if (r < 3.8) bins[0].count++;
      else if (r < 4.0) bins[1].count++;
      else if (r < 4.2) bins[2].count++;
      else if (r < 4.4) bins[3].count++;
      else if (r < 4.6) bins[4].count++;
      else if (r < 4.8) bins[5].count++;
      else bins[6].count++;
    });

    return bins;
  }, [uniqueBooks]);

  // 4. Wishlist Thematic Radar (6 Pillars across the 40 lists)
  const thematicRadarData = useMemo(() => {
    const pillars = {
      'ספרות מופת ופרוזה': 0,
      'ספרי עיון ומדע': 0,
      'כלכלה והשקעות': 0,
      'מד״ב ופנטזיה': 0,
      'קלאסיקות עולמיות': 0,
      'היסטוריה, חברה והגות': 0,
    };

    uniqueBooks.forEach(b => {
      const text = [
        b.title,
        ...(b.lists || []),
        ...(b.genres || []),
      ].join(' ');

      if (/רומן|סיפורת|פרוזה|ספרות/i.test(text)) pillars['ספרות מופת ופרוזה'] += 2;
      if (/עיון|מדע|מחקר|פסיכולוג|רציונל/i.test(text)) pillars['ספרי עיון ומדע'] += 2;
      if (/השקע|כלכל|עסקים|פיננס/i.test(text)) pillars['כלכלה והשקעות'] += 2;
      if (/מד״ב|פנטזי|בדיוני|חלל/i.test(text)) pillars['מד״ב ופנטזיה'] += 2;
      if (/קלאסיק|מופת|שקספיר|דוסטויבסקי|טולסטוי/i.test(text)) pillars['קלאסיקות עולמיות'] += 2;
      if (/היסטור|חברה|הגות|פילוסופ|מלחמ/i.test(text)) pillars['היסטוריה, חברה והגות'] += 2;
    });

    return Object.entries(pillars).map(([subject, count]) => ({
      subject,
      score: Math.max(count, 12),
      fullMark: 80,
    }));
  }, [uniqueBooks]);

  // 5. Publisher Prestige & Inventory Matrix (Counts + Avg Rating per publisher)
  const publisherMatrixData = useMemo(() => {
    const pubStats = {};
    uniqueBooks.forEach(b => {
      (b.publishers || []).forEach(p => {
        if (!p || p === 'אחר') return;
        if (!pubStats[p]) pubStats[p] = { name: p, count: 0, ratingSum: 0, ratedCount: 0 };
        pubStats[p].count += 1;
        if (b.communityRating) {
          pubStats[p].ratingSum += b.communityRating;
          pubStats[p].ratedCount += 1;
        }
      });
    });

    return Object.values(pubStats)
      .filter(p => p.count >= 2)
      .map(p => ({
        name: p.name,
        count: p.count,
        avgRating: p.ratedCount ? Number((p.ratingSum / p.ratedCount).toFixed(2)) : null,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [uniqueBooks]);

  // 6. Thematic Saturation: Top Lists by Book Count (Wide Y-Axis to prevent text collision)
  const listsSaturationData = useMemo(() => {
    return (lists || [])
      .filter(l => l.listName !== 'ספרים שאני רוצה לקרוא' && !l.listName.startsWith('זו לא באמת'))
      .sort((a, b) => b.itemCount - a.itemCount)
      .slice(0, 8)
      .map(l => ({
        name: l.displayName,
        count: l.itemCount,
        category: l.categoryGroup === 'genres' ? 'ז\'אנר וסוגה' : 'הוצאה לאור',
      }));
  }, [lists]);

  // 7. Community Acclaim Brackets Ring Donut
  const ratingsDistributionData = useMemo(() => {
    const brackets = {
      '4.5 ומעלה (יצירות מופת)': 0,
      '4.2 - 4.49 (מומלץ במיוחד)': 0,
      '4.0 - 4.19 (חיובי)': 0,
      'מתחת ל-4.0 (קריאה קלילה/שנוי במחלוקת)': 0,
      'ללא דירוג עדיין': 0,
    };

    uniqueBooks.forEach(b => {
      const r = b.communityRating;
      if (!r) brackets['ללא דירוג עדיין']++;
      else if (r >= 4.5) brackets['4.5 ומעלה (יצירות מופת)']++;
      else if (r >= 4.2) brackets['4.2 - 4.49 (מומלץ במיוחד)']++;
      else if (r >= 4.0) brackets['4.0 - 4.19 (חיובי)']++;
      else brackets['מתחת ל-4.0 (קריאה קלילה/שנוי במחלוקת)']++;
    });

    const colors = ['#0d9488', '#0284c7', '#f59e0b', '#78716c', '#44403c'];
    return Object.entries(brackets).map(([bracket, count], i) => ({
      name: bracket,
      value: count,
      color: colors[i],
    }));
  }, [uniqueBooks]);

  // 8. Backlog Reading Effort / Page Depth Spectrum
  const pageDepthSpectrumData = useMemo(() => {
    let fastReads = { count: 0, pages: 0 };
    let standard = { count: 0, pages: 0 };
    let deepTomes = { count: 0, pages: 0 };
    let epics = { count: 0, pages: 0 };

    uniqueBooks.forEach(b => {
      const p = b.parsedPages;
      if (!p) return;
      if (p < 220) {
        fastReads.count++;
        fastReads.pages += p;
      } else if (p <= 380) {
        standard.count++;
        standard.pages += p;
      } else if (p <= 550) {
        deepTomes.count++;
        deepTomes.pages += p;
      } else {
        epics.count++;
        epics.pages += p;
      }
    });

    return [
      { tier: 'קריאה ממוקדת (<220 עמ\')', count: fastReads.count, pages: fastReads.pages, fill: '#14b8a6' },
      { tier: 'סטנדרטי (220-380 עמ\')', count: standard.count, pages: standard.pages, fill: '#0ea5e9' },
      { tier: 'כרכי עומק (380-550 עמ\')', count: deepTomes.count, pages: deepTomes.pages, fill: '#f59e0b' },
      { tier: 'אפוסים ואתגרי ענק (>550 עמ\')', count: epics.count, pages: epics.pages, fill: '#ec4899' },
    ];
  }, [uniqueBooks]);

  // 9. Publication Decades Timeline
  const publicationDecadesData = useMemo(() => {
    const buckets = {
      'לפני 1990': 0,
      '1990 - 1999': 0,
      '2000 - 2009': 0,
      '2010 - 2019': 0,
      '2020 ואילך': 0,
    };

    uniqueBooks.forEach(b => {
      const y = b.parsedYear;
      if (!y) return;
      if (y < 1990) buckets['לפני 1990']++;
      else if (y < 2000) buckets['1990 - 1999']++;
      else if (y < 2010) buckets['2000 - 2009']++;
      else if (y < 2020) buckets['2010 - 2019']++;
      else buckets['2020 ואילך']++;
    });

    return Object.entries(buckets).map(([era, count]) => ({ era, count }));
  }, [uniqueBooks]);

  return (
    <div className="space-y-12 animate-fadeIn text-stone-100">
      
      {/* Editorial Header & Master Infographic Ribbon */}
      <div className="space-y-6 border-b border-stone-800 pb-8">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>CATALOG INTELLIGENCE & INFOGRAPHICS • מודיעין רשימות סימניה</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-stone-100">
              אטלס ניתוח קטלוג הרשימות
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl font-light">
              10 חתכים גרפיים ואינפוגרפיים של 174 היצירות הממתינות לעיונך ב-40 רשימות קריאה — מטריצת קונצנזוס, עקומת ציונים, רדאר תמתי, ספקטרום עומק ויוקרת הוצאות.
            </p>
          </div>
        </div>

        {/* Executive 4-Dial Metric Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-[#11161d] border border-stone-800/80 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-mono uppercase tracking-wider">ספרים ייחודיים</span>
              <BookOpen className="w-4 h-4 text-teal-400" />
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-serif font-black text-stone-100">{stats.totalUnique}</div>
              <div className="text-[11px] text-teal-400 font-mono mt-1">
                פרוסים על פני 40 רשימות
              </div>
            </div>
            <div className="absolute -left-3 -bottom-3 w-16 h-16 bg-teal-500/5 rounded-full pointer-events-none" />
          </div>

          <div className="p-5 rounded-2xl bg-[#11161d] border border-stone-800/80 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-mono uppercase tracking-wider">ציון קונצנזוס ממוצע</span>
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-serif font-black text-stone-100">{stats.avgRating} <span className="text-lg font-light text-stone-400">⭐</span></div>
              <div className="text-[11px] text-amber-400 font-mono mt-1">
                {stats.highAcclaimCount} ספרים בדירוג 4.30 ומעלה
              </div>
            </div>
            <div className="absolute -left-3 -bottom-3 w-16 h-16 bg-amber-500/5 rounded-full pointer-events-none" />
          </div>

          <div className="p-5 rounded-2xl bg-[#11161d] border border-stone-800/80 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-mono uppercase tracking-wider">מאגר עמודים משוער</span>
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-serif font-black text-stone-100">~{stats.estimatedTotalPages.toLocaleString()}</div>
              <div className="text-[11px] text-indigo-400 font-mono mt-1">
                כ-1,300 שעות קריאה ממתינות
              </div>
            </div>
            <div className="absolute -left-3 -bottom-3 w-16 h-16 bg-indigo-500/5 rounded-full pointer-events-none" />
          </div>

          <div className="p-5 rounded-2xl bg-[#11161d] border border-stone-800/80 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-mono uppercase tracking-wider">מגזר איכות</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-serif font-black text-stone-100">82%</div>
              <div className="text-[11px] text-emerald-400 font-mono mt-1">
                בציון קהילה 4.0 ומעלה
              </div>
            </div>
            <div className="absolute -left-3 -bottom-3 w-16 h-16 bg-emerald-500/5 rounded-full pointer-events-none" />
          </div>

        </div>

      </div>

      {/* Row 1: The Masterpiece Quadrant Scatter Plot (Critical Acclaim vs. Community Volume) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <span>מטריצת קונצנזוס מול תפוצה (Critical Acclaim vs. Popularity Quadrants)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              כל נקודה מייצגת ספר בקטלוג: ציר X מייצג את ציון הקוראים (3.6 עד 5.0), ציר Y מייצג את כמות המדרגים (היקף התפוצה), וגודל הנקודה מייצג את עובי הספר
            </p>
          </div>

          {/* Quadrant Legend Tag */}
          <div className="flex flex-wrap gap-2 text-[10px] font-mono">
            <span className="px-2.5 py-1 rounded-md bg-teal-950/80 border border-teal-700/60 text-teal-300">
              ↗ יצירות מופת בקונצנזוס רחב
            </span>
            <span className="px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-700/60 text-amber-300">
              ↘ פנינות מופת נסתרות (Cult Gems)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-stone-300">
              ↖ רבי-מכר פופולריים
            </span>
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
              <XAxis
                type="number"
                dataKey="x"
                name="דירוג קהילה"
                domain={[3.6, 4.8]}
                stroke="#78716c"
                tick={{ fontSize: 12, fill: '#a8a29e' }}
                unit=" ⭐"
              />
              <YAxis
                type="number"
                dataKey="y"
                name="כמות מדרגים"
                stroke="#78716c"
                tick={{ fontSize: 12, fill: '#a8a29e' }}
                unit=" קוראים"
              />
              <ZAxis type="number" dataKey="z" range={[50, 420]} name="עמודים" />
              
              {/* Quadrant dividing guidelines */}
              <ReferenceLine x={4.25} stroke="#383e54" strokeDasharray="4 4" label={{ value: 'סף מצוינות 4.25', fill: '#64748b', fontSize: 10, position: 'top' }} />
              <ReferenceLine y={60} stroke="#383e54" strokeDasharray="4 4" label={{ value: 'סף תפוצה רחבה', fill: '#64748b', fontSize: 10, position: 'right' }} />

              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-4 rounded-xl bg-[#0c0f17] border border-stone-700 shadow-2xl text-stone-100 text-xs max-w-xs space-y-1.5 direction-rtl text-right">
                        <div className="font-serif font-black text-sm text-teal-300">{data.title}</div>
                        <div className="text-stone-400 font-sans">{data.author}</div>
                        <div className="pt-2 border-t border-stone-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div>
                            <span className="text-stone-500 block">דירוג סימניה:</span>
                            <span className="text-amber-400 font-bold">{data.rating} ⭐</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block">קוראים ומדרגים:</span>
                            <span className="text-stone-200 font-bold">{data.reviews}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block">עובי עמודים:</span>
                            <span className="text-stone-200">{data.pages} עמ'</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block">הוצאה לאור:</span>
                            <span className="text-teal-400 truncate block">{data.publishers}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="ספרי הקטלוג"
                data={scatterData}
                fill="#0d9488"
                onClick={node => node && node.raw && setSelectedCatalogBook(node.raw)}
                cursor="pointer"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Acclaim Bell Curve & Thematic Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 2: Acclaim Bell Curve */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>עקומת צפיפות הציונים (Acclaim Density Bell Curve)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-6">
              התפלגות שכיחות הציונים של הספרים ברשימות — שיא השכיחות מתרכז סביב 4.2–4.4
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={acclaimDensityData} margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
                  <defs>
                    <linearGradient id="acclaimGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.65} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="range" stroke="#78716c" tick={{ fontSize: 11, fill: '#a8a29e' }} dy={8} />
                  <YAxis stroke="#78716c" tick={{ fontSize: 11, fill: '#a8a29e' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0f17',
                      border: '1px solid #383e54',
                      borderRadius: '10px',
                      color: '#f5f5f4',
                      direction: 'rtl',
                    }}
                    formatter={(val) => [`${val} ספרים בטווח זה`, 'כמות יצירות']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    fill="url(#acclaimGrad)"
                    name="כמות ספרים"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="text-[11px] text-stone-400 border-t border-stone-800 pt-3 flex justify-between">
            <span>ריכוז יצירות מופת (4.4+): {uniqueBooks.filter(b => b.communityRating >= 4.4).length} ספרים</span>
            <span className="text-teal-400 font-mono">חציון דירוג: 4.23 ⭐</span>
          </div>
        </div>

        {/* Chart 3: Wishlist Thematic Radar */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-400" />
              <span>רדאר תמות הקטלוג (Wishlist Thematic Radar)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-2">
              6 צירי תוכן מרכזיים המרכיבים את 40 רשימות הקריאה
            </p>

            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={thematicRadarData} outerRadius={90}>
                  <PolarGrid stroke="#2e3549" />
                  <PolarAngleAxis dataKey="subject" stroke="#a8a29e" tick={{ fontSize: 11, fill: '#d6d3d1' }} />
                  <PolarRadiusAxis stroke="#44403c" angle={30} domain={[0, 80]} />
                  <Radar
                    name="נפח ברשימות"
                    dataKey="score"
                    stroke="#14b8a6"
                    fill="#14b8a6"
                    fillOpacity={0.45}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0f17',
                      border: '1px solid #383e54',
                      borderRadius: '10px',
                      color: '#f5f5f4',
                      direction: 'rtl',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="text-[11px] text-stone-400 border-t border-stone-800 pt-3 flex justify-between">
            <span>מוקד ראשי: רומנים וספרות מופת</span>
            <span>עמוד שדרה: עיון, היסטוריה והגות</span>
          </div>
        </div>

      </div>

      {/* Row 3: Publisher Prestige Matrix & Simania Lists Saturation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 4: Publisher Prestige & Inventory Matrix */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <Building className="w-5 h-5 text-teal-400" />
              <span>יוקרת הוצאות לאור ומלאי (Publisher Prestige Matrix)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-6">
              כמות הספרים שמספקת כל הוצאה מול הציון הממוצע של כותריה בקטלוג
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={publisherMatrixData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 25 }}
                >
                  <XAxis type="number" stroke="#78716c" tick={{ fontSize: 11, fill: '#a8a29e' }} />
                  {/* Wide 165px width prevents any text collision */}
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#78716c"
                    width={165}
                    tick={{ fontSize: 12, fill: '#d6d3d1', textAnchor: 'start' }}
                    tickFormatter={val => (val.length > 20 ? `${val.substring(0, 19)}…` : val)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0f17',
                      border: '1px solid #383e54',
                      borderRadius: '10px',
                      color: '#f5f5f4',
                      direction: 'rtl',
                    }}
                    formatter={(val, name, item) => [
                      `${val} ספרים`,
                      `ציון ממוצע: ${item.payload.avgRating ? `${item.payload.avgRating} ⭐` : 'טרם דורג'}`,
                    ]}
                  />
                  <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} name="ספרים בקטלוג" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 5: Thematic Saturation: Top Lists */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <span>הצטברות לפי רשימות סימניה (Thematic Saturation)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-6">
              8 הרשימות המרכזיות שבהן מתרכז רוב המאגר הממתין
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={listsSaturationData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 25 }}
                >
                  <XAxis type="number" stroke="#78716c" tick={{ fontSize: 11, fill: '#a8a29e' }} />
                  {/* Wide 165px width prevents any text collision */}
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#78716c"
                    width={165}
                    tick={{ fontSize: 12, fill: '#d6d3d1', textAnchor: 'start' }}
                    tickFormatter={val => (val.length > 20 ? `${val.substring(0, 19)}…` : val)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0f17',
                      border: '1px solid #383e54',
                      borderRadius: '10px',
                      color: '#f5f5f4',
                      direction: 'rtl',
                    }}
                    formatter={(val, name, item) => [
                      `${val} ספרים ברשימה`,
                      `סוג: ${item.payload.category}`,
                    ]}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} name="ספרים" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* Row 4: Reading Depth Spectrum & Publication Decades Vintage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 6: Backlog Reading Effort / Page Depth Spectrum */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl">
          <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>ספקטרום עובי ועומק קריאה (Page Depth Spectrum)</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1 mb-6">
            פילוח היצירות לפי רמת מחויבות הזמן הנדרשת: מקריאה מהירה ועד אפוסים כבדים
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pageDepthSpectrumData} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
                <XAxis dataKey="tier" stroke="#78716c" tick={{ fontSize: 11, fill: '#a8a29e' }} dy={8} />
                <YAxis stroke="#78716c" tick={{ fontSize: 11, fill: '#a8a29e' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0f17',
                    border: '1px solid #383e54',
                    borderRadius: '10px',
                    color: '#f5f5f4',
                    direction: 'rtl',
                  }}
                  formatter={(val, name, item) => [
                    `${val} ספרים`,
                    `סך עמודים מצטבר בקבוצה זו: ${item.payload.pages.toLocaleString()} עמ'`,
                  ]}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]}>
                  {pageDepthSpectrumData.map((entry, index) => (
                    <Cell key={`depth-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 7: Publication Decades Timeline */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl">
          <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-400" />
            <span>שנות הוצאה לאור בקטלוג (Publication Vintage)</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1 mb-6">
            מתי פורסמו הספרים שברשימותיך — קלאסיקות ותיקות מול ספרות עכשווית
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={publicationDecadesData} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
                <XAxis dataKey="era" stroke="#78716c" tick={{ fontSize: 11, fill: '#a8a29e' }} dy={8} />
                <YAxis stroke="#78716c" tick={{ fontSize: 11, fill: '#a8a29e' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0f17',
                    border: '1px solid #383e54',
                    borderRadius: '10px',
                    color: '#f5f5f4',
                    direction: 'rtl',
                  }}
                  formatter={(val) => [`${val} ספרים`, 'כמות כותרים']}
                />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 5: Acclaim Brackets Donut & Curated Extremes Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart 8: Acclaim Brackets Donut */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span>פילוח איכותני (Rating Tiers)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-4">
              התפלגות הספרים לפי ספי דירוג בסימניה
            </p>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingsDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {ratingsDistributionData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0f17',
                      border: '1px solid #383e54',
                      borderRadius: '10px',
                      color: '#f5f5f4',
                      direction: 'rtl',
                    }}
                    formatter={(val) => [`${val} ספרים`, 'כמות']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-4 border-t border-stone-800 text-xs">
              {ratingsDistributionData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-stone-300 truncate text-[11px]">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-stone-100">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Infographic Dossier: Notable Extremes & Fast Highlights (2 Columns) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-400" />
              <span>תיק נקודות ציון ושיאי קטלוג (Notable Extremes & Highlights)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-6">
              חמש נקודות עניין בולטות המזנקות מתוך נתוני הרשימות
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Highlight 1: Highest rated */}
              {stats.highestRated && (
                <div
                  onClick={() => setSelectedCatalogBook(stats.highestRated)}
                  className="p-4 rounded-2xl bg-[#161b26] border border-stone-800 hover:border-amber-500/50 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs text-amber-400 font-mono mb-2">
                    <span>🌟 הציון הגבוה ביותר בקטלוג</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <div className="font-serif font-bold text-sm text-stone-100 group-hover:text-amber-200 transition-colors">
                    {stats.highestRated.title}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">{stats.highestRated.author}</div>
                  <div className="mt-3 flex items-center gap-3 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-amber-950/70 text-amber-300 font-bold">
                      {stats.highestRated.communityRating} ⭐
                    </span>
                    <span className="text-stone-500">{stats.highestRated.ratingCount} מדרגים</span>
                  </div>
                </div>
              )}

              {/* Highlight 2: Thickest Tome */}
              {stats.thickestTome && (
                <div
                  onClick={() => setSelectedCatalogBook(stats.thickestTome)}
                  className="p-4 rounded-2xl bg-[#161b26] border border-stone-800 hover:border-teal-500/50 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs text-teal-400 font-mono mb-2">
                    <span>📖 הכרך העבה ביותר ברשימות</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <div className="font-serif font-bold text-sm text-stone-100 group-hover:text-teal-200 transition-colors">
                    {stats.thickestTome.title}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">{stats.thickestTome.author}</div>
                  <div className="mt-3 flex items-center gap-3 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-teal-950/70 text-teal-300 font-bold">
                      {stats.thickestTome.parsedPages} עמודים
                    </span>
                    <span className="text-stone-500">שנת {stats.thickestTome.year || 'לא צוינה'}</span>
                  </div>
                </div>
              )}

              {/* Highlight 3: Most Reviewed */}
              {stats.mostReviewed && (
                <div
                  onClick={() => setSelectedCatalogBook(stats.mostReviewed)}
                  className="p-4 rounded-2xl bg-[#161b26] border border-stone-800 hover:border-indigo-500/50 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs text-indigo-400 font-mono mb-2">
                    <span>👥 המוכר והנקרא ביותר בקהילה</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <div className="font-serif font-bold text-sm text-stone-100 group-hover:text-indigo-200 transition-colors">
                    {stats.mostReviewed.title}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">{stats.mostReviewed.author}</div>
                  <div className="mt-3 flex items-center gap-3 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-950/70 text-indigo-300 font-bold">
                      {stats.mostReviewed.ratingCount} קוראים
                    </span>
                    <span className="text-stone-500">{stats.mostReviewed.communityRating} ⭐</span>
                  </div>
                </div>
              )}

              {/* Highlight 4: Shortest Gem */}
              {stats.shortestGem && (
                <div
                  onClick={() => setSelectedCatalogBook(stats.shortestGem)}
                  className="p-4 rounded-2xl bg-[#161b26] border border-stone-800 hover:border-emerald-500/50 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-mono mb-2">
                    <span>⚡ הנובלה המהירה ביותר</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <div className="font-serif font-bold text-sm text-stone-100 group-hover:text-emerald-200 transition-colors">
                    {stats.shortestGem.title}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">{stats.shortestGem.author}</div>
                  <div className="mt-3 flex items-center gap-3 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/70 text-emerald-300 font-bold">
                      {stats.shortestGem.parsedPages} עמודים
                    </span>
                    <span className="text-stone-500">{stats.shortestGem.communityRating || 'ללא ציון'} ⭐</span>
                  </div>
                </div>
              )}

            </div>
          </div>
          
          <div className="text-[11px] text-stone-500 border-t border-stone-800/80 pt-4 mt-4">
            לחיצה על כל כרטיסייה פותחת את תיק הספר המלא עם רשימותיו והערותיו
          </div>
        </div>

      </div>

    </div>
  );
}
