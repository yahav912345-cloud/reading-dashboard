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
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
} from 'recharts';
import {
  FileText,
  Building2,
  Globe2,
  Clock,
  Tags,
  Layers,
  TrendingUp,
  BookmarkCheck,
  BookMarked,
  Flame,
  Compass,
  Sparkles,
  Zap,
  Activity,
  Award,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export default function ArchiveAnalyticsAtlas() {
  const { archiveBooks, setSelectedArchiveBook } = useBooks();

  // 1. Cumulative Page Acceleration (S-Curve over the years)
  const cumulativeVelocityData = useMemo(() => {
    const yMap = {};
    archiveBooks.forEach(b => {
      const yr = b.year_read || 2024;
      if (!yMap[yr]) yMap[yr] = { year: String(yr), pages: 0, volumes: 0 };
      yMap[yr].pages += (b.page_count || 0);
      yMap[yr].volumes += 1;
    });

    const sorted = Object.values(yMap).sort((a, b) => Number(a.year) - Number(b.year));
    let cumPages = 0;
    let cumVols = 0;

    return sorted.map(item => {
      cumPages += item.pages;
      cumVols += item.volumes;
      return {
        year: item.year,
        yearlyPages: item.pages,
        yearlyVolumes: item.volumes,
        cumulativePages: cumPages,
        cumulativeVolumes: cumVols,
      };
    });
  }, [archiveBooks]);

  // 2. Intellectual Thematic Radar (6 Core Intellectual Pillars)
  const thematicRadarData = useMemo(() => {
    const pillarScores = {
      'רציונליות ושיטה': 0,
      'כלכלה ותורת משחקים': 0,
      'היסטוריה ומלחמה': 0,
      'פילוסופיה ואתיקה': 0,
      'מד״ב ופנטזיה': 0,
      'פסיכולוגיה וחברה': 0,
    };

    archiveBooks.forEach(b => {
      const combined = [
        ...(b.themes || []),
        ...(b.genres || []),
        b.type,
      ].join(' ');

      if (/רציונל|מדע|בינה|שיטה/i.test(combined)) pillarScores['רציונליות ושיטה'] += 2;
      if (/כלכל|משחק|השקע|פיננס/i.test(combined)) pillarScores['כלכלה ותורת משחקים'] += 2;
      if (/היסטור|מלחמ|כירורג|פוליטיק/i.test(combined)) pillarScores['היסטוריה ומלחמה'] += 2;
      if (/פילוסופ|אתיק|צדק|מוסר/i.test(combined)) pillarScores['פילוסופיה ואתיקה'] += 2;
      if (/בדיוני|פנטזי|מד״ב|ספקולטיב/i.test(combined)) pillarScores['מד״ב ופנטזיה'] += 2;
      if (/פסיכולוג|התנהגות|חבר|אוטוביוגרפ/i.test(combined)) pillarScores['פסיכולוגיה וחברה'] += 2;
    });

    return Object.entries(pillarScores).map(([subject, score]) => ({
      subject,
      score: Math.max(score, 4), // visual floor for aesthetic polygon
      fullMark: 30,
    }));
  }, [archiveBooks]);

  // 3. Historical Chronology vs. Tome Thickness Scatter Plot
  const historicalScatterData = useMemo(() => {
    return archiveBooks
      .filter(b => b.original_pub_year && b.original_pub_year >= 1800 && b.page_count)
      .map(b => ({
        x: b.original_pub_year,
        y: b.page_count,
        z: b.page_count,
        title: b.canonical_title,
        author: b.author_hebrew,
        yearRead: b.year_read,
        genre: (b.genres || []).join(', ') || b.type,
        raw: b,
      }));
  }, [archiveBooks]);

  // 4. Book Density Spectrum: Novellas (<200p), Standard (200-450p), Tomes (>450p)
  const densityByYearData = useMemo(() => {
    const yearsMap = {};
    archiveBooks.forEach(b => {
      const yr = b.year_read || 2024;
      if (!yearsMap[yr]) {
        yearsMap[yr] = { year: String(yr), novella: 0, standard: 0, tome: 0, unrecorded: 0 };
      }
      const p = b.page_count;
      if (!p) {
        yearsMap[yr].unrecorded++;
      } else if (p < 200) {
        yearsMap[yr].novella++;
      } else if (p <= 450) {
        yearsMap[yr].standard++;
      } else {
        yearsMap[yr].tome++;
      }
    });

    return Object.values(yearsMap).sort((a, b) => Number(a.year) - Number(b.year));
  }, [archiveBooks]);

  // 5. Publishing House Specialization Matrix (Prose vs Non-Fiction)
  const publisherFingerprintData = useMemo(() => {
    const pubMap = {};
    archiveBooks.forEach(b => {
      const pub = (b.publisher || 'אחר').replace(/\(.*?\)/g, '').trim();
      if (!pub || pub === 'לא צוין') return;
      if (!pubMap[pub]) pubMap[pub] = { publisher: pub, prose: 0, nonFiction: 0, total: 0 };
      if (b.type === 'פרוזה') pubMap[pub].prose++;
      else pubMap[pub].nonFiction++;
      pubMap[pub].total++;
    });

    return Object.values(pubMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [archiveBooks]);

  // 6. Total Page Volume by Genre (Actual time invested)
  const genrePagesData = useMemo(() => {
    const gMap = {};
    archiveBooks.forEach(b => {
      const genreList = b.genres && b.genres.length ? b.genres : ['כללי'];
      const pages = b.page_count || 280;
      genreList.forEach(g => {
        if (!gMap[g]) gMap[g] = { genre: g, totalPages: 0, bookCount: 0 };
        gMap[g].totalPages += pages;
        gMap[g].bookCount += 1;
      });
    });

    return Object.values(gMap)
      .sort((a, b) => b.totalPages - a.totalPages)
      .slice(0, 8);
  }, [archiveBooks]);

  // 7. Linguistic Streams & Translation Donut
  const translationData = useMemo(() => {
    const langMap = {};
    archiveBooks.forEach(b => {
      const lang = b.orig_language || 'עברית';
      langMap[lang] = (langMap[lang] || 0) + 1;
    });

    const colors = ['#f59e0b', '#0f766e', '#6366f1', '#ec4899', '#0284c7', '#84cc16', '#a855f7'];
    return Object.entries(langMap)
      .map(([name, value], i) => ({
        name,
        value,
        color: colors[i % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [archiveBooks]);

  // 8. Chronological Eras (Ancient Antiquity to 21st Century)
  const vintageErasData = useMemo(() => {
    const eraMap = {
      'העת העתיקה': 0,
      'המאה ה-18 וה-19': 0,
      'המאה ה-20': 0,
      'המאה ה-21': 0,
    };

    archiveBooks.forEach(b => {
      const y = b.original_pub_year;
      if (!y) eraMap['המאה ה-21']++;
      else if (y < 500) eraMap['העת העתיקה']++;
      else if (y < 1900) eraMap['המאה ה-18 וה-19']++;
      else if (y < 2000) eraMap['המאה ה-20']++;
      else eraMap['המאה ה-21']++;
    });

    return Object.entries(eraMap).map(([era, count]) => ({ era, count }));
  }, [archiveBooks]);

  // 9. Series Dynamics vs Standalones (Radial Chart)
  const seriesDynamicsData = useMemo(() => {
    let seriesCount = 0;
    let standaloneCount = 0;

    archiveBooks.forEach(b => {
      if (b.is_series) {
        seriesCount++;
      } else {
        standaloneCount++;
      }
    });

    return [
      { name: 'יצירות בודדות', count: standaloneCount, fill: '#0f766e' },
      { name: 'כרכי סדרות', count: seriesCount, fill: '#f59e0b' },
    ];
  }, [archiveBooks]);

  // 10. Series Breakdown Details (Spotlight on deconstructed volumes)
  const deconstructedSagas = useMemo(() => {
    const sagas = {};
    archiveBooks.forEach(b => {
      if (b.is_series) {
        const sName = b.series_name || 'סדרה שונות';
        if (!sagas[sName]) sagas[sName] = [];
        sagas[sName].push(b);
      }
    });

    return Object.entries(sagas).map(([name, vols]) => ({
      seriesName: name,
      volumeCount: vols.length,
      volumes: vols.sort((a, b) => (a.volume_number || 0) - (b.volume_number || 0)),
      totalPages: vols.reduce((sum, v) => sum + (v.page_count || 0), 0),
    }));
  }, [archiveBooks]);

  // 11. Format & Medium Breakdown
  const formatData = useMemo(() => {
    const fMap = {};
    archiveBooks.forEach(b => {
      const f = b.format || 'ספר מודפס';
      fMap[f] = (fMap[f] || 0) + 1;
    });

    return Object.entries(fMap).map(([format, count]) => ({ format, count }));
  }, [archiveBooks]);

  // 12. Top Intellectual Themes
  const topThemes = useMemo(() => {
    const tMap = {};
    archiveBooks.forEach(b => {
      (b.themes || []).forEach(t => {
        if (t) tMap[t] = (tMap[t] || 0) + 1;
      });
    });

    return Object.entries(tMap)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [archiveBooks]);

  // High-level aggregates and extremes
  const totalPages = archiveBooks.reduce((acc, b) => acc + (b.page_count || 0), 0);
  const avgPages = archiveBooks.length > 0 ? Math.round(totalPages / archiveBooks.length) : 0;
  const seriesVolumesCount = archiveBooks.filter(b => b.is_series).length;

  const longestTome = useMemo(() => {
    return [...archiveBooks].filter(b => b.page_count).sort((a, b) => (b.page_count || 0) - (a.page_count || 0))[0];
  }, [archiveBooks]);

  const shortestGem = useMemo(() => {
    return [...archiveBooks].filter(b => b.page_count && b.page_count > 60).sort((a, b) => (a.page_count || 999) - (b.page_count || 999))[0];
  }, [archiveBooks]);

  const oldestClassic = useMemo(() => {
    return [...archiveBooks].filter(b => b.original_pub_year).sort((a, b) => (a.original_pub_year || 9999) - (b.original_pub_year || 9999))[0];
  }, [archiveBooks]);

  return (
    <div className="space-y-12 animate-fadeIn text-stone-100">
      
      {/* Editorial Header & Master Infographic Ribbon */}
      <div className="space-y-6 border-b border-stone-800 pb-8">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ARCHIVE LITERARY DOSSIER • אטלס ניתוחים מתקדם</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-stone-100">
              אטלס ניתוח קריאה ואינפוגרפיקה
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl font-light">
              12 חתכים ביבליוגרפיים מעמיקים המנתחים את 69 הכרכים שנקראו — תאוצת עמודים, רדאר תמתי, ספקטרום משקל, מפת כתיבה היסטורית, פירוק סדרות ושפות מקור.
            </p>
          </div>
        </div>

        {/* Executive Infographic Ribbon - Bespoke Dials & Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-[#121622] border border-stone-800/80 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-mono uppercase tracking-wider">סך כרכים מתועדים</span>
              <BookmarkCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-serif font-black text-stone-100">{archiveBooks.length}</div>
              <div className="text-[11px] text-amber-400 font-mono mt-1 flex items-center gap-1">
                <span>{seriesVolumesCount} כרכים מסדרות מפורקות</span>
              </div>
            </div>
            <div className="absolute -left-3 -bottom-3 w-16 h-16 bg-amber-500/5 rounded-full pointer-events-none" />
          </div>

          <div className="p-5 rounded-2xl bg-[#121622] border border-stone-800/80 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-mono uppercase tracking-wider">נפח עמודים שנצרך</span>
              <FileText className="w-4 h-4 text-teal-400" />
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-serif font-black text-stone-100">{totalPages.toLocaleString()}</div>
              <div className="text-[11px] text-teal-400 font-mono mt-1">
                ממוצע של {avgPages} עמ' לכרך
              </div>
            </div>
            <div className="absolute -left-3 -bottom-3 w-16 h-16 bg-teal-500/5 rounded-full pointer-events-none" />
          </div>

          <div className="p-5 rounded-2xl bg-[#121622] border border-stone-800/80 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-mono uppercase tracking-wider">עומק היסטורי (שנים)</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-serif font-black text-stone-100">2,500+</div>
              <div className="text-[11px] text-indigo-400 font-mono mt-1">
                מהעת העתיקה (500 לפנה"ס) ועד ימינו
              </div>
            </div>
            <div className="absolute -left-3 -bottom-3 w-16 h-16 bg-indigo-500/5 rounded-full pointer-events-none" />
          </div>

          <div className="p-5 rounded-2xl bg-[#121622] border border-stone-800/80 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-mono uppercase tracking-wider">סוגה דומיננטית</span>
              <Activity className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-serif font-black text-stone-100">62% פרוזה</div>
              <div className="text-[11px] text-stone-400 font-mono mt-1">
                38% ספרי עיון ומדע
              </div>
            </div>
            <div className="absolute -left-3 -bottom-3 w-16 h-16 bg-rose-500/5 rounded-full pointer-events-none" />
          </div>

        </div>

      </div>

      {/* Row 1: Grand Composed Acceleration Chart & Intellectual Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart 1: Cumulative Reading Velocity (2 Columns) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                  <span>עקומת תאוצת קריאה מצטברת (Cumulative Page Acceleration)</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  נפח עמודים מצטבר לפי שנים (2022–2025) לצד קצב העמודים השנתי בפועל
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cumulativeVelocityData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                  <defs>
                    <linearGradient id="cumPageGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="#78716c" tick={{ fontSize: 13, fill: '#a8a29e' }} dy={8} />
                  <YAxis yAxisId="cum" stroke="#0f766e" tick={{ fontSize: 12, fill: '#78716c' }} orientation="right" />
                  <YAxis yAxisId="year" stroke="#f59e0b" tick={{ fontSize: 12, fill: '#78716c' }} orientation="left" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0f17',
                      border: '1px solid #383e54',
                      borderRadius: '12px',
                      color: '#f5f5f4',
                      direction: 'rtl',
                    }}
                    formatter={(val, name) => [
                      `${val.toLocaleString()} עמודים`,
                      name === 'cumulativePages' ? 'סך עמודים מצטבר' : 'עמודים שנקראו בשנה זו',
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={val => (val === 'cumulativePages' ? 'עמודים מצטברים (S-Curve)' : 'עמודים באותה שנה')}
                  />
                  <Area
                    yAxisId="cum"
                    type="monotone"
                    dataKey="cumulativePages"
                    fill="url(#cumPageGrad)"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    name="cumulativePages"
                  />
                  <Bar
                    yAxisId="year"
                    dataKey="yearlyPages"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    barSize={36}
                    name="yearlyPages"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Intellectual Thematic Radar (1 Column) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-500" />
              <span>רדאר תמות אינטלקטואלי (Thematic Radar)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5 mb-2">
              6 צירי התוכן המרכזיים המגדירים את מסלול הקריאה
            </p>

            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={thematicRadarData} outerRadius={90}>
                  <PolarGrid stroke="#2e3549" />
                  <PolarAngleAxis dataKey="subject" stroke="#a8a29e" tick={{ fontSize: 11, fill: '#d6d3d1' }} />
                  <PolarRadiusAxis stroke="#44403c" angle={30} domain={[0, 30]} />
                  <Radar
                    name="עוצמת תמה"
                    dataKey="score"
                    stroke="#f59e0b"
                    fill="#f59e0b"
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

          <div className="text-[11px] text-stone-400 border-t border-stone-800/80 pt-3 flex justify-between">
            <span>מוקד ראשי: רציונליות ושיטה מדעית</span>
            <span>איזון: פרוזה רעיונית ועיון</span>
          </div>
        </div>

      </div>

      {/* Row 2: NEW Historical Chronology vs. Tome Thickness Scatter Plot */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>מפת ציר זמן כתיבה מול עובי הכרך (Historical Epoch vs. Volume Thickness)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              כל נקודה מייצגת כרך שנקרא: ציר X מייצג את שנת הכתיבה המקורית (1800–2025), וציר Y מייצג את מספר העמודים
            </p>
          </div>
          <div className="text-xs font-mono text-amber-400 bg-amber-950/60 px-3 py-1.5 rounded-full border border-amber-800/60 shrink-0">
            {historicalScatterData.length} כרכים בעלי שנת פרסום ועמודים
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
              <XAxis
                type="number"
                dataKey="x"
                name="שנת פרסום מקורית"
                domain={[1800, 2025]}
                stroke="#78716c"
                tick={{ fontSize: 12, fill: '#a8a29e' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="עמודים"
                stroke="#78716c"
                tick={{ fontSize: 12, fill: '#a8a29e' }}
                unit=" עמ'"
              />
              <ZAxis type="number" dataKey="z" range={[60, 360]} name="עובי" />
              
              <ReferenceLine x={1900} stroke="#383e54" strokeDasharray="3 3" label={{ value: 'ראשית המאה ה-20', fill: '#64748b', fontSize: 10, position: 'top' }} />
              <ReferenceLine x={2000} stroke="#383e54" strokeDasharray="3 3" label={{ value: 'המילניום השלישי', fill: '#64748b', fontSize: 10, position: 'top' }} />

              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-4 rounded-xl bg-[#0c0f17] border border-stone-700 shadow-2xl text-stone-100 text-xs max-w-xs space-y-1.5 direction-rtl text-right">
                        <div className="font-serif font-black text-sm text-amber-300">{data.title}</div>
                        <div className="text-stone-400 font-sans">{data.author}</div>
                        <div className="pt-2 border-t border-stone-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div>
                            <span className="text-stone-500 block">פורסם במקור:</span>
                            <span className="text-stone-200 font-bold">{data.x}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block">נקרא בשנת:</span>
                            <span className="text-amber-400 font-bold">{data.yearRead}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block">עמודים:</span>
                            <span className="text-stone-200">{data.y} עמ'</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block">סוגה:</span>
                            <span className="text-teal-400 truncate block">{data.genre}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="כרכים היסטוריים"
                data={historicalScatterData}
                fill="#f59e0b"
                onClick={node => node && node.raw && setSelectedArchiveBook(node.raw)}
                cursor="pointer"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Book Density & Publishing House Specialization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 4: Book Density & Depth Spectrum */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span>ספקטרום משקל ועומק ספרים (Book Density)</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                נובלות (&lt;200 עמ'), ספרים סטנדרטיים (200–450 עמ'), וכרכים כבדים (&gt;450 עמ')
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={densityByYearData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                <XAxis dataKey="year" stroke="#78716c" tick={{ fontSize: 13, fill: '#a8a29e' }} dy={8} />
                <YAxis stroke="#78716c" tick={{ fontSize: 12, fill: '#a8a29e' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0f17',
                    border: '1px solid #383e54',
                    borderRadius: '10px',
                    color: '#f5f5f4',
                    direction: 'rtl',
                  }}
                  formatter={(val, name) => [
                    `${val} כרכים`,
                    name === 'novella'
                      ? 'נובלות ומסות קצרות (<200 עמ\')'
                      : name === 'standard'
                      ? 'ספרים סטנדרטיים (200-450 עמ\')'
                      : name === 'tome'
                      ? 'כרכים כבדי משקל (>450 עמ\')'
                      : 'ללא ספירת עמודים',
                  ]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={val =>
                    val === 'novella'
                      ? 'נובלות ומסות קצרות (<200 עמ\')'
                      : val === 'standard'
                      ? 'סטנדרטיים (200-450 עמ\')'
                      : val === 'tome'
                      ? 'כרכים כבדים (>450 עמ\')'
                      : 'ללא ספירת עמודים'
                  }
                />
                <Bar dataKey="novella" stackId="a" fill="#fbbf24" name="novella" />
                <Bar dataKey="standard" stackId="a" fill="#0f766e" name="standard" />
                <Bar dataKey="tome" stackId="a" fill="#b45309" name="tome" />
                <Bar dataKey="unrecorded" stackId="a" fill="#44403c" name="unrecorded" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Publishing House Specialization Matrix (Wide YAxis ensures zero text overlap) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-stone-300" />
              <span>טביעת אצבע מו"לית (Publishing House Specialization)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-6">
              התפלגות 8 ההוצאות המובילות בארכיון בחלוקה בין פרוזה לעיון ומדע
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={publisherFingerprintData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 25 }}
                >
                  <XAxis type="number" stroke="#78716c" tick={{ fontSize: 11, fill: '#a8a29e' }} />
                  {/* Wide 165px width prevents any text collision */}
                  <YAxis
                    type="category"
                    dataKey="publisher"
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
                    formatter={(val, name) => [val, name === 'prose' ? 'פרוזה' : 'עיון']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '15px' }} formatter={val => (val === 'prose' ? 'פרוזה' : 'עיון ומדע')} />
                  <Bar dataKey="prose" stackId="a" fill="#ea580c" name="prose" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="nonFiction" stackId="a" fill="#0f766e" name="nonFiction" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* Row 4: Page Volume by Genre & Language Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 6: Page Volume by Genre */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>נפח עמודים לפי ז'אנר (Actual Pages Digest by Genre)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-6">
              כמה עמודים בפועל נקראו בכל ז'אנר (מדד השקעת הזמן והקשב האמיתי)
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={genrePagesData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 25 }}
                >
                  <XAxis type="number" stroke="#78716c" tick={{ fontSize: 11, fill: '#a8a29e' }} />
                  <YAxis
                    type="category"
                    dataKey="genre"
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
                    formatter={(val) => [`${val.toLocaleString()} עמודים`, 'נפח קריאה']}
                  />
                  <Bar dataKey="totalPages" fill="#f59e0b" radius={[0, 4, 4, 0]} name="עמודים" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 7: Linguistic Streams & Translation Donut */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-teal-400" />
              <span>נוף שפות מקור ותרגום (Linguistic Streams)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-4">
              יצירות מקור בעברית מול ספרות מתורגמת מאנגלית, רוסית, הולנדית וכו'
            </p>

            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={translationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {translationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
                    formatter={(val) => [`${val} כרכים`, 'כמות']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-stone-800 text-xs">
              {translationData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-stone-300 font-medium truncate">{item.name}:</span>
                  <span className="font-mono font-bold text-stone-100">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 5: Chronological Vintage Wave & Series Dynamics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 8: Chronological Vintage Timeline */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl">
          <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>ציר תקופות כתיבה היסטוריות (Chronological Horizon)</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1 mb-6">
            מתי נכתבו היצירות (מהעת העתיקה ועד לספרות עכשווית במאה ה-21)
          </p>

          <div className="space-y-4">
            {vintageErasData.map(item => {
              const pct = Math.round((item.count / archiveBooks.length) * 100);
              return (
                <div key={item.era} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-serif font-bold text-stone-200">{item.era}</span>
                    <span className="font-mono text-stone-400 font-semibold">{item.count} כרכים ({pct}%)</span>
                  </div>
                  <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 9: Series Sagas vs Standalones */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <span>דינמיקת סדרות רב-כרכיות (Series Sagas vs Standalones)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-4">
              חלוקת הקריאה בין סדרות (HPMOR 4-6, קליפטון, סנדמן) ליצירות יחידות
            </p>

            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="90%"
                  barSize={18}
                  data={seriesDynamicsData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    minAngle={15}
                    background={{ fill: '#1f2438' }}
                    clockWise
                    dataKey="count"
                    cornerRadius={10}
                  />
                  <Legend
                    iconSize={10}
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={val => (val === 'count' ? 'כמות כרכים' : val)}
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
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-stone-800 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-300">כרכים מתוך סדרות מפורקות:</span>
              <span className="font-mono font-bold text-amber-400">15 כרכים (22%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-300">יצירות בודדות ועצמאיות:</span>
              <span className="font-mono font-bold text-teal-400">54 כרכים (78%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 6: Series Deconstruction Spotlight & Milestones Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Infographic 10: Deconstructed Series Dossier */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <span>פירוק סדרות לכרכים עצמאיים (Deconstructed Sagas)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-6">
              כל כרך בסדרה מתועד ומחושב כספר נפרד עם נפח העמודים ושנת הקריאה שלו
            </p>

            <div className="space-y-4">
              {deconstructedSagas.map(saga => (
                <div key={saga.seriesName} className="p-4 rounded-2xl bg-[#161a27] border border-stone-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif font-bold text-sm text-amber-300">{saga.seriesName}</span>
                    <span className="font-mono text-xs text-stone-400">{saga.volumeCount} כרכים • {saga.totalPages.toLocaleString()} עמ'</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {saga.volumes.map(v => (
                      <div
                        key={v.book_id}
                        onClick={() => setSelectedArchiveBook(v)}
                        className="px-3 py-2 rounded-xl bg-[#101420] border border-stone-800 hover:border-amber-500/50 cursor-pointer transition text-xs flex justify-between items-center group"
                      >
                        <span className="truncate text-stone-200 group-hover:text-amber-200">{v.canonical_title}</span>
                        <span className="font-mono text-stone-400 shrink-0 mr-2">{v.page_count} עמ'</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Infographic 11: Personal Canon Milestones Dossier */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-400" />
              <span>שיאי הארכיון וציוני דרך (Canon Milestones)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-6">
              נקודות קצה וציוני דרך שנרשמו ביומן הקריאה
            </p>

            <div className="space-y-3.5">
              
              {longestTome && (
                <div
                  onClick={() => setSelectedArchiveBook(longestTome)}
                  className="p-3.5 rounded-2xl bg-[#161a27] border border-stone-800 hover:border-amber-500/50 cursor-pointer transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-[11px] font-mono text-amber-400">🏆 הכרך העבה ביותר בארכיון</div>
                    <div className="font-serif font-bold text-sm text-stone-100 group-hover:text-amber-200 mt-0.5">{longestTome.canonical_title}</div>
                    <div className="text-xs text-stone-400">{longestTome.author_hebrew}</div>
                  </div>
                  <div className="text-left font-mono font-bold text-amber-300 text-sm">
                    {longestTome.page_count} עמודים
                  </div>
                </div>
              )}

              {shortestGem && (
                <div
                  onClick={() => setSelectedArchiveBook(shortestGem)}
                  className="p-3.5 rounded-2xl bg-[#161a27] border border-stone-800 hover:border-teal-500/50 cursor-pointer transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-[11px] font-mono text-teal-400">⚡ הנובלה הממוקדת ביותר</div>
                    <div className="font-serif font-bold text-sm text-stone-100 group-hover:text-teal-200 mt-0.5">{shortestGem.canonical_title}</div>
                    <div className="text-xs text-stone-400">{shortestGem.author_hebrew}</div>
                  </div>
                  <div className="text-left font-mono font-bold text-teal-300 text-sm">
                    {shortestGem.page_count} עמודים
                  </div>
                </div>
              )}

              {oldestClassic && (
                <div
                  onClick={() => setSelectedArchiveBook(oldestClassic)}
                  className="p-3.5 rounded-2xl bg-[#161a27] border border-stone-800 hover:border-indigo-500/50 cursor-pointer transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-[11px] font-mono text-indigo-400">🏛️ היצירה הוותיקה ביותר כרונולוגית</div>
                    <div className="font-serif font-bold text-sm text-stone-100 group-hover:text-indigo-200 mt-0.5">{oldestClassic.canonical_title}</div>
                    <div className="text-xs text-stone-400">{oldestClassic.author_hebrew}</div>
                  </div>
                  <div className="text-left font-mono font-bold text-indigo-300 text-sm">
                    {oldestClassic.original_pub_year < 0 ? `${Math.abs(oldestClassic.original_pub_year)} לפנה"ס` : `שנת ${oldestClassic.original_pub_year}`}
                  </div>
                </div>
              )}

            </div>
          </div>
          
          <div className="text-[11px] text-stone-500 border-t border-stone-800/80 pt-4 mt-4">
            לחיצה על כל כרטיסייה פותחת את תיק הכרך המלא בארכיון
          </div>
        </div>

      </div>

      {/* Row 7: Format Breakdown & Thematic Tag Cloud */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 12: Format Breakdown */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl">
          <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-teal-400" />
            <span>פורמט ומדיום קריאה (Medium Breakdown)</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1 mb-6">
            איך נקראו הספרים: דפוס, דיגיטלי, או קריאה ברשת
          </p>

          <div className="space-y-3">
            {formatData.map(item => {
              const pct = Math.round((item.count / archiveBooks.length) * 100);
              return (
                <div key={item.format} className="p-3.5 rounded-xl bg-[#161a27] border border-stone-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-200">{item.format}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-stone-400">({pct}%)</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">{item.count} כרכים</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Infographic 13: Intellectual Thematic Tags Cloud */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e] border border-stone-800 shadow-xl">
          <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
            <Tags className="w-5 h-5 text-amber-500" />
            <span>תמות ורעיונות אינטלקטואליים מובילים (Thematic Vectors)</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1 mb-6">
            הרעיונות והנושאים החוזרים לאורך קריאתך
          </p>

          <div className="flex flex-wrap gap-2.5">
            {topThemes.map((item) => (
              <div
                key={item.theme}
                className="px-3.5 py-2 rounded-xl bg-[#161a27] border border-stone-800 hover:border-amber-500/60 transition flex items-center gap-2"
              >
                <span className="text-xs font-semibold text-stone-200">
                  {item.theme}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-stone-800 text-amber-400 font-bold">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
