'use client';

import { useEffect, useState } from 'react';
import { getReceivedContacts, getReceivedNotes } from '@/lib/api/match';
import { ReceivedContact, ReceivedNote } from '@/lib/types/match.types';
import { handleApiError } from '@/lib/api/handleApiError';
import ReceivedContactCard from '@/components/match/ReceivedContactCard';
import ReceivedNoteCard from '@/components/match/ReceivedNoteCard';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'contacts' | 'notes';

export default function ReceivedPage() {
  const [tab, setTab] = useState<Tab>('contacts');
  const [contacts, setContacts] = useState<ReceivedContact[]>([]);
  const [notes, setNotes] = useState<ReceivedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const noteData = await getReceivedNotes();
      setNotes(noteData);
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [contactData, noteData] = await Promise.all([
          getReceivedContacts(),
          getReceivedNotes(),
        ]);
        setContacts(contactData);
        setNotes(noteData);
      } catch (err) {
        toast.error(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-brand-rose" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 탭 */}
      <div className="flex rounded-xl bg-brand-warm p-1">
        <button
          onClick={() => setTab('contacts')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === 'contacts'
              ? 'bg-white text-brand-dark shadow-card'
              : 'text-brand-light'
          }`}
        >
          연락처 열람자 {contacts.length > 0 && `(${contacts.length})`}
        </button>
        <button
          onClick={() => setTab('notes')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === 'notes'
              ? 'bg-white text-brand-dark shadow-card'
              : 'text-brand-light'
          }`}
        >
          받은 쪽지 {notes.length > 0 && `(${notes.length})`}
        </button>
      </div>

      {tab === 'contacts' && (
        <>
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <span className="text-4xl">🔒</span>
              <p className="text-brand-mid text-sm">아직 아무도 당신의 연락처를 열람하지 않았어요</p>
            </div>
          ) : (
            contacts.map((item) => (
              <ReceivedContactCard key={item.selectorId} item={item} />
            ))
          )}
        </>
      )}

      {tab === 'notes' && (
        <>
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <span className="text-4xl">💌</span>
              <p className="text-brand-mid text-sm">아직 받은 쪽지가 없어요</p>
            </div>
          ) : (
            notes.map((item) => (
              <ReceivedNoteCard key={item.noteId} item={item} onRespond={fetchNotes} />
            ))
          )}
        </>
      )}
    </div>
  );
}
