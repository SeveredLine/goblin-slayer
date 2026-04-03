import { useCreatorStore } from '../stores/useCreatorStore';

interface CharExt {
  name: string;
  gender: string;
  age: number | string;
  race: string;
  background: unknown;
  attributes: Record<string, number>;
  money?: number;
}

export function buildCharacterPrompt(): string {
  const store = useCreatorStore();
  const char = store.character as unknown as CharExt;

  const finalName = char.name.trim() || '{{user}}';
  const gender = char.gender || '未设定';
  const age = char.age || '未知';
  const race = char.race || '凡人';

  const bg = char.background as Record<string, Record<string, unknown> | string> | undefined;
  const origin = bg?.origin as Record<string, string> | undefined;
  const past = bg?.past as Record<string, string> | undefined;

  const originName = origin?.name ?? '未知';
  const pastName = past?.name ?? '未知';
  const encounterName = (bg?.encounter as string) ?? '未知';

  const hp = 10 + char.attributes['力量'] * 5 + char.attributes['感知'] * 2;
  const sp = 5 + char.attributes['力量'] + char.attributes['敏捷'];
  const mp = char.attributes['魔力'] || 0;
  const fth = char.attributes['信仰力'] || 0;

  const promptText = `Admin:
这是一个TRPG开局，请为 User 生成一段详尽的背景故事。
# 故事核心要求
请严格根据以下【角色完整设定】，撰写一段从角色童年到现在的成长故事。故事需要清晰地阐述是什么关键事件或心路历程，最终让他/她确立了要成为一名冒险者的志向。请在故事中自然地融入角色的种族、出身背景、技能和性格特点；接着在设置变量时，请你补全未设置的变量，已有的变量不需要进行更改。

# 角色完整设定
---
## 基础信息
- **姓名:** ${finalName}
- **性别:** ${gender}
- **年龄:** ${age}
- **种族:** ${race}

## 经历
- **出身:** ${originName}
- **来历:** ${pastName}
- **邂逅:** ${encounterName}

## 能力值
- **力量:** ${char.attributes['力量']} | **敏捷:** ${char.attributes['敏捷']}
- **感知:** ${char.attributes['感知']} | **知识:** ${char.attributes['知识']}
- **魅力:** ${char.attributes['魅力']} | **魔力:** ${char.attributes['魔力']}
- **信仰力:** ${char.attributes['信仰力']} | **潜力:** ${char.attributes['潜力']}`;

  const updateVariableBlock = `
<UpdateVariable>
    // == 基础身份 ==
    _.set('主角.姓名', '${finalName}');
    _.set('主角.种族', '${race}');
    _.set('主角.经验等级', 1);
    _.set('主角.技能点', 0);

    // == 能力与历练 ==
    _.set('主角.能力', {
      力量: ${char.attributes['力量']}, 敏捷: ${char.attributes['敏捷']},
      感知: ${char.attributes['感知']}, 知识: ${char.attributes['知识']},
      魅力: ${char.attributes['魅力']}, 魔力: ${char.attributes['魔力']},
      信仰力: ${char.attributes['信仰力']}
    });
    _.set('主角.历练进度', { 力量: 0, 敏捷: 0, 感知: 0, 知识: 0, 魅力: 0, 魔力: 0, 信仰力: 0 });

    // == 核心资源 ==
    _.set('主角.生命值.最大值', ${hp}); _.set('主角.生命值.当前值', ${hp});
    _.set('主角.体力值.最大值', ${sp}); _.set('主角.体力值.当前值', ${sp});
    _.set('主角.魔力值.最大值', ${mp}); _.set('主角.魔力值.当前值', ${mp});
    _.set('主角.信仰力值.最大值', ${fth}); _.set('主角.信仰力值.当前值', ${fth});
    _.set('主角.护甲值.最大值', 0); _.set('主角.护甲值.当前值', 0);

    // == 状态 / 资产 / 任务 ==
    _.set('主角.当前状态', {});
    _.set('主角.资产', {});
    _.set('主角.任务日志.进行中', {});
    _.set('主角.任务日志.已完成', {});

    // == 装备与背包 ==
    _.set('主角.装备.武器', {});
    _.set('主角.装备.防具', {});
    _.set('主角.装备.饰品', {});
    _.set('主角.背包', { 武器: {}, 防具: {}, 饰品: {}, 消耗品: {}, 材料: {}, 金钱: { 金币: 0, 银币: ${char.money}, 铜币: 0 } });

    // == 公会信息 ==
    _.set('主角.公会信息.所属公会', '无');
    _.set('主角.公会信息.公会阶级', '白瓷');
    _.set('主角.公会信息.当前贡献度', '0/100');
</UpdateVariable>`;

  return `/send <START>\n${promptText}\n${updateVariableBlock}\n|\n/trigger`;
}
