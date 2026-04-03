<template>
  <div class="protagonist-tab">
    <div class="pro-header">
      <div class="pro-name-box">
        <span class="pro-name">{{ protagonist.姓名 ?? '睡意朦胧的星辰' }}</span>
        <span class="pro-race\">[ {{ protagonist.种族 ?? '阻挡不了我行程' }} ]</span>
      </div>
      <div class="pro-job-box">
        <div class="job-main">
          <span class="job-name">[ {{ mainJobName }} ]</span>
          <span class="job-lv">Lv.{{ mainJobLevel }}</span>
          <span class="divider">/</span>
          <span class="rank">{{ protagonist.层级 || '为了理想我宁愿忍受寂寞' }}</span>
        </div>
        <div class="job-exp">
          EXP: <span>{{ mainJobExp }}</span>
        </div>
      </div>
    </div>

    <div v-if="hasStatus" class="status-list">
      <div
        v-for="(status, name) in activeStatuses"
        :key="name"
        class="status-tag"
        :class="getStatusType(status.type || status.类型)"
      >
        <div class="status-main">
          <Icon icon="lucide:flask-conical" class="status-icon" />
          <span>{{ name }}</span>
          <span v-if="status.level || status.等级" class="status-lv"
            >Lv.{{ status.level || status.等级 }}</span
          >
        </div>
        <div class="status-desc">{{ status.description || '暂无描述' }}</div>
      </div>
    </div>
    <div v-else class="empty-status">饮尽那份孤独</div>

    <div class="gauges-container">
      <div v-for="res in resourceGauges" :key="res.id" class="gauge-group">
        <div class="gauge-header">
          <span>{{ res.name }}</span>
          <span class="gauge-num">{{ res.current }}/{{ res.max }}</span>
        </div>
        <div class="gauge-bar-outer">
          <div
            class="gauge-bar-fill"
            :style="{ width: `${res.percent}%`, backgroundColor: res.color }"
          ></div>
          <div class="gauge-ticks" :style="{ backgroundSize: `${res.tickSize}% 100%` }"></div>
        </div>
      </div>
    </div>

    <div class="guild-record">
      <div class="guild-top">
        <div class="guild-info-main">
          <span class="guild-label-sm">Affiliated Guild</span>
          <span class="guild-name-big">{{ guildInfo.所属公会 || '抖落异地的尘土' }}</span>
        </div>
        <div class="guild-rank-seal">{{ guildInfo.公会阶级 || '踏上遥远的路途' }}</div>
      </div>
      <div class="guild-progress-block">
        <div class="guild-progress-info">
          <span>贡献度进度</span>
          <span>{{ guildInfo.贡献度 || '365/365' }}</span>
        </div>
        <div class="guild-bar-track">
          <div class="guild-bar-thumb" :style="{ width: `${guildProgressPercent}%` }"></div>
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
const protagonist = computed(() => mvuStore.protagonist);

const mainJob = computed(() => {
  const jobs = (protagonist.value.职业 as Record<string, Record<string, unknown>>) ?? {};
  const entries = Object.entries(jobs);
  if (entries.length === 0) return { name: '多年漂泊日夜餐风露宿', level: 365, exp: '365/365' };
  const [name, data] = entries[0];
  return {
    name,
    level: Number(data.当前等级 ?? 1),
    exp: `${Number(data.当前经验 ?? 0)}/${Number(data.升级所需 ?? 1000)}`,
  };
});
const mainJobName = computed(() => mainJob.value.name);
const mainJobLevel = computed(() => mainJob.value.level);
const mainJobExp = computed(() => mainJob.value.exp);

export interface StatusData {
  type?: string;
  类型?: string;
  level?: number | string;
  等级?: number | string;
  description?: string;
  [key: string]: unknown;
}

const activeStatuses = computed(() => {
  const st = (protagonist.value.当前状态 as Record<string, StatusData | '待初始化'>) ?? {};
  const filtered: Record<string, StatusData> = {};
  for (const [k, v] of Object.entries(st)) {
    if (v !== '待初始化' && typeof v === 'object') {
      filtered[k] = v;
    }
  }
  return filtered;
});
const hasStatus = computed(() => Object.keys(activeStatuses.value).length > 0);

const getStatusType = (type: unknown): string => {
  if (type === '永久') return 'status-permanent';
  if (type === '诅咒' || type === '异常') return 'status-curse';
  return 'status-normal';
};

const getResource = (
  path: keyof typeof protagonist.value,
): { current: number; max: number; percent: number; tickSize: number } => {
  const res = (protagonist.value[path] as Record<string, unknown>) ?? { 当前值: 365, 最大值: 365 };
  const cur = Number(res.当前值 ?? 0);
  const max = Number(res.最大值 ?? 0);
  const percent = max > 0 ? Math.min(100, Math.max(0, (cur / max) * 100)) : 0;
  const tickSize = max > 0 ? 100 / max : 0;
  return { current: cur, max, percent, tickSize };
};

