<template>
  <div class="bag-tab">
    <div class="bag-controls">
      <div class="bag-ctrl-group">
        <span class="bag-ctrl-label">布局:</span>
        <button class="layout-btn" :class="{ active: layout === 'list' }" @click="layout = 'list'">
          <Icon icon="lucide:list" /> 列表
        </button>
        <button class="layout-btn" :class="{ active: layout === 'grid' }" @click="layout = 'grid'">
          <Icon icon="lucide:grid" /> 格子
        </button>
      </div>
    </div>

    <div class="equip-section">
      <div class="equip-cat-title">当前武装</div>
      <div class="equip-grid">
        <div v-for="part in equipSlots" :key="part.key" class="equip-slot">
          <div class="slot-label">{{ part.label }}</div>
          <div
            v-if="part.item"
            class="slot-item equipped"
            @click="unequip(part.cat, part.key, part.item)"
          >
            <span class="item-name" :class="'tier-' + (part.item.tier || '普通')">{{
              part.item.name || part.item.名称 || part.key
            }}</span>
            <div class="slot-overlay">点击脱下</div>
          </div>
          <div v-else class="slot-item empty">
            <span>空缺</span>
          </div>
        </div>
      </div>
    </div>

    <div class="inventory-section">
      <div class="equip-cat-title">行囊物资</div>

      <div v-if="isBagEmpty" class="empty-bag">行囊空空如也</div>

      <div v-for="(items, cat) in bagData" v-else :key="cat" class="bag-category">
        <template v-if="hasValidItems(items)">
          <div class="cat-title-sm">{{ cat }}</div>

          <div v-if="layout === 'list'" class="bag-list-view">
            <div v-for="(item, name) in items" :key="name" class="bag-item">
              <div class="bag-item-header" @click="toggleDetail(name)">
                <Icon :icon="getCatIcon(cat)" class="bag-item-icon" />
                <div class="bag-item-name">
                  <span :class="'tier-' + (item.tier || '普通')">{{ item.name || name }}</span>
                </div>
                <div class="bag-item-count">×{{ item.quantity || 1 }}</div>
                <Icon
                  icon="lucide:chevron-right"
                  class="drawer-arrow"
                  :class="{ rotate: openDetail === name }"
                />
              </div>
              <div class="bag-item-detail" :class="{ open: openDetail === name }">
                <p>{{ item.description || item.描述 || '一两件不值一提的小玩意。' }}</p>
                <div class="item-meta">
                  <span>[品质] {{ item.tier || '普通' }}</span>
                  <span v-if="item.type">[类型] {{ item.type }}</span>
                  <span v-if="item.part">[部位] {{ item.part }}</span>
                  <span v-if="item.armor_value">[护甲] {{ item.armor_value }}</span>
                </div>
                <div v-if="['武器', '防具', '饰品'].includes(cat)" class="action-row">
                  <button class="btn-equip" @click="equip(cat, name, item)">装备</button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="bag-grid-view">
            <div
              v-for="(item, name) in items"
              :key="name"
              class="bag-slot-wrapper"
              @click="equip(cat, name, item)"
            >
              <div class="bag-slot" :title="item.name || name">
                <Icon
                  :icon="getCatIcon(cat)"
                  class="bag-slot-icon"
                  :class="'icon-tier-' + (item.tier || '普通')"
                />
                <div class="bag-slot-count">{{ item.quantity || 1 }}</div>
              </div>
              <div class="bag-slot-label" :class="'tier-' + (item.tier || '普通')">
                {{ item.name || name }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, computed } from 'vue';

import { useMvuStore } from '../../stores/useMvuStore';

const mvuStore = useMvuStore();
const layout = ref<'list' | 'grid'>('list');
const openDetail = ref<string | null>(null);

const bagData = computed(() => {
  const raw =
    (mvuStore.protagonist.背包 as Record<string, Record<string, BagItemData | '待初始化'>>) ?? {};
  const res: Record<string, Record<string, BagItemData>> = {};
  for (const [cat, items] of Object.entries(raw)) {
    res[cat] = {};
    if (items && typeof items === 'object') {
      for (const [name, item] of Object.entries(items)) {
        if (item && item !== '待初始化' && typeof item === 'object') {
          res[cat][name] = item;
        }
      }
    }
  }
  return res;
});

const equipData = computed(() => {
  const raw =
    (mvuStore.protagonist.装备 as Record<string, Record<string, BagItemData | '待初始化'>>) ?? {};
  const res: Record<string, Record<string, BagItemData>> = {};
  for (const [cat, items] of Object.entries(raw)) {
    res[cat] = {};
    if (items && typeof items === 'object') {
      for (const [name, item] of Object.entries(items)) {
        if (item && item !== '待初始化' && typeof item === 'object') {
          res[cat][name] = item;
        }
      }
    }
  }
  return res;
});

