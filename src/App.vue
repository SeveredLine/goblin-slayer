<template>
  <div class="zod-app-container">
    <div ref="swipeAreaRef" class="scroll-wrapper">
      <div class="roller roller-start">
        <div class="roller-cap cap-1"></div>
        <div class="roller-cap cap-2"></div>

        <div class="nav-icons">
          <div
            v-for="(tab, index) in tabs"
            :key="tab.id"
            class="nav-icon-btn"
            :class="{ 'is-active': activeTabIndex === index }"
            :title="tab.name"
            @click="handleTabSwitch(index)"
          >
            <Icon :icon="tab.icon" />
          </div>
        </div>
      </div>

      <div class="parchment-viewport" :class="{ 'is-rolling': isRolling }">
        <div class="parchment-inner">
          <Transition name="fade" mode="out-in">
            <Icon :key="currentTab.icon" :icon="currentTab.icon" class="watermark-icon" />
          </Transition>

          <div class="parchment-header">
            <div class="header-info">
              <Icon icon="lucide:clock" class="header-icon" />
              <span>{{ timeText }}</span>
            </div>
            <div class="header-info">
              <Icon icon="lucide:map-pin" class="header-icon" />
              <span>{{ locationText }}</span>
            </div>
            <div class="header-wealth">
              <div class="coin-item" title="金币">
                <Icon icon="lucide:coins" style="color: var(--brass-gold)" />
                <span>{{ gold ?? '---' }}</span>
              </div>
              <div class="coin-item" title="银币">
                <Icon icon="lucide:coins" style="color: #c0c0c0" />
                <span>{{ silver ?? '---' }}</span>
              </div>
              <div class="coin-item" title="铜币">
                <Icon icon="lucide:coins" style="color: #cd7f32" />
                <span>{{ copper ?? '---' }}</span>
              </div>
            </div>
          </div>

          <div class="parchment-content-area">
            <Transition
              :name="transitionMode === 'slide' ? slideDirectionName : 'none'"
              @before-enter="onAnimStart"
              @after-enter="onAnimEnd"
            >
              <component :is="currentTab.component" :key="currentTab.id" class="panel-content" />
            </Transition>
          </div>
        </div>
      </div>

      <div class="roller roller-end">
        <div class="roller-cap cap-1"></div>
        <div class="roller-cap cap-2"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { usePointerSwipe, useStorage } from '@vueuse/core';
import { computed, ref } from 'vue';
import type { Component } from 'vue';

import AbilityTab from './components/Tabs/AbilityTab.vue';
import BagTab from './components/Tabs/BagTab.vue';
import ChatTab from './components/Tabs/ChatTab.vue';
import MapTab from './components/Tabs/MapTab.vue';
import PetTab from './components/Tabs/PetTab.vue';
import ProtagonistTab from './components/Tabs/ProtagonistTab.vue';
import QuestWorldTab from './components/Tabs/QuestWorldTab.vue';
import SettingTab from './components/Tabs/SettingTab.vue';
import SocialTab from './components/Tabs/SocialTab.vue';
import { useMessageSync } from './composables/useMessageSync';

useMessageSync();

const tabs: { id: string; name: string; icon: string; component: Component }[] = [
  { id: 'protagonist', name: '主角', icon: 'lucide:user', component: ProtagonistTab as Component },
  { id: 'ability', name: '能力', icon: 'lucide:shield', component: AbilityTab as Component },
  { id: 'pet', name: '宠物', icon: 'lucide:paw-print', component: PetTab as Component },
  { id: 'bag', name: '行囊', icon: 'lucide:backpack', component: BagTab as Component },
  { id: 'chat', name: '沟通', icon: 'lucide:message-circle', component: ChatTab as Component },
  { id: 'quests', name: '志事', icon: 'lucide:scroll', component: QuestWorldTab as Component },
  { id: 'social', name: '社交', icon: 'lucide:users', component: SocialTab as Component },
  { id: 'map', name: '地图', icon: 'lucide:map', component: MapTab as Component },
  { id: 'mgmt', name: '管理', icon: 'lucide:settings', component: SettingTab as Component },
];

const activeTabIndex = useStorage('zod-active-tab-index', 4);
const currentTab = computed(() => tabs[activeTabIndex.value]);

const transitionMode = useStorage<'slide' | 'roll'>('zod-transition-mode', 'slide');
const slideDirectionName = ref('slide-forward');

