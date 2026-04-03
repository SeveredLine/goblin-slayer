<template>
  <div class="mgmt-tab-root">
    <h2 class="panel-title">系统设置</h2>

    <div class="mgmt-section">
      <h3 class="section-title">
        <Icon icon="lucide:sliders-horizontal" />
        界面设置
      </h3>

      <div class="setting-item">
        <label class="setting-label">界面切换方式</label>
        <div class="radio-group">
          <label class="radio-btn" :class="{ active: transitionMode === 'slide' }">
            <input v-model="transitionMode" type="radio" value="slide" />
            <Icon icon="lucide:arrow-left-right" />
            画轴平移
          </label>
          <label class="radio-btn" :class="{ active: transitionMode === 'roll' }">
            <input v-model="transitionMode" type="radio" value="roll" />
            <Icon icon="lucide:scroll" />
            卷轴收展
          </label>
        </div>
        <p class="setting-desc">画轴平移如同翻页滑动，卷轴收展则会模拟真实卷轴的闭合与展开动作。</p>
      </div>

      <div class="setting-item">
        <label class="setting-label">全局字体大小</label>
        <div class="radio-group">
          <label class="radio-btn" :class="{ active: fontSize === 'small' }">
            <input v-model="fontSize" type="radio" value="small" />
            <Icon icon="lucide:a-small" /> 小
          </label>
          <label class="radio-btn" :class="{ active: fontSize === 'medium' }">
            <input v-model="fontSize" type="radio" value="medium" />
            <Icon icon="lucide:a-large" /> 中
          </label>
          <label class="radio-btn" :class="{ active: fontSize === 'large' }">
            <input v-model="fontSize" type="radio" value="large" />
            <Icon icon="lucide:a-arrow-up" /> 大
          </label>
        </div>
      </div>
    </div>

    <div class="mgmt-section">
      <h3 class="section-title">
        <Icon icon="lucide:award" />
        冒险者名录
      </h3>

      <div class="credits-container">
        <div v-for="(group, index) in creditsList" :key="index" class="credit-group">
          <div class="credit-group-title">{{ group.title }}</div>
          <div class="credit-list">
            <div v-for="item in group.items" :key="item.name" class="credit-item">
              <span class="credit-name">{{ item.name }}</span>
              <span v-if="item.desc" class="credit-desc">({{ item.desc }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useStorage } from '@vueuse/core';
import { watch } from 'vue';

const transitionMode = useStorage<'slide' | 'roll'>('zod-transition-mode', 'slide');

const fontSize = useStorage<'small' | 'medium' | 'large'>('zod-font-size', 'medium');

watch(
  fontSize,
  (newVal) => {
    const sizeMap = {
      small: '13px',
      medium: '15px',
      large: '17px',
    };
    document.body.style.fontSize = sizeMap[newVal];
  },
  { immediate: true },
);

const rawCredits = [
  {
    title: '❖ 原作者 ❖',
    rawList: ['Elainades'],
  },
  {
    title: '❖ 大爹们 ❖',
    rawList: [
      'keil（编排世界书，整理屎山）',
      '11（录入大量原作角色和剧情，初步骰子COT编写）',
      '龙使者德丽莎（提供美化底子和思路建议）',
      'KKKKKK_0735（帖子内答疑/编写问题指南）',
      'S15萌新（东方沙漠怪物/随机遇敌系统/武藏/龙娘/剑客架势/苇名一心的编写优化）',
      'Italian Pasta（整理世界书条目并多次调整编写，经济修订/新骰子/怪物图鉴/生态的重置产出）',
      'tata（亡灵船怪物图鉴和二创角色）',
      '露琪诺（创作了兰德索尔及相关角色的完整世界观生态，为地图系统跑图）',
      'K1nn（编写龙族生态/图鉴，二创人物/制作地图！）',
      'エル（大量原作角色插图，修订zod脚本）',
      'gemini114514（包办地图系统的制作！）',
      'glen0822(扭曲亞提)（魅魔“零”以及独立故事线）',
      '烁寒（额头妹妹）',
      '露琪亚（古罗）',
      '哈气咪（圣吉列斯/圣辉师姬以及相关卷剧情）',
      'shiyue137（Goblin Slayer拓展的制作！大爹！）',
      '快乐柠檬茶（历法）',
      'hsuika·赤猫肆号（普蒂和盘蛇旅店）',
      'tttk2929（妖精法师和番外剧情）',
      '黑森森（文风的修订和世界书的指点）',
    ],
  },
  {
    title: '❖ 英灵殿 ❖',
    rawList: ['LunaGlaze（修MVU状态栏代码/以及二创角色）'],
  },
];

const creditsList = rawCredits.map((group) => {
  return {
    title: group.title,
    items: group.rawList.map((str) => {
      const match = /^([^（(]+)[（(]([^）)]+)[）)]?/.exec(str);
      if (match) {
        return { name: match[1].trim(), desc: match[2].trim() };
      }
      return { name: str.trim(), desc: '' };
    }),
  };
});
</script>

<style scoped>
.mgmt-tab-root {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.mgmt-section {
  border: 1px solid var(--paper-shadow, #d9c5a3);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
  padding: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 15px 0;
  border-bottom: 2px solid rgba(139, 115, 85, 0.2);
  padding-bottom: 8px;
  color: var(--wood-dark);
  font-weight: bold;
  font-size: 18px;
  font-family: 'Cinzel', 'Noto Serif SC', serif;
}

.setting-item {
  margin-bottom: 20px;
}
.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  margin-bottom: 8px;
  color: var(--wood-light);
  font-weight: 700;
  font-size: 14px;
}

.setting-desc {
  margin: 8px 0 0 0;
  color: #7a6e5d;
  font-size: 12px;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.radio-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid rgba(139, 115, 85, 0.4);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.5);
  padding: 8px 16px;
  color: var(--wood-dark);
  font-weight: bold;
  font-size: 14px;
  user-select: none;
}

.radio-btn input[type='radio'] {
  display: none;
}

.radio-btn:hover {
  border-color: var(--brass-gold);
  background: rgba(255, 255, 255, 0.8);
}

.radio-btn.active {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  border-color: var(--brass-gold);
  background: var(--wood-dark);
  color: var(--brass-gold);
}

.credits-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.credit-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.credit-group-title {
  color: var(--brass-gold);
  font-weight: bold;
  font-size: 16px;
  font-family: 'Cinzel', 'Noto Serif SC', serif;
  letter-spacing: 2px;
  text-align: center;
}

.credit-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.credit-item {
  display: flex;
  align-items: baseline;
  transition: transform 0.2s ease;
  border: 1px solid rgba(139, 115, 85, 0.2);
  border-left: 3px solid var(--wood-light);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.6);
  padding: 8px 12px;
}

.credit-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border-color: rgba(139, 115, 85, 0.4);
}

.credit-name {
  color: var(--wood-dark);
  font-weight: 900;
  font-size: 14px;
}

.credit-desc {
  margin-left: 6px;
  color: #7a6e5d;
  font-style: italic;
  font-size: 12px;
}
</style>
