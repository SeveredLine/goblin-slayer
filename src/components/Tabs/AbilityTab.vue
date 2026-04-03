<template>
  <div class="ability-tab">
    <div class="section-title">
      <Icon icon="lucide:shield" class="section-icon" />
      <span>能力评价与历练</span>
    </div>

    <div class="attr-grid">
      <div v-for="attr in attributeKeys" :key="attr" class="attr-card">
        <div class="attr-label">{{ attr }}</div>
        <div class="attr-value">{{ attributes[attr] || 0 }}</div>
        <div class="attr-exp-bar" title="历练进度">
          <div class="attr-exp-fill" :style="{ width: `${progress[attr] || 0}%` }"></div>
          <div class="gauge-ticks"></div>
        </div>
      </div>
    </div>

    <div class="section-title" style="margin-top: 25px">
      <Icon icon="lucide:swords" class="section-icon" />
      <span>职业体系 (Class System)</span>
    </div>

    <div v-if="!hasJobs" class="empty-state">尚未感应到职业共鸣</div>

    <div v-for="(jobData, jobName) in jobs" :key="jobName" class="job-tree-section">
      <div class="job-info-banner">
        <div class="job-header-card">
          <div class="job-seal">Lv.{{ jobData.当前等级 || 1 }}</div>
          <div class="job-info-main">
            <div class="job-name-row">
              <span class="j-name"
                >{{ jobName }} <span class="j-tier">[{{ jobData.等阶 || '初期' }}]</span></span
              >
            </div>
            <div class="job-exp-wrap">
              <div class="job-exp-text">
                <span>EXP PROGRESS</span>
                <span>{{ jobData.当前经验 || 0 }}/{{ jobData.升级所需 || 1000 }}</span>
              </div>
              <div class="job-exp-bar">
                <div class="job-exp-fill" :style="{ width: getExpPercent(jobData) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="skill-header">
      <div class="section-title" style="margin-top: 0; border: none; padding: 0">
        <Icon icon="lucide:book-open" class="section-icon" />
        <span>技艺专长 (Skills)</span>
      </div>
      <div class="skill-point-tag">
        SP: <span>{{ skillPoints }}</span>
      </div>
    </div>

    <div v-if="!hasSkills" class="empty-state">此技艺记载已随风尘隐去...</div>

    <div class="st-list">
      <div
        v-for="(skill, name) in skills"
        :key="name"
        class="st-item"
        :class="{ active: openSkill === name }"
        @click="toggleSkill(name as string)"
      >
        <div class="st-item-summary">
          <div class="st-item-title">
            <Icon
              icon="lucide:triangle"
              class="st-icon"
              :style="{ color: getTierColor(skill.tier) }"
            />
            <span class="st-item-name">{{ name }}</span>
            <span class="st-item-type-tag">{{ skill.type || '主动' }}</span>
          </div>
          <div class="st-item-status">
            <span class="st-tier" :style="{ background: getTierColor(skill.tier) }">{{
              skill.tier || 'T1'
            }}</span>
            <Icon icon="lucide:chevron-right" class="st-arrow" />
          </div>
        </div>

        <div class="st-item-content">
          <div class="st-item-desc">{{ skill.description || '暂无技能概述。' }}</div>
          <div v-if="skill.effect" class="st-item-effect">
            <strong>[效果]</strong> {{ skill.effect }}
          </div>
          <div class="st-item-footer">
            <div class="st-item-req">
              熟练度: {{ skill.熟练度 || 0 }}% | {{ skill.level || '初级' }}
            </div>
            <div v-if="skill.cost && skill.cost !== '无'" class="st-cost-tag">
              COST: {{ skill.cost }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';

import { useMvuStore } from '../../stores/useMvuStore';

const mvuStore = useMvuStore();
const protagonist = computed(() => mvuStore.protagonist);

const attributeKeys = ['力量', '敏捷', '感知', '知识', '魅力', '魔力', '信仰力'];
const attributes = computed(() => (protagonist.value.能力 as Record<string, unknown>) ?? {});
const progress = computed(() => (protagonist.value.历练进度 as Record<string, unknown>) ?? {});

export interface JobData {
  当前等级?: number | string;
  当前经验?: number | string;
  升级所需?: number | string;
  等阶?: string;
  [key: string]: unknown;
}

export interface SkillData {
  type?: string;
  tier?: string;
  level?: string;
  熟练度?: number | string;
  description?: string;
  effect?: string;
  cost?: string;
  [key: string]: unknown;
}

const jobs = computed(() => {
  const raw = (protagonist.value.职业 as Record<string, JobData | '待初始化'>) ?? {};
  const res: Record<string, JobData> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v && v !== '待初始化' && typeof v === 'object') {
      res[k] = v;
    }
  }
  return res;
});
const hasJobs = computed(() => Object.keys(jobs.value).length > 0);

const skills = computed(() => {
  const raw = (protagonist.value.技能列表 as Record<string, SkillData | '待初始化'>) ?? {};
  const res: Record<string, SkillData> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v && v !== '待初始化' && typeof v === 'object') {
      res[k] = v;
    }
  }
  return res;
});
const hasSkills = computed(() => Object.keys(skills.value).length > 0);
const skillPoints = computed(() => protagonist.value.技能点 ?? 0);

const openSkill = ref<string | null>(null);

const toggleSkill = (name: string): void => {
  openSkill.value = openSkill.value === name ? null : name;
};

const getExpPercent = (job: JobData): number => {
  if (!job || typeof job !== 'object') return 0;
  const cur = Number(job.当前经验 ?? 0);
  const max = Number(job.升级所需 ?? 1000);
  return max > 0 ? Math.min(100, (cur / max) * 100) : 0;
};

