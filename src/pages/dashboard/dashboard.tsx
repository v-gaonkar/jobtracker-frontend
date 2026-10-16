import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { SidebarNav } from "../components/sidebar-nav";
import { BufferLoader } from "../components/common/BufferingLoader";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import "./dashboard.css";

interface DashboardData {
    applicationCount?: number;
    totalApplications?: number;
    statusBreakdown?: Record<string, number>;
    upcomingInterviewCount?: number;
    staleApplicationCount?: number;
    applicationsPerWeek?: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
    Applied: '#64748B',
    'Under Process': '#6366F1',
    Interview: '#F59E0B',
    Offer: '#10B981',
    Rejected: '#EF4444',
    Withdrawn: '#94A3B8',
};

export function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDashboard() {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('/api/dashboard');
                setData(response.data);
            } catch {
                setError('Failed to load dashboard.');
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="app-shell">
                <SidebarNav />
                <main className="content">
                    <BufferLoader variant="contentOverlay" label="Loading dashboard..." />
                </main>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="app-shell">
                <SidebarNav />
                <main className="content">
                    <div className="form-help" style={{ color: '#b91c1c' }}>{error || 'No dashboard data.'}</div>
                </main>
            </div>
        );
    }

    const statusEntries = Object.entries(data.statusBreakdown || {});
    const weekEntries = Object.entries(data.applicationsPerWeek || {});

    const pieData = statusEntries.map(([status, count]) => ({
        name: status,
        value: count,
    }));

    const weekData = weekEntries.map(([week, count]) => ({
        week: week.slice(5, 10),
        count,
    }));

    return (
        <div className="app-shell">
            <SidebarNav />
            <main className="content">
                <div className="page-heading">
                    <h1>Dashboard</h1>
                    <p>Here's your job search overview.</p>
                </div>

                <div className="stat-card-grid">
                    <div className="stat-card">
                        <span className="stat-label">Total Applications</span>
                        <span className="stat-value">{data.totalApplications ?? 0}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Upcoming Interviews (7 days)</span>
                        <span className="stat-value">{data.upcomingInterviewCount ?? 0}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Stale Applications</span>
                        <span className="stat-value">{data.staleApplicationCount ?? 0}</span>
                    </div>
                </div>

                <div className="dashboard-panels">
                    <div className="panel-card">
                        <h2>Status Breakdown</h2>
                        {statusEntries.length === 0 ? (
                            <p className="form-help">No applications yet.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={STATUS_COLORS[entry.name] || '#CBD5E1'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="panel-card">
                        <h2>Applications Per Week</h2>
                        {weekEntries.length === 0 ? (
                            <p className="form-help">No data yet.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={weekData}>
                                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}