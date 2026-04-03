import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface InventoryItem {
  name: string;
  cost?: number;
  itemType?: string;
  tier?: string;
  quality?: string;
  desc?: string;
  effect?: string;
  [key: string]: unknown;
}

export interface PartnerItem {
  姓名: string;
  cost?: number;
  层级?: string;
  身份背景?: string;
  [key: string]: unknown;
}

export interface ScenarioItem {
  id: string;
  title: string;
  cost?: number;
  desc?: string;
  [key: string]: unknown;
}

export const useCreatorStore = defineStore('creatorStore', () => {
  const character = ref({
    name: '无名',
    gender: '无性',
    age: 0,
    race: '非人',
    startLocation: '非之地',
    rank: '无等级',
    background: '无背景',
    growth: '无',
    encounter: '无',
    extraSettings: '',
    jobs: ['一无所有之人'],
    playstyle: '',
    attributes: { 力量: 0, 敏捷: 0, 感知: 0, 知识: 0, 魅力: 0, 信仰力: 0, 魔力: 0 } as Record<
      string,
      number
    >,
  });

  const totalPoints = ref(1000);
  const inventory = ref<InventoryItem[]>([]);
  const partners = ref<PartnerItem[]>([]);
  const startScenario = ref<ScenarioItem | null>(null);
  const customScenarioText = ref('');
  const skillTreeResult = ref<string | null>(null);

  const currentPoints = computed(() => {
    let total = 0;
    inventory.value.forEach((i) => {
      total += i.cost ?? 0;
    });
    partners.value.forEach((p) => {
      total += p.cost ?? 0;
    });
    if (startScenario.value && startScenario.value.id !== 'custom') {
      total += startScenario.value.cost ?? 0;
    }
    return total;
  });

  const isOverBudget = computed(() => currentPoints.value > totalPoints.value);

  const rollPoints = (): void => {
    totalPoints.value = Math.floor(Math.random() * 10000) + 1;
  };

  const resetCharacter = (): void => {
    character.value = {
      name: '无名',
      gender: '无性',
      age: 0,
      race: '非人',
      startLocation: '非之地',
      rank: '无等级',
      background: '无背景',
      growth: '无过去',
      encounter: '无相识',
      extraSettings: '',
      jobs: ['一无所有之人'],
      playstyle: '',
      attributes: { 力量: 0, 敏捷: 0, 感知: 0, 知识: 0, 魅力: 0, 信仰力: 0, 魔力: 0 },
    };
    totalPoints.value = 1000;
    inventory.value = [];
    partners.value = [];
    startScenario.value = null;
    customScenarioText.value = '';
    skillTreeResult.value = null;
  };

  return {
    character,
    totalPoints,
    inventory,
    partners,
    startScenario,
    customScenarioText,
    skillTreeResult,
    currentPoints,
    isOverBudget,
    rollPoints,
    resetCharacter,
  };
});
