import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { SidebarNav } from "../components/sidebar-nav";
import "./calendar.css";
import { BufferLoader } from "../components/common/BufferingLoader";

interface RoundItem {
    id?: number;
    round?: string;
    interviewDate?: string;
    applicationJobTitle?: string;
    companyName?: string;
    status?: string;
    notes?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getUrgencyColor(interviewDate: string): string {
    const now = new Date();
    const roundDate = new Date(interviewDate);
    const daysUntil = Math.ceil((roundDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 2) return '#ef4444';
    if (daysUntil <= 6) return '#f59e0b';
    return '#10b981';
}

export function CalendarPage() {
    const today = new Date();

    const [viewYear, setViewYear] = useState<number>(today.getFullYear());
    const [viewMonth, setViewMonth] = useState<number>(today.getMonth());
    const [rounds, setRounds] = useState<RoundItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
    const [popoverEvent, setPopoverEvent] = useState<RoundItem | null>(null);

    useEffect(() => {
        async function fetchRounds() {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('/api/rounds');
                setRounds(response.data);
            } catch {
                setError('Failed to load interview rounds.');
            } finally {
                setLoading(false);
            }
        }
        fetchRounds();
    }, []);

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(d);
    }

    function getRoundsForDay(day: number): RoundItem[] {
        return rounds.filter((round) => {
            if (!round.interviewDate) return false;
            const roundDate = new Date(round.interviewDate);
            return (
                roundDate.getFullYear() === viewYear &&
                roundDate.getMonth() === viewMonth &&
                roundDate.getDate() === day
            );
        });
    }

    function goToPreviousMonth() {
        setPopoverEvent(null);
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    }

    function goToNextMonth() {
        setPopoverEvent(null);
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    }

    function selectDay(day: number) {
        setSelectedDay(day);
        setPopoverEvent(null);
    }

    const isToday = (day: number) =>
        day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

    const isSelected = (day: number) =>
        day === selectedDay && viewMonth === today.getMonth() && viewYear === today.getFullYear();

    const agendaRounds = getRoundsForDay(selectedDay);

    function formatSelectedDate(): string {
        return `${MONTHS[viewMonth]} ${selectedDay}, ${viewYear}`;
    }

    return (
        <div className="app-shell">
            <SidebarNav />
            <main className="content">
                <div className="calendar-heading">
                    <h1>Calendar</h1>
                    <p>{MONTHS[viewMonth]} {viewYear} — interviews and rounds</p>
                </div>

                {loading && <BufferLoader variant="contentOverlay" label="Loading applications..." />}
                
                {error && <div className="form-help" style={{ color: '#b91c1c' }}>{error}</div>}

                <div className="calendar-layout">
                    <section className="calendar-panel">
                        <div className="calendar-toolbar">
                            <div className="calendar-nav">
                                <button type="button" aria-label="Previous month" onClick={goToPreviousMonth}>‹</button>
                            </div>
                            <div className="calendar-month">{MONTHS[viewMonth]} {viewYear}</div>
                            <div className="calendar-nav">
                                <button type="button" aria-label="Next month" onClick={goToNextMonth}>›</button>
                            </div>
                        </div>

                        <div className="calendar-grid">
                            {DAYS.map((d) => (
                                <div key={d} className="calendar-weekday">{d}</div>
                            ))}

                            {cells.map((day, index) => {
                                if (!day) {
                                    return <div key={index} className="calendar-day is-empty" />;
                                }
                                const dayRounds = getRoundsForDay(day);
                                return (
                                    <div
                                        key={index}
                                        className={`calendar-day ${isToday(day) ? 'is-today' : ''} ${isSelected(day) ? 'is-selected' : ''}`}
                                    >
                                        <button type="button" className="calendar-day-button" onClick={() => selectDay(day)}>
                                            {day}
                                        </button>
                                        {dayRounds.length > 0 && (
                                            <div className="event-list">
                                                {dayRounds.map((round) => (
                                                    <button
                                                        key={round.id}
                                                        type="button"
                                                        className="event-chip"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPopoverEvent(round);
                                                        }}
                                                    >
                                                        <span className="event-dot" style={{ backgroundColor: getUrgencyColor(round.interviewDate!) }} />
                                                        <span>{round.round}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="calendar-legend">
                            <span className="legend-item"><i className="legend-dot" style={{ background: '#ef4444' }} />Soon (0–2 days)</span>
                            <span className="legend-item"><i className="legend-dot" style={{ background: '#f59e0b' }} />This week (3–6 days)</span>
                            <span className="legend-item"><i className="legend-dot" style={{ background: '#10b981' }} />Further out</span>
                        </div>
                    </section>

                    <aside className="agenda-panel">
                        <div className="agenda-heading">
                            <div>
                                <h2>{isSelected(selectedDay) ? "Today's schedule" : 'Schedule'}</h2>
                                <p>{formatSelectedDate()}</p>
                            </div>
                            <span className="agenda-count">{agendaRounds.length}</span>
                        </div>
                        <div className="agenda-list">
                            {agendaRounds.length === 0 ? (
                                <div className="agenda-empty">No schedules for this date.</div>
                            ) : (
                                agendaRounds.map((round) => (
                                    <article
                                        key={round.id}
                                        className="agenda-card"
                                        style={{ ['--event-color' as string]: getUrgencyColor(round.interviewDate!) }}
                                        onClick={() => setPopoverEvent(round)}
                                    >
                                        <div className="agenda-card-top">
                                            <h3>{round.round}</h3>
                                            <time>{new Date(round.interviewDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                                        </div>
                                        <p>{round.companyName} · {round.applicationJobTitle}</p>
                                        <div className="agenda-type">
                                            <span className="event-dot" style={{ backgroundColor: getUrgencyColor(round.interviewDate!) }} />
                                            {round.status}
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </aside>
                </div>

                {popoverEvent && (
                    <div className="event-popover">
                        <button type="button" aria-label="Close details" onClick={() => setPopoverEvent(null)}>×</button>
                        <h3>{popoverEvent.round}</h3>
                        <p>
                            {popoverEvent.companyName} · {popoverEvent.applicationJobTitle} ·{' '}
                            {new Date(popoverEvent.interviewDate!).toLocaleString()}.{' '}
                            {popoverEvent.notes || 'No additional notes.'}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}