import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  rawText: string;
  timestamp?: number;
}

export interface AppMessageEventData {
  type?: string;
  messages?: ChatMessage[];
  state?: boolean;
  text?: string;
  mvuData?: Record<string, unknown>;
  mvuAvailable?: boolean;
}

export const useChatStore = defineStore('chatStore', () => {
  const messages = ref<ChatMessage[]>([]);
  const isGenerating = ref(false);
  const streamText = ref('');
  const syncedInputText = ref('');

  const isOpening = computed(() => {
    if (messages.value.length === 1) {
      const text = messages.value[0].rawText ?? '';
      return /【开局】|\[自定义开局\]|【自选开局】|【怪物开局】|【高难开局】|【介绍】/.test(text);
    }
    return false;
  });

  const handleHostMessage = (event: MessageEvent<AppMessageEventData>): void => {
    const data = event.data;
    if (!data?.type) return;

    if (data.type === 'SYNC_DATA') {
      messages.value = data.messages ?? [];
    }

    if (data.type === 'GEN_STATE') {
      isGenerating.value = Boolean(data.state);
      if (!isGenerating.value) streamText.value = '';
    }

    if (data.type === 'SYNC_INPUT_FROM_ST') {
      syncedInputText.value = data.text ?? '';
    }
  };

  const sendMessageToHost = (text: string): void => {
    if (!text.trim() || isGenerating.value) return;
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'SEND_CHAT_TO_ST', text }, '*');
    }
  };

  return {
    messages,
    isGenerating,
    streamText,
    syncedInputText,
    isOpening,
    handleHostMessage,
    sendMessageToHost,
  };
});
