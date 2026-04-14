import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

export function Table({ headers, children, className }: TableProps) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-2xl border border-slate-100', className)}>
      <table className="w-full text-sm text-left min-w-[600px]">
        <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-4 border-b border-slate-100">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {children}
        </tbody>
      </table>
    </div>
  );
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr 
      onClick={onClick}
      className={cn(
        'group bg-white hover:bg-primary-50/30 transition-all duration-200',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export function TableCell({ children, className, colSpan }: TableCellProps) {
  return (
    <td 
      colSpan={colSpan}
      className={cn('px-6 py-4 whitespace-nowrap text-slate-600 font-medium', className)}
    >
      {children}
    </td>
  );
}
