import React, { useState, useEffect, useCallback, useRef } from 'react';
import StatCard from './StatCard';
import PageViewsChart from './PageViewsChart';
import AbTestPanel from './AbTestPanel';
import AiCostTable from './AiCostTable';

// --- Types ---

interface StatsData {
  totalViews: number;
  uniqueSessions: number;
  totalInteractions: number;
  totalAiSpend: number;
  dailyPageViews: { date: string; count: number; scroll: number; cards: number }[];
  topChapters: { chapter: string; views: number }[];
}

interface ExperimentData {
  id: string;
  name: string;
  status: 'active' | 'paused';
  variants: { name: string; assignments: number; views: number; interactions: number }[];
}

interface AiCostData {
  totalCost: number;
  totalRequests: number;
  totalTokens: number;
  dailyCosts: { date: string; cost: number; requests: number }[];
  byWidget: { widget: string; requests: number; tokens: number; cost: number }[];
}

type Tab = 'overview' | 'ab-tests' | 'ai-costs';

// --- Component ---

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [dateRange, setDateRange] = useState<7 | 30 | 90>(7);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [stats, setStats] = useState<StatsData | null>(null);
  const [experiments, setExperiments] = useState<ExperimentData[]>([]);
  const [aiCosts, setAiCosts] = useState<AiCostData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Data fetching ---

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/stats?days=${dateRange}`);
      if (!res.ok) throw new Error(`Stats fetch failed: ${res.status}`);
      const data = await res.json();
      setStats({
        totalViews: data.pageViews?.total ?? 0,
        uniqueSessions: data.pageViews?.uniqueSessions ?? 0,
        totalInteractions: data.widgetInteractions?.total ?? 0,
        totalAiSpend: data.aiUsage?.totalCost ?? 0,
        dailyPageViews: data.dailyPageViews ?? [],
        topChapters: data.pageViews?.topChapters ?? [],
      });
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      setError(err.message);
    }
  }, [dateRange]);

  const fetchExperiments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/experiments');
      if (!res.ok) throw new Error(`Experiments fetch failed: ${res.status}`);
      const data = await res.json();
      setExperiments(data.experiments ?? []);
    } catch (err: any) {
      console.error('Failed to fetch experiments:', err);
      setError(err.message);
    }
  }, []);

  const fetchAiCosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/stats?days=${dateRange}`);
      if (!res.ok) throw new Error(`AI costs fetch failed: ${res.status}`);
      const data = await res.json();
      setAiCosts({
        totalCost: data.aiUsage?.totalCost ?? 0,
        totalRequests: data.aiUsage?.totalRequests ?? 0,
        totalTokens: data.aiUsage?.totalTokens ?? 0,
        dailyCosts: data.aiUsage?.dailyCosts ?? [],
        byWidget: data.aiUsage?.byWidget ?? [],
      });
    } catch (err: any) {
      console.error('Failed to fetch AI costs:', err);
      setError(err.message);
    }
  }, [dateRange]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchStats(), fetchExperiments(), fetchAiCosts()]);
    setLoading(false);
  }, [fetchStats, fetchExperiments, fetchAiCosts]);

  // Initial load + dateRange change
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchAll();
      }, 30000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, fetchAll]);

  // --- Experiment toggle ---

  const handleToggleExperiment = async (id: string, newStatus: 'active' | 'paused') => {
    try {
      const res = await fetch(`/api/admin/experiments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update experiment');
      setExperiments((prev) =>
        prev.map((exp) => (exp.id === id ? { ...exp, status: newStatus } : exp))
      );
    } catch (err) {
      console.error('Failed to toggle experiment:', err);
    }
  };

  // --- Styles ---

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    padding: '8px 20px',
    borderRadius: '9999px',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
    background: activeTab === tab ? '#7B61FF' : 'transparent',
    color: activeTab === tab ? '#ffffff' : '#9ca3af',
  });

  const dateButtonStyle = (days: 7 | 30 | 90): React.CSSProperties => ({
    padding: '5px 14px',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: dateRange === days ? '#7B61FF' : '#374151',
    background: dateRange === days ? 'rgba(123, 97, 255, 0.15)' : 'transparent',
    color: dateRange === days ? '#7B61FF' : '#9ca3af',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  // --- Render ---

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '32px 24px',
        fontFamily: "'Inter', 'Source Serif 4', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: 700,
              margin: '0 0 4px 0',
            }}
          >
            Talking to Machines — Admin
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
            Analytics & experiment management
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Date range picker */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {([7, 30, 90] as const).map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                style={dateButtonStyle(days)}
              >
                {days}d
              </button>
            ))}
          </div>

          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: '5px 14px',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: autoRefresh ? '#22c55e' : '#374151',
              background: autoRefresh ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
              color: autoRefresh ? '#22c55e' : '#9ca3af',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: autoRefresh ? '#22c55e' : '#6b7280',
                display: 'inline-block',
              }}
            />
            Auto-refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '28px',
          background: '#161830',
          borderRadius: '9999px',
          padding: '4px',
          width: 'fit-content',
        }}
      >
        <button onClick={() => setActiveTab('overview')} style={tabStyle('overview')}>
          Overview
        </button>
        <button onClick={() => setActiveTab('ab-tests')} style={tabStyle('ab-tests')}>
          A/B Tests
        </button>
        <button onClick={() => setActiveTab('ai-costs')} style={tabStyle('ai-costs')}>
          AI Costs
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#f87171',
            fontSize: '0.85rem',
          }}
        >
          Failed to load data: {error}
        </div>
      )}

      {/* Loading state */}
      {loading && !stats && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#6b7280',
            fontSize: '0.95rem',
          }}
        >
          Loading dashboard...
        </div>
      )}

      {/* Tab content */}
      {!loading || stats ? (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                }}
              >
                <StatCard label="Total Page Views" value={stats.totalViews} format="number" />
                <StatCard label="Unique Sessions" value={stats.uniqueSessions} format="number" />
                <StatCard
                  label="Widget Interactions"
                  value={stats.totalInteractions}
                  format="number"
                />
                <StatCard label="AI Spend" value={stats.totalAiSpend} format="currency" />
              </div>
              <PageViewsChart data={stats.dailyPageViews} />
            </div>
          )}

          {/* A/B Tests Tab */}
          {activeTab === 'ab-tests' && (
            <div>
              {experiments.length === 0 ? (
                <div
                  style={{
                    background: '#1e2240',
                    borderRadius: '12px',
                    padding: '40px',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '0.95rem',
                  }}
                >
                  No experiments configured
                </div>
              ) : (
                experiments.map((exp) => (
                  <AbTestPanel
                    key={exp.id}
                    experiment={exp}
                    onToggleStatus={handleToggleExperiment}
                  />
                ))
              )}
            </div>
          )}

          {/* AI Costs Tab */}
          {activeTab === 'ai-costs' && aiCosts && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                }}
              >
                <StatCard label="Total AI Cost" value={aiCosts.totalCost} format="currency" />
                <StatCard
                  label="Total Requests"
                  value={aiCosts.totalRequests}
                  format="number"
                />
              </div>
              <AiCostTable byWidget={aiCosts.byWidget} dailyCosts={aiCosts.dailyCosts} />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
