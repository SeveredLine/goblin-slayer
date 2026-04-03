<template>
  <div class="social-tab-root">
    <div class="social-wrapper">
      <div class="social-sidebar">
        <div class="sidebar-header">
          <div
            class="social-tab"
            :class="{ active: currentTab === 'allies' }"
            @click="currentTab = 'allies'"
          >
            关系者
          </div>
          <div class="social-tab-divider"></div>
          <div
            class="social-tab"
            :class="{ active: currentTab === 'enemies' }"
            @click="currentTab = 'enemies'"
          >
            敌对者
          </div>
        </div>

        <div class="social-search-box">
          <input v-model="searchQuery" type="text" placeholder="搜索人物..." />
        </div>

        <div class="sidebar-list">
          <div v-if="Object.keys(filteredList).length === 0" class="empty-sidebar">
            未找到符合条件的人物
          </div>

          <div
            v-for="(char, name) in filteredList"
            :key="name"
            class="sidebar-item"
            :class="{ active: selectedCharName === name }"
            @click="selectChar(name as string)"
          >
            <div class="sidebar-item-main">
              <span class="sidebar-item-name" :class="{ masked: char.屏蔽 }">{{
                char.称呼 || name
              }}</span>
              <div class="sidebar-item-meta">
                <Icon icon="lucide:map-pin" :class="char.在场 ? 'icon-present' : 'icon-absent'" />
                <span :class="{ 'text-present': char.在场 }">{{
                  char.所处地点 || '记录缺失'
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedChar" class="social-main">
        <div class="social-detail-header-new" :class="{ 'is-enemy': currentTab === 'enemies' }">
          <div class="header-content-col">
            <div class="name-row">
              <div class="detail-name-large">{{ selectedChar.称呼 || selectedCharName }}</div>
              <div v-if="currentTab === 'allies'" class="detail-meta">
                {{ getJobString(selectedChar.职业) }} Lv.{{ selectedChar.职业等级 || 1 }}
              </div>
              <div v-else class="detail-meta">[ 威胁级别 ] {{ selectedChar.类型 || '未知' }}</div>
              <span v-if="selectedChar.is_companion" class="companion-tag">同行者</span>
            </div>
            <div v-if="currentTab === 'allies'" class="sub-info-row">
              {{ selectedChar.层级 || '白瓷' }}级 · {{ selectedChar.种族 || '人类' }} |
              {{ selectedChar.所处地点 || '记录缺失' }}
            </div>
          </div>
        </div>

        <div class="social-stats-grid">
          <div class="social-stats-col">
            <div class="social-portrait-container">
              <div class="social-portrait-placeholder">
                <Icon icon="lucide:image" class="portrait-icon" />
                <p>人物影像载入中...</p>
              </div>
            </div>

            <div class="social-section-title" :class="{ 'is-enemy': currentTab === 'enemies' }">
              {{ currentTab === 'enemies' ? '生存指标' : '核心状态' }}
            </div>

            <div class="gauges-wrap">
              <GaugeRow
                label="生命"
                :res="selectedChar.生命值"
                color="#c62828"
                icon="lucide:heart"
              />
              <GaugeRow
                label="护甲"
                :res="selectedChar.护甲值"
                color="#546e7a"
                icon="lucide:shield"
                :hide-empty="true"
              />
              <GaugeRow
                label="体力"
                :res="selectedChar.体力值"
                color="#2d5a27"
                icon="lucide:clock"
                :hide-empty="true"
              />
              <GaugeRow
                label="魔力"
                :res="selectedChar.魔力值"
                color="#2a5298"
                icon="lucide:flask-conical"
                :hide-empty="true"
              />
              <GaugeRow
                label="信仰"
                :res="selectedChar.信仰力值"
                color="#b8860b"
                icon="lucide:star"
                :hide-empty="true"
              />
            </div>

            <div
              class="social-section-title"
              :class="{ 'is-enemy': currentTab === 'enemies' }"
              style="margin-top: 20px"
            >
              {{ currentTab === 'enemies' ? '威胁评估 (能力)' : '能力评价与历练' }}
            </div>

            <div class="attr-grid">
              <div
                v-for="attr in ['力量', '敏捷', '感知', '知识', '魅力', '魔力', '信仰力']"
                :key="attr"
                class="attr-card"
              >
                <div class="attr-label">{{ attr }}</div>
                <div class="attr-value">{{ selectedChar.能力?.[attr] || 0 }}</div>
              </div>
            </div>

            <div v-if="currentTab === 'allies'" class="social-section-title">技艺记录</div>
            <div v-if="currentTab === 'allies'" class="social-skill-list">
              <div v-if="!hasSkills" class="empty-text">暂无技艺记载</div>
              <div
                v-for="(skill, sName) in selectedCharSkills"
                :key="sName"
                class="social-skill-card"
              >
                <div class="ss-header">
                  <div class="ss-name">{{ sName }}</div>
                  <div class="ss-tier">{{ skill.tier || 'T1' }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="social-stats-col">
            <div class="social-section-title" :class="{ 'is-enemy': currentTab === 'enemies' }">
              {{ currentTab === 'enemies' ? '战术情报 (备注)' : '背景记录' }}
            </div>

            <template v-if="currentTab === 'enemies'">
              <div class="enemy-intel-box">
                <div class="enemy-intel-content">
                  {{
                    selectedChar.备注 || '暂无该目标的详细战斗情报记录。目标意图不明，请保持警惕。'
                  }}
                </div>
              </div>
            </template>

            <template v-else>
              <div v-if="hasTraits" class="social-trait-list">
                <div
                  v-for="(val, tName) in selectedChar.性格标签"
                  v-show="val"
                  :key="tName"
                  class="social-trait-tag"
                >
                  {{ tName }}
                </div>
              </div>

              <div class="social-resume-section">
                <div class="social-resume-title">小简历</div>
                <div class="social-resume-content">
                  {{ getResumeText(selectedChar.小简历) }}
                </div>
              </div>

              <div class="social-info-item">
                <div class="social-info-label">外貌:</div>
                <div class="social-info-content">{{ selectedChar.外貌 || '...' }}</div>
              </div>
              <div class="social-info-item">
                <div class="social-info-label">身份背景:</div>
                <div class="social-info-content">
                  {{ selectedChar.身份背景 || selectedChar.背景 || '关于此人的记录寥寥无几。' }}
                </div>
              </div>

              <details v-if="hasEroticRecord" class="social-sex-details">
                <summary>
                  <div
                    class="social-section-title"
                    style="color: var(--highlight-red); margin: 0; border: none; padding: 0"
                  >
                    <Icon icon="lucide:key" /> 角色秘密档案
                  </div>
                  <span class="fold-hint">[ 点击展开/折叠 ]</span>
                </summary>
                <div class="social-sex-files">
                  <div v-for="(val, key) in eroticRecords" :key="key" class="sex-file-item">
                    <div class="sex-file-label">{{ key }}</div>
                    <div class="sex-file-content">{{ val }}</div>
                  </div>
                </div>
              </details>

              <div class="social-relation-zone">
                <div class="social-section-title">社交关联</div>
                <div class="social-relation-card">
                  <Icon icon="lucide:heart" class="relation-icon" />
                  <div class="relation-text-box">
                    <div class="relation-label">当前关系状态</div>
                    <div class="relation-val">{{ selectedChar['与主角关系'] || '点头之交' }}</div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div v-else class="social-empty-state">点击左侧列表查看详细档案</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, computed } from 'vue';

import { useMvuStore } from '../../stores/useMvuStore';

import GaugeRow from './GaugeRow.vue';

export interface CharacterInfo {
  称呼?: string;
  职业?: Record<string, unknown>;
  职业等级?: number | string;
  类型?: string;
  is_companion?: boolean;
  层级?: string;
  种族?: string;
  所处地点?: string;
  生命值?: Record<string, number>;
  护甲值?: Record<string, number>;
  体力值?: Record<string, number>;
  魔力值?: Record<string, number>;
  信仰力值?: Record<string, number>;
  能力?: Record<string, number>;
  技能列表?: Record<string, unknown>;
  备注?: string;
  性格标签?: Record<string, boolean>;
  小简历?: unknown;
  外貌?: string;
  身份背景?: string;
  背景?: string;
  性档案?: unknown;
  亲密档案?: unknown;
  秘密档案?: unknown;
  与主角关系?: string;
  屏蔽?: boolean;
  在场?: boolean;
  [key: string]: unknown;
}

const mvuStore = useMvuStore();
const currentTab = ref<'allies' | 'enemies'>('allies');
const searchQuery = ref('');
const selectedCharName = ref<string | null>(null);

const alliesRecord = computed(
  () => (mvuStore.relations as Record<string, CharacterInfo | '待初始化'>) ?? {},
);
const enemiesRecord = computed(
  () => (mvuStore.mvuData.敌人列表 as Record<string, CharacterInfo | '待初始化'>) ?? {},
);

const currentList = computed(() => {
  return currentTab.value === 'allies' ? alliesRecord.value : enemiesRecord.value;
});

const filteredList = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const result: Record<string, CharacterInfo> = {};
  for (const [name, char] of Object.entries(currentList.value)) {
    if (char === '待初始化' || !char) continue;
    if (name.toLowerCase().includes(query)) {
      result[name] = char;
    }
  }
  return result;
});

