import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface PerformanceOptimizedSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  height?: string;
}

const PerformanceOptimizedSuspense: React.FC<PerformanceOptimizedSuspenseProps> = ({ 
  children, 
  fallback,
  height = "40vh" 
}) => {
  const defaultFallback = (
    <div className="flex flex-col space-y-3 p-4" style={{ minHeight: height }}>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-32 w-full" />
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

export default PerformanceOptimizedSuspense;