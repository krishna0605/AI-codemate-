import { SupabaseClient } from '@supabase/supabase-js';
import * as Y from 'yjs';
// @ts-ignore
import SupabaseProvider from 'y-supabase/dist/index.js';

export const createYjsProvider = (supabase: SupabaseClient, doc: Y.Doc, documentId: string) => {
  const provider = new SupabaseProvider(doc, supabase, {
    channel: `room-${documentId}`,
    id: documentId,
    tableName: 'documents', // This might need to be configurable
    columnName: 'content',
  });

  return provider;
};