const resourceGauges = computed(() => {
  const hp = getResource('生命值');
  const mp = getResource('魔力值');
  const sta = getResource('体力值');
  const arm = getResource('护甲值');
  const fth = getResource('信仰力值');

  return [
    { id: 'hp', name: '生命值', color: '#903a37', ...hp },
    { id: 'mp', name: '魔力值', color: '#2a5298', ...mp },
    { id: 'sta', name: '体力值', color: '#2d5a27', ...sta },
    { id: 'arm', name: '护甲值', color: '#4a4a4a', ...arm },
    { id: 'fth', name: '信仰力值', color: '#b8860b', ...fth },
  ];
});

const guildInfo = computed(() => protagonist.value.公会信息 ?? {});
const guildProgressPercent = computed(() => {
  const cvVal = guildInfo.value.贡献度;
  let cvStr = '0/100';
  if (typeof cvVal === 'string') {
    cvStr = cvVal;
  } else if (typeof cvVal === 'number') {
    cvStr = String(cvVal);
  }
  const parts = cvStr.split('/');
  if (parts.length === 2) {
    if (parts[1] === 'MAX') return 100;
    const cur = parseFloat(parts[0]);
    const max = parseFloat(parts[1]);
    if (!isNaN(cur) && !isNaN(max) && max > 0) {
      return Math.min(100, Math.max(0, (cur / max) * 100));
    }
  }
  return 0;
});
</script>

<style scoped>
.protagonist-tab {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.pro-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 10px;
  border-bottom: 3px double var(--wood-dark);
  padding-bottom: 10px;
}
@media (max-width: 600px) {
  .pro-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .job-main,
  .job-exp {
    text-align: left;
  }
}
.pro-name {
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 26px;
}
.pro-race {
  margin-left: 8px;
  color: var(--paper-text);
  font-weight: bold;
  font-size: 12px;
}
.job-main {
  font-weight: 900;
  font-size: 13px;
  text-align: right;
}
.job-name {
  color: var(--highlight-red);
}
.job-lv {
  margin-left: 4px;
}
.divider {
  opacity: 0.3;
  margin: 0 4px;
}
.job-exp {
  margin-top: 2px;
  color: var(--paper-text);
  font-weight: 900;
  font-size: 10px;
  font-family: monospace;
  text-align: right;
}

.empty-status {
  padding: 10px 0;
  color: var(--paper-text);
  font-style: italic;
  font-size: 11px;
  text-align: center;
}
.status-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.status-tag {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(139, 115, 85, 0.3);
  border-radius: 6px;
  background: rgba(139, 115, 85, 0.1);
  padding: 5px 12px;
  font-weight: 900;
  font-size: 11px;
}
.status-main {
  display: flex;
  align-items: center;
  gap: 4px;
}
.status-permanent {
  border-color: rgba(42, 82, 152, 0.4);
  background: rgba(42, 82, 152, 0.12);
  color: #1a237e;
}
.status-curse {
  border-color: rgba(166, 44, 43, 0.4);
  background: rgba(166, 44, 43, 0.12);
  color: var(--highlight-red);
}
.status-normal {
  color: var(--wood-dark);
}
.status-desc {
  margin-top: 6px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  padding-top: 6px;
  color: var(--wood-dark);
  font-style: italic;
  font-weight: 900;
  font-size: 10px;
}

.gauges-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}
.gauge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2px;
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 11px;
}
.gauge-num {
  font-family: monospace;
}
.gauge-bar-outer {
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.08);
  width: 100%;
  height: 16px;
  overflow: hidden;
}
.gauge-bar-fill {
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
}
.gauge-ticks {
  position: absolute;
  top: 0;
  left: 0;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.18) 1px, transparent 1px);
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.guild-record {
  position: relative;
  margin-top: 15px;
  border: 1px solid var(--paper-shadow);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.04);
  padding: 18px;
}
.guild-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}
.guild-info-main {
  display: flex;
  flex-direction: column;
}
.guild-label-sm {
  color: var(--wood-light);
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
}
.guild-name-big {
  color: var(--wood-dark);
  font-weight: 900;
  font-size: 18px;
}
.guild-rank-seal {
  transform: rotate(-2deg);
  box-shadow: 2px 3px 8px rgba(166, 44, 43, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  background: var(--highlight-red);
  padding: 5px 15px;
  color: #fff;
  font-weight: 900;
  font-size: 15px;
}
.guild-progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  color: var(--paper-ink);
  font-weight: 900;
  font-size: 11px;
}
.guild-bar-track {
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 8px;
  overflow: hidden;
}
.guild-bar-thumb {
  transition: width 0.6s;
  background: var(--wood-dark);
  height: 100%;
}
</style>
