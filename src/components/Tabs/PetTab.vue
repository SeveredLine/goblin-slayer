<template>
  <div class="pet-tab-root">
    <div v-if="isPetsEmpty" class="social-empty-state">
      <Icon icon="lucide:paw-print" class="empty-icon" />
      <p>暂无宠物随行</p>
    </div>

    <div v-else class="pet-list-container">
      <div v-for="(pet, name) in validPets" :key="name" class="pet-card">
        <div class="pet-watermark">PAW</div>

        <div class="pet-header">
          <div class="pet-name-box">
            <span class="pet-species">
              <Icon icon="lucide:paw-print" class="species-icon" />
              {{ pet.品类 ?? '奇珍' }}
            </span>
            <span class="pet-name">{{ name }}</span>
          </div>
          <div class="pet-eval-tag">{{ pet.评价 ?? '普通' }}</div>
        </div>

        <div class="pet-body">
          <div class="pet-info-item">
            <div class="pet-info-label"><Icon icon="lucide:info" /> 内在</div>
            <div class="pet-info-val">{{ pet.内在 ?? '未契合' }}</div>
          </div>
          <div class="pet-info-item">
            <div class="pet-info-label"><Icon icon="lucide:eye" /> 外在</div>
            <div class="pet-info-val">{{ pet.外在 ?? '未显现' }}</div>
          </div>
        </div>

        <div class="pet-trait-list">
          <template v-if="hasValidKeys(pet.词条)">
            <span v-for="(val, key) in getValidObj(pet.词条)" :key="key" class="pet-trait-tag">
              {{ key }}: {{ val }}
            </span>
          </template>
          <span v-else class="empty-trait">[ 尚未觉醒特殊词条 ]</span>
        </div>

        <div v-if="hasValidKeys(pet.装备)" class="pet-equip-section">
          <div class="pet-equip-grid">
            <div
              v-for="(eqData, eqName) in getValidEquips(pet.装备)"
              :key="eqName"
              class="pet-equip-item"
              :title="eqData.效果 || ''"
            >
              <div class="pet-equip-part">
                <Icon icon="lucide:shield" style="color: var(--highlight-red); font-size: 10px" />
                {{ eqData.部位 || '部位' }}
              </div>
              <div class="pet-equip-name">{{ eqName }}</div>
              <div class="pet-equip-effect">{{ eqData.效果 || '' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

import { useMvuStore } from '../../stores/useMvuStore';

const mvuStore = useMvuStore();

const validPets = computed<Record<string, Record<string, unknown>>>(() => {
  const pets = (mvuStore.mvuData.宠物 as Record<string, unknown>) ?? {};
  const result: Record<string, Record<string, unknown>> = {};
  for (const [name, pet] of Object.entries(pets)) {
    if (pet && typeof pet === 'object') {
      result[name] = pet as Record<string, unknown>;
    }
  }
  return result;
});

const isPetsEmpty = computed(() => Object.keys(validPets.value).length === 0);

const getValidObj = (obj: unknown): Record<string, unknown> => {
  if (!obj || typeof obj !== 'object') return {};
  const res: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v && (v as unknown) !== '待初始化') res[k] = v;
  }
  return res;
};

const hasValidKeys = (obj: unknown): boolean => {
  return Object.keys(getValidObj(obj)).length > 0;
};

export interface PetEquipData {
  部位?: string;
  效果?: string;
  [key: string]: unknown;
}

const getValidEquips = (obj: unknown): Record<string, PetEquipData> => {
  return getValidObj(obj) as Record<string, PetEquipData>;
};
</script>

<style scoped>
.pet-tab-root {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.social-empty-state {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0.3;
  padding: 40px;
  font-weight: 900;
  font-size: 18px;
  letter-spacing: 2px;
  text-align: center;
}
.empty-icon {
  margin-bottom: 10px;
  font-size: 48px;
}

.pet-list-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pet-card {
  position: relative;
  box-shadow:
    0 5px 15px rgba(0, 0, 0, 0.1),
    inset 0 0 20px rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(139, 115, 85, 0.5);
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.3));
  padding: 18px 60px 18px 18px;
  overflow: hidden;
}
@media (max-width: 600px) {
  .pet-card {
    padding: 15px 40px 15px 15px;
  }
  .pet-body {
    grid-template-columns: 1fr;
  }
}

.pet-watermark {
  position: absolute;
  right: -10px;
  bottom: -20px;
  transform: rotate(-15deg);
  opacity: 0.04;
  pointer-events: none;
  color: var(--paper-ink);
  font-size: 80px;
  font-family: 'Arial Black', sans-serif;
}

.pet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  border-bottom: 2.5px solid var(--paper-shadow);
  padding-bottom: 10px;
}

.pet-name-box {
  display: flex;
  flex-direction: column;
}
.pet-name {
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 24px;
  line-height: 1.2;
  letter-spacing: 1px;
}
.pet-species {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  color: var(--highlight-red);
  font-weight: 900;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.species-icon {
  font-size: 14px;
}

.pet-eval-tag {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--brass-gold);
  background: var(--paper-ink);
  padding: 3px 10px;
  color: var(--brass-gold);
  font-weight: 900;
  font-size: 10px;
}

.pet-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 15px;
}

.pet-info-item {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(139, 115, 85, 0.1);
  background: rgba(139, 115, 85, 0.06);
  padding: 6px 10px;
}
.pet-info-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(139, 115, 85, 0.2);
  padding-bottom: 1px;
  color: var(--wood-light);
  font-weight: 900;
  font-size: 10px;
  letter-spacing: 1px;
}
.pet-info-val {
  color: var(--wood-dark);
  font-weight: 900;
  font-size: 12px;
  line-height: 1.5;
}

.pet-trait-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}
.pet-trait-tag {
  box-shadow: 2px 2px 0 rgba(139, 115, 85, 0.2);
  border: 1.5px solid var(--wood-light);
  background: #fff;
  padding: 3px 10px;
  color: #5d4033;
  font-weight: 900;
  font-size: 11px;
}
.empty-trait {
  opacity: 0.3;
  margin: 10px auto;
  font-weight: 900;
  font-size: 10px;
}

.pet-equip-section {
  margin-top: 5px;
  border-top: 2px dashed rgba(0, 0, 0, 0.1);
  padding-top: 15px;
}
.pet-equip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}
.pet-equip-item {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1.5px solid var(--paper-shadow);
  background: rgba(255, 255, 255, 0.7);
  padding: 8px;
  font-size: 11px;
}
.pet-equip-part {
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 2px;
  color: var(--highlight-red);
  font-weight: 900;
  font-size: 10px;
}
.pet-equip-name {
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 12px;
}
.pet-equip-effect {
  margin-top: 4px;
  color: var(--wood-dark);
  font-style: italic;
  font-weight: 900;
  font-size: 10px;
}
</style>
