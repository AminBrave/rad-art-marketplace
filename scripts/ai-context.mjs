#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const chatgpt = args.includes('--chatgpt');
const taskFlag = args.indexOf('--task');
const task = taskFlag >= 0
  ? args.slice(taskFlag + 1).filter((value) => value !== '--chatgpt').join(' ')
  : args.filter((value) => value !== '--chatgpt').join(' ');

const routes = [
  ['feature-planning', /feature|product|scope|requirement|acceptance|roadmap|mvp|user flow|plan/i],
  ['laravel-backend', /laravel|php|eloquent|api|backend|migration|database|controller|model|policy|middleware/i],
  ['react-frontend', /react|javascript|frontend|front-end|ui|ux|component|route|rtl|persian|css|vite/i],
  ['debugging', /bug|debug|error|exception|regression|broken|fails|failure/i],
  ['security-review', /security|auth|permission|authorization|privacy|upload|file access|secret|threat/i],
  ['code-review', /review|inspect diff|pull request review|audit code/i],
  ['quality-engineering', /test|testing|quality|lint|build|accessibility|performance|coverage|ci/i],
  ['git-github', /git|github|branch|commit|pull request|\bpr\b|merge|release|workflow|issue|milestone|label/i],
];
const selected = task ? routes.filter(([, pattern]) => pattern.test(task)).map(([name]) => name) : [];

function read(path) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) {
    console.error(`[ai-context] Required context file is missing: ${path}`);
    process.exitCode = 1;
    return;
  }
  console.log(`\n========== ${path} ==========`);
  console.log(readFileSync(absolute, 'utf8').trim());
}

console.log('Rademan AI context packet (read-only)');
console.log(`Task: ${task || '(not supplied — no task skills selected)'}`);
console.log(`Selected skills: ${selected.length ? selected.join(', ') : '(none; consult the index if the task is not yet defined)'}`);
read('AGENTS.md');
if (chatgpt) read('CHATGPT.md');
read('AI/PROJECT.md');
read('AI/SESSION.md');
read('.agents/skills/README.md');
for (const skill of selected) read(`.agents/skills/${skill}/SKILL.md`);
read('AI/GIT-WORKFLOW.md');
console.log('\n========== TASK HANDOFF ==========');
console.log('Work on one bounded task. Confirm the related issue and branch. State assumptions and acceptance criteria. Do not run verification or CI without explicit user permission. Update AI/SESSION.md only when durable decisions or handoff state change.');
