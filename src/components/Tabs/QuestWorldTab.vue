<template>
  <div class="quest-world-tab">
    <div v-if="hasWorldInfo" class="world-section-wrapper">
      <div class="section-title">
        <Icon icon="lucide:globe" class="section-icon" />
        <span>世界动向 (World)</span>
      </div>

      <div class="world-info-grid">
        <div class="world-info-item">
          <div class="world-info-label">世界动向</div>
          <div class="world-info-val">{{ worldInfo.世界动向 || '暂无重大动向' }}</div>
        </div>
        <div class="world-info-item">
          <div class="world-info-label">城市趣闻</div>
          <div class="world-info-val">{{ worldInfo.城市趣闻 || '暂无传闻' }}</div>
        </div>
        <div class="world-info-item">
          <div class="world-info-label">冒险逸闻</div>
          <div class="world-info-val">{{ worldInfo.冒险逸闻 || '暂无逸闻' }}</div>
        </div>
      </div>
    </div>

    <div class="quest-board-header">
      <div class="section-title" style="margin: 0; border: none; padding: 0">
        <Icon icon="lucide:scroll-text" class="section-icon" />
        <span>任务日志 (Quests)</span>
      </div>
      <div class="quest-tabs">
        <button
          class="quest-tab-btn"
          :class="{ active: questTab === 'ongoing' }"
          @click="questTab = 'ongoing'"
        >
          进行中
        </button>
        <button
          class="quest-tab-btn"
          :class="{ active: questTab === 'completed' }"
          @click="questTab = 'completed'"
        >
          已完成
        </button>
      </div>
    </div>

    <div class="quest-list">
      <div v-if="Object.keys(currentQuests).length === 0" class="empty-board">
        EMPTY BOARD / 尚无记载
      </div>

      <div
        v-for="(quest, name) in currentQuests"
        :key="name"
        class="quest-card"
        :class="{ completed: questTab === 'completed', collapsed: openQuest !== name }"
      >
        <div class="pin-icon"></div>
        <div class="quest-header" :class="getHeaderClass(quest.类型)" @click="toggleQuest(name)">
          <div class="quest-type-tag">{{ quest.类型 || '一般' }}委托</div>
          <div class="quest-name">{{ name }}</div>
        </div>

        <div class="quest-content-wrapper">
          <div class="quest-body">
            <div class="quest-section">
              <div class="quest-label"><Icon icon="lucide:target" /> 当前目标</div>
              <div class="target-box">
                <div class="target-text">{{ quest.当前目标 || '未知目标' }}</div>
              </div>
            </div>

            <div class="quest-section">
              <div class="quest-label"><Icon icon="lucide:info" /> 进度说明</div>
              <div class="insight-box">
                <div class="insight-text">{{ quest.进度说明 || '尚无详细进度描述' }}</div>
              </div>
            </div>

            <div v-if="quest.奖励预览" class="quest-section">
              <div class="quest-label"><Icon icon="lucide:gift" /> 报酬结算</div>
              <div class="reward-box">
                <div class="reward-text">{{ quest.奖励预览 }}</div>
              </div>
            </div>
          </div>
          <div v-if="questTab === 'completed'" class="quest-status-overlay">已完成</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';

import { useMvuStore } from '../../stores/useMvuStore';

const mvuStore = useMvuStore();
const worldInfo = computed(() => mvuStore.worldInfo ?? {});
const hasWorldInfo = computed(
  () => Object.keys(worldInfo.value).length > 0 && worldInfo.value['当前时间'],
);

const questLogs = computed(() => (mvuStore.protagonist.任务日志 as Record<string, unknown>) ?? {});
const questTab = ref<'ongoing' | 'completed'>('ongoing');

const currentQuests = computed<Record<string, Record<string, unknown>>>(() => {
  return questTab.value === 'ongoing'
    ? ((questLogs.value.进行中 as Record<string, Record<string, unknown>>) ?? {})
    : ((questLogs.value.已完成 as Record<string, Record<string, unknown>>) ?? {});
});

const openQuest = ref<string | null>(null);

const toggleQuest = (name: string | number): void => {
  openQuest.value = openQuest.value === String(name) ? null : String(name);
};

const getHeaderClass = (type: unknown): string => {
  if (!type || typeof type !== 'string') return '';
  const typeStr = type;
  if (typeStr.includes('战')) return 'header-combat';
  if (typeStr.includes('护') || typeStr.includes('守')) return 'header-escort';
  if (typeStr.includes('侦') || typeStr.includes('情报') || typeStr.includes('查'))
    return 'header-intel';
  if (typeStr.includes('集') || typeStr.includes('采')) return 'header-gather';
  if (typeStr.includes('引') || typeStr.includes('教')) return 'header-guide';
  return '';
};
</script>

<style scoped>
.quest-world-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  border-bottom: 2px solid rgba(139, 115, 85, 0.3);
  padding-bottom: 8px;
  color: var(--wood-dark);
  font-weight: 900;
  font-size: 18px;
  font-family: 'Cinzel', 'Noto Serif SC', serif;
  letter-spacing: 2px;
}
.section-icon {
  color: var(--wood-light);
  font-size: 20px;
}

