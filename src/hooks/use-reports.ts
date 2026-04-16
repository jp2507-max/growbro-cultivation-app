import { useCallback, useRef } from 'react';

import { useAuth } from '@/providers/auth-provider';
import type { CommunityReportTargetType } from '@/src/hooks/use-community-navigation';
import { type REPORT_REASONS } from '@/src/lib/forms';
import { db, id } from '@/src/lib/instant';
import { normalizeWhitespace } from '@/src/lib/text-sanitization';

type ReportReason = (typeof REPORT_REASONS)[number];

type SubmitReportInput = {
  targetType: CommunityReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
};

export function useReports(): {
  submitReport: (input: SubmitReportInput) => Promise<void>;
} {
  const { profile } = useAuth();
  const isSubmittingRef = useRef(false);

  const submitReport = useCallback(
    async ({ targetType, targetId, reason, details }: SubmitReportInput) => {
      if (isSubmittingRef.current) return;
      if (!profile?.id) throw new Error('Authentication required');
      isSubmittingRef.current = true;

      try {
        const reportId = id();
        const normalizedDetails = details ? normalizeWhitespace(details) : '';

        await db.transact([
          db.tx.reports[reportId].update({
            createdAt: Date.now(),
            details: normalizedDetails,
            reason,
            status: 'pending',
            targetId,
            targetType,
          }),
          db.tx.reports[reportId].link({ reporter: profile.id }),
        ]);
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [profile?.id]
  );

  return { submitReport };
}
