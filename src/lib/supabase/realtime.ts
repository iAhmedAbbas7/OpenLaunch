// <== SUPABASE REALTIME HELPERS ==>
"use client";

// <== IMPORTS ==>
import type { Message } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/client";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

// <== MESSAGE PAYLOAD TYPE ==>
export type MessagePayload = RealtimePostgresChangesPayload<Message>;

// <== CONVERT SNAKE CASE TO CAMEL CASE ==>
function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  // CREATE NEW OBJECT
  const result: Record<string, unknown> = {};
  // LOOP THROUGH KEYS
  Object.keys(obj).forEach((key) => {
    // CONVERT KEY TO CAMEL CASE
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
    // SET VALUE
    result[camelKey] = obj[key];
  });
  // RETURN RESULT
  return result;
}

// <== CONVERT DB MESSAGE TO MESSAGE TYPE ==>
function convertDbMessage(dbMessage: Record<string, unknown>): Message {
  // CONVERT SNAKE CASE TO CAMEL CASE
  const converted = snakeToCamel(dbMessage);
  // RETURN AS MESSAGE
  return converted as unknown as Message;
}

// <== PRESENCE USER TYPE ==>
export interface PresenceUser {
  // <== USER ID ==>
  userId: string;
  // <== USERNAME ==>
  username: string;
  // <== AVATAR URL ==>
  avatarUrl: string | null;
  // <== ONLINE AT ==>
  onlineAt: string;
}

// <== PRESENCE STATE TYPE ==>
export interface PresenceState {
  // <== USERS ==>
  [key: string]: PresenceUser[];
}

// <== SUBSCRIBE TO MESSAGES ==>
export function subscribeToMessages(
  conversationId: string,
  callbacks: {
    onInsert?: (message: Message) => void;
    onUpdate?: (message: Message) => void;
    onDelete?: (oldMessage: Message) => void;
  }
): RealtimeChannel {
  // CREATE SUPABASE CLIENT
  const supabase = createClient();
  // CREATE CHANNEL
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        // CALL ON INSERT CALLBACK
        if (callbacks.onInsert && payload.new) {
          // CONVERT SNAKE CASE TO CAMEL CASE AND CALL CALLBACK
          callbacks.onInsert(
            convertDbMessage(payload.new as Record<string, unknown>)
          );
        }
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        // CALL ON UPDATE CALLBACK
        if (callbacks.onUpdate && payload.new) {
          // CONVERT SNAKE CASE TO CAMEL CASE AND CALL CALLBACK
          callbacks.onUpdate(
            convertDbMessage(payload.new as Record<string, unknown>)
          );
        }
      }
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        // CALL ON DELETE CALLBACK
        if (callbacks.onDelete && payload.old) {
          // CONVERT SNAKE CASE TO CAMEL CASE AND CALL CALLBACK
          callbacks.onDelete(
            convertDbMessage(payload.old as Record<string, unknown>)
          );
        }
      }
    )
    .subscribe();
  // RETURN CHANNEL
  return channel;
}

