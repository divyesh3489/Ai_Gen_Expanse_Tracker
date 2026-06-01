import { useTheme } from '../../app/theme/ThemeContext'

/** Recharts / dashboard chart colors that follow light/dark theme. */
export function useDashboardChartTheme() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return {
    isDark,
    cardClass:
      'rounded-xl border border-slate-200 bg-[#F8F9FA] p-3 sm:p-4 dark:border-slate-700/60 dark:bg-[#0d1117]',
    titleClass: 'text-base font-bold tracking-tight text-[#1A1A2E] dark:text-white',
    subtitleClass: 'mt-0.5 text-xs text-slate-500 dark:text-slate-400',
    legendClass: 'text-xs text-slate-600 dark:text-slate-300',
    selectClass:
      'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-[#1A1A2E] outline-none focus:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-slate-500',
    tickFill: isDark ? '#9ca3af' : '#6b7280',
    gridStroke: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    gridOpacity: 1,
    chartBg: isDark ? '#0d1117' : '#ffffff',
    activeDotStroke: isDark ? '#0d1117' : '#ffffff',
    tooltipStyle: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      border: 'none',
      borderRadius: 9999,
      fontSize: 12,
      color: '#fff',
      boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
      padding: '6px 12px',
    } as const,
    tooltipLabelStyle: { color: '#fff', fontWeight: 600, marginBottom: 2 } as const,
  }
}
