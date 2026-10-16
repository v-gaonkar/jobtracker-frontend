import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import axios from "axios";
import "./application-list.css";
import { SidebarNav } from "../components/sidebar-nav";
import { BufferLoader } from "../components/common/BufferingLoader";
import { EmptyState } from "../components/common/empty-state/EmptyState";

interface ApplicationItem {
    id?: number;
    jobTitle?: string;
    companyName?: string;
    location?: string;
    dateApplied?: string;
    minSalary?: number;
    maxSalary?: number;
    status?: string;
    nextInterview?: string;
}

export function ApplicationList() {

    const [applications, setApplications] = useState<ApplicationItem[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const routeToastMessage = (location.state as { toastMessage?: string } | null)?.toastMessage ?? null;

    useEffect(() => {
        async function fetchApplications() {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/api/applications?page=${page}&size=10`);
                if (response.status === 200 && response.data) {
                    setApplications(response.data.content);
                    setTotalPages(response.data.totalPages);
                    setTotalElements(response.data.totalElements);
                } else {
                    setError('Failed to fetch applications');
                }
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response) {
                    setError(err.response.data.message || 'An error occurred while fetching applications. Please try again.');
                } else {
                    setError('Could not reach the server. It may be waking up, so please try again in a moment.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, [page]);

    const displayError = routeToastMessage ?? error;

    // Show the empty state only after loading finished without an error
    const isEmpty = !loading && !error && totalElements === 0;

    return (
        <>
            <div className="app-shell">
                <SidebarNav />
                <main className="content">
                    <div className="page-heading">
                        <h1>Applications</h1>
                        {displayError ? <p className="form-help" style={{ color: '#b91c1c' }}>{displayError}</p> : (
                            <p>
                                {isEmpty
                                    ? "Add your first application to get started"
                                    : `Showing ${page * 10 + 1}–${page * 10 + applications.length} of ${totalElements} applications`}
                            </p>
                        )}
                    </div>

                    {loading && <BufferLoader variant="contentOverlay" label="Loading applications..." />}

                    {isEmpty ? (
                        <EmptyState
                            title="No applications yet"
                            message="Track your first job application and keep every step in one place."
                            action={
                                <button className="btn btn-primary" onClick={() => navigate('/applications/add')}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    Add Application
                                </button>
                            }
                        />
                    ) : (
                        <>
                            <div className="toolbar">
                                <div className="search-box">
                                    <span className="icon" aria-hidden="true">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                                            <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                    <input className="input" type="text" placeholder="Search by role or company…" />
                                </div>

                                {/* <div className="filter-dropdown">
                                    <button className="btn btn-secondary">Filter</button>
                                </div> */}

                                {/* <button className="btn btn-secondary">
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                                        <path d="M7.5 1.5v8M4.5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M2 11.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                    </svg>
                                    Export CSV
                                </button> */}

                                <button className="btn btn-primary" onClick={() => navigate('/applications/add')}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    Add Application
                                </button>
                            </div>

                            <div className="table-card">
                                <div className="table-head">
                                    <span className="col-title">Job Title</span>
                                    <span className="col-company">Company</span>
                                    <span className="col-date">Date Applied</span>
                                    <span className="col-salary">Salary Range</span>
                                    <span className="col-interview">Next Interview</span>
                                    <span className="col-status">Status</span>
                                    <span className="col-actions"></span>
                                </div>
                                <div className="table-body">
                                {
                                    applications.map((application, index) => {
                                        return (
                                            <div key={application.id ?? index} className="table-row" onClick={() => application.id && navigate(`/applications/${application.id}`)} style={{ cursor: 'pointer' }}>
                                                <span className="role">{application.jobTitle || 'Untitled Role'}</span>
                                                <span className="company">{application.companyName || 'Unknown Company'}<span className="meta">{application.location || 'Remote'}</span></span>
                                                <span className="date">{application.dateApplied ? new Date(application.dateApplied).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                                                <span className="salary">{application.minSalary && application.maxSalary ? `₹${application.minSalary / 100000}L – ₹${application.maxSalary / 100000}L` : 'Not disclosed'}</span>
                                                <span className="interview is-due">{application.nextInterview || 'N/A'}</span>
                                                <span>
                                                    <span className="status-badge" data-status={(application.status || 'applied').toLowerCase()}>
                                                        <span className="dot"></span>
                                                        {application.status || 'Applied'}
                                                    </span>
                                                </span>
                                                <div className="actions">
                                                    <button aria-label="Actions" onClick={(event) => { event.stopPropagation();  if (application.id) navigate(`/applications/${application.id}`); }}>
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <circle cx="8" cy="3.5" r="1.2" fill="currentColor" />
                                                            <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                                                            <circle cx="8" cy="12.5" r="1.2" fill="currentColor" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                                </div>

                                <div className="mobile-card">
                                    <div className="mobile-row-top">
                                        <div>
                                            <div className="role">Senior Product Designer</div>
                                            <div className="company">Linear · Remote</div>
                                        </div>
                                        <span className="status-badge" data-status="interview">
                                            <span className="dot"></span>
                                            Interviewing
                                        </span>
                                    </div>
                                    <div className="mobile-meta">
                                        <span>Applied <strong>Jul 24, 2026</strong></span>
                                        <span>Salary <strong>₹22L – ₹28L</strong></span>
                                        <span>Interview <strong>Aug 5, 2026</strong></span>
                                    </div>
                                </div>

                                <div className="mobile-card">
                                    <div className="mobile-row-top">
                                        <div>
                                            <div className="role">UX Engineer</div>
                                            <div className="company">Vercel · San Francisco, CA</div>
                                        </div>
                                        <span className="status-badge" data-status="applied">
                                            <span className="dot"></span>
                                            Applied
                                        </span>
                                    </div>
                                    <div className="mobile-meta">
                                        <span>Applied <strong>Jul 22, 2026</strong></span>
                                        <span>Salary <strong>₹18L – ₹24L</strong></span>
                                    </div>
                                </div>

                                <div className="mobile-card">
                                    <div className="mobile-row-top">
                                        <div>
                                            <div className="role">Design Systems Lead</div>
                                            <div className="company">Figma · New York, NY</div>
                                        </div>
                                        <span className="status-badge" data-status="offer">
                                            <span className="dot"></span>
                                            Offer
                                        </span>
                                    </div>
                                    <div className="mobile-meta">
                                        <span>Applied <strong>Jul 18, 2026</strong></span>
                                        <span>Salary <strong>₹30L – ₹38L</strong></span>
                                    </div>
                                </div>

                                <div className="mobile-card">
                                    <div className="mobile-row-top">
                                        <div>
                                            <div className="role">Product Designer</div>
                                            <div className="company">Notion · Remote</div>
                                        </div>
                                        <span className="status-badge" data-status="rejected">
                                            <span className="dot"></span>
                                            Rejected
                                        </span>
                                    </div>
                                    <div className="mobile-meta">
                                        <span>Applied <strong>Jul 15, 2026</strong></span>
                                        <span>Salary <strong>Not disclosed</strong></span>
                                    </div>
                                </div>

                                <div className="pagination">
                                    <div className="pagination-controls">
                                        <button className="page-btn" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous page">←</button>
                                        {/* <button className="page-btn active">1</button> */}
                                        <span className="info">Page {page + 1} of {totalPages} · {applications.length} results</span>
                                        <button className="page-btn" disabled={page + 1 >= totalPages} aria-label="Next page" onClick={() => setPage(page + 1)}>→</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </>
    );
}