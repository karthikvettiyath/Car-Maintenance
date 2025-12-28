import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    isLoading,
    disabled,
    ...props
}) {
    const variants = {
        primary: "bg-primary hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20",
        secondary: "bg-secondary hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20",
        outline: "border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white bg-transparent",
        ghost: "text-slate-400 hover:text-white hover:bg-white/5",
        danger: "bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5",
        lg: "px-6 py-3 text-lg"
    };

    return (
        <button
            className={twMerge(
                clsx(
                    "rounded-xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                    variants[variant],
                    sizes[size],
                    className
                )
            )}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}
