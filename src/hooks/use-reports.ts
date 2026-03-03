import { useCallback } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, id } from '@/src/lib/instant';
import { normalizeWhitespace } from '@/src/lib/text-sanitization';

type ReportTargetType = 'post' | 'comment' | 'user';
type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'other';

type SubmitReportInput = {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
};

export function useReports(): {
  submitReport: (input: SubmitReportInput) => Promise<void>;
} {
  const { profile } = useAuth();

  const submitReport = useCallback(
    async ({ targetType, targetId, reason, details }: SubmitReportInput) => {
      if (!profile?.id) throw new Error('Authentication required');

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
    },
    [profile?.id]
  );

  return { submitReport };
}
