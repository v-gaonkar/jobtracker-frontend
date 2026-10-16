import type { ReactNode } from "react";
import "./EmptyState.css";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode; // optional custom icon per page
  action?: ReactNode; // optional button
}

const DefaultIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const EmptyState = ({
  title = "Nothing here yet",
  message = "When there is something to show, it will appear here.",
  icon,
  action,
}: EmptyStateProps) => {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state__illustration">
        <div className="empty-state__ring">
          <div className="empty-state__icon">{icon ?? <DefaultIcon />}</div>
        </div>
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
};

export { EmptyState };