import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function minifyCss(input) {
  let css = input.replace(/\/\*[\s\S]*?\*\//g, '');
  css = css.replace(/\s+/g, ' ');
  css = css.replace(/\s*([{}:;,>+~])\s*/g, '$1');
  css = css.replace(/;}/g, '}');
  return css.trim();
}

function minifyJs(input) {
  let out = '';
  let i = 0;
  let state = 'code';
  let quote = '';

  while (i < input.length) {
    const ch = input[i];
    const next = input[i + 1];

    if (state === 'line_comment') {
      if (ch === '\n') {
        out += '\n';
        state = 'code';
      }
      i++;
      continue;
    }

    if (state === 'block_comment') {
      if (ch === '*' && next === '/') {
        state = 'code';
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    if (state === 'string') {
      out += ch;
      if (ch === '\\') {
        out += next || '';
        i += 2;
        continue;
      }
      if (ch === quote) {
        state = 'code';
      }
      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      state = 'string';
      quote = ch;
      out += ch;
      i++;
      continue;
    }

    if (ch === '/' && next === '/') {
      state = 'line_comment';
      i += 2;
      continue;
    }

    if (ch === '/' && next === '*') {
      state = 'block_comment';
      i += 2;
      continue;
    }

    out += ch;
    i++;
  }

  // conservative whitespace collapsing (line-based)
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter((line, idx, arr) => line.length > 0 || (idx > 0 && arr[idx - 1].length > 0))
    .join('\n');
}

const cssFiles = ['style.css'];
const jsFiles = ['gtag.js', 'config.js', 'schedule-data.js', 'main.js', 'data.js'];

for (const file of cssFiles) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  fs.writeFileSync(path.join(root, file.replace(/\.css$/, '.min.css')), minifyCss(src) + '\n');
}

for (const file of jsFiles) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  fs.writeFileSync(path.join(root, file.replace(/\.js$/, '.min.js')), minifyJs(src) + '\n');
}

console.log('Minified assets generated.');
