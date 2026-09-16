import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import { SidebarNav } from "../components/sidebar-nav";
import { BufferLoader } from "../components/common/BufferingLoader";

interface CompanyDetail {
    id?: number;
    name?: string;
    industry?: string;
    website?: string;
    careerPageUrl?: string;
    notes?: string;
}

interface ContactItem {
    id?: number;
    name?: string;
    role?: string;
    email?: string;
    phoneNo?: string;
}

interface ApplicationItem {
    id?: number;
    jobTitle?: string;
    companyId?: number;
    dateApplied?: string;
    status?: string;
}

export function CompanyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [company, setCompany] = useState<CompanyDetail | null>(null);
    const [contacts, setContacts] = useState<ContactItem[]>([]);
    const [applications, setApplications] = useState<ApplicationItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const companyResponse = await api.get(`/api/companies/${id}`);
                setCompany(companyResponse.data);

                const contactsResponse = await api.get(`/api/companies/${id}/contacts?page=0&size=50`);
                setContacts(contactsResponse.data.content);

                const applicationsResponse = await api.get(`/api/applications?page=0&size=100`);
                const allApplications: ApplicationItem[] = applicationsResponse.data.content;
                const filtered = allApplications.filter((app) => app.companyId === Number(id));
                setApplications(filtered);
            } catch {
                setError('Failed to load company details.');
            } finally {
                setLoading(false);
            }
        }
        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) {
        return <BufferLoader variant="contentOverlay" label="Loading applications..." />;
    }

    if (error || !company) {
        return <div className="form-help" style={{ color: '#b91c1c' }}>{error || 'Company not found.'}</div>;
    }

    const statusLabel = applications.length > 0 ? 'Applied' : 'Interested';

    return (
        <div className="app-shell">
            <SidebarNav />
            <main className="content">
                <div className="topbar">
                    <button type="button" className="back-link" onClick={() => navigate('/companies')}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9.5 4L5.5 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Back to companies
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => navigate(`/companies/${id}/edit`)}>Edit Company</button>
                </div>

                <section className="detail-shell">
                    <div className="company-header-row">
                        <div>
                            <div className="eyebrow">Company</div>
                            <h1>{company.name}</h1>
                        </div>
                        <span className="status-badge" data-status={statusLabel.toLowerCase()}>
                            <span className="dot"></span>
                            {statusLabel}
                        </span>
                    </div>

                    <div className="detail-grid">
                        <section className="panel">
                            <div className="panel-header">
                                <h2>Company Info</h2>
                            </div>
                            <dl className="info-list">
                                <div className="info-row">
                                    <dt>Industry</dt>
                                    <dd>{company.industry || '—'}</dd>
                                </div>
                                <div className="info-row">
                                    <dt>Website</dt>
                                    <dd>
                                        {company.website ? (
                                            <a href={company.website} target="_blank" rel="noreferrer">{company.website}</a>
                                        ) : '—'}
                                    </dd>
                                </div>
                                <div className="info-row">
                                    <dt>Career Page</dt>
                                    <dd>
                                        {company.careerPageUrl ? (
                                            <a href={company.careerPageUrl} target="_blank" rel="noreferrer">{company.careerPageUrl}</a>
                                        ) : '—'}
                                    </dd>
                                </div>
                                <div className="info-row">
                                    <dt>Notes</dt>
                                    <dd>{company.notes || '—'}</dd>
                                </div>
                            </dl>
                        </section>

                        <section className="panel">
                            <div className="panel-header">
                                <div>
                                    <h2>Contacts</h2>
                                </div>
                                <button className="secondary-button" type="button" onClick={() => navigate(`/companies/${id}/contacts/add`)}>Add Contact</button>
                            </div>

                            <div className="contact-list">
                                {contacts.length === 0 && <p>No contacts added</p>}
                                {contacts.map((contact, index) => (
                                    <div className="contact-card" key={contact.id ?? index}>
                                        <div className="contact-name">{contact.name}</div>
                                        <div className="contact-meta">{contact.role || '—'}</div>
                                        <div className="contact-meta">{contact.email || '—'}</div>
                                        <div className="contact-meta">{contact.phoneNo || '—'}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <section className="panel applications-panel">
                        <div className="panel-header">
                            <h2>Applications at this Company</h2>
                        </div>

                        <div className="applications-list">
                            {applications.length === 0 && <p>No applications yet for this company</p>}
                            {applications.map((app) => (
                                <div
                                    key={app.id}
                                    className="application-row"
                                    onClick={() => navigate(`/applications/${app.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="application-main">
                                        <div className="application-role">{app.jobTitle}</div>
                                        <div className="application-date">
                                            Applied {app.dateApplied ? new Date(app.dateApplied).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                        </div>
                                    </div>
                                    <span className="status-badge" data-status={(app.status || 'applied').toLowerCase()}>
                                        <span className="dot"></span>
                                        {app.status || 'Applied'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
}