<template>
  <div class="custom-opening-root">
    <div class="steps-bar">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step-item"
        :class="{ active: currentStep === index }"
        @click="currentStep = index"
      >
        {{ index + 1 }}. {{ step }}
      </div>
    </div>

    <div class="point-dashboard">
      <div class="point-info">
        <span
          >当前层级: <b class="highlight">{{ store.character.rank }}</b></span
        >
        <span class="divider">|</span>
        <span
          >可用创建点:
          <b class="points-val" :class="{ over: store.isOverBudget }">{{ store.currentPoints }}</b>
          / {{ store.totalPoints }}
        </span>
      </div>
      <button class="btn-outline" @click="store.rollPoints">
        <Icon icon="lucide:dice-5" /> Roll点数
      </button>
    </div>

    <div class="step-content">
      <div v-if="currentStep === 0" class="fade-in">
        <div class="form-grid">
          <div class="form-group">
            <label>姓名</label>
            <input v-model="store.character.name" placeholder="{{user}}" class="form-input" />
          </div>
          <div class="form-group">
            <label>性别</label>
            <select v-model="store.character.gender" class="form-input">
              <option>男</option>
              <option>女</option>
              <option>扶他</option>
              <option>无性</option>
            </select>
          </div>
          <div class="form-group">
            <label>年龄</label>
            <input v-model="store.character.age" type="number" class="form-input" />
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>种族</label>
            <select v-model="store.character.race" class="form-input">
              <option v-for="r in constantsData.races" :key="r">{{ r }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>起始地点</label>
            <select v-model="store.character.startLocation" class="form-input">
              <option v-for="loc in constantsData.locations" :key="loc">{{ loc }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>层级</label>
            <select v-model="store.character.rank" class="form-input" disabled>
              <option v-for="rank in constantsData.ranks" :key="rank">{{ rank }}</option>
            </select>
          </div>
        </div>

        <div class="section-divider">属性分配</div>
        <div class="attr-grid">
          <div v-for="(val, key) in store.character.attributes" :key="key" class="attr-stepper">
            <div class="attr-label">{{ key }}</div>
            <div class="stepper-ctrl">
              <button @click="store.character.attributes[key] = Math.max(1, val - 1)">-</button>
              <input :value="val" readonly />
              <button @click="store.character.attributes[key]++">+</button>
            </div>
          </div>
        </div>

        <div class="section-divider">职业体系</div>
        <div class="form-group">
          <label>目标职业 (以逗号分隔多个职业)</label>
          <input v-model="jobInputStr" class="form-input" placeholder="例如：战士, 剑客" />
        </div>
        <div class="form-group">
          <label>流派倾向与背景设定</label>
          <textarea
            v-model="store.character.extraSettings"
            class="form-textarea"
            placeholder="在这里描述角色的身体特征、习惯或详细职业背景..."
          ></textarea>
        </div>
      </div>

      <div v-if="currentStep === 1" class="fade-in">
        <div class="shop-tabs">
          <button :class="{ active: shopTab === 'equipment' }" @click="shopTab = 'equipment'">
            装备
          </button>
          <button :class="{ active: shopTab === 'consumable' }" @click="shopTab = 'consumable'">
            道具
          </button>
          <button :class="{ active: shopTab === 'skill' }" @click="shopTab = 'skill'">技能</button>
        </div>

        <div class="shop-container">
          <div class="shop-grid">
            <div
              v-for="item in filteredShopItems"
              :key="item.name"
              class="shop-card"
              :class="{ selected: isItemSelected(item) }"
              @click="toggleItem(item)"
            >
              <div class="sc-header">
                <b>{{ item.name }}</b>
                <span class="tier-badge">{{ item.tier || item.quality || '普通' }}</span>
              </div>
              <div class="sc-desc">{{ item.desc || item.effect }}</div>
              <div class="sc-footer">
                <span class="cost">{{ item.cost || 0 }} PTS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentStep === 2" class="fade-in">
        <div class="section-divider">选择同行伙伴</div>
        <div class="shop-grid" style="margin-bottom: 20px">
          <div
            v-for="p in partnerData"
            :key="p.姓名"
            class="shop-card"
            :class="{ selected: isPartnerSelected(p) }"
            @click="togglePartner(p)"
          >
            <div class="sc-header">
              <b>{{ p.姓名 }}</b>
              <span class="tier-badge">{{ p.层级 }}</span>
            </div>
            <div class="sc-desc">{{ p.身份背景 }}</div>
            <div class="sc-footer">
              <span class="cost">{{ p.cost || 0 }} PTS</span>
            </div>
          </div>
        </div>

        <div class="section-divider">选择初始开局剧情</div>
        <div class="shop-grid">
          <div
            v-for="sc in scenarioData"
            :key="sc.id"
            class="shop-card"
            :class="{ selected: store.startScenario?.id === sc.id }"
            @click="store.startScenario = sc"
          >
            <div class="sc-header">
              <b>{{ sc.title }}</b>
            </div>
            <div class="sc-desc">{{ sc.desc }}</div>
            <div class="sc-footer">
              <span class="cost">{{ sc.cost || 0 }} PTS</span>
            </div>
          </div>

          <div
            class="shop-card"
            :class="{ selected: store.startScenario?.id === 'custom' }"
            @click="store.startScenario = { id: 'custom', title: '完全自定义', cost: 0 }"
          >
            <div class="sc-header"><b>🖋️ 完全自定义</b></div>
            <div class="sc-desc">自行编写开局剧情</div>
            <div v-if="store.startScenario?.id === 'custom'" class="sc-custom-input" @click.stop>
              <textarea
                v-model="store.customScenarioText"
                class="form-textarea"
                placeholder="在这里编写..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentStep === 3" class="fade-in">
        <div class="preview-box">
          <h3 style="color: var(--wood-dark); margin-top: 0">最终确认档案</h3>
          <p><b>姓名：</b>{{ store.character.name }}</p>
          <p>
            <b>种族：</b>{{ store.character.race }} | <b>职业：</b
            >{{ store.character.jobs.join(', ') }}
          </p>
          <p><b>已选物资：</b>{{ store.inventory.map((i) => i.name).join(', ') || '无' }}</p>
          <p><b>同行伙伴：</b>{{ store.partners.map((p) => p.姓名).join(', ') || '无' }}</p>
          <p><b>开局剧情：</b>{{ store.startScenario?.title || '未选择' }}</p>
        </div>

        <div v-if="store.isOverBudget" class="error-msg">
          ⚠️ 警告：当前消耗点数 ({{ store.currentPoints }}) 已超过可用上限 ({{
            store.totalPoints
          }})，请删减物资或重新Roll点！
        </div>
      </div>
    </div>

    <div class="step-footer">
      <button class="btn-outline" :disabled="currentStep === 0" @click="currentStep--">
        上一步
      </button>
      <button v-if="currentStep < 3" class="btn-solid" @click="currentStep++">下一步</button>
      <button
        v-if="currentStep === 3"
        class="btn-solid"
        :disabled="store.isOverBudget"
        @click="emitSubmit"
      >
        签署契约，降临世界
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, computed, onMounted, watch } from 'vue';

import { useCreatorStore } from '../../stores/useCreatorStore';
import type { InventoryItem, PartnerItem, ScenarioItem } from '../../stores/useCreatorStore';

interface ConstantsData {
  races: string[];
  locations: string[];
  ranks: string[];
}

const store = useCreatorStore();

const steps = ['基础设定', '物资整备', '开局抉择', '确认出发'];
const currentStep = ref(0);

const constantsData = ref<ConstantsData>({ races: [], locations: [], ranks: ['白瓷级'] });
const shopItems = ref<InventoryItem[]>([]);
const partnerData = ref<PartnerItem[]>([]);
const scenarioData = ref<ScenarioItem[]>([]);

const shopTab = ref('equipment');

const jobInputStr = ref(store.character.jobs.join(', '));
watch(jobInputStr, (val) => {
  store.character.jobs = val
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
});

onMounted(async (): Promise<void> => {
  const baseURL =
    'https://cdn.jsdelivr.net/gh/Elainadesne/The-Four-Dice-World---Character-Creation@main/';
  try {
    const [c, i, p, s] = await Promise.all([
      fetch(baseURL + 'constants.json').then((r) => r.json() as Promise<ConstantsData>),
      fetch(baseURL + 'items.json').then((r) => r.json() as Promise<InventoryItem[]>),
      fetch(baseURL + 'partners.json').then((r) => r.json() as Promise<PartnerItem[]>),
      fetch(baseURL + 'scenarios.json').then((r) => r.json() as Promise<ScenarioItem[]>),
    ]);
    constantsData.value = c;
    shopItems.value = i;
    partnerData.value = p;
    scenarioData.value = s;

    if (c.races && c.races.length > 0) store.character.race = c.races[0];
    if (c.locations && c.locations.length > 0) store.character.startLocation = c.locations[0];
  } catch (err) {
    console.error('拉取Github配置失败，请检查网络跨域:', err);
  }
});

const filteredShopItems = computed(() =>
  shopItems.value.filter((item) => item.itemType === shopTab.value),
);
const isItemSelected = (item: InventoryItem): boolean =>
  store.inventory.some((i) => i.name === item.name);
const toggleItem = (item: InventoryItem): void => {
  const idx = store.inventory.findIndex((i) => i.name === item.name);
  if (idx >= 0) store.inventory.splice(idx, 1);
  else store.inventory.push(item);
};

const isPartnerSelected = (p: PartnerItem): boolean =>
  store.partners.some((x) => x.姓名 === p.姓名);
const togglePartner = (p: PartnerItem): void => {
  const idx = store.partners.findIndex((x) => x.姓名 === p.姓名);
  if (idx >= 0) store.partners.splice(idx, 1);
  else store.partners.push(p);
};

const emitSubmit = (): void => {
  const parentBtn = document.querySelector('.btn-submit');
  if (parentBtn instanceof HTMLButtonElement) {
    parentBtn.click();
  }
};
</script>

<style scoped>
.custom-opening-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: var(--paper-text);
}

