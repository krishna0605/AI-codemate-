import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

export interface CursorPosition {
  line: number;
  column: number;
}

export interface PresenceState {
  id: string;
  cursor: CursorPosition | null;
  color: string;
  online_at: string;
  user_email?: string;
  user_name?: string;
}

export const PRESENCE_COLORS = [
  '#FF5733', // Red/Orange
  '#33FF57', // Green
  '#3357FF', // Blue
  '#F333FF', // Magenta
  '#33FFF3', // Cyan
  '#F3FF33', // Yellow
  '#FF3380', // Pink
  '#8033FF', // Purple
];

const generateColor = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PRESENCE_COLORS.length;
  return PRESENCE_COLORS[index];
};

export const createPresenceChannel = (
  supabase: SupabaseClient,
  documentId: string,
  userId: string,
  userInfo?: { email?: string; name?: string }
): RealtimeChannel => {
  const channel = supabase.channel(`doc:${documentId}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        id: userId,
        cursor: null,
        color: generateColor(userId),
        online_at: new Date().toISOString(),
        user_email: userInfo?.email,
        user_name: userInfo?.name,
      });
    }
  });

  return channel;
};

export const updateCursor = async (channel: RealtimeChannel, cursor: CursorPosition) => {
  if (channel.state === 'closed') return;

  // Safe access to presence state key
  const presenceKey = (channel.params as any)?.config?.presence?.key;
  if (!presenceKey) return;

  const userState = channel.presenceState()[presenceKey]?.[0];
  if (!userState) return;

  await channel.track({
    ...userState,
    cursor,
    updated_at: new Date().toISOString(),
  });
};
