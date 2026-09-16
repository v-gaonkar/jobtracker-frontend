import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import axios from "axios";
import "./company-list.css";
import { SidebarNav } from "../components/sidebar-nav";
import { BufferLoader } from "../components/common/BufferingLoader";

interface CompanyItem {
    id?: number;
    name?: string;
    industry?: string;
    website?: string;
}

export function CompanyList() {

    const [companies, setCompanies] = useState<CompanyItem[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchCompanies() {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/api/companies?page=${page}&size=10`);
                if (response.status === 200 && response.data) {
                    setCompanies(response.data.content);
                    setTotalPages(response.data.totalPages);
                    setTotalElements(response.data.totalElements);
                } else {
                    setError('Failed to fetch companies');
                }
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response) {
                    setError(err.response.data.message || 'An error occurred while fetching companies. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        }
        fetchCompanies();
    }, [page]);

    return (
        <>
            <div className="app-shell">
                <SidebarNav />
                <main className="content">
                    <div className="page-heading">
                        <h1>Companies</h1>
                        {error ? (
                            <p className="form-help" style={{ color: '#b91c1c' }}>{error}</p>
                        ) : (
                            <p>Showing {page * 10 + 1}–{page * 10 + companies.length} of {totalElements} companies</p>
                        )}
                    </div>

                    {loading && <BufferLoader variant="contentOverlay" label="Loading applications..." />}

                    <div className="toolbar">
                        <div className="search-box">
                            <span className="icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                                    <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                            </span>
                            <input className="input" type="text" placeholder="Search by company or industry…" />
                        </div>

                        <button className="btn btn-secondary">Filter</button>

                        <button className="btn btn-primary" onClick={() => navigate('/companies/add')}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            Add Company
                        </button>
                    </div>

                    <div className="table-card">
                        <div className="table-head">
                            <span>Company Name</span>
                            <span>Industry</span>
                            <span>Website</span>
                            <span></span>
                        </div>

                        <div className="table-body">
                            {companies.map((company, index) => (
                                <div
                                    key={company.id ?? index}
                                    className="table-row"
                                    onClick={() => company.id && navigate(`/companies/${company.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <span className="company-name">{company.name || 'Unnamed Company'}</span>
                                    <span className="company-industry">{company.industry || '—'}</span>
                                    <span className="company-website">{company.website || '—'}</span>
                                    <span className="actions">
                                        <button
                                            type="button"
                                            aria-label="More actions"
                                            className="menu-trigger"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                if (company.id) {
                                                    navigate(`/companies/${company.id}`);
                                                }
                                            }}
                                        >
                                            ⋯
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="table-footer">
                            <span>Page {page + 1} of {totalPages} · {totalElements} results</span>
                            <div className="pagination">
                                <button className="page-btn" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous page">‹</button>
                                <button className="page-btn" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)} aria-label="Next page">›</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}