.steps-bar {
  display: flex;
  gap: 5px;
  margin-bottom: 15px;
  border-radius: 6px;
  background: rgba(139, 115, 85, 0.1);
  padding: 5px;
}
.step-item {
  flex: 1;
  transition: 0.3s;
  cursor: pointer;
  border-radius: 4px;
  padding: 8px;
  color: var(--wood-light);
  font-weight: bold;
  font-size: 13px;
  text-align: center;
}
.step-item.active {
  background: var(--wood-dark);
  color: var(--brass-gold);
}

.point-dashboard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border: 1px solid var(--paper-shadow);
  border-radius: 6px;
  background: #fff;
  padding: 10px 15px;
}
.highlight {
  color: var(--wood-dark);
  font-weight: 900;
}
.points-val {
  color: var(--wood-dark);
  font-size: 18px;
  font-family: monospace;
}
.points-val.over {
  color: red;
}
.divider {
  opacity: 0.3;
  margin: 0 10px;
}

.step-content {
  flex: 1;
  padding-right: 5px;
  overflow-y: auto;
}
.step-content::-webkit-scrollbar {
  width: 6px;
}
.step-content::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: var(--paper-shadow);
}

.fade-in {
  animation: fadeIn 0.4s ease;
}
@keyframes fadeIn {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  color: var(--wood-light);
  font-weight: bold;
  font-size: 12px;
}
.form-input,
.form-textarea {
  box-sizing: border-box;
  outline: none;
  border: 1px solid var(--paper-shadow);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.6);
  padding: 10px;
  width: 100%;
  font-weight: bold;
  font-family: inherit;
}
.form-input:focus,
.form-textarea:focus {
  border-color: var(--brass-gold);
  background: #fff;
}
.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.section-divider {
  margin: 25px 0 15px 0;
  border-bottom: 2px dashed rgba(139, 115, 85, 0.3);
  padding-bottom: 5px;
  color: var(--wood-dark);
  font-weight: 900;
  font-size: 15px;
}