const equipSlots = computed(() => {
  const slots = [];
  const w = equipData.value.武器 ?? {};
  const a = equipData.value.防具 ?? {};
  const ac = equipData.value.饰品 ?? {};

  for (const [k, v] of Object.entries(w))
    slots.push({ cat: '武器', key: k, label: `[武器] ${k}`, item: v });
  for (const [k, v] of Object.entries(a))
    slots.push({ cat: '防具', key: k, label: `[防具] ${k}`, item: v });
  for (const [k, v] of Object.entries(ac))
    slots.push({ cat: '饰品', key: k, label: `[饰品] ${k}`, item: v });

  if (slots.length === 0) {
    slots.push({ cat: '武器', key: '主手', label: '[武器] 主手', item: null });
    slots.push({ cat: '防具', key: '身体', label: '[防具] 身体', item: null });
  }
  return slots;
});

const isBagEmpty = computed(() => {
  for (const cat in bagData.value) {
    if (cat === '金钱') continue;
    if (hasValidItems(bagData.value[cat])) return false;
  }
  return true;
});

const hasValidItems = (items: unknown): boolean => {
  if (!items || typeof items !== 'object') return false;
  return Object.values(items as Record<string, unknown>).some((v) => v && v !== '待初始化');
};

const getCatIcon = (cat: string): string => {
  const map: Record<string, string> = {
    消耗品: 'lucide:flask-conical',
    材料: 'lucide:box',
    饰品: 'lucide:gem',
    杂物: 'lucide:more-horizontal',
    武器: 'lucide:sword',
    防具: 'lucide:shield',
  };
  return map[cat] ?? 'lucide:circle';
};

const toggleDetail = (name: string): void => {
  openDetail.value = openDetail.value === name ? null : name;
};

export interface BagItemData {
  name?: string;
  名称?: string;
  tier?: string;
  type?: string;
  类型?: string;
  part?: string;
  部位?: string;
  armor_value?: number | string;
  quantity?: number;
  description?: string;
  描述?: string;
  hands?: string;
  [key: string]: unknown;
}

type MvuRoot = Record<string, Record<string, Record<string, BagItemData | '待初始化'>>>;

const equip = (cat: string, itemName: string, itemData: BagItemData): void => {
  if (!['武器', '防具', '饰品'].includes(cat)) return;

  const newMvuData = JSON.parse(JSON.stringify(mvuStore.mvuData)) as Record<string, unknown>;
  const root = newMvuData.主角 as MvuRoot;

  let defaultPart = '饰品槽';
  if (cat === '武器') defaultPart = '主手';
  else if (cat === '防具') defaultPart = '身体';

  let part = defaultPart;
  if (typeof itemData.part === 'string') {
    part = itemData.part;
  } else if (typeof itemData.部位 === 'string') {
    part = itemData.部位;
  }

  const oldItem = root.装备?.[cat]?.[part];
  if (oldItem && oldItem !== '待初始化') {
    let oldName = part;
    if (typeof oldItem.name === 'string') {
      oldName = oldItem.name;
    } else if (typeof oldItem.名称 === 'string') {
      oldName = oldItem.名称;
    }

    root.背包[cat] ??= {};
    const existingOld = root.背包[cat][oldName] as BagItemData | undefined;
    const oldQuantity = existingOld?.quantity ?? 0;
    root.背包[cat][oldName] = { ...oldItem, quantity: oldQuantity + 1 };
  }

  const currentQuantity = itemData.quantity ?? 1;
  if (currentQuantity > 1) {
    (root.背包[cat][itemName] as BagItemData).quantity = currentQuantity - 1;
  } else {
    Reflect.deleteProperty(root.背包[cat] as object, itemName);
  }

  root.装备[cat] ??= {};
  const equipCopy = { ...itemData };
  Reflect.deleteProperty(equipCopy, 'quantity');
  root.装备[cat][part] = equipCopy;

  mvuStore.saveToHost(newMvuData);
};

const unequip = (cat: string, partKey: string, itemData: BagItemData): void => {
  const newMvuData = JSON.parse(JSON.stringify(mvuStore.mvuData)) as Record<string, unknown>;
  const root = newMvuData.主角 as MvuRoot;

  let itemName = partKey;
  if (typeof itemData.name === 'string') {
    itemName = itemData.name;
  } else if (typeof itemData.名称 === 'string') {
    itemName = itemData.名称;
  }

  Reflect.deleteProperty(root.装备[cat] as object, partKey);

  root.背包[cat] ??= {};
  const existingInBag = root.背包[cat][itemName] as BagItemData | undefined;
  const existingQuantity = existingInBag?.quantity ?? 0;
  root.背包[cat][itemName] = { ...itemData, quantity: existingQuantity + 1 };

  mvuStore.saveToHost(newMvuData);
};
</script>