// <== SUBSCRIBE TO CONVERSATIONS ==>
export function subscribeToConversations(
  userId: string,
  callbacks: {
    onNewMessage?: (conversationId: string) => void;
    onConversationUpdate?: (conversationId: string) => void;
  }
): RealtimeChannel {
  // CREATE SUPABASE CLIENT
  const supabase = createClient();
  // CREATE CHANNEL FOR CONVERSATION UPDATES
  const channel = supabase
    .channel(`user-conversations:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "conversations",
      },
      (payload) => {
        // TYPE THE PAYLOAD
        const oldData = payload.old as Record<string, unknown>;
        // TYPE THE NEW DATA
        const newData = payload.new as Record<string, unknown>;
        // CALL ON CONVERSATION UPDATE CALLBACK
        if (callbacks.onConversationUpdate && newData.id) {
          // CALL CALLBACK
          callbacks.onConversationUpdate(newData.id as string);
        }
        // ALSO TRIGGER NEW MESSAGE IF LAST MESSAGE CHANGED
        if (
          oldData.last_message_at !== newData.last_message_at &&
          callbacks.onNewMessage &&
          newData.id
        ) {
          // CALL CALLBACK
          callbacks.onNewMessage(newData.id as string);
        }
      }
    )
    .subscribe();
  // RETURN CHANNEL
  return channel;
}

// <== HELPER TO GET ONLINE USERS FROM PRESENCE STATE ==>
function getOnlineUsersFromState(channel: RealtimeChannel): PresenceUser[] {
  // GET STATE
  const state = channel.presenceState<PresenceUser>();
  // GET ONLINE USERS
  const onlineUsers: PresenceUser[] = [];
  // LOOP THROUGH STATE
  Object.values(state).forEach((presences) => {
    // ADD PRESENCES TO ONLINE USERS
    presences.forEach((presence) => {
      // ADD TO ONLINE USERS
      onlineUsers.push(presence);
    });
  });
  // RETURN ONLINE USERS
  return onlineUsers;
}

// <== ONLINE PRESENCE CHANNEL ==>
export function createPresenceChannel(
  currentUser: {
    userId: string;
    username: string;
    avatarUrl: string | null;
  },
  onPresenceChange: (onlineUsers: PresenceUser[]) => void
): RealtimeChannel {
  // CREATE SUPABASE CLIENT
  const supabase = createClient();
  // CREATE CHANNEL
  const channel = supabase.channel("online-users", {
    config: {
      presence: {
        key: currentUser.userId,
      },
    },
  });
  // HANDLE PRESENCE SYNC (INITIAL STATE AND UPDATES)
  channel
    .on("presence", { event: "sync" }, () => {
      // GET AND REPORT ONLINE USERS
      onPresenceChange(getOnlineUsersFromState(channel));
    })
    .on("presence", { event: "join" }, () => {
      // SOMEONE JOINED - UPDATE LIST
      onPresenceChange(getOnlineUsersFromState(channel));
    })
    .on("presence", { event: "leave" }, () => {
      // SOMEONE LEFT - UPDATE LIST
      onPresenceChange(getOnlineUsersFromState(channel));
    })
    // HANDLE SUBSCRIPTION STATUS
    .subscribe(async (status) => {
      // CHECK IF SUBSCRIBED
      if (status === "SUBSCRIBED") {
        // TRACK PRESENCE
        await channel.track({
          userId: currentUser.userId,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
          onlineAt: new Date().toISOString(),
        });
      }
    });
  // RETURN CHANNEL
  return channel;
}

// <== CONVERSATION PRESENCE CHANNEL ==>
export function createConversationPresenceChannel(
  conversationId: string,
  currentUser: {
    userId: string;
    username: string;
    avatarUrl: string | null;
  },
  onPresenceChange: (onlineUsers: PresenceUser[]) => void
): RealtimeChannel {
  // CREATE SUPABASE CLIENT
  const supabase = createClient();
  // CREATE CHANNEL
  const channel = supabase.channel(`presence:${conversationId}`, {
    config: {
      presence: {
        key: currentUser.userId,
      },
    },
  });
  // HANDLE PRESENCE SYNC (INITIAL STATE AND UPDATES)
  channel
    .on("presence", { event: "sync" }, () => {
      // GET AND REPORT ONLINE USERS
      onPresenceChange(getOnlineUsersFromState(channel));
    })
    .on("presence", { event: "join" }, () => {
      // SOMEONE JOINED - UPDATE LIST
      onPresenceChange(getOnlineUsersFromState(channel));
    })
    .on("presence", { event: "leave" }, () => {
      // SOMEONE LEFT - UPDATE LIST
      onPresenceChange(getOnlineUsersFromState(channel));
    })
    // HANDLE SUBSCRIPTION STATUS
    .subscribe(async (status) => {
      // CHECK IF SUBSCRIBED
      if (status === "SUBSCRIBED") {
        // TRACK PRESENCE
        await channel.track({
          userId: currentUser.userId,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
          onlineAt: new Date().toISOString(),
        });
      }
    });
  // RETURN CHANNEL
  return channel;
}

// <== UNSUBSCRIBE FROM CHANNEL ==>
export function unsubscribeFromChannel(channel: RealtimeChannel): void {
  // CREATE SUPABASE CLIENT
  const supabase = createClient();
  // UNSUBSCRIBE
  supabase.removeChannel(channel);
}