const timeText = ref<string | null>(null);
const locationText = ref<string | null>(null);
const gold = ref<number | null>(null);
const silver = ref<number | null>(null);
const copper = ref<number | null>(null);

const isRolling = ref(false);
const isAnimating = ref(false);
const swipeAreaRef = ref<HTMLElement | null>(null);

const onAnimStart = (): void => {
  isAnimating.value = true;
};
const onAnimEnd = (): void => {
  isAnimating.value = false;
};

const handleTabSwitch = (index: number): void => {
  if (isAnimating.value || isRolling.value || activeTabIndex.value === index) return;

  slideDirectionName.value = index > activeTabIndex.value ? 'slide-forward' : 'slide-backward';

  if (transitionMode.value === 'roll') {
    isRolling.value = true;
    setTimeout(() => {
      activeTabIndex.value = index;
      setTimeout(() => {
        isRolling.value = false;
      }, 50);
    }, 450);
  } else {
    activeTabIndex.value = index;
  }
};

const { distanceX, distanceY } = usePointerSwipe(swipeAreaRef, {
  threshold: 40,
  onSwipeEnd(_e: PointerEvent, direction: string): void {
    if (isAnimating.value || isRolling.value) return;

    if (Math.abs(distanceY.value) > Math.abs(distanceX.value)) return;

    let isNext = false;
    let isPrev = false;

    if (direction === 'left' && distanceX.value > 0) isNext = true;
    if (direction === 'right' && distanceX.value < 0) isPrev = true;

    if (isNext) {
      const next = activeTabIndex.value + 1;
      if (next < tabs.length) handleTabSwitch(next);
    } else if (isPrev) {
      const prev = activeTabIndex.value - 1;
      if (prev >= 0) handleTabSwitch(prev);
    }
  },
});
</script>

<style scoped>
.zod-app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at 50% 50%, #2a2420 0%, #0c0a14 100%);
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  color: var(--paper-text);
}

.roller {
  display: flex;
  position: relative;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  z-index: 20;
  box-shadow:
    0 5px 20px rgba(0, 0, 0, 0.9),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
  background: linear-gradient(
    to bottom right,
    #110b08 0%,
    var(--wood-dark) 20%,
    var(--wood-light) 50%,
    var(--wood-dark) 80%,
    #110b08 100%
  );
}
.roller-cap {
  position: absolute;
  box-shadow:
    inset 0 0 5px rgba(255, 255, 255, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.8);
  border: 1px solid #3e271d;
  border-radius: 4px;
  background: radial-gradient(circle at center, #ffd700 10%, var(--brass-gold) 60%, #5c4019 100%);
}

.nav-icons {
  display: flex;
  gap: 15px;
  z-index: 30;
}
.nav-icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 4px;
  color: #6a5c4d;
  font-size: 20px;
}
.nav-icon-btn:hover {
  color: #a89a8a;
}
.nav-icon-btn.is-active {
  transform: scale(1.15);
  filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.6));
  color: var(--brass-gold);
}

@media (orientation: landscape) {
  .scroll-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 90vw;
    max-width: 1000px;
    height: 85vh;
  }

  .roller {
    border-radius: 16px;
    background: linear-gradient(
      to right,
      #110b08 0%,
      var(--wood-dark) 30%,
      var(--wood-light) 50%,
      var(--wood-dark) 70%,
      #110b08 100%
    );
    width: 32px;
    height: 100%;
  }

  .roller-cap {
    left: -4px;
    width: 40px;
    height: 14px;
  }
  .cap-1 {
    top: -6px;
  }
  .cap-2 {
    bottom: -6px;
  }

  .nav-icons {
    flex-direction: column;
  }

  .parchment-viewport {
    z-index: 10;
    transition: width 0.45s cubic-bezier(0.5, 0, 0.1, 1);
    margin: 0 -14px;
    width: 100%;
    height: 96%;
    overflow: hidden;
    touch-action: pan-y;
  }
  .parchment-viewport.is-rolling {
    width: 0 !important;
  }

  .parchment-inner {
    width: calc(90vw - 36px);
    max-width: 964px;
    height: 100%;
  }
  .mobile-hint {
    display: none;
  }
}

