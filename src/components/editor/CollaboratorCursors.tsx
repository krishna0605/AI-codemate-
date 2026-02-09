import React, { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { PresenceState } from '@/lib/collaboration/presence';
import type * as Monaco from 'monaco-editor';

interface CollaboratorCursorsProps {
  editor: Monaco.editor.IStandaloneCodeEditor | null;
  channel: RealtimeChannel | null;
  currentUserId: string;
}

export const CollaboratorCursors: React.FC<CollaboratorCursorsProps> = ({
  editor,
  channel,
  currentUserId,
}) => {
  const [collaborators, setCollaborators] = useState<PresenceState[]>([]);
  const cursorDecorationsRef = React.useRef<string[]>([]);

  useEffect(() => {
    if (!channel || !editor) return;

    const updateCollaborators = () => {
      const state = channel.presenceState();
      const others = Object.values(state)
        .flat()
        .filter((p: any) => p.id !== currentUserId) as unknown as PresenceState[];

      setCollaborators(others);
    };

    channel.on('presence', { event: 'sync' }, updateCollaborators);
    channel.on('presence', { event: 'join' }, updateCollaborators);
    channel.on('presence', { event: 'leave' }, updateCollaborators);

    // Initial state
    updateCollaborators();

    return () => {
      channel.unsubscribe();
    };
  }, [channel, editor, currentUserId]);

  // Render cursors using Monaco decorations
  useEffect(() => {
    if (!editor) return;

    // Get monaco instance from the editor's model
    // We need to construct Range without directly importing monaco
    // Monaco's deltaDecorations accepts ranges in {startLineNumber, startColumn, endLineNumber, endColumn} format
    const newDecorations = collaborators
      .filter((c) => c.cursor)
      .map((c) => {
        const line = c.cursor!.line;
        const column = c.cursor!.column;

        return {
          range: {
            startLineNumber: line,
            startColumn: column,
            endLineNumber: line,
            endColumn: column,
          },
          options: {
            className: `collaborator-cursor cursor-${c.id}`,
            hoverMessage: { value: `User: ${c.user_email || c.id}` },
            beforeContentClassName: `collaborator-cursor-flag flag-${c.id}`, // Custom CSS needed
          },
        };
      });

    // Use ref to track decorations without triggering re-renders
    cursorDecorationsRef.current = editor.deltaDecorations(
      cursorDecorationsRef.current,
      newDecorations
    );

    // We also need to inject dynamic CSS for cursor colors because Monaco decorations use classes
    const styleId = 'collaborator-cursor-styles';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const cssRules = collaborators
      .map(
        (c) => `
      .cursor-${c.id} {
        border-right: 2px solid ${c.color} !important;
        background-color: ${c.color}20; /* 20% opacity */
      }
      .flag-${c.id}::before {
        content: "${c.user_name?.[0] || 'U'}";
        position: absolute;
        top: -18px;
        left: 0;
        background-color: ${c.color};
        color: white;
        font-size: 10px;
        padding: 1px 4px;
        border-radius: 3px;
        pointer-events: none;
        white-space: nowrap;
        opacity: 0.8;
      }
    `
      )
      .join('\n');

    styleEl.innerHTML = cssRules;
  }, [collaborators, editor]); // Re-run when collaborators change

  return null; // Component renders decorations directly into Monaco
};
