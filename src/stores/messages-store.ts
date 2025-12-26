// <== IMPORTS ==>
import { create } from "zustand";

// <== MESSAGES STORE STATE ==>
interface MessagesStoreState {
  // <== ACTIVE CONVERSATION ID ==>
  activeConversationId: string | null;
  // <== LAST READ TIMESTAMPS ==>
  lastReadTimestamps: Record<string, Date>;
  // <== SET ACTIVE CONVERSATION ==>
  setActiveConversation: (conversationId: string | null) => void;
  // <== UPDATE LAST READ TIMESTAMP ==>
  updateLastReadTimestamp: (conversationId: string, timestamp: Date) => void;
  // <== GET LAST READ TIMESTAMP ==>
  getLastReadTimestamp: (conversationId: string) => Date | null;
  // <== IS CONVERSATION ACTIVE ==>
  isConversationActive: (conversationId: string) => boolean;
}

// <== USE MESSAGES STORE ==>
export const useMessagesStore = create<MessagesStoreState>((set, get) => ({
  // <== INITIAL STATE ==>
  activeConversationId: null,
  // <== LAST READ TIMESTAMPS ==>
  lastReadTimestamps: {},
  // <== SET ACTIVE CONVERSATION ==>
  setActiveConversation: (conversationId) => {
    // SET ACTIVE CONVERSATION
    set({ activeConversationId: conversationId });
  },
  // <== UPDATE LAST READ TIMESTAMP ==>
  updateLastReadTimestamp: (conversationId, timestamp) => {
    // UPDATE LAST READ TIMESTAMPS
    set((state) => ({
      lastReadTimestamps: {
        ...state.lastReadTimestamps,
        [conversationId]: timestamp,
      },
    }));
  },
  // <== GET LAST READ TIMESTAMP ==>
  getLastReadTimestamp: (conversationId) => {
    // GET LAST READ TIMESTAMP
    return get().lastReadTimestamps[conversationId] ?? null;
  },
  // <== IS CONVERSATION ACTIVE ==>
  isConversationActive: (conversationId) => {
    // CHECK IF CONVERSATION IS ACTIVE
    return get().activeConversationId === conversationId;
  },
}));
