<template>
  <div class="chat-tab-root">
    <OpeningMain v-if="chatStore.isOpening" />

    <div v-else class="chat-layout">
      <div ref="scrollContainerRef" class="chat-messages">
        <div v-if="listData.length === 0" class="empty-hint">📜 此处暂无书写的传说...</div>

        <div
          v-if="listData.length > 0"
          :style="{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }"
        >
          <div
            v-for="virtualRow in rowVirtualizer.getVirtualItems()"
            :key="virtualRow.index"
            :ref="(el) => rowVirtualizer.measureElement(el as HTMLElement | null)"
            :data-index="virtualRow.index"
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
              paddingBottom: '15px',
            }"
          >
            <div class="msg-bubble" :class="listData[virtualRow.index].role">
              <div class="msg-name">
                {{ listData[virtualRow.index].role === 'ai' ? '四方指引' : '你' }}
              </div>
              <div
                class="msg-text"
                v-html="renderMarkdown(listData[virtualRow.index].rawText)"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <input
          v-model="inputText"
          type="text"
          placeholder="向这个世界传达你的意志..."
          class="chat-input"
          @keydown.enter="handleSend"
        />
        <button class="chat-send-btn" title="发送" @click="handleSend">
          <Icon icon="lucide:send" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { ref, nextTick, watch, computed } from 'vue';

import { useChatStore } from '../../stores/useChatStore';
import { renderMarkdown } from '../../utils/markdown';
import OpeningMain from '../Opening/OpeningMain.vue';

const chatStore = useChatStore();
const inputText = ref('');

const scrollContainerRef = ref<HTMLElement | null>(null);
const listData = computed(() => chatStore.messages);

const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: listData.value.length,
    getScrollElement: (): HTMLElement | null => scrollContainerRef.value,
    estimateSize: (): number => 100,
    overscan: 3,
  })),
);

const scrollToBottom = async (): Promise<void> => {
  await nextTick();
  if (listData.value.length > 0) {
    rowVirtualizer.value.scrollToIndex(listData.value.length - 1, { align: 'end' });
  }
  const container = scrollContainerRef.value;
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
};

watch(() => chatStore.messages.length, scrollToBottom, { immediate: true });

const handleSend = (): void => {
  if (!inputText.value.trim()) return;
  chatStore.sendMessageToHost(inputText.value.trim());
  inputText.value = '';
  void scrollToBottom();
};
</script>

<style scoped>
.chat-tab-root {
  width: 100%;
  height: 100%;
}

.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}

.chat-messages {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  padding: 10px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}
.chat-messages::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: var(--wood-light);
}

.empty-hint {
  opacity: 0.4;
  margin-top: 50px;
  font-size: 18px;
  font-family: 'Cinzel', 'Noto Serif SC', serif;
  text-align: center;
}

.msg-bubble {
  position: relative;
  box-shadow: 0 2px 6px rgba(139, 115, 85, 0.15);
  border-radius: 4px;
  padding: 12px 16px;
  max-width: 85%;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.msg-bubble.ai {
  margin-right: auto;
  border: 1px solid rgba(139, 115, 85, 0.3);
  border-left: 4px solid var(--wood-light);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6));
}

.msg-bubble.user {
  margin-left: auto;
  border: 1px solid var(--brass-gold);
  border-right: 4px solid var(--wood-dark);
  background: linear-gradient(135deg, rgba(225, 205, 160, 0.3), rgba(197, 160, 89, 0.1));
}
@media (max-width: 600px) {
  .msg-bubble {
    max-width: 95%;
  }
}

.msg-name {
  opacity: 0.8;
  margin-bottom: 4px;
  color: var(--wood-light);
  font-weight: 900;
  font-size: 11px;
}

.chat-input-area {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  margin-top: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--paper-shadow, #d9c5a3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  padding: 10px;
}

.chat-input {
  flex-grow: 1;
  outline: none;
  border: none;
  background: transparent;
  color: var(--paper-text);
  font-weight: bold;
  font-size: 14px;
  font-family: inherit;
}

.chat-send-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
  cursor: pointer;
  border: none;
  border-radius: 6px;
  background: var(--wood-dark);
  width: 40px;
  height: 40px;
  color: var(--brass-gold);
}

.chat-send-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  background: var(--wood-light);
}

:deep(.msg-text p) {
  margin: 0 0 8px 0;
}
:deep(.msg-text p:last-child) {
  margin-bottom: 0;
}
:deep(.zod-dice-event-wrapper) {
  margin-top: 10px;
  border: 1px dashed var(--wood-light);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
  padding: 10px;
}
</style>
