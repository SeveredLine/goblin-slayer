import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface MvuStatData {
  世界?: Record<string, unknown>;
  主角?: {
    姓名?: string;
    种族?: string;
    层级?: string;
    经验等级?: number;
    技能点?: number;
    能力?: Record<string, number>;
    生命值?: { 当前值: number; 最大值: number };
    体力值?: { 当前值: number; 最大值: number };
    魔力值?: { 当前值: number; 最大值: number };
    信仰力值?: { 当前值: number; 最大值: number };
    护甲值?: { 当前值: number; 最大值: number };
    职业?: Record<string, unknown>;
    技能列表?: Record<string, unknown>;
    装备?: Record<string, unknown>;
    背包?: Record<string, unknown>;
    公会信息?: Record<string, unknown>;
    [key: string]: unknown;
  };
  关系列表?: Record<string, unknown>;
  [key: string]: unknown;
}

export const useMvuStore = defineStore('mvuStore', () => {
  const mvuData = ref<MvuStatData>({});
  const isMvuAvailable = ref(false);

  const updateMvuData = (data: Record<string, unknown>, available: boolean): void => {
    if (data?.stat_data) {
      mvuData.value = data.stat_data as MvuStatData;
    }
    isMvuAvailable.value = available;
  };

  const protagonist = computed(() => mvuData.value.主角 ?? {});
  const worldInfo = computed(() => mvuData.value.世界 ?? {});
  const relations = computed(() => mvuData.value.关系列表 ?? {});

  const saveToHost = (newData: Record<string, unknown>): void => {
    if (window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'UPDATE_MVU_DATA',
          newData: { stat_data: newData },
        },
        '*',
      );
    }
  };

  return {
    mvuData,
    isMvuAvailable,
    protagonist,
    worldInfo,
    relations,
    updateMvuData,
    saveToHost,
  };
});