.world-info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.world-info-item {
  box-shadow: 2px 2px 0 rgba(139, 115, 85, 0.1);
  border: 1.5px solid var(--wood-light);
  border-left: 5px solid var(--wood-light);
  background: rgba(139, 115, 85, 0.06);
  padding: 12px 15px;
}
.world-info-label {
  display: inline-block;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(139, 115, 85, 0.2);
  padding-bottom: 2px;
  color: var(--wood-light);
  font-weight: 900;
  font-size: 11px;
  letter-spacing: 1px;
}
.world-info-val {
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 13px;
  line-height: 1.6;
}

.quest-board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  border-bottom: 2px solid var(--wood-dark);
  padding-bottom: 10px;
}
.quest-tabs {
  display: flex;
  border: 1px solid rgba(139, 115, 85, 0.2);
  border-radius: 4px;
  background: rgba(139, 115, 85, 0.1);
  padding: 3px;
}
.quest-tab-btn {
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  border-radius: 3px;
  background: transparent;
  padding: 4px 15px;
  color: var(--wood-light);
  font-weight: 900;
  font-size: 12px;
}
.quest-tab-btn.active {
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  background: var(--wood-dark);
  color: var(--brass-gold);
}

.empty-board {
  opacity: 0.3;
  padding: 40px 20px;
  font-weight: 900;
  font-family: serif;
  letter-spacing: 2px;
  text-align: center;
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 10px;
}
.quest-card {
  display: flex;
  position: relative;
  flex-direction: column;
  gap: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    2px 4px 10px rgba(0, 0, 0, 0.15),
    inset 0 0 30px rgba(139, 115, 85, 0.1);
  border: 1px solid #bba282;
  border-radius: 2px;
  background: #fcf4e1;
  padding: 20px;
}
.quest-card.completed {
  filter: sepia(0.4) contrast(0.9);
}

.pin-icon {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  transition: all 0.4s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  background: var(--wood-dark);
  width: 16px;
  height: 16px;
}
.pin-icon::after {
  position: absolute;
  top: 3px;
  left: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  width: 4px;
  height: 4px;
  content: '';
}

.quest-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: background-color 0.3s;
  cursor: pointer;
  margin: -20px -20px 15px -20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-radius: 2px 2px 0 0;
  background: var(--wood-dark);
  padding: 12px 20px;
  user-select: none;
}
.header-combat {
  background: linear-gradient(135deg, var(--highlight-red), #d32f2f) !important;
}
.header-escort {
  background: linear-gradient(135deg, #1b5e20, #388e3c) !important;
}
.header-intel {
  background: linear-gradient(135deg, #0d47a1, #1976d2) !important;
}
.header-gather {
  background: linear-gradient(135deg, #824b1a, #a0522d) !important;
}
.header-guide {
  background: linear-gradient(135deg, #4a148c, #7b1fa2) !important;
}

.quest-type-tag {
  opacity: 0.7;
  color: #fff;
  font-weight: 900;
  font-size: 10px;
  letter-spacing: 2px;
}
.quest-name {
  color: #fff;
  font-weight: 900;
  font-size: 18px;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.quest-card.collapsed {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding-bottom: 0;
}
.quest-card.collapsed .quest-header {
  margin-bottom: 0;
  border-bottom-width: 0;
}
.quest-card.collapsed .quest-content-wrapper {
  transform: scaleY(0.95);
  opacity: 0;
  max-height: 0;
  pointer-events: none;
}
.quest-card.collapsed .pin-icon {
  transform: translateX(-50%) scale(0.8);
  opacity: 0.3;
}

.quest-content-wrapper {
  position: relative;
  transform-origin: top;
  transition: all 0.4s ease;
  overflow: hidden;
}
.quest-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-bottom: 10px;
}

.quest-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--wood-dark);
  font-weight: 900;
  font-size: 13px;
}
.quest-label::after {
  flex-grow: 1;
  background: linear-gradient(to right, rgba(139, 115, 85, 0.3), transparent);
  height: 1px;
  content: '';
}

.target-box {
  box-shadow: 3px 3px 0 rgba(62, 39, 35, 0.15);
  border: 2px solid var(--wood-dark);
  border-left: 6px solid var(--highlight-red);
  background: #fff;
  padding: 12px;
}
.target-text {
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 14px;
  line-height: 1.5;
}

.insight-box {
  box-shadow: 3px 3px 0 rgba(62, 39, 35, 0.15);
  border: 2px solid var(--wood-dark);
  border-left: 6px solid var(--wood-light);
  background: #fff;
  padding: 12px;
}
.insight-text {
  color: var(--wood-dark);
  font-style: italic;
  font-weight: 500;
  font-size: 12px;
  line-height: 1.6;
}

.reward-box {
  box-shadow: 3px 3px 0 rgba(184, 155, 94, 0.1);
  border: 2px solid #b89b5e;
  border-left: 6px solid #b89b5e;
  background: linear-gradient(to bottom, var(--paper-bg));
  padding: 12px;
}
.reward-text {
  color: var(--highlight-red);
  font-weight: 900;
  font-size: 14px;
}

.quest-status-overlay {
  position: absolute;
  top: 50%;
  right: 5%;
  transform: translateY(-50%) rotate(-15deg);
  border: 4px solid rgba(76, 175, 80, 0.2);
  border-radius: 4px;
  padding: 2px 15px;
  pointer-events: none;
  color: rgba(76, 175, 80, 0.2);
  font-weight: 900;
  font-size: 32px;
  font-family: 'Noto Serif SC', serif;
}
</style>