const selectChar = (name: string): void => {
  selectedCharName.value = name;
};

const selectedChar = computed(() => {
  if (!selectedCharName.value) return null;
  const char = currentList.value[selectedCharName.value];
  return char !== '待初始化' ? char : null;
});

const getJobString = (jobs: unknown): string => {
  if (!jobs || typeof jobs !== 'object') return '异乡客';
  const keys = Object.keys(jobs as Record<string, unknown>);
  return keys.length > 0 ? keys.join('/') : '异乡客';
};

const getResumeText = (resume: unknown): string => {
  if (!resume) return '（该人物的生平尚未被载入史册...）';
  if (typeof resume === 'string') return resume;
  if (typeof resume === 'object') {
    const entries = Object.entries(resume as Record<string, unknown>).filter(
      ([_, v]) => v && v !== '待初始化',
    );
    if (entries.length === 0) return '（生平暂无具体记载...）';
    return entries
      .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
      .join('\n');
  }
  return String(resume as string | number | boolean);
};

const hasTraits = computed(() => {
  const charVal = selectedChar.value;
  return charVal?.性格标签 && Object.keys(charVal.性格标签 as Record<string, unknown>).length > 0;
});

const selectedCharSkills = computed(() => {
  const raw = selectedChar.value?.技能列表 ?? {};
  const res: Record<string, Record<string, unknown>> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v && v !== '待初始化' && typeof v === 'object') {
      res[k] = v as Record<string, unknown>;
    }
  }
  return res;
});

