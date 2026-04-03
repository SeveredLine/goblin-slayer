import { onMounted, onUnmounted } from 'vue';

import { type AppMessageEventData, useChatStore } from '../stores/useChatStore';
import { useMvuStore } from '../stores/useMvuStore';

export function useMessageSync(): void {
  const chatStore = useChatStore();
  const mvuStore = useMvuStore();

  const messageHandler = (event: MessageEvent): void => {
    const data = event.data as AppMessageEventData;
    if (!data?.type) return;

    chatStore.handleHostMessage(event as MessageEvent<AppMessageEventData>);

    if (data.type === 'SYNC_DATA' || data.type === 'UPDATE_MVU_DATA') {
      if (data.mvuData) {
        mvuStore.updateMvuData(data.mvuData, data.mvuAvailable ?? true);
      }
    }
  };

  onMounted(() => {
    window.addEventListener('message', messageHandler);
  });

  onUnmounted(() => {
    window.removeEventListener('message', messageHandler);
  });
}
