import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axiosInstance';
import { SidebarNav } from '../components/sidebar-nav';
import './application-details.css';

type ApplicationResponse = {
    id: number;
    jobTitle?: string | null;
    jobDescription?: string | null;
    dateApplied?: string | null;
    source?: string | null;
    minSalary?: number | null;
    maxSalary?: number | null;
    currency?: string | null;
    location?: string | null;
    status?: string | null;
    companyId?: number | null;
    companyName?: string | null;
    companyWebsite?: string | null;
    companyCareerPageUrl?: string | null;
    createdAt?: string | null;
};

type StatusHistoryResponse = {
    id: number;
    oldStatus?: string | null;
    newStatus?: string | null;
    changedAt?: string | null;
};

type RoundResponse = {
    id: number;
    applicationId?: number | null;
    applicationJobTitle?: string | null;
    companyName?: string | null;
    round?: string | null;
    interviewDate?: string | null;
    status?: string | null;
    notes?: string | null;
};

type ContactResponse = {
    id: number;
    companyId?: number | null;
    companyName?: string | null;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    phoneNo?: string | null;
    notes?: string | null;
};

type AiMatchResponse = {
    matchScore?: number | null;
    extractedSkills?: string[] | null;
    interviewTips?: string[] | null;
};

const emptyContactForm = { name: '', email: '', role: '', phoneNo: '', notes: '' };
const emptyRoundForm = { round: '', interviewDate: '', status: 'Scheduled', notes: '' };

function getStatusClass(status?: string | null) {
    const normalized = (status ?? '').trim().toLowerCase().replace(/\s+/g, '_');

    switch (normalized) {
        case 'applied':
            return 'applied';
        case 'under_process':
        case 'under process':
        case 'scheduled':
        case 'in_review':
            return 'under_process';
        case 'interview':
        case 'interviewing':
            return 'interview';
        case 'offer':
            return 'offer';
        case 'rejected':
            return 'rejected';
        case 'withdrawn':
            return 'withdrawn';
        case 'completed':
            return 'offer';
        case 'passed':
            return 'offer';
        case 'failed':
            return 'rejected';
        default:
            return 'applied';
    }
}