<style scoped>
.bag-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bag-controls {
  display: flex;
  border-bottom: 2px solid var(--paper-shadow);
  padding-bottom: 10px;
}
.bag-ctrl-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bag-ctrl-label {
  color: var(--wood-light);
  font-weight: bold;
  font-size: 11px;
}
.layout-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  border: 1px solid var(--wood-light);
  border-radius: 4px;
  background: var(--wood-dark);
  padding: 4px 10px;
  color: var(--brass-gold);
  font-size: 12px;
}
.layout-btn.active {
  border-color: var(--wood-dark);
  background: var(--highlight-red);
  color: #fff;
}

.equip-cat-title {
  display: inline-block;
  margin-bottom: 10px;
  border-radius: 4px 4px 0 0;
  background: var(--wood-dark);
  padding: 4px 15px;
  color: #fff;
  font-weight: 900;
  font-size: 14px;
}

.equip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}
@media (max-width: 480px) {
  .equip-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  }
}

.equip-slot {
  border: 1px dashed var(--wood-light);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
  padding: 8px;
  text-align: center;
}
.slot-label {
  margin-bottom: 4px;
  color: var(--wood-light);
  font-size: 10px;
}
.slot-item {
  position: relative;
  border-radius: 4px;
  padding: 6px;
  overflow: hidden;
  font-weight: bold;
  font-size: 13px;
}
.slot-item.empty {
  color: var(--paper-text);
  font-style: italic;
}
.slot-item.equipped {
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid var(--highlight-red);
  background: rgba(255, 255, 255, 0.6);
}
.slot-item.equipped:hover {
  background: rgba(166, 44, 43, 0.1);
}
.slot-overlay {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
  background: rgba(166, 44, 43, 0.8);
  color: #fff;
  font-size: 12px;
}
.slot-item.equipped:hover .slot-overlay {
  opacity: 1;
}

.cat-title-sm {
  margin: 10px 0 5px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  color: var(--wood-dark);
  font-weight: bold;
  font-size: 12px;
}
.bag-item {
  transition: transform 0.2s;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(139, 115, 85, 0.15);
  border: 1px solid rgba(139, 115, 85, 0.3);
  border-left: 4px solid var(--wood-light);
  border-radius: 4px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.4));
}
.bag-item:hover {
  transform: translateX(2px);
  border-left-color: var(--brass-gold);
}
.bag-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
}
.bag-item-name {
  flex-grow: 1;
  font-weight: bold;
  font-size: 13px;
}
.bag-item-count {
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  font-weight: bold;
  font-size: 12px;
  font-family: monospace;
}
.drawer-arrow {
  transition: transform 0.3s;
}
.drawer-arrow.rotate {
  transform: rotate(90deg);
}

.bag-item-detail {
  transition: all 0.3s ease;
  padding: 0 12px;
  max-height: 0;
  overflow: hidden;
  font-size: 12px;
}
.bag-item-detail.open {
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  padding: 10px 12px;
  max-height: 200px;
}

.item-meta {
  display: flex;
  gap: 10px;
  margin-top: 5px;
  color: var(--paper-text);
  font-size: 11px;
}
.action-row {
  margin-top: 10px;
  text-align: right;
}
.btn-equip {
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background: var(--wood-dark);
  padding: 4px 12px;
  color: #fff;
  font-weight: bold;
}
.btn-equip:hover {
  background: var(--highlight-red);
}

.bag-grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 10px;
  padding: 5px;
}
.bag-slot-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.bag-slot {
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
  border: 1px solid var(--paper-shadow);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
  width: 48px;
  height: 48px;
}
.bag-slot:hover {
  transform: scale(1.05);
  border-color: var(--highlight-red);
  background: rgba(255, 255, 255, 0.6);
}
.bag-slot-icon {
  color: var(--wood-dark);
  font-size: 24px;
}
.bag-slot-count {
  position: absolute;
  right: 2px;
  bottom: 0;
  font-weight: bold;
  font-size: 10px;
  font-family: monospace;
}
.bag-slot-label {
  margin-top: 4px;
  width: 100%;
  overflow: hidden;
  font-size: 10px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tier-普通 {
  color: var(--paper-text);
}
.tier-精良 {
  color: #3f51b5;
}
.tier-稀有 {
  color: #9c27b0;
}
.tier-史诗 {
  color: #f57c00;
}
.tier-传奇 {
  color: #d81b60;
  font-weight: 900;
}

.icon-tier-精良 {
  color: #3f51b5;
}
.icon-tier-稀有 {
  color: #9c27b0;
}
.icon-tier-史诗 {
  color: #f57c00;
}
.icon-tier-传奇 {
  color: #d81b60;
}
</style>
