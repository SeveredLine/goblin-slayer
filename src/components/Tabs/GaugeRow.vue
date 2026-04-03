<template>
  <div v-if="shouldShow" class="social-gauge-row">
    <div class="social-gauge-label">
      <Icon :icon="icon" :style="{ color }" />
      <span>{{ label }}</span>
    </div>
    <div class="social-gauge-bar-outer">
      <div
        class="social-gauge-bar-fill"
        :style="{ width: `${percent}%`, backgroundColor: color }"
      ></div>
      <div class="social-gauge-text">{{ current }}/{{ max }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  res?: { 当前值?: number; 最大值?: number };
  color: string;
  icon: string;
  hideEmpty?: boolean;
}>();

const current = computed(() => props.res?.当前值 ?? 0);
const max = computed(() => props.res?.最大值 ?? 0);
const percent = computed(() =>
  max.value > 0 ? Math.min(100, Math.max(0, (current.value / max.value) * 100)) : 0,
);

const shouldShow = computed(() => {
  return !(props.hideEmpty && max.value === 0);
});
</script>

<style scoped>
.social-gauge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.social-gauge-label {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  width: 60px;
  color: var(--paper-text);
  font-weight: 900;
  font-size: 12px;
}
.social-gauge-bar-outer {
  position: relative;
  flex-grow: 1;
  box-shadow: inset 1px 2px 4px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(62, 43, 31, 0.2);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.1);
  height: 16px;
  overflow: hidden;
}
.social-gauge-bar-fill {
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    inset 0 -3px 3px rgba(0, 0, 0, 0.2),
    inset 0 2px 2px rgba(255, 255, 255, 0.3);
  height: 100%;
}
.social-gauge-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 10px;
  font-family: monospace;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
}
</style>
