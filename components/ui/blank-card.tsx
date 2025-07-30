import React from 'react';
import { Card } from '@/components/ui/card';

interface BlankCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function BlankCard({ children, className = '', title }: BlankCardProps) {
  return (
    <Card className={`p-8 shadow-lg ${className}`}>
      {title && (
        <h2 className="text-2xl font-semibold mb-6 text-slate-800">
          {title}
        </h2>
      )}
      {children}
    </Card>
  );
}