function formatDate(dateValue?: string | null) {
    if (!dateValue) return 'N/A';

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue;

    return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateValue?: string | null) {
    if (!dateValue) return 'N/A';

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue;

    return parsed.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatSalaryRange(min?: number | null, max?: number | null, currency?: string | null) {
    if (min == null && max == null) return 'Not disclosed';
    const formattedCurrency = currency || '₹';
    const minDisplay = min != null ? `${formattedCurrency}${min.toLocaleString()}` : 'N/A';
    const maxDisplay = max != null ? `${formattedCurrency}${max.toLocaleString()}` : 'N/A';
    return `${minDisplay} – ${maxDisplay}`;
}

// "2026-08-05T00:00:00" -> "2026-08-05" (for <input type="date">)
function toDateInputValue(value?: string | null) {
    if (!value) return '';
    return value.slice(0, 10);
}

// "2026-08-05" -> "2026-08-05T00:00:00" (backend expects LocalDateTime)
function toLocalDateTimeString(dateOnly: string): string | null {
    return dateOnly ? `${dateOnly}T00:00:00` : null;
}

export function ApplicationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState<ApplicationResponse | null>(null);
    const [statusHistory, setStatusHistory] = useState<StatusHistoryResponse[]>([]);
    const [rounds, setRounds] = useState<RoundResponse[]>([]);
    const [contacts, setContacts] = useState<ContactResponse[]>([]);
    const [aiMatch, setAiMatch] = useState<AiMatchResponse | null>(null);
    const [pageError, setPageError] = useState<string | null>(null);
    const [contactForm, setContactForm] = useState(emptyContactForm);
    const [roundForm, setRoundForm] = useState(emptyRoundForm);
    const [contactModalState, setContactModalState] = useState<{ mode: 'add' | 'edit'; contact?: ContactResponse } | null>(null);
    const [roundModalState, setRoundModalState] = useState<{ mode: 'add' | 'edit'; round?: RoundResponse } | null>(null);
    const [isLoading, setIsLoading] = useState({
        application: false,
        history: false,
        rounds: false,
        contacts: false,
        ai: false,
    });

    const renderedHistory = useMemo(() => [...statusHistory].reverse(), [statusHistory]);

    const fetchRoundsData = useCallback(async () => {
        if (!id) return;

        setIsLoading((current) => ({ ...current, rounds: true }));

        try {
            const response = await api.get<RoundResponse[]>(`/api/applications/${id}/rounds`);
            setRounds(response.data ?? []);
        } catch (error) {
            console.error('Failed to load interview rounds', error);
            setRounds([]);
        } finally {
            setIsLoading((current) => ({ ...current, rounds: false }));
        }
    }, [id]);

    const fetchContactsData = useCallback(async (companyId?: number | null) => {
        if (!companyId || !id) {
            setContacts([]);
            return;
        }

        setIsLoading((current) => ({ ...current, contacts: true }));

        try {
            const response = await api.get<{ content?: ContactResponse[]; items?: ContactResponse[] }>(
                `/api/companies/${companyId}/contacts?page=0&size=50`
            );
            const result = response.data;
            const nextContacts = Array.isArray(result?.content)
                ? result.content
                : Array.isArray(result?.items)
                    ? result.items
                    : [];
            setContacts(nextContacts);
        } catch (error) {
            console.error('Failed to load contacts', error);
            setContacts([]);
        } finally {
            setIsLoading((current) => ({ ...current, contacts: false }));
        }
    }, [id]);

    useEffect(() => {
        if (!id) return;

        async function loadApplicationPage() {
            setPageError(null);
            setIsLoading((current) => ({ ...current, application: true, history: true, rounds: true }));

            try {
                const [applicationResponse, historyResponse, roundsResponse] = await Promise.all([
                    api.get<ApplicationResponse>(`/api/applications/${id}`),
                    api.get<StatusHistoryResponse[]>(`/api/applications/${id}/status-history`),
                    api.get<RoundResponse[]>(`/api/applications/${id}/rounds`),
                ]);

                const applicationData = applicationResponse.data;
                setApplication(applicationData);
                setStatusHistory(historyResponse.data ?? []);
                setRounds(roundsResponse.data ?? []);

                await fetchContactsData(applicationData.companyId);
            } catch (error: unknown) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    navigate('/applications', {
                        replace: true,
                        state: { toastMessage: 'Application not found.' },
                    });
                    return;
                }

                setPageError('Unable to load the application details right now.');
                console.error('Failed to load application page', error);
            } finally {
                setIsLoading((current) => ({ ...current, application: false, history: false, rounds: false }));
            }
        }

        void loadApplicationPage();
    }, [id, navigate, fetchContactsData]);

    async function handleAnalyzeAi() {
        if (!id) return;

        setIsLoading((current) => ({ ...current, ai: true }));

        try {
            const response = await api.post<AiMatchResponse>(`/api/applications/${id}/ai-match`);
            setAiMatch(response.data ?? null);
        } catch (error) {
            console.error('Failed to analyze application with AI', error);
        } finally {
            setIsLoading((current) => ({ ...current, ai: false }));
        }
    }

    async function handleStatusChange(currentStatus: string) {
        if (!id) return;

        try {
            const response = await api.patch<ApplicationResponse>(`/api/applications/${id}/status`, { status: currentStatus });
            setApplication((previous) => ({ ...(previous ?? {}), ...response.data }));
        } catch (error) {
            console.error('Failed to update application status', error);
        }
    }

    function openAddRound() {
        setRoundForm(emptyRoundForm);
        setRoundModalState({ mode: 'add' });
    }

    function openEditRound(round: RoundResponse) {
        setRoundForm({
            round: round.round ?? '',
            interviewDate: toDateInputValue(round.interviewDate),
            status: round.status ?? 'Scheduled',
            notes: round.notes ?? '',
        });
        setRoundModalState({ mode: 'edit', round });
    }

    function closeRoundModal() {
        setRoundModalState(null);
    }

    async function handleRoundSubmit() {
        if (!id) return;

        const payload = {
            applicationId: Number(id),
            round: roundForm.round,
            interviewDate: toLocalDateTimeString(roundForm.interviewDate),
            status: roundForm.status || 'Scheduled',
            notes: roundForm.notes || null,
        };

        try {
            if (roundModalState?.mode === 'edit' && roundModalState.round?.id) {
                await api.put(`/api/rounds/${roundModalState.round.id}`, payload);
            } else {
                await api.post('/api/rounds/create', payload);
            }
            setRoundModalState(null);
            setRoundForm(emptyRoundForm);
            await fetchRoundsData();
        } catch (error) {
            console.error('Failed to save round', error);
        }
    }

    function openAddContact() {
        setContactForm(emptyContactForm);
        setContactModalState({ mode: 'add' });
    }

    function openEditContact(contact: ContactResponse) {
        setContactForm({
            name: contact.name ?? '',
            email: contact.email ?? '',
            role: contact.role ?? '',
            phoneNo: contact.phoneNo ?? '',
            notes: contact.notes ?? '',
        });
        setContactModalState({ mode: 'edit', contact });
    }

    function closeContactModal() {
        setContactModalState(null);
    }

    async function handleContactSubmit() {
        if (!application?.companyId) return;

        const payload = {
            companyId: application.companyId,
            name: contactForm.name || null,
            email: contactForm.email || null,
            role: contactForm.role || null,
            phoneNo: contactForm.phoneNo || null,
            notes: contactForm.notes || null,
        };

        try {
            if (contactModalState?.mode === 'edit' && contactModalState.contact?.id) {
                await api.put(`/api/contacts/${contactModalState.contact.id}`, payload);
            } else {
                await api.post('/api/contacts/create', payload);
            }
            setContactModalState(null);
            setContactForm(emptyContactForm);
            await fetchContactsData(application.companyId);
        } catch (error) {
            console.error('Failed to save contact', error);
        }
    }

    if (pageError) {
        return (
            <div className="app-shell">
                <SidebarNav />
                <main className="content">
                    <div className="card" style={{ padding: '32px', maxWidth: '560px', margin: '40px auto' }}>
                        <h2 style={{ marginTop: 0 }}>Application details unavailable</h2>
                        <p>{pageError}</p>
                        <button className="btn btn-primary" type="button" onClick={() => navigate('/applications')}>
                            Back to applications
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app-shell">
            <SidebarNav />
            <main className="content">
                <div className="topbar">
                    <button type="button" className="back-link" onClick={() => navigate('/applications')}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9.5 4L5.5 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Back to applications
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => id && navigate(`/applications/${id}/edit`)}>
                        Edit Application
                    </button>
                </div>

                {isLoading.application && (
                    <div className="card" style={{ padding: '18px 22px' }}>
                        Loading application details...
                    </div>
                )}

                {application && (
                    <>
                        <header className="page-header card">
                            <div className="page-header-kicker">Application Overview</div>
                            <div className="title-row">
                                <div className="title-block">
                                    <h1>{application.jobTitle || 'Untitled Role'}</h1>
                                    <span className="company-inline">{application.companyName || 'Unknown Company'}</span>
                                </div>
                                <span className={`status-badge`} data-status={getStatusClass(application.status)}>
                                    <span className="dot"></span>
                                    {application.status || 'Applied'}
                                </span>
                            </div>
                        </header>

                        <div className="detail-grid">
                            <section className="card ai-card">
                                <div className="card-header-row">
                                    <div>
                                        <div className="card-eyebrow">AI Match Analysis</div>
                                        <p className="card-subtitle">AI-generated summary for this opportunity</p>
                                    </div>
                                    <button className="secondary-pill" type="button" onClick={handleAnalyzeAi} disabled={isLoading.ai}>
                                        {isLoading.ai ? 'Analyzing...' : 'Analyze with AI'}
                                    </button>
                                </div>

                                {aiMatch ? (
                                    <div className="ai-content">
                                        <div className="match-score-panel">
                                            <div className="match-label">Match Score</div>
                                            <div className="match-value">{Math.round(aiMatch.matchScore ?? 0)}%</div>
                                        </div>

                                        <div className="skill-box">
                                            <div className="mini-title">Extracted Skills</div>
                                            <div className="tag-row">
                                                {(aiMatch.extractedSkills?.length ? aiMatch.extractedSkills : ['N/A']).map((skill, index) => (
                                                    <span key={`${skill}-${index}`} className="tag">{skill}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="tips-box">
                                            <div className="mini-title">Interview Tips</div>
                                            <ul>
                                                {(aiMatch.interviewTips?.length ? aiMatch.interviewTips : ['No tips available yet.']).map((tip, index) => (
                                                    <li key={`${tip}-${index}`}>{tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="empty-contact">
                                        <p>No AI analysis has been generated yet.</p>
                                    </div>
                                )}
                            </section>

                            <section className="card details-card">
                                <div className="card-eyebrow">Application Details</div>
                                <dl className="detail-list">
                                    <div className="detail-row">
                                        <dt>Job Title</dt>
                                        <dd>{application.jobTitle || 'Not provided'}</dd>
                                    </div>
                                    <div className="detail-row">
                                        <dt>Description</dt>
                                        <dd className="long-copy">{application.jobDescription || 'Not provided'}</dd>
                                    </div>
                                    <div className="detail-row">
                                        <dt>Applied On</dt>
                                        <dd>{formatDate(application.dateApplied)}</dd>
                                    </div>
                                    <div className="detail-row">
                                        <dt>Source</dt>
                                        <dd>{application.source || 'Not provided'}</dd>
                                    </div>
                                    <div className="detail-row">
                                        <dt>Salary</dt>
                                        <dd>{formatSalaryRange(application.minSalary, application.maxSalary, application.currency)}</dd>
                                    </div>
                                    <div className="detail-row">
                                        <dt>Location</dt>
                                        <dd>{application.location || 'Not provided'}</dd>
                                    </div>
                                    <div className="detail-row status-row">
                                        <dt>Status</dt>
                                        <dd>
                                            <select
                                                className="input"
                                                value={application.status || 'Applied'}
                                                onChange={(event) => handleStatusChange(event.target.value)}
                                                style={{ minWidth: 160 }}
                                            >
                                                <option value="Applied">Applied</option>
                                                <option value="Under Process">Under Process</option>
                                                <option value="Interview">Interview</option>
                                                <option value="Offer">Offer</option>
                                                <option value="Rejected">Rejected</option>
                                                <option value="Withdrawn">Withdrawn</option>
                                            </select>
                                        </dd>
                                    </div>
                                </dl>
                            </section>

                            <div className="side-stack">
                                <section className="card company-card">
                                    <div className="card-eyebrow">Company</div>
                                    <dl className="detail-list compact-list">
                                        <div className="detail-row">
                                            <dt>Company</dt>
                                            <dd>{application.companyName || 'Unknown Company'}</dd>
                                        </div>
                                        <div className="detail-row">
                                            <dt>Website</dt>
                                            <dd>
                                                {application.companyWebsite ? (
                                                    <a href={application.companyWebsite} target="_blank" rel="noreferrer">{application.companyWebsite}</a>
                                                ) : (
                                                    'Not provided'
                                                )}
                                            </dd>
                                        </div>
                                        <div className="detail-row">
                                            <dt>Career Page</dt>
                                            <dd>
                                                {application.companyCareerPageUrl ? (
                                                    <a href={application.companyCareerPageUrl} target="_blank" rel="noreferrer">{application.companyCareerPageUrl}</a>
                                                ) : (
                                                    'Not provided'
                                                )}
                                            </dd>
                                        </div>
                                    </dl>
                                </section>

                                <section className="card contact-card">
                                    <div className="card-eyebrow">Recruiter Contact</div>
                                    {isLoading.contacts ? (
                                        <div className="empty-contact"><p>Loading contacts...</p></div>
                                    ) : contacts.length > 0 ? (
                                        <div className="contact-list">
                                            {contacts.map((contact) => (
                                                <div
                                                    key={contact.id}
                                                    className="contact-item"
                                                    onClick={() => openEditContact(contact)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="contact-name">{contact.name || 'Recruiter'}</div>
                                                    <div className="contact-meta">{contact.role || 'Recruiter'}</div>
                                                    {contact.email ? <div className="contact-meta">{contact.email}</div> : null}
                                                    {contact.phoneNo ? <div className="contact-meta">{contact.phoneNo}</div> : null}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-contact">
                                            <p>No contact added</p>
                                            <button className="primary-button" type="button" onClick={openAddContact}>
                                                Add Contact
                                            </button>
                                        </div>
                                    )}
                                </section>
                            </div>
                        </div>

                        <section className="card history-card">
                            <div className="card-eyebrow">Status History</div>
                            <div className="history-list">
                                {renderedHistory.length > 0 ? renderedHistory.map((historyItem) => (
                                    <div key={historyItem.id} className="history-item">
                                        <span className="timeline-dot"></span>
                                        <div className="history-meta">{formatDateTime(historyItem.changedAt)}</div>
                                        <div className="history-copy">
                                            {historyItem.oldStatus || 'Unknown'} → {historyItem.newStatus || 'Unknown'}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-contact"><p>No status history available.</p></div>
                                )}
                            </div>
                        </section>

                        <section className="card rounds-card">
                            <div className="card-header-row compact-header">
                                <div className="card-eyebrow">Interview Rounds</div>
                                <button className="secondary-button alt" type="button" onClick={openAddRound}>
                                    Add Round
                                </button>
                            </div>

                            {isLoading.rounds ? (
                                <div className="empty-contact"><p>Loading rounds...</p></div>
                            ) : rounds.length > 0 ? (
                                <div className="round-list">
                                    {rounds.map((round) => (
                                        <div
                                            key={round.id}
                                            className="round-row"
                                            onClick={() => openEditRound(round)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="round-name">{round.round || 'Round'}</div>
                                            <div className="round-date">{formatDate(round.interviewDate)}</div>
                                            <span className={`status-badge`} data-status={getStatusClass(round.status)}>
                                                <span className="dot"></span>
                                                {round.status || 'Scheduled'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-contact"><p>No interview rounds added yet.</p></div>
                            )}
                        </section>
                    </>
                )}
            </main>

            {contactModalState && (
                <div className="modal-backdrop" onClick={closeContactModal}>
                    <div className="modal-card" onClick={(event) => event.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{contactModalState.mode === 'edit' ? 'Edit Contact' : 'Add Contact'}</h3>
                            <button type="button" className="close-modal" onClick={closeContactModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="form-field">
                                <label className="form-label">Name</label>
                                <input className="input" value={contactForm.name} onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Email</label>
                                <input className="input" type="email" value={contactForm.email} onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Role</label>
                                <input className="input" value={contactForm.role} onChange={(event) => setContactForm({ ...contactForm, role: event.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Phone Number</label>
                                <input className="input" value={contactForm.phoneNo} onChange={(event) => setContactForm({ ...contactForm, phoneNo: event.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Notes</label>
                                <textarea className="input textarea" rows={3} value={contactForm.notes} onChange={(event) => setContactForm({ ...contactForm, notes: event.target.value })} />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn btn-secondary" onClick={closeContactModal}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={handleContactSubmit}>Save Contact</button>
                        </div>
                    </div>
                </div>
            )}

            {roundModalState && (
                <div className="modal-backdrop" onClick={closeRoundModal}>
                    <div className="modal-card" onClick={(event) => event.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{roundModalState.mode === 'edit' ? 'Edit Round' : 'Add Round'}</h3>
                            <button type="button" className="close-modal" onClick={closeRoundModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="form-field">
                                <label className="form-label">Round</label>
                                <input className="input" value={roundForm.round} onChange={(event) => setRoundForm({ ...roundForm, round: event.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Interview Date</label>
                                <input className="input" type="date" value={roundForm.interviewDate} onChange={(event) => setRoundForm({ ...roundForm, interviewDate: event.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Status</label>
                                <select className="input" value={roundForm.status} onChange={(event) => setRoundForm({ ...roundForm, status: event.target.value })}>
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Passed">Passed</option>
                                    <option value="Failed">Failed</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label className="form-label">Notes</label>
                                <textarea className="input textarea" rows={4} value={roundForm.notes} onChange={(event) => setRoundForm({ ...roundForm, notes: event.target.value })} />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn btn-secondary" onClick={closeRoundModal}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={handleRoundSubmit}>Save Round</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