const hasSkills = computed(() => Object.keys(selectedCharSkills.value).length > 0);

const eroticRecords = computed(() => {
  const charVal = selectedChar.value;
  const sexRecord = charVal?.性档案 ?? charVal?.亲密档案 ?? charVal?.秘密档案;

  if (!sexRecord || typeof sexRecord !== 'object' || (sexRecord as unknown) === '待初始化')
    return null;

  const validRecords: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(sexRecord as Record<string, unknown>)) {
    if (v && (v as unknown) !== '待初始化' && v !== '') {
      if (typeof v === 'object' && !Array.isArray(v)) {
        validRecords[k] = Object.entries(v as Record<string, unknown>)
          .map(([sk, sv]) => `${sk}: ${String(sv)}`)
          .join(' | ');
      } else {
        validRecords[k] = v;
      }
    }
  }
  return Object.keys(validRecords).length > 0 ? validRecords : null;
});

const hasEroticRecord = computed(() => eroticRecords.value !== null);
</script>

<style scoped>
.social-tab-root {
  height: 100%;
}
.social-wrapper {
  display: flex;
  gap: 15px;
  height: 100%;
  min-height: 500px;
}

.social-sidebar {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--paper-shadow);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.3);
  width: 220px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .social-wrapper {
    flex-direction: column;
    height: auto;
  }
  .social-sidebar {
    border-right: 1px solid var(--paper-shadow);
    border-bottom: 2px solid var(--wood-light);
    width: 100%;
    height: 240px;
  }
}
.sidebar-header {
  display: flex;
  align-items: center;
  background: var(--wood-dark);
  color: #fff;
}
.social-tab {
  flex: 1;
  opacity: 0.5;
  transition: all 0.3s;
  cursor: pointer;
  padding: 12px 0;
  font-weight: 900;
  font-size: 14px;
  text-align: center;
}
.social-tab.active {
  opacity: 1;
  background: rgba(0, 0, 0, 0.2);
  color: var(--brass-gold);
}
.social-tab-divider {
  background: rgba(255, 255, 255, 0.2);
  width: 1px;
  height: 16px;
}

