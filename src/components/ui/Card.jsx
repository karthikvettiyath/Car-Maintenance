import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className, ...props }) {
    return (
        <div
            className={twMerge(
                clsx(
                    "bg-dark-light/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl",
                    className
                )
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle, className }) {
    return (
        <div className={clsx("mb-4", className)}>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
    )
}
