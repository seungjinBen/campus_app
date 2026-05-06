'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ReceivedNote } from '@/lib/types/match.types';
import { formatTraitBadge } from '@/lib/utils/traitLabel';
import Badge from '@/components/ui/Badge';
import { Check, Contact, MessageSquare, X } from 'lucide-react';

const BADGE_COLORS = ['rose', 'blue', 'violet', 'emerald', 'amber'] as const;
import { respondToNote } from '@/lib/api/match';
import toast from 'react-hot-toast';

interface ReceivedNoteCardProps {
  item: ReceivedNote;
  onRespond: () => void;
}

export default function ReceivedNoteCard({ item, onRespond }: ReceivedNoteCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRespond = async (action: 'ACCEPTED' | 'REJECTED') => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = await respondToNote(item.noteId, action);
      toast.success(result.message);
      onRespond();
    } catch {
      toast.error('오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-brand-sand overflow-hidden animate-fadeIn">
      <div className="flex gap-4 p-4">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={item.photoUrl}
            alt={`${item.nickname}의 프로필 사진`}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-brand-dark text-sm">{item.nickname}</p>
            {item.status === 'ACCEPTED' && (
              <span className="text-xs text-brand-rose font-medium">수락됨</span>
            )}
          </div>

          {item.visibleTraits.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.visibleTraits.map(({ traitKey, traitValue }, i) => (
                <Badge key={traitKey} variant={BADGE_COLORS[i % BADGE_COLORS.length]} className="text-xs">
                  {formatTraitBadge(traitKey, traitValue)}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-start gap-1.5 mt-2.5 p-2.5 bg-brand-rose-light rounded-lg border border-brand-rose/15">
            <MessageSquare className="h-3.5 w-3.5 text-brand-rose flex-shrink-0 mt-0.5" />
            <p className="text-sm text-brand-dark leading-relaxed">{item.noteContent}</p>
          </div>

          {item.status === 'ACCEPTED' && item.selectorContactValue && (
            <div className="flex items-center gap-1.5 mt-2 p-2 bg-[#F0FDF4] rounded-lg border border-[#BBF7D0]">
              <Contact className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 font-medium">{item.selectorContactValue}</p>
            </div>
          )}

          <p className="text-xs text-brand-light mt-1.5">
            {new Date(item.sentAt).toLocaleDateString('ko-KR')}
          </p>

          {item.status === 'PENDING' && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleRespond('ACCEPTED')}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-brand-rose text-white text-sm font-medium transition-opacity disabled:opacity-60"
              >
                <Check className="w-3.5 h-3.5" />
                수락
              </button>
              <button
                onClick={() => handleRespond('REJECTED')}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-brand-warm text-brand-mid text-sm font-medium transition-opacity disabled:opacity-60"
              >
                <X className="w-3.5 h-3.5" />
                거절
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
