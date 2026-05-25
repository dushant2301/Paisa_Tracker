import { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';

import { useApp } from '../../context/AppContext';
import { getLastNMonths } from '../../utils/formatDate';
import {
  getMonthExpenses,
  computeSummary,
  computeCategoryBreakdown,
  computeDailyAnalysis,
  computePendingAnalysis,
  generateInsights,
} from '../../utils/reportAnalytics';
import { exportToPDF, exportToExcel } from '../../utils/reportExport';
import { saveReportToHistory } from '../../utils/reportHistory';
import { injectDemoData, clearDemoData } from '../../utils/demoReportData';

import PageWrapper from '../../components/layout/PageWrapper';
import TopBar from '../../components/layout/TopBar';
import SummaryCards from './components/SummaryCards';
import CategoryBreakdown from './components/CategoryBreakdown';
import DailyAnalysis from './components/DailyAnalysis';
import PendingAnalysis from './components/PendingAnalysis';
import SmartInsights from './components/SmartInsights';
import TransactionHistory from './components/TransactionHistory';
import ReportHistory from './components/ReportHistory';
import MonthTrend from './components/MonthTrend';

import {
  FileText, Download, Table, Sparkles, RefreshCw, FlaskConical
} from 'lucide-react';

const LoadingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(8px)' }}
  >
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw size={28} className="text-white" />
        </motion.div>
      </div>
      <p className="text-text-primary font-semibold text-lg">Generating Report...</p>
      <p className="text-text-muted text-sm mt-1">Analyzing your financial data</p>
    </div>
  </motion.div>
);

