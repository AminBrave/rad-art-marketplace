#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const taskFlag = args.indexOf('--task');
const task = taskFlag >= 0 ? args.slice(taskFlag + 1).join(' ') : args.join(' ');

const routes = [
  ['product-discovery', /discover|research|opportunity|user problem|customer|market|hypothesis|experiment/i],
  ['feature-planning', /feature|product|scope|requirement|acceptance|task|user flow|plan/i],
  ['architecture-design', /architecture|design pattern|module|boundary|system design|scalability|migration plan/i],
  ['laravel-backend', /laravel|php|eloquent|api|backend|migration|database|controller|model|policy|middleware/i],
  ['react-frontend', /react|javascript|frontend|front-end|ui|ux|component|route|rtl|persian|css|vite/i],
  ['ui-ux-design', /design|user experience|journey|navigation|layout|visual|responsive|accessibility|rtl/i],
  ['debugging', /bug|debug|error|exception|regression|broken|fails|failure/i],
  ['security-review', /security|auth|permission|authorization|privacy|upload|file access|secret|threat/i],
  ['code-review', /review|inspect diff|pull request review|audit code/i],
  ['quality-engineering', /test|testing|quality|lint|build|accessibility|performance|coverage|ci/i],
  ['git-github', /git|github|branch|commit|pull request|\\bpr\\b|merge|release|workflow|issue/i],
  ['operations-reliability', /deploy|deployment|runtime|observability|backup|incident|reliability|operations/i],
  ['documentation-maintenance', /documentation|docs|markdown|agent|skill|instructions|readme/i],
];
const selected = task ? [...new Set(routes.filter(([, pattern]) => pattern.test(task)).map(([name]) => name))] : [];

function read(path, optional = false) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) {
    if (!optional) console.error(`[ai-context] Context file not found: ${path}`);
    if (!optional) process.exitCode = 1;
    return;
  }
  console.log(`\\n========== ${path} ==========`);
  console.log(readFileSync(absolute, 'utf8').trim());
}

console.log('Rademan AI context packet (read-only)');
console.log(`Task: ${task || '(not supplied — no task-specific skills selected)'}`);
console.log(`Selected skills: ${selected.length ? selected.join(', ') : '(none)'}`);
read('AGENTS.md');
read('AI/DEVELOPMENT-GUIDE.md');
read('AI/PROJECT.md');
for (const skill of selected) read(`.agents/skills/${skill}/SKILL.md`);
console.log('\\n========== TASK HANDOFF ==========');
console.log('Follow the current user request. State important assumptions and acceptance criteria when useful. Choose proportionate verification for the changed boundaries. Update the relevant canonical documentation when it becomes inaccurate. Treat historical issues, PRs and AI notes as context only, not as future requirements.');