@media (orientation: portrait) {
  .scroll-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 94vw;
    height: 88vh;
  }

  .roller {
    border-radius: 16px;
    background: linear-gradient(
      to bottom,
      #110b08 0%,
      var(--wood-dark) 30%,
      var(--wood-light) 50%,
      var(--wood-dark) 70%,
      #110b08 100%
    );
    width: 100%;
    height: 32px;
  }

  .roller-cap {
    top: -4px;
    width: 14px;
    height: 40px;
  }
  .cap-1 {
    left: -5px;
  }
  .cap-2 {
    right: -5px;
  }

  .nav-icons {
    flex-direction: row;
    justify-content: space-evenly;
    padding: 0 10px;
    width: 100%;
  }
  .nav-icon-btn {
    font-size: 18px;
  }

  .parchment-viewport {
    z-index: 10;
    transition: height 0.45s cubic-bezier(0.5, 0, 0.1, 1);
    margin: -14px 0;
    width: 96%;
    height: 100%;
    overflow: hidden;
    touch-action: pan-y;
  }
  .parchment-viewport.is-rolling {
    height: 0 !important;
  }

  .parchment-inner {
    width: 100%;
    height: calc(88vh - 36px);
  }
}

.parchment-inner {
  display: flex;
  position: relative;
  flex-direction: column;
  box-shadow:
    inset 0 0 60px rgba(139, 115, 85, 0.4),
    0 5px 15px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(139, 115, 85, 0.3);
  background-image:
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, rgba(139, 115, 85, 0.15) 100%),
    linear-gradient(
      to right,
      rgba(0, 0, 0, 0.05) 0%,
      transparent 2%,
      transparent 98%,
      rgba(0, 0, 0, 0.05) 100%
    );
  background-color: var(--paper-bg, #f4ebd8);
}

.parchment-header {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border-bottom: 3px double rgba(139, 115, 85, 0.4);
  background: linear-gradient(to bottom, rgba(139, 115, 85, 0.05), transparent);
  padding: 20px 25px 15px;
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 14px;
  font-family: 'Cinzel', 'Noto Serif SC', serif;
  letter-spacing: 1px;
}
.header-info {
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.85;
}
.header-icon {
  color: var(--wood-light);
  font-size: 16px;
}
.header-wealth {
  display: flex;
  gap: 15px;
}
.coin-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  font-family: monospace;
}

.watermark-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.15;
  z-index: 0;
  pointer-events: none;
  color: var(--paper-shadow);
  font-size: 250px;
}

.parchment-content-area {
  position: relative;
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: auto;
  touch-action: pan-y;
}

.parchment-content-area::-webkit-scrollbar {
  width: 4px;
}
.parchment-content-area::-webkit-scrollbar-thumb {
  border-radius: 2px;
  background: rgba(139, 115, 85, 0.3);
}

.panel-content {
  position: relative;
  box-sizing: border-box;
  padding: 20px;
  width: 100%;
  min-height: 100%;
  color: var(--paper-ink);
}

.content-body {
  position: relative;
  z-index: 2;
  text-align: center;
}

.panel-title {
  margin-bottom: 20px;
  border-bottom: 2px dashed rgba(43, 35, 29, 0.2);
  padding-bottom: 12px;
  color: var(--wood-dark);
  font-size: 24px;
  letter-spacing: 2px;
}

.test-scroll-area {
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.3;
  margin-top: 50px;
  border: 2px dashed var(--wood-light);
  border-radius: 8px;
  height: 800px;
  font-weight: bold;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-forward-enter-active,
.slide-forward-leave-active,
.slide-backward-enter-active,
.slide-backward-leave-active {
  position: absolute !important;
  top: 0;
  right: 0;
  left: 0;
  transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1);
}

@media (orientation: landscape) {
  .slide-forward-enter-from {
    transform: translateX(100%);
  }
  .slide-forward-leave-to {
    transform: translateX(-100%);
  }

  .slide-backward-enter-from {
    transform: translateX(-100%);
  }
  .slide-backward-leave-to {
    transform: translateX(100%);
  }
}

@media (orientation: portrait) {
  .slide-forward-enter-from {
    transform: translateY(100%);
  }
  .slide-forward-leave-to {
    transform: translateY(-100%);
  }

  .slide-backward-enter-from {
    transform: translateY(-100%);
  }
  .slide-backward-leave-to {
    transform: translateY(100%);
  }
}
</style>