const getTierColor = (tier?: string): string => {
  const colors: Record<string, string> = {
    T1: 'var(--wood-light)',
    T2: '#2e7d32',
    T3: '#1565c0',
    T4: 'var(--highlight-red)',
    T0: 'var(--paper-text)',
  };
  return colors[tier?.toUpperCase() ?? ''] || colors.T1;
};
</script>

<style scoped>
.ability-tab {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  border-bottom: 2px solid rgba(139, 115, 85, 0.2);
  padding-bottom: 6px;
  color: var(--wood-dark);
  font-weight: 900;
  font-size: 15px;
}

.attr-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
@media (max-width: 600px) {
  .attr-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 400px) {
  .attr-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.attr-card {
  box-shadow:
    inset 0 0 15px rgba(255, 255, 255, 0.5),
    0 2px 5px rgba(139, 115, 85, 0.15);
  border: 1px solid rgba(139, 115, 85, 0.4);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.3);
  padding: 10px 6px;
  text-align: center;
}
.attr-label {
  margin-bottom: 2px;
  color: var(--wood-dark);
  font-weight: 900;
  font-size: 11px;
}
.attr-value {
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 22px;
  line-height: 1.2;
  font-family: 'Georgia', serif;
}
.attr-exp-bar {
  position: relative;
  margin-top: 6px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.15);
  width: 100%;
  height: 4px;
  overflow: hidden;
}
.attr-exp-fill {
  transition: width 0.3s;
  background: var(--wood-dark);
  height: 100%;
}
.gauge-ticks {
  position: absolute;
  top: 0;
  left: 0;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.2) 1px, transparent 1px);
  background-size: 10% 100%;
  width: 100%;
  height: 100%;
}

.job-info-banner {
  position: relative;
  margin-bottom: 10px;
  border: 1px solid var(--paper-shadow);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.02);
  padding: 12px 15px;
}
.job-header-card {
  display: flex;
  align-items: center;
  gap: 15px;
}
.job-seal {
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
  border: 2px solid var(--wood-dark);
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, var(--highlight-red), var(--highlight-red));
  width: 44px;
  height: 44px;
  color: #fff;
  font-weight: 900;
  font-size: 14px;
  font-family: serif;
}
.job-info-main {
  flex-grow: 1;
}
.job-name-row {
  display: flex;
  justify-content: space-between;
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 16px;
}
.j-tier {
  color: var(--highlight-red);
  font-size: 10px;
}
.job-exp-wrap {
  margin-top: 6px;
  width: 100%;
}
.job-exp-text {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  color: var(--paper-text);
  font-weight: 900;
  font-size: 9px;
}
.job-exp-bar {
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 5px;
  overflow: hidden;
}
.job-exp-fill {
  transition: width 0.3s;
  background: var(--highlight-red);
  height: 100%;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  border-bottom: 1px solid var(--paper-shadow);
  padding-bottom: 5px;
}
.skill-point-tag {
  border-radius: 10px;
  background: var(--wood-dark);
  padding: 2px 10px;
  color: var(--brass-gold);
  font-weight: 900;
  font-size: 11px;
}

.st-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.st-item {
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(139, 115, 85, 0.2);
  border: 1px solid rgba(139, 115, 85, 0.3);
  border-radius: 4px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
  overflow: hidden;
}
.st-item:hover {
  border-color: var(--wood-light);
}
.st-item-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 10px 15px;
}
.st-item-summary:hover {
  background: rgba(0, 0, 0, 0.03);
}
.st-item-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.st-item-name {
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 14px;
}
.st-item-type-tag {
  border-radius: 3px;
  background: var(--wood-dark);
  padding: 1px 5px;
  color: #fff;
  font-weight: 900;
  font-size: 9px;
}
.st-item-status {
  display: flex;
  align-items: center;
  gap: 6px;
}
.st-tier {
  border-radius: 2px;
  padding: 1px 6px;
  color: #fff;
  font-weight: 900;
  font-size: 9px;
  font-family: serif;
}
.st-arrow {
  transition: transform 0.3s;
  color: var(--wood-light);
  font-size: 14px;
}
.st-item.active .st-arrow {
  transform: rotate(90deg);
}

.st-item-content {
  transition: all 0.3s ease;
  padding: 0 15px;
  max-height: 0;
  overflow: hidden;
  color: #222;
  font-size: 12px;
}
.st-item.active .st-item-content {
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.2);
  padding: 12px 15px;
  max-height: 500px;
}
.st-item-desc {
  margin-bottom: 8px;
  color: var(--paper-text);
  font-style: italic;
  line-height: 1.4;
}
.st-item-effect {
  margin-bottom: 10px;
  border-left: 2px solid var(--highlight-red);
  padding-left: 8px;
  color: var(--highlight-red);
  font-weight: 900;
}
.st-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed rgba(0, 0, 0, 0.05);
  padding-top: 8px;
}
.st-item-req {
  color: var(--paper-text);
  font-weight: 900;
  font-size: 10px;
}
.st-cost-tag {
  border: 1px solid rgba(166, 44, 43, 0.2);
  border-radius: 3px;
  background: rgba(166, 44, 43, 0.1);
  padding: 2px 6px;
  color: var(--highlight-red);
  font-weight: 900;
  font-size: 10px;
}

.empty-state {
  padding: 20px;
  color: var(--paper-text);
  font-style: italic;
  font-size: 12px;
  text-align: center;
}
</style>
