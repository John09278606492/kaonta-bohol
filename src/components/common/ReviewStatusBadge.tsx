import React from 'react';
import { ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { SubmissionStatus } from '../../types';

interface ReviewStatusBadgeProps {
  status: SubmissionStatus;
  isDemo?: boolean;
  showExplanation?: boolean;
}

export const ReviewStatusBadge: React.FC<ReviewStatusBadgeProps> = ({
  status,
  isDemo = false,
  showExplanation = false,
}) => {
  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      {status === 'approved' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Verified Listing
        </span>
      )}

      {status === 'pending' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          Pending Review
        </span>
      )}

      {status === 'rejected' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-800 border border-red-200">
          <AlertCircle className="w-3 h-3 text-red-600" />
          Rejected
        </span>
      )}

      {isDemo && (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/[0.04] text-stone-500">
          Sample
        </span>
      )}
    </div>
  );
};
