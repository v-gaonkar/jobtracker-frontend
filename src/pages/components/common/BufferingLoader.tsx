import './buffer-loader.css';

interface BufferLoaderProps {
    label?: string;
    variant?: 'contentOverlay' | 'inline' | 'fullPage';
}

export function BufferLoader({ label, variant = 'inline' }: BufferLoaderProps) {
    const className =
        variant === 'fullPage' ? 'buffer-fullpage' :
        variant === 'contentOverlay' ? 'buffer-content-overlay' :
        'buffer-inline';

    return (
        <div className={className}>
            <svg className="buffer-svg" viewBox="0 0 50 50">
                <circle className="buffer-circle" cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
            </svg>
            {label && <span className="buffer-label">{label}</span>}
        </div>
    );
}