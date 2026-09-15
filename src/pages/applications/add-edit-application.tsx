import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axiosInstance';
import { useCompanies } from '../../contexts/use-companies';
import './add-edit-application.css';

const stepLabels = ['Company Info', 'Role Details', 'Contact', 'Review'];

function normalizeCompanyValue(value: string) {
    return value.trim().toLowerCase();
}

function toInputDateValue(dateValue?: string | null) {
    if (!dateValue) return '';

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return '';

    const year = parsedDate.getFullYear();
    const month = `${parsedDate.getMonth() + 1}`.padStart(2, '0');
    const day = `${parsedDate.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function AddEditApplication() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { companies: companyOptions } = useCompanies();
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [companyName, setCompanyName] = useState('');
    const [isNewCompany, setIsNewCompany] = useState(false);
    const [location, setLocation] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [dateApplied, setDateApplied] = useState('');
    const [source, setSource] = useState('');
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');
    const [currency, setCurrency] = useState('');
    const [status, setStatus] = useState('Applied');
    const [recruiterName, setRecruiterName] = useState('');
    const [recruiterEmail, setRecruiterEmail] = useState('');
    const [recruiterRole, setRecruiterRole] = useState('');
    const [recruiterPhone, setRecruiterPhone] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;

        async function fetchApplicationForEdit() {
            try {
                const response = await api.get(`/api/applications/${id}`);
                const application = response.data ?? {};

                setCompanyName(application.companyName ?? application.company?.name ?? '');
                setLocation(application.location ?? '');
                setJobTitle(application.jobTitle ?? '');
                setJobDescription(application.jobDescription ?? '');
                setDateApplied(toInputDateValue(application.dateApplied));
                setSource(application.source ?? '');
                setSalaryMin(application.minSalary != null ? String(application.minSalary) : '');
                setSalaryMax(application.maxSalary != null ? String(application.maxSalary) : '');
                setCurrency(application.currency ?? '');
                setStatus(application.status ?? 'Applied');
                setRecruiterName(application.recruiterName ?? '');
                setRecruiterEmail(application.recruiterEmail ?? '');
                setRecruiterRole(application.recruiterRole ?? '');
                setRecruiterPhone(application.phoneNo ?? application.recruiterPhone ?? '');
                setSelectedCompanyId(application.companyId ?? null);
                setIsNewCompany(!application.companyId && Boolean(application.companyName));
            } catch (error) {
                console.error('Failed to load application for edit', error);
            }
        }

        void fetchApplicationForEdit();
    }, [id]);

    const isCompanyKnown = useMemo(() => {
        const trimmedValue = companyName.trim();
        if (!trimmedValue) return false;

        return companyOptions.some(
            (company) => normalizeCompanyValue(company.name) === normalizeCompanyValue(trimmedValue)
        );
    }, [companyName, companyOptions]);

    const showNewCompanyToggle = companyName.trim().length > 0 && !isCompanyKnown;
    const isCompanyStepValid = (() => {
        const trimmed = companyName.trim();

        if (!trimmed) return false;
        if (isCompanyKnown) return true;

        return isNewCompany;
    })();
    const isLastStep = currentStep === stepLabels.length - 1;
    const hasContactData = Boolean(
        recruiterName.trim() ||
            recruiterEmail.trim() ||
            recruiterRole.trim() ||
            recruiterPhone.trim()
    );

    function handleCompanyChange(event: ChangeEvent<HTMLInputElement>) {
        const nextValue = event.target.value;
        setCompanyName(nextValue);

        if (!nextValue.trim()) {
            setIsNewCompany(false);
            setSelectedCompanyId(null);
            return;
        }

        const match = companyOptions.find(
            (company) => normalizeCompanyValue(company.name) === normalizeCompanyValue(nextValue)
        );

        if (match) {
            setSelectedCompanyId(match.id);
            setIsNewCompany(false);
            return;
        }

        setSelectedCompanyId(null);
        if (!isNewCompany) {
            setIsNewCompany(false);
        }
    }

    function handleBack() {
        setCurrentStep((step) => Math.max(0, step - 1));
    }

    function handleGoBack() {
        navigate('/applications');
    }

    async function handleSubmit() {
        try {
            setSubmitError(null);
            setIsSubmitting(true);

            const trimmedCompanyName = companyName.trim();
            const applicationPayload: Record<string, unknown> = {
                jobTitle: jobTitle.trim(),
                jobDescription: jobDescription.trim(),
                dateApplied: dateApplied ? new Date(`${dateApplied}T00:00:00`).toISOString() : null,
                source: source || null,
                minSalary: salaryMin ? Number(salaryMin) : null,
                maxSalary: salaryMax ? Number(salaryMax) : null,
                currency: currency || null,
                location: location.trim() || null,
                status: status || 'Applied',
            };

            if (selectedCompanyId) {
                applicationPayload.companyId = selectedCompanyId;
            } else {
                applicationPayload.companyName = trimmedCompanyName;
            }

            const applicationResponse = await api.post('/api/applications/create', applicationPayload);
            const createdApplicationId = applicationResponse.data?.id;
            const createdCompanyId = applicationResponse.data?.companyId ?? selectedCompanyId ?? null;
            const hasContactInfo = Boolean(
                recruiterName.trim() ||
                    recruiterEmail.trim() ||
                    recruiterRole.trim() ||
                    recruiterPhone.trim()
            );

            if (hasContactInfo && createdCompanyId != null) {
                await api.post('/api/contacts/create', {
                    companyId: createdCompanyId,
                    name: recruiterName.trim() || null,
                    email: recruiterEmail.trim() || null,
                    role: recruiterRole.trim() || null,
                    phoneNo: recruiterPhone.trim() || null,
                    notes: null,
                });
            }

            if (createdApplicationId) {
                console.log('Created application ID:', createdApplicationId);
            }

            navigate('/applications');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const backendMessage = error.response?.data?.message || error.response?.data?.error;

                if (status === 409) {
                    setSubmitError('This application already exists for the same company, job title, and date.');
                    return;
                }

                if (status === 404) {
                    setSubmitError('The selected company could not be found. Please choose another company.');
                    return;
                }

                setSubmitError(backendMessage || 'Something went wrong while saving the application.');
                return;
            }

            setSubmitError('Something went wrong while saving the application.');
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleNext() {
        if (currentStep === 0 && !isCompanyStepValid) {
            return;
        }

        if (currentStep < stepLabels.length - 1) {
            setCurrentStep((step) => step + 1);
            return;
        }

        void handleSubmit();
    }

    return (
        <div className="add-app-shell">
            <div className="wizard-card">
                <aside className="step-panel" aria-label="Application progress">
                    <div className="step-content">
                        <div className="brand-block" aria-label="Application tracker">
                            <div className="brand-mark" aria-hidden="true">T</div>
                            <div className="brand-copy">
                                <span className="brand-kicker">Application</span>
                                <span className="brand-name">Tracker</span>
                            </div>
                        </div>

                        <div className="side-title">Add Application</div>

                        <div className="step-list" aria-label="Add application steps">
                            {stepLabels.map((label, index) => (
                                <div key={label} className={`step-item ${currentStep === index ? 'active' : ''}`}>
                                    <span className="step-circle">{index + 1}</span>
                                    <span className="step-label">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <section className="form-panel">
                    <button
                        type="button"
                        className="close-button"
                        onClick={handleGoBack}
                        aria-label="Go back to applications"
                        title="Back to applications"
                    >
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                    </button>

                    <div className={`form-step ${currentStep === 0 ? 'is-active' : ''}`}>
                        <div className="form-heading">
                            <h2>Company Info</h2>
                            <p>Start by selecting the company or add a new one.</p>
                        </div>

                        <div className="form-grid">
                            <div className="form-field full">
                                <label className="form-label">Company</label>
                                <input
                                    className="input"
                                    type="text"
                                    list="company-options"
                                    placeholder="Search or type a company name"
                                    autoComplete="off"
                                    value={companyName}
                                    onChange={handleCompanyChange}
                                />
                                <datalist id="company-options">
                                    {companyOptions.map((company) => (
                                        <option key={company.id} value={company.name} />
                                    ))}
                                </datalist>

                                {showNewCompanyToggle && (
                                    <div className="new-company-toggle" aria-live="polite">
                                        <label className="checkbox-row">
                                            <input
                                                type="checkbox"
                                                checked={isNewCompany}
                                                onChange={(event) => setIsNewCompany(event.target.checked)}
                                            />
                                            <span>
                                                Add <strong>{companyName.trim()}</strong> as a new company
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="form-field full">
                                <label className="form-label">Location</label>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="e.g. Remote / Bengaluru, India"
                                    value={location}
                                    onChange={(event) => setLocation(event.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`form-step ${currentStep === 1 ? 'is-active' : ''}`}>
                        <div className="form-heading">
                            <h2>Role Details</h2>
                            <p>Capture the role, compensation, and application source.</p>
                        </div>

                        <div className="form-grid">
                            <div className="form-field full">
                                <label className="form-label" htmlFor="job-title">Job Title</label>
                                <input
                                    className="input"
                                    id="job-title"
                                    type="text"
                                    value={jobTitle}
                                    onChange={(event) => setJobTitle(event.target.value)}
                                    placeholder="e.g. Senior Product Designer"
                                />
                            </div>

                            <div className="form-field full">
                                <label className="form-label" htmlFor="job-description">Job Description</label>
                                <textarea
                                    className="input textarea"
                                    id="job-description"
                                    rows={4}
                                    value={jobDescription}
                                    onChange={(event) => setJobDescription(event.target.value)}
                                    placeholder="Paste the full job description here"
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="date-applied">Date Applied</label>
                                <input
                                    className="input"
                                    id="date-applied"
                                    type="date"
                                    value={dateApplied}
                                    onChange={(event) => setDateApplied(event.target.value)}
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="source">Source</label>
                                <select
                                    className="input"
                                    id="source"
                                    value={source}
                                    onChange={(event) => setSource(event.target.value)}
                                >
                                    <option value="">Select source</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="Referral">Referral</option>
                                    <option value="Company Site">Company Site</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="salary-min">Salary Min</label>
                                <input
                                    className="input"
                                    id="salary-min"
                                    type="number"
                                    value={salaryMin}
                                    onChange={(event) => setSalaryMin(event.target.value)}
                                    placeholder="e.g. 2200000"
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="salary-max">Salary Max</label>
                                <input
                                    className="input"
                                    id="salary-max"
                                    type="number"
                                    value={salaryMax}
                                    onChange={(event) => setSalaryMax(event.target.value)}
                                    placeholder="e.g. 2800000"
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="currency">Currency</label>
                                <input
                                    className="input"
                                    id="currency"
                                    type="text"
                                    value={currency}
                                    onChange={(event) => setCurrency(event.target.value)}
                                    placeholder="₹ or $"
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="status">Status</label>
                                <select
                                    className="input"
                                    id="status"
                                    value={status}
                                    onChange={(event) => setStatus(event.target.value)}
                                >
                                    <option value="Applied">Applied</option>
                                    <option value="Under Process">Under Process</option>
                                    <option value="Interview">Interview</option>
                                    <option value="Offer">Offer</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Withdrawn">Withdrawn</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={`form-step ${currentStep === 2 ? 'is-active' : ''}`}>
                        <div className="form-heading">
                            <h2>Contact</h2>
                            <p>Optional. You can skip this section if you do not have recruiter details.</p>
                        </div>

                        <div className="form-grid">
                            <div className="form-field">
                                <label className="form-label" htmlFor="recruiter-name">Recruiter Name</label>
                                <input
                                    className="input"
                                    id="recruiter-name"
                                    type="text"
                                    value={recruiterName}
                                    onChange={(event) => setRecruiterName(event.target.value)}
                                    placeholder="e.g. Priya Shah"
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="recruiter-email">Recruiter Email</label>
                                <input
                                    className="input"
                                    id="recruiter-email"
                                    type="email"
                                    value={recruiterEmail}
                                    onChange={(event) => setRecruiterEmail(event.target.value)}
                                    placeholder="name@company.com"
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="recruiter-role">Recruiter Role/Title</label>
                                <input
                                    className="input"
                                    id="recruiter-role"
                                    type="text"
                                    value={recruiterRole}
                                    onChange={(event) => setRecruiterRole(event.target.value)}
                                    placeholder="e.g. Hiring Manager"
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label" htmlFor="recruiter-phone">Phone Number</label>
                                <input
                                    className="input"
                                    id="recruiter-phone"
                                    type="tel"
                                    value={recruiterPhone}
                                    onChange={(event) => setRecruiterPhone(event.target.value)}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`form-step ${currentStep === 3 ? 'is-active' : ''}`}>
                        <div className="form-heading">
                            <h2>Review</h2>
                            <p>Review everything before submitting your application.</p>
                        </div>

                        <div className="review-list">
                            <div className="review-section">
                                <div className="review-header">
                                    <span>Company Info</span>
                                    <a href="#" className="edit-link">Edit</a>
                                </div>
                                <div className="review-row">
                                    <span className="review-label">Company</span>
                                    <span className="review-value">{companyName || 'Not provided'}</span>
                                </div>
                                <div className="review-row">
                                    <span className="review-label">Location</span>
                                    <span className="review-value">{location || 'Not provided'}</span>
                                </div>
                            </div>

                            <div className="review-section">
                                <div className="review-header">
                                    <span>Role Details</span>
                                    <a href="#" className="edit-link">Edit</a>
                                </div>
                                <div className="review-row">
                                    <span className="review-label">Job Title</span>
                                    <span className="review-value">{jobTitle || 'Not provided'}</span>
                                </div>
                                <div className="review-row">
                                    <span className="review-label">Date Applied</span>
                                    <span className="review-value">{dateApplied || 'Not provided'}</span>
                                </div>
                                <div className="review-row">
                                    <span className="review-label">Status</span>
                                    <span className="review-value">{status || 'Not provided'}</span>
                                </div>
                            </div>

                            <div className="review-section">
                                <div className="review-header">
                                    <span>Contact</span>
                                    <a href="#" className="edit-link">Edit</a>
                                </div>
                                <div className="review-row">
                                    <span className="review-label">Recruiter</span>
                                    <span className="review-value">{hasContactData ? recruiterName || 'Not provided' : 'Not provided'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {submitError && (
                        <div className="form-help" style={{ marginTop: '16px', color: '#b91c1c' }}>
                            {submitError}
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={handleBack}
                            style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
                        >
                            Back
                        </button>
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={handleNext}
                            disabled={currentStep === 0 ? !isCompanyStepValid : isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : isLastStep ? 'Submit' : 'Next'}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
