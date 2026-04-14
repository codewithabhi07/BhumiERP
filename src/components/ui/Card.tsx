import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: ReactNode;
}

export function Card({ children, className, title, description, footer }: CardProps) {
  return (
    <div className={cn('rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40 overflow-hidden', className)}>
      {(title || description) && (
        <div className="border-b border-slate-50 p-6 lg:p-8">
          {title && <h3 className="text-xl font-black leading-none tracking-tight text-slate-900 uppercase italic">{title}</h3>}
          {description && <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">{description}</p>}
        </div>
      )}
      <div className={cn('p-6 lg:p-8', !title && !description && 'pt-6')}>
        {children}
      </div>
      {footer && (
        <div className="border-t border-slate-50 bg-slate-50/30 p-6 lg:p-8">
          {footer}
        </div>
      )}
    </div>
  );
}