.social-search-box {
  background: rgba(0, 0, 0, 0.03);
  padding: 10px;
}
.social-search-box input {
  box-sizing: border-box;
  outline: none;
  border: 1.5px solid var(--paper-shadow);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.6);
  padding: 6px 10px;
  width: 100%;
  font-size: 12px;
}

.sidebar-list {
  flex-grow: 1;
  overflow-y: auto;
}
.sidebar-list::-webkit-scrollbar {
  width: 4px;
}
.sidebar-list::-webkit-scrollbar-thumb {
  border-radius: 2px;
  background: var(--paper-shadow);
}

.sidebar-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 12px 15px;
  color: var(--wood-dark);
}
.sidebar-item:hover {
  background: rgba(0, 0, 0, 0.03);
}
.sidebar-item.active {
  background: rgba(166, 44, 43, 0.1);
  color: var(--highlight-red);
  font-weight: 900;
}
.sidebar-item-name {
  font-weight: 900;
  font-size: 14px;
}
.sidebar-item-name.masked {
  opacity: 0.5;
  text-decoration: line-through;
}
.sidebar-item-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.6;
  margin-top: 4px;
  color: var(--wood-light);
  font-size: 10px;
}
.icon-present {
  color: var(--highlight-red);
}
.text-present {
  color: var(--highlight-red);
  font-weight: 900;
}
.empty-sidebar {
  opacity: 0.5;
  padding: 20px;
  font-size: 12px;
  text-align: center;
}

.social-main {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  box-shadow: inset 0 0 20px rgba(139, 115, 85, 0.1);
  border: 1px solid var(--paper-shadow);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.25);
  padding: 0 20px 20px;
  overflow-y: auto;
}
.social-main::-webkit-scrollbar {
  width: 4px;
}
.social-main::-webkit-scrollbar-thumb {
  background: var(--paper-shadow);
}

.social-empty-state {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  opacity: 0.3;
  font-weight: 900;
  font-size: 18px;
  letter-spacing: 2px;
}

.social-detail-header-new {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 -20px 15px -20px;
  border-bottom: 1.5px solid var(--paper-shadow);
  background: rgba(62, 43, 31, 0.05);
  padding: 15px 20px;
}
.social-detail-header-new.is-enemy {
  border-color: var(--highlight-red) !important;
  background: rgba(166, 44, 43, 0.05);
}

.name-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.detail-name-large {
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 24px;
  font-family: 'Noto Serif SC', serif;
}
.detail-meta {
  opacity: 0.8;
  color: var(--paper-text);
  font-weight: 900;
  font-size: 12px;
}
.companion-tag {
  border-radius: 10px;
  background: var(--highlight-red);
  padding: 2px 6px;
  color: #fff;
  font-weight: 900;
  font-size: 9px;
}
.sub-info-row {
  margin-top: 4px;
  color: var(--wood-light);
  font-weight: 900;
  font-size: 11px;
}

.social-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .social-stats-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  .attr-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

.social-portrait-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  border: 2px solid var(--paper-shadow);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
  height: 120px;
  overflow: hidden;
}
.social-portrait-placeholder {
  opacity: 0.5;
  color: var(--wood-light);
  font-style: italic;
  font-size: 11px;
  text-align: center;
}
.portrait-icon {
  margin-bottom: 5px;
  font-size: 32px;
}

