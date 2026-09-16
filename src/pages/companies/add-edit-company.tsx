import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import axios from "axios";

export function AddEditCompany() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [name, setName] = useState<string>('');
    const [industry, setIndustry] = useState<string>('');
    const [website, setWebsite] = useState<string>('');
    const [careerPageUrl, setCareerPageUrl] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        async function fetchCompany() {
            if (!id) return;
            setLoading(true);
            try {
                const response = await api.get(`/api/companies/${id}`);
                setName(response.data.name || '');
                setIndustry(response.data.industry || '');
                setWebsite(response.data.website || '');
                setCareerPageUrl(response.data.careerPageUrl || '');
                setNotes(response.data.notes || '');
            } catch {
                setError('Failed to load company details.');
            } finally {
                setLoading(false);
            }
        }
        fetchCompany();
    }, [id]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!name) {
            setError('Company name is required');
            return;
        }

        setError(null);
        setLoading(true);

        const payload = {
            name,
            industry: industry || null,
            website: website || null,
            careerPageUrl: careerPageUrl || null,
            notes: notes || null,
        };

        try {
            if (isEditMode) {
                await api.put(`/api/companies/${id}`, payload);
            } else {
                await api.post('/api/companies/create', payload);
            }
            navigate('/companies');
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="company-form-shell">
            <div className="form-card">
                <div className="form-header">
                    <div>
                        <div className="eyebrow">Company</div>
                        <h1>{isEditMode ? 'Edit Company' : 'Add Company'}</h1>
                    </div>
                    <button type="button" className="close-button" aria-label="Back to companies" onClick={() => navigate('/companies')}>
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <form className="company-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label className="form-label">Company Name</label>
                        <input className="input" value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="e.g. Stripe" required />
                    </div>

                    <div className="form-row">
                        <label className="form-label">Industry</label>
                        <input className="input" value={industry} onChange={(e) => setIndustry(e.target.value)} type="text" placeholder="e.g. Fintech" />
                    </div>

                    <div className="form-row">
                        <label className="form-label">Website</label>
                        <input className="input" value={website} onChange={(e) => setWebsite(e.target.value)} type="url" placeholder="https://example.com" />
                    </div>

                    <div className="form-row">
                        <label className="form-label">Career Page URL</label>
                        <input className="input" value={careerPageUrl} onChange={(e) => setCareerPageUrl(e.target.value)} type="url" placeholder="https://example.com/careers" />
                    </div>

                    <div className="form-row">
                        <label className="form-label">Notes</label>
                        <textarea className="input textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} placeholder="Add notes about the company, role fit, or follow-ups…"></textarea>
                    </div>

                    {error && <span className="form-help" style={{ color: '#b91c1c' }}>{error}</span>}

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/companies')}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (isEditMode ? 'Update Company' : 'Save Company')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}