const MonthlyReports = () => {
  const { expenses, shopExpenses, friendTransactions } = useApp();
  const months = getLastNMonths(6);
  const [selectedMonth, setSelectedMonth] = useState(months[0].value);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [isExcelExporting, setIsExcelExporting] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [demoActive, setDemoActive] = useState(false);

  const pdfTemplateRef = useRef(null);
  const reportSectionRef = useRef(null);

  const selectedMonthLabel = months.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  // ── Analytics (memoized) ─────────────────────────────────────────────────
  const monthExpenses = useMemo(
    () => getMonthExpenses(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  const prevMonthValue = useMemo(() => {
    const idx = months.findIndex((m) => m.value === selectedMonth);
    return months[idx + 1]?.value || null;
  }, [selectedMonth, months]);

  const prevMonthExpenses = useMemo(
    () => (prevMonthValue ? getMonthExpenses(expenses, prevMonthValue) : []),
    [expenses, prevMonthValue]
  );

  const summary = useMemo(
    () => computeSummary(monthExpenses, shopExpenses, friendTransactions, selectedMonth),
    [monthExpenses, shopExpenses, friendTransactions, selectedMonth]
  );

  const prevSummary = useMemo(
    () => prevMonthValue
      ? computeSummary(prevMonthExpenses, shopExpenses, friendTransactions, prevMonthValue)
      : null,
    [prevMonthExpenses, shopExpenses, friendTransactions, prevMonthValue]
  );

  const categoryBreakdown = useMemo(
    () => computeCategoryBreakdown(monthExpenses),
    [monthExpenses]
  );

  const dailyAnalysis = useMemo(
    () => computeDailyAnalysis(monthExpenses, selectedMonth),
    [monthExpenses, selectedMonth]
  );

  const pendingAnalysis = useMemo(
    () => computePendingAnalysis(shopExpenses, friendTransactions),
    [shopExpenses, friendTransactions]
  );

  const insights = useMemo(
    () => generateInsights(summary, categoryBreakdown, dailyAnalysis, pendingAnalysis, prevSummary),
    [summary, categoryBreakdown, dailyAnalysis, pendingAnalysis, prevSummary]
  );

  const reportData = useMemo(() => ({
    summary,
    categoryBreakdown,
    dailyAnalysis,
    pendingAnalysis,
    insights,
    monthExpenses,
  }), [summary, categoryBreakdown, dailyAnalysis, pendingAnalysis, insights, monthExpenses]);

  // ── Generate Report ──────────────────────────────────────────────────────
  const handleGenerateReport = useCallback(async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 800)); // UX delay for feel
    setReportGenerated(true);
    setIsGenerating(false);

    // Save to history
    saveReportToHistory({
      yearMonth: selectedMonth,
      monthLabel: selectedMonthLabel,
      summary: { totalSpent: summary.totalSpent, txCount: summary.txCount },
    });
    setHistoryRefresh((n) => n + 1);

    toast.success(`${selectedMonthLabel} report generated!`);

    // Scroll to report
    setTimeout(() => {
      reportSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [selectedMonth, selectedMonthLabel, summary]);

  // ── PDF Export ───────────────────────────────────────────────────────────
  const handlePdfExport = useCallback(async () => {
    if (!reportGenerated) {
      toast.error('Please generate the report first');
      return;
    }
    setIsPdfExporting(true);
    try {
      const filename = await exportToPDF(reportData, selectedMonthLabel, pdfTemplateRef);
      toast.success(`PDF downloaded: ${filename}`);
    } catch (err) {
      console.error(err);
      toast.error('PDF export failed. Try again.');
    } finally {
      setIsPdfExporting(false);
    }
  }, [reportGenerated, reportData, selectedMonthLabel]);

  // ── Excel Export ─────────────────────────────────────────────────────────
  const handleExcelExport = useCallback(() => {
    if (!reportGenerated) {
      toast.error('Please generate the report first');
      return;
    }
    setIsExcelExporting(true);
    try {
      const filename = exportToExcel(reportData, selectedMonthLabel);
      toast.success(`Excel downloaded: ${filename}`);
    } catch (err) {
      console.error(err);
      toast.error('Excel export failed. Try again.');
    } finally {
      setIsExcelExporting(false);
    }
  }, [reportGenerated, reportData, selectedMonthLabel]);

  // ── Re-download from history ─────────────────────────────────────────────
  const handleRedownload = useCallback(async (historyEntry) => {
    // Switch to the history entry's month and re-generate
    if (historyEntry.yearMonth !== selectedMonth) {
      setSelectedMonth(historyEntry.yearMonth);
      // small delay to let state settle before generating
      await new Promise((r) => setTimeout(r, 150));
    }
    setReportGenerated(true);
    toast('Re-generating report for ' + historyEntry.monthLabel, { icon: '📥' });
  }, [selectedMonth]);

  // ── Demo Data ────────────────────────────────────────────────────────────
  const handleInjectDemo = useCallback(() => {
    injectDemoData();
    setDemoActive(true);
    toast.success('Demo data loaded! Click "Generate Report" to see the report.', { duration: 4000 });
    // Force a page reload to refresh the AppContext with new localStorage data
    setTimeout(() => window.location.reload(), 500);
  }, []);

  const handleClearDemo = useCallback(() => {
    clearDemoData();
    setDemoActive(false);
    setReportGenerated(false);
    toast('Demo data cleared', { icon: '🗑️' });
    setTimeout(() => window.location.reload(), 300);
  }, []);

  // When month changes, reset generated state
  const handleMonthChange = (val) => {
    setSelectedMonth(val);
    setReportGenerated(false);
  };

  const hasData = monthExpenses.length > 0;

  return (
    <PageWrapper>
      <AnimatePresence>{isGenerating && <LoadingOverlay />}</AnimatePresence>

      <div className="page-container">
        <TopBar title="Monthly Reports" subtitle="Financial report center" />

        {/* ── Demo Banner ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-xl border border-brand-purple/25 bg-brand-purple/6 flex items-center gap-3"
        >
          <FlaskConical size={16} className="text-brand-purple-light flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-text-secondary text-xs font-medium">Demo Mode</p>
            <p className="text-text-disabled text-xs">Load sample data to see the full report in action</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              id="btn-load-demo"
              onClick={handleInjectDemo}
              className="px-3 py-1.5 rounded-lg bg-brand-purple text-white text-xs font-medium hover:bg-brand-purple-light transition-colors"
            >
              Load Demo
            </button>
            <button
              id="btn-clear-demo"
              onClick={handleClearDemo}
              className="px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-default text-text-muted text-xs font-medium hover:text-expense-red transition-colors"
            >
              Clear
            </button>
          </div>
        </motion.div>

        {/* ── Month Selector ──────────────────────────────────── */}
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {months.map((m) => (
            <button
              key={m.value}
              id={`month-tab-${m.value}`}
              onClick={() => handleMonthChange(m.value)}
              className={clsx(
                'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200',
                selectedMonth === m.value
                  ? 'bg-brand-purple/15 border-brand-purple text-brand-purple-light'
                  : 'bg-bg-elevated border-border-subtle text-text-muted hover:border-border-bright'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* ── Generate Button ─────────────────────────────────── */}
        <motion.div className="mt-4" whileTap={{ scale: 0.97 }}>
          <button
            id="btn-generate-report"
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="btn-gradient w-full flex items-center justify-center gap-2 py-3.5 text-base font-semibold disabled:opacity-60"
          >
            <Sparkles size={18} />
            {reportGenerated ? `Regenerate ${selectedMonthLabel} Report` : `Generate ${selectedMonthLabel} Report`}
          </button>
        </motion.div>

        {/* ── No Data Warning ─────────────────────────────────── */}
        {!hasData && !reportGenerated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 p-3 rounded-xl bg-pending-yellow-bg border border-pending-yellow/20 flex items-center gap-2"
          >
            <span className="text-pending-yellow text-base">⚠️</span>
            <p className="text-text-secondary text-xs">
              No expense data found for <strong>{selectedMonthLabel}</strong>. Load demo data or add transactions.
            </p>
          </motion.div>
        )}

        {/* ── Report Sections ─────────────────────────────────── */}
        <AnimatePresence>
          {reportGenerated && (
            <motion.div
              ref={reportSectionRef}
              id="report-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Report header badge */}
              <div className="mt-5 flex items-center gap-2">
                <div className="h-px flex-1 bg-border-subtle" />
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple-light text-xs font-medium">
                  <FileText size={12} />
                  {selectedMonthLabel} Report
                </span>
                <div className="h-px flex-1 bg-border-subtle" />
              </div>

              <SummaryCards summary={summary} />
              <CategoryBreakdown categoryBreakdown={categoryBreakdown} />
              <MonthTrend expenses={expenses} selectedMonth={selectedMonth} />
              <DailyAnalysis dailyAnalysis={dailyAnalysis} />
              <PendingAnalysis pendingAnalysis={pendingAnalysis} />
              <SmartInsights insights={insights} />
              <TransactionHistory monthExpenses={monthExpenses} />

              {/* ── Download Buttons ──────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-5 grid grid-cols-2 gap-3"
              >
                <button
                  id="btn-download-pdf"
                  onClick={handlePdfExport}
                  disabled={isPdfExporting}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 border disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.15))',
                    borderColor: 'rgba(124,58,237,0.3)',
                    color: '#9D5CF6',
                  }}
                >
                  {isPdfExporting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <RefreshCw size={16} />
                    </motion.div>
                  ) : (
                    <Download size={16} />
                  )}
                  {isPdfExporting ? 'Exporting...' : 'Download PDF'}
                </button>

                <button
                  id="btn-download-excel"
                  onClick={handleExcelExport}
                  disabled={isExcelExporting}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 border disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))',
                    borderColor: 'rgba(16,185,129,0.3)',
                    color: '#10B981',
                  }}
                >
                  {isExcelExporting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <RefreshCw size={16} />
                    </motion.div>
                  ) : (
                    <Table size={16} />
                  )}
                  {isExcelExporting ? 'Exporting...' : 'Download Excel'}
                </button>
              </motion.div>

              {/* Generated timestamp */}
              <p className="text-center text-text-disabled text-xs mt-3">
                Generated on {format(new Date(), 'dd MMM yyyy, hh:mm a')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Report History ──────────────────────────────────── */}
        <div className="mt-6">
          <h2 className="text-text-secondary font-semibold text-sm uppercase tracking-wider mb-1">
            Report History
          </h2>
          <ReportHistory onRedownload={handleRedownload} refreshTrigger={historyRefresh} />
        </div>

        <div className="h-6" />
      </div>

      {/* Hidden PDF template reference div */}
      <div ref={pdfTemplateRef} className="absolute opacity-0 pointer-events-none left-[-9999px]" aria-hidden="true">
        <div id="pdf-capture-area" style={{ width: '800px', background: '#0A0A0F', padding: '24px' }}>
          {reportGenerated && (
            <>
              <SummaryCards summary={summary} />
              <CategoryBreakdown categoryBreakdown={categoryBreakdown} />
              <DailyAnalysis dailyAnalysis={dailyAnalysis} />
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default MonthlyReports;
