#!/usr/bin/env node
/**
 * Prefix a global stylesheet so it only applies under a theme root.
 * Usage: node scripts/scope-css.mjs <input.css> <output.css> .theme-aura
 */
import fs from 'fs';

const [, , input, output, scope] = process.argv;
if (!input || !output || !scope) {
  console.error('Usage: scope-css.mjs <in> <out> <scope>');
  process.exit(1);
}

let css = fs.readFileSync(input, 'utf8');

// Pull @import url(...) lines out first (font URLs may contain ';')
const imports = [];
css = css.replace(/@import\s+url\([^)]+\);/g, (m) => {
  imports.push(m);
  return '';
});

function splitTopLevel(cssText) {
  const parts = [];
  let depth = 0;
  let start = 0;
  let inStr = null;
  for (let i = 0; i < cssText.length; i++) {
    const ch = cssText[i];
    const prev = cssText[i - 1];
    if (inStr) {
      if (ch === inStr && prev !== '\\') inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      continue;
    }
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        parts.push(cssText.slice(start, i + 1));
        start = i + 1;
      }
    }
  }
  if (start < cssText.length) parts.push(cssText.slice(start));
  return parts;
}

function prefixSelectorList(selectors, theme) {
  return selectors
    .split(',')
    .map((raw) => {
      let s = raw.trim();
      if (!s) return s;
      if (s === ':root' || s === 'body' || s === 'html') return theme;
      if (s.startsWith(theme)) return s;
      if (s.startsWith(':root')) s = s.replace(/^:root/, theme);
      else if (s.startsWith('body')) s = s.replace(/^body/, theme);
      else if (s.startsWith('html')) s = s.replace(/^html/, theme);
      else s = `${theme} ${s}`;
      return s;
    })
    .join(', ');
}

function transformBlock(block, theme) {
  const trimmed = block.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('@keyframes') || trimmed.startsWith('@font-face')) {
    return trimmed + '\n\n';
  }
  if (trimmed.startsWith('@media') || trimmed.startsWith('@supports')) {
    const open = trimmed.indexOf('{');
    const header = trimmed.slice(0, open).trim();
    const inner = trimmed.slice(open + 1, trimmed.lastIndexOf('}'));
    const rebuilt = splitTopLevel(inner)
      .map((p) => transformBlock(p, theme))
      .join('');
    return `${header} {\n${rebuilt}}\n\n`;
  }
  const open = trimmed.indexOf('{');
  if (open === -1) return trimmed + '\n';
  const selector = trimmed.slice(0, open).trim();
  const body = trimmed.slice(open);
  return `${prefixSelectorList(selector, theme)} ${body}\n\n`;
}

const scoped = splitTopLevel(css)
  .map((part) => transformBlock(part, scope))
  .join('');

const out = `${imports.join('\n')}\n\n${scoped}`;
fs.writeFileSync(output, out);
console.log(`Scoped ${input} → ${output} under ${scope}`);