.attr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}
.attr-stepper {
  border: 1px solid var(--paper-shadow);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.03);
  padding: 10px;
  text-align: center;
}
.attr-label {
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 12px;
}
.stepper-ctrl {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
.stepper-ctrl button {
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 4px;
  background: #fff;
  width: 28px;
  height: 28px;
  font-weight: bold;
}
.stepper-ctrl input {
  outline: none;
  border: none;
  background: transparent;
  width: 40px;
  font-weight: 900;
  font-size: 16px;
  text-align: center;
}

.shop-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 15px;
}
.shop-tabs button {
  cursor: pointer;
  border: 1px solid var(--paper-shadow);
  border-radius: 4px 4px 0 0;
  background: transparent;
  padding: 8px 20px;
  color: var(--wood-light);
  font-weight: bold;
}
.shop-tabs button.active {
  border-color: var(--wood-dark);
  background: var(--wood-dark);
  color: var(--brass-gold);
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 15px;
}
.shop-card {
  position: relative;
  transition: 0.2s;
  cursor: pointer;
  border: 1px solid var(--paper-shadow);
  border-radius: 6px;
  background: #fff;
  padding: 15px;
}
.shop-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.15);
  border-color: var(--brass-gold);
}
.shop-card.selected {
  box-shadow: inset 0 0 0 1px var(--highlight-red);
  border-color: var(--highlight-red);
  background: rgba(166, 44, 43, 0.05);
}

.sc-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}
.tier-badge {
  border-radius: 3px;
  background: var(--wood-dark);
  padding: 2px 6px;
  color: #fff;
  font-size: 10px;
}
.sc-desc {
  margin-bottom: 10px;
  color: #666;
  font-size: 12px;
  line-height: 1.5;
}
.sc-footer {
  color: var(--highlight-red);
  font-weight: bold;
  font-size: 14px;
  font-family: monospace;
  text-align: right;
}
.sc-custom-input {
  margin-top: 10px;
}

.preview-box {
  border: 2px solid var(--wood-light);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.6);
  padding: 20px;
  font-size: 14px;
  line-height: 1.8;
}
.error-msg {
  margin-top: 15px;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  background: #ffebee;
  padding: 10px;
  color: #d32f2f;
  font-weight: bold;
}

.step-footer {
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  margin-top: 20px;
  border-top: 1px solid rgba(139, 115, 85, 0.2);
  padding-top: 15px;
}
.btn-outline,
.btn-solid {
  transition: 0.2s;
  cursor: pointer;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: bold;
  font-size: 14px;
}
.btn-outline {
  border: 1px solid var(--wood-dark);
  background: transparent;
  color: var(--wood-dark);
}
.btn-outline:hover {
  background: rgba(0, 0, 0, 0.05);
}
.btn-solid {
  border: 1px solid var(--wood-dark);
  background: var(--wood-dark);
  color: var(--brass-gold);
}
.btn-solid:hover {
  background: var(--wood-light);
}
.btn-solid:disabled {
  cursor: not-allowed;
  border-color: #999;
  background: #999;
  color: #ccc;
}
</style>
