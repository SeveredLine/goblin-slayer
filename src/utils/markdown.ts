import DOMPurify from 'dompurify';
import { marked, type TokenizerAndRendererExtension } from 'marked';

const diceEventExtension: TokenizerAndRendererExtension = {
  name: 'diceEvent',
  level: 'block',
  start(src: string) {
    return /<DiceEvent>/.exec(src)?.index;
  },
  tokenizer(src: string) {
    const rule = /^<DiceEvent>([\s\S]*?)<\/DiceEvent>/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: 'diceEvent',
        raw: match[0],
        content: match[1].trim(),
      };
    }
    return undefined;
  },
  renderer(token: { type: string; raw: string; content?: string } & Record<string, unknown>) {
    const contentString = token.content ?? '';
    return `<div class="zod-dice-event-wrapper" data-content="${encodeURIComponent(contentString)}">
              <div class="zod-dice-event-fallback">
                <strong>🎲 命运的骰子正在转动...</strong>
                <p>${contentString}</p>
              </div>
            </div>`;
  },
};

marked.use({
  gfm: true,
  breaks: true,
  extensions: [diceEventExtension],
});

export function renderMarkdown(rawText: string): string {
  if (!rawText) return '';
  const rawHtml = marked.parse(rawText) as string;
  return DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['target', 'data-content'],
    ADD_TAGS: ['iframe'],
  });
}
