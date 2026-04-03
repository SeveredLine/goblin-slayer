<template>
  <Transition name="fade">
    <div v-if="visible" class="dice-overlay">
      <div class="dice-container">
        <div
          v-for="(die, index) in activeDice"
          :key="index"
          class="dice-wrapper"
          :style="{ transform: die.transform, transition: die.transition }"
        >
          <div class="dice-cube">
            <div class="dice-face face-1"><span class="dot"></span></div>
            <div class="dice-face face-6">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
            <div class="dice-face face-3">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
            <div class="dice-face face-4">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span
              ><span class="dot"></span>
            </div>
            <div class="dice-face face-2"><span class="dot"></span><span class="dot"></span></div>
            <div class="dice-face face-5">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
              <span class="dot"></span><span class="dot"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="dice-text">{{ diceText }}</div>
      <button class="skip-btn" @click="skipRoll">跳过动画</button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const activeDice = ref<{ transform: string; transition: string }[]>([]);
const diceText = ref('');
let resolveRoll: (() => void) | null = null;
let isSkipping = false;

const getRotationForFace = (face: number): string => {
  switch (face) {
    case 1:
      return 'rotateX(0deg) rotateY(0deg)';
    case 6:
      return 'rotateX(0deg) rotateY(180deg)';
    case 3:
      return 'rotateX(0deg) rotateY(-90deg)';
    case 4:
      return 'rotateX(0deg) rotateY(90deg)';
    case 2:
      return 'rotateX(-90deg) rotateY(0deg)';
    case 5:
      return 'rotateX(90deg) rotateY(0deg)';
    default:
      return 'rotateX(0deg) rotateY(0deg)';
  }
};

const delay = (ms: number): Promise<void> =>
  new Promise((res): void => {
    setTimeout(res, ms);
  });

const roll = async (results: number[], text: string): Promise<void> => {
  visible.value = true;
  isSkipping = false;
  diceText.value = text;
  activeDice.value = results.map(() => ({
    transform: 'rotateX(0deg) rotateY(0deg)',
    transition: 'none',
  }));

  return new Promise<void>((resolve) => {
    resolveRoll = resolve;
    void (async (): Promise<void> => {
      await delay(50);
      if (isSkipping) return;

      activeDice.value = results.map(() => ({
        transform: `rotateX(${Math.random() * 720 + 720}deg) rotateY(${Math.random() * 720 + 720}deg)`,
        transition: 'transform 1.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }));

      await delay(1800);
      if (isSkipping) return;

      activeDice.value = results.map((res) => ({
        transform: getRotationForFace(res),
        transition: 'transform 0.5s ease-out',
      }));

      await delay(600);
      if (!isSkipping) finishRoll();
    })();
  });
};

const finishRoll = (): void => {
  visible.value = false;
  if (resolveRoll) resolveRoll();
};

const skipRoll = (): void => {
  isSkipping = true;
  finishRoll();
};

defineExpose({ roll });
</script>

<style scoped>
.dice-overlay {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  backdrop-filter: blur(5px);
  background: rgba(0, 0, 0, 0.85);
  width: 100%;
  height: 100%;
}
.dice-container {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}
.dice-wrapper {
  transform-style: preserve-3d;
  perspective: 800px;
  width: 5rem;
  height: 5rem;
}
.dice-cube {
  position: relative;
  transform: translateZ(-2.5rem);
  transform-style: preserve-3d;
  width: 100%;
  height: 100%;
}
.dice-face {
  display: flex;
  position: absolute;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border: 2px solid #857e72;
  border-radius: 12%;
  background: rgba(255, 255, 255, 0.95);
  padding: 10%;
  width: 5rem;
  height: 5rem;
}
.face-1 {
  transform: rotateY(0deg) translateZ(2.5rem);
}
.face-6 {
  transform: rotateY(180deg) translateZ(2.5rem);
}
.face-3 {
  transform: rotateY(90deg) translateZ(2.5rem);
}
.face-4 {
  transform: rotateY(-90deg) translateZ(2.5rem);
}
.face-2 {
  transform: rotateX(90deg) translateZ(2.5rem);
}
.face-5 {
  transform: rotateX(-90deg) translateZ(2.5rem);
}

.dot {
  margin: 2px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  background: #3d352e;
  width: 1rem;
  height: 1rem;
}
.dice-text {
  margin-bottom: 2rem;
  color: #ffeb3b;
  font-size: 2.2rem;
  font-family: 'Cinzel', 'Noto Serif SC', serif;
  text-shadow: 0 0 12px #ffeb3b;
}
.skip-btn {
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 20px;
  color: white;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
