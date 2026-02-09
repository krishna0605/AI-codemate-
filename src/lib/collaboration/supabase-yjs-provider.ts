import * as Y from 'yjs';
import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Awareness } from 'y-protocols/awareness';
import * as AwarenessProtocol from 'y-protocols/awareness';

export class SupabaseYjsProvider {
  public awareness: Awareness;
  private channel: RealtimeChannel;
  private doc: Y.Doc;
  private connected: boolean = false;

  constructor(
    private supabase: SupabaseClient,
    doc: Y.Doc,
    private channelId: string
  ) {
    this.doc = doc;
    this.awareness = new Awareness(doc);

    this.channel = this.supabase.channel(this.channelId);

    this.setupChannel();
  }

  private setupChannel() {
    this.channel
      .on('broadcast', { event: 'yjs-sync' }, ({ payload }) => {
        this.receiveSyncStep(payload);
      })
      .on('broadcast', { event: 'yjs-awareness' }, ({ payload }) => {
        this.receiveAwarenessUpdate(payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.connected = true;
          this.broadcastSyncStep(); // Initial sync attempt
        }
      });

    // Listen for local updates to broadcast
    this.doc.on('update', (update: Uint8Array) => {
      this.broadcastUpdate(update);
    });

    // Listen for local awareness updates
    this.awareness.on(
      'update',
      ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }) => {
        const changedClients = added.concat(updated).concat(removed);
        const update = AwarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients);
        this.broadcastAwareness(update);
      }
    );
  }

  private broadcastUpdate(update: Uint8Array) {
    if (!this.connected) return;
    this.channel.send({
      type: 'broadcast',
      event: 'yjs-sync',
      payload: Array.from(update), // Convert Uint8Array to number[] for JSON serialization
    });
  }

  private broadcastAwareness(update: Uint8Array) {
    if (!this.connected) return;
    this.channel.send({
      type: 'broadcast',
      event: 'yjs-awareness',
      payload: Array.from(update),
    });
  }

  private receiveSyncStep(payload: number[]) {
    // Apply remote update
    Y.applyUpdate(this.doc, new Uint8Array(payload));
  }

  private receiveAwarenessUpdate(payload: number[]) {
    AwarenessProtocol.applyAwarenessUpdate(this.awareness, new Uint8Array(payload), 'remote');
  }

  // Simulate a sync step (simplified for now, full sync usually requires vector clocks)
  private broadcastSyncStep() {
    const stateVector = Y.encodeStateVector(this.doc);
    // In a full implementation, we'd ask for differences based on this vector.
    // For this simple version, we'll just broadcast the full state on connect (not efficient for large docs but works for small/mid)
    // Actually, let's just broadcast the current state as an update
    const update = Y.encodeStateAsUpdate(this.doc);
    this.broadcastUpdate(update);
  }

  public destroy() {
    this.channel.unsubscribe();
    this.connected = false;
    this.awareness.destroy();
  }
}

export const createYjsProvider = (supabase: SupabaseClient, doc: Y.Doc, documentId: string) => {
  return new SupabaseYjsProvider(supabase, doc, `room-${documentId}`);
};
