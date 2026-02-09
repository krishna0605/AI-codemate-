import { SupabaseClient } from '@supabase/supabase-js';
import * as Y from 'yjs';
// @ts-ignore
import SupabaseProvider from 'y-supabase/dist/index.js';
// @ts-ignore
import { SocketIOProvider } from 'y-socket.io/dist/client';

export const createYjsProvider = (supabase: SupabaseClient, doc: Y.Doc, documentId: string) => {
  const collabServerUrl = process.env.NEXT_PUBLIC_COLLAB_SERVER_URL;

  if (collabServerUrl) {
    console.log('Using custom collaboration server:', collabServerUrl);
    return new SocketIOProvider(collabServerUrl, documentId, doc, {
      autoConnect: true,
    });
  }

  // Fallback to Supabase
  return new SupabaseProvider(doc, supabase, {
    channel: `room-${documentId}`,
    id: documentId,
    tableName: 'documents',
    columnName: 'content',
  });
};
