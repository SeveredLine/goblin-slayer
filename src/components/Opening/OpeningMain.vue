<template>
  <div class="opening-main-container">
    <div class="opening-header">
      <h2>📜 命运交汇之所</h2>
      <p class="subtitle">在这一刻，你将决定自己以何种姿态降临四方世界。</p>
    </div>

    <div class="opening-body">
      <div class="opening-sidebar">
        <button
          v-for="mode in openingModes"
          :key="mode.id"
          class="mode-btn"
          :class="{ active: currentMode === mode.id }"
          @click="currentMode = mode.id"
        >
          <Icon :icon="mode.icon" /> {{ mode.name }}
        </button>
      </div>

      <div class="opening-content">
        <div class="mode-desc">
          <h3>{{ currentModeData.name }}</h3>
          <p>{{ currentModeData.desc }}</p>
        </div>

        <div class="generator-area">
          <Transition name="fade" mode="out-in">
            <component :is="activeComponent" v-if="activeComponent" />
            <div v-else class="placeholder-box">
              <Icon icon="lucide:book-open" class="placeholder-icon" />
              <p>
                查看《哥布林杀手TRPG》的核心规则与环境设置。<br /><br />左侧选择命运之路以开始。
              </p>
            </div>
          </Transition>
        </div>

        <div class="action-footer">
          <button class="btn-submit" :disabled="isSubmitting" @click="submitCharacter">
            {{ isSubmitting ? '命运交织中...' : '签署命运契约' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { Component } from 'vue';
import { ref, computed } from 'vue';

import { useChatStore } from '../../stores/useChatStore';
import { buildCharacterPrompt } from '../../utils/characterBuilder';

import CustomOpening from './CustomOpening.vue';

const openingModes = [
  {
    id: 'intro',
    name: '世界概览',
    icon: 'lucide:book-open',
    desc: '查看《哥布林杀手TRPG》的核心规则与环境设置。',
  },
  {
    id: 'standard',
    name: '冒险者开局',
    icon: 'lucide:sword',
    desc: '从凡人的视角开始，投掷命运的骰子，踏上常规的讨伐之旅。',
  },
  {
    id: 'hardcore',
    name: '不幸者(高难)',
    icon: 'lucide:skull',
    desc: '你从绝望的深渊中睁眼。开局将受到严酷的惩罚与限制，甚至可能成为俘虏。',
  },
  {
    id: 'monster',
    name: '异端(怪物)',
    icon: 'lucide:ghost',
    desc: '拥抱暗夜的血脉，作为哥布林、不死族或深渊魔兽降生。',
  },
  {
    id: 'custom',
    name: '自由谱写',
    icon: 'lucide:pen-tool',
    desc: '完全自定义你的出身、属性与技能。跳过命运的判定，亲自书写传说。',
  },
];

const currentMode = ref(openingModes[0].id);

const currentModeData = computed(() => {
  return openingModes.find((m) => m.id === currentMode.value) ?? openingModes[0];
});

const activeComponent = computed<Component | null>(() => {
  if (currentMode.value === 'custom') return CustomOpening as Component;
  return null;
});

const chatStore = useChatStore();
const isSubmitting = ref(false);

const submitCharacter = (): void => {
  isSubmitting.value = true;

  const slashCommand = buildCharacterPrompt();

  chatStore.sendMessageToHost(slashCommand);

  setTimeout(() => {
    isSubmitting.value = false;
  }, 2000);
};
</script>

<style scoped>
.opening-main-container {
  display: flex;
  flex-direction: column;
  box-shadow: inset 0 0 40px var(--paper-shadow);
  border: 2px solid var(--wood-light);
  border-radius: 8px;
  background: var(--paper-bg);
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.opening-header {
  border-bottom: 3px solid var(--paper-ink);
  background: linear-gradient(to bottom, var(--wood-dark), var(--wood-light));
  padding: 15px 25px;
  color: var(--brass-gold);
  text-align: center;
}
.opening-header h2 {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-family: 'Cinzel', serif;
  letter-spacing: 2px;
}
.subtitle {
  margin: 0;
  color: #a89a8a;
  font-size: 12px;
}

.opening-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.opening-sidebar {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  border-right: 2px solid rgba(139, 115, 85, 0.3);
  background: rgba(44, 30, 22, 0.08);
  padding: 15px 0;
  width: 220px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  border-left: 4px solid transparent;
  background: transparent;
  padding: 16px 20px;
  color: var(--wood-light);
  font-weight: 900;
  font-size: 15px;
  font-family: 'Noto Serif SC', serif;
  text-align: left;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

.mode-btn.active {
  box-shadow:
    inset 0 2px 5px rgba(0, 0, 0, 0.3),
    inset 4px 0 0 var(--brass-gold);
  border-left-color: transparent;
  background: linear-gradient(90deg, var(--wood-dark), var(--wood-light));
  color: var(--brass-gold);
}

@media (max-width: 768px) {
  .opening-body {
    flex-direction: column;
    overflow-y: auto;
  }
  .opening-sidebar {
    flex-direction: row;
    border-right: none;
    border-bottom: 2px solid rgba(139, 115, 85, 0.3);
    padding: 0;
    width: 100%;
    overflow-x: auto;
  }
  .mode-btn {
    border-bottom: 4px solid transparent;
    border-left: none;
    padding: 12px 16px;
    white-space: nowrap;
  }
  .mode-btn.active {
    box-shadow:
      inset 0 -4px 0 var(--brass-gold),
      inset 0 2px 5px rgba(0, 0, 0, 0.3);
    background: linear-gradient(0deg, var(--wood-dark), var(--wood-light));
  }
}

.opening-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 25px;
  overflow-y: auto;
}

.mode-desc {
  margin-bottom: 20px;
  border-bottom: 2px dashed rgba(139, 115, 85, 0.4);
  padding-bottom: 15px;
}
.mode-desc h3 {
  margin: 0 0 8px 0;
  color: var(--wood-dark);
  font-size: 24px;
}
.mode-desc p {
  opacity: 0.8;
  margin: 0;
  color: var(--paper-ink);
  line-height: 1.6;
}

.generator-area {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
}
.placeholder-box {
  opacity: 0.4;
  text-align: center;
}
.placeholder-icon {
  margin-bottom: 15px;
  color: var(--wood-dark);
  font-size: 64px;
}

.action-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  border-top: 1px solid rgba(139, 115, 85, 0.2);
  padding-top: 15px;
}

.btn-submit {
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border: 2px solid var(--brass-gold);
  border-radius: 4px;
  background: var(--wood-dark);
  padding: 12px 35px;
  color: var(--brass-gold);
  font-weight: 700;
  font-size: 16px;
  font-family: 'Noto Serif SC', serif;
}
.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  background: var(--wood-light);
}
</style>
