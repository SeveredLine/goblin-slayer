<template>
  <div class="map-tab-root">
    <div ref="containerRef" class="map-container" :class="{ fullscreen: isFullscreen }">
      <div class="map-overlay-location">
        <Icon icon="lucide:map" class="map-icon" />
        <span
          >当前驻留: <b>{{ currentLocation }}</b></span
        >
      </div>

      <img
        ref="imgRef"
        src="https://files.catbox.moe/8hnxiy.png"
        class="map-img"
        :style="imgStyle"
        draggable="false"
        alt="World Map"
        @wheel.prevent="onWheel"
        @mousedown="onMouseDown"
        @touchstart.prevent="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
      />

      <button class="map-fullscreen-btn" @click="toggleFullscreen">
        <Icon :icon="isFullscreen ? 'lucide:shrink' : 'lucide:expand'" />
        {{ isFullscreen ? '退出全屏' : '全屏查看' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

import { useMvuStore } from '../../stores/useMvuStore';

const mvuStore = useMvuStore();
const currentLocation = computed(() => {
  return (
    (mvuStore.protagonist.所在地 as string | undefined) ??
    (mvuStore.worldInfo.所在地 as string | undefined) ??
    '未知领域'
  );
});

const isFullscreen = ref(false);
const imgRef = ref<HTMLImageElement | null>(null);

const scale = ref(1);
const x = ref(0);
const y = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const lastPinchDist = ref(0);

const imgStyle = computed(() => ({
  transform: `translate(${x.value}px, ${y.value}px) scale(${scale.value})`,
  cursor: isDragging.value ? 'grabbing' : 'grab',
}));

const toggleFullscreen = (): void => {
  isFullscreen.value = !isFullscreen.value;
  if (!isFullscreen.value) {
    if (scale.value <= 1) {
      x.value = 0;
      y.value = 0;
    }
  }
};

const onWheel = (e: WheelEvent): void => {
  if (!imgRef.value) return;
  const zoomSpeed = 0.1;
  const delta = -Math.sign(e.deltaY);
  const nextScale = Math.min(Math.max(1, scale.value + delta * zoomSpeed * scale.value), 8);

  const rect = imgRef.value.getBoundingClientRect();
  const offsetX = (e.clientX - rect.left) / scale.value;
  const offsetY = (e.clientY - rect.top) / scale.value;

  x.value -= offsetX * (nextScale - scale.value);
  y.value -= offsetY * (nextScale - scale.value);
  scale.value = nextScale;

  if (scale.value <= 1) {
    x.value = 0;
    y.value = 0;
  }
};

const onMouseDown = (e: MouseEvent): void => {
  if (scale.value <= 1) return;
  isDragging.value = true;
  startX.value = e.clientX - x.value;
  startY.value = e.clientY - y.value;
};

const onWindowMouseMove = (e: MouseEvent): void => {
  if (!isDragging.value) return;
  x.value = e.clientX - startX.value;
  y.value = e.clientY - startY.value;
};

const onWindowMouseUp = (): void => {
  isDragging.value = false;
};

const onTouchStart = (e: TouchEvent): void => {
  if (e.touches.length === 2) {
    lastPinchDist.value = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY,
    );
  } else if (e.touches.length === 1 && scale.value > 1) {
    isDragging.value = true;
    startX.value = e.touches[0].clientX - x.value;
    startY.value = e.touches[0].clientY - y.value;
  }
};

const onTouchMove = (e: TouchEvent): void => {
  if (e.touches.length === 2 && imgRef.value) {
    const dist = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY,
    );
    const zoomSpeed = 0.01;
    const delta = dist - lastPinchDist.value;
    const nextScale = Math.min(Math.max(1, scale.value + delta * zoomSpeed), 8);

    const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

    const rect = imgRef.value.getBoundingClientRect();
    const offsetX = (centerX - rect.left) / scale.value;
    const offsetY = (centerY - rect.top) / scale.value;

    x.value -= offsetX * (nextScale - scale.value);
    y.value -= offsetY * (nextScale - scale.value);
    scale.value = nextScale;
    lastPinchDist.value = dist;

    if (scale.value <= 1) {
      x.value = 0;
      y.value = 0;
    }
  } else if (e.touches.length === 1 && isDragging.value) {
    x.value = e.touches[0].clientX - startX.value;
    y.value = e.touches[0].clientY - startY.value;
  }
};

const onTouchEnd = (): void => {
  isDragging.value = false;
  lastPinchDist.value = 0;
};

onMounted(() => {
  window.addEventListener('mousemove', onWindowMouseMove);
  window.addEventListener('mouseup', onWindowMouseUp);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onWindowMouseMove);
  window.removeEventListener('mouseup', onWindowMouseUp);
});
</script>

<style scoped>
.map-tab-root {
  height: 100%;
}

.map-container {
  position: relative;
  transition: all 0.3s ease;
  box-shadow:
    inset 0 0 50px rgba(0, 0, 0, 0.8),
    0 10px 20px rgba(0, 0, 0, 0.3);
  border: 3px solid var(--wood-dark);
  border-radius: 6px;
  background: #111;
  width: 100%;
  height: 420px;
  overflow: hidden;
}

.map-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  transform-origin: 0 0;
  will-change: transform;
}

.map-overlay-location {
  display: flex;
  position: absolute;
  top: 15px;
  left: 15px;
  align-items: center;
  gap: 8px;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  border: 1.5px solid var(--brass-gold);
  border-radius: 4px;
  background: rgba(30, 20, 10, 0.85);
  padding: 8px 15px;
  pointer-events: none;
  color: var(--brass-gold);
  font-size: 13px;
}
.map-icon {
  font-size: 16px;
}
.map-overlay-location b {
  color: #fff;
  letter-spacing: 1px;
}

.map-fullscreen-btn {
  display: flex;
  position: absolute;
  right: 15px;
  bottom: 15px;
  align-items: center;
  gap: 6px;
  z-index: 10;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
  border: 1px solid var(--brass-gold);
  border-radius: 4px;
  background: var(--wood-dark);
  padding: 8px 12px;
  color: var(--brass-gold);
  font-weight: 900;
  font-size: 12px;
}

.map-fullscreen-btn:hover {
  transform: translateY(-2px);
  border-color: #fff;
  background: var(--highlight-red);
  color: #fff;
}

.map-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999999;
  margin: 0;
  border: none;
  border-radius: 0;
  background: rgba(0, 0, 0, 0.95);
  padding: 0;
  width: 100vw;
  height: 100vh;
}
</style>