.social-section-title {
  margin: 15px 0 10px 0;
  border-bottom: 2px solid rgba(139, 115, 85, 0.2);
  padding-bottom: 6px;
  color: var(--wood-dark);
  font-weight: 900;
  font-size: 15px;
  font-family: 'Noto Serif SC', serif;
}
.social-section-title.is-enemy {
  border-bottom-color: rgba(166, 44, 43, 0.3);
  color: var(--highlight-red);
}

.attr-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 15px;
}
.attr-card {
  border: 1px solid var(--paper-shadow);
  background: rgba(0, 0, 0, 0.04);
  padding: 6px 2px;
  text-align: center;
}
.attr-label {
  color: var(--wood-dark);
  font-weight: 900;
  font-size: 10px;
}
.attr-value {
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 18px;
  font-family: 'Georgia', serif;
}

.social-skill-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.social-skill-card {
  border: 1px solid var(--paper-shadow);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.4);
  padding: 8px 10px;
}
.ss-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ss-name {
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 13px;
}
.ss-tier {
  border-radius: 2px;
  background: var(--wood-light);
  padding: 2px 6px;
  color: #fff;
  font-weight: 900;
  font-size: 9px;
}

.social-trait-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}
.social-trait-tag {
  border: 1px solid rgba(139, 115, 85, 0.2);
  border-radius: 3px;
  background: rgba(139, 115, 85, 0.1);
  padding: 2px 6px;
  color: var(--wood-dark);
  font-weight: 900;
  font-size: 10px;
}

.social-resume-section {
  margin-bottom: 15px;
  border-left: 3px solid var(--wood-light);
  border-radius: 4px;
  background: rgba(139, 115, 85, 0.05);
  padding: 10px 12px;
}
.social-resume-title {
  margin-bottom: 6px;
  color: var(--wood-dark);
  font-weight: 900;
  font-size: 13px;
}
.social-resume-content {
  color: var(--wood-dark);
  font-size: 11px;
  line-height: 1.5;
  white-space: pre-line;
}

.social-info-item {
  margin-bottom: 10px;
}
.social-info-label {
  margin-bottom: 2px;
  color: var(--wood-light);
  font-weight: 900;
  font-size: 12px;
}
.social-info-content {
  color: var(--paper-text);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.enemy-intel-box {
  border: 1px solid rgba(166, 44, 43, 0.2);
  border-radius: 4px;
  background: rgba(166, 44, 43, 0.05);
  padding: 12px;
}
.enemy-intel-content {
  color: var(--paper-ink);
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.social-relation-zone {
  margin-top: 15px;
  border-top: 1.5px dashed var(--paper-shadow);
  padding-top: 10px;
}
.social-relation-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--paper-shadow);
  background: rgba(139, 115, 85, 0.05);
  padding: 12px;
}
.relation-icon {
  opacity: 0.7;
  color: var(--highlight-red);
  font-size: 28px;
}
.relation-label {
  color: var(--wood-light);
  font-weight: 900;
  font-size: 11px;
}
.relation-val {
  color: #2e7d32;
  font-weight: 900;
  font-size: 16px;
}

.social-sex-details {
  margin-top: 15px;
  border: 1px solid var(--paper-shadow);
  background: rgba(0, 0, 0, 0.02);
}
.social-sex-details summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  outline: none;
  background: rgba(0, 0, 0, 0.03);
  padding: 8px 12px;
}
.fold-hint {
  opacity: 0.6;
  color: var(--highlight-red);
  font-weight: 900;
  font-size: 10px;
}
.social-sex-files {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid rgba(139, 115, 85, 0.1);
  padding: 10px;
}
.sex-file-item {
  border-left: 3px solid var(--highlight-red);
  background: rgba(255, 255, 255, 0.5);
  padding: 6px 10px;
}
.sex-file-label {
  margin-bottom: 2px;
  color: var(--highlight-red);
  font-weight: 900;
  font-size: 11px;
}
.sex-file-content {
  color: var(--wood-dark);
  font-weight: bold;
  font-size: 12px;
  line-height: 1.4;
}
</style>
