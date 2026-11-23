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
  ['react-frontend', /react|javascript|frontend|front-end|component|route|rtl|persian|css|vite/i],
  ['ui-ux-design', /user experience|journey|navigation|layout|visual|responsive|accessibility|rtl|\bui\b|\bux\b/i],
  ['debugging', /bug|debug|error|exception|regression|broken|fails|failure/i],
  ['security-review', /security|auth|permission|authorization|privacy|upload|file access|secret|threat/i],
  ['code-review', /review|inspect diff|pull request review|audit code/i],
  ['quality-engineering', /test|testing|quality|lint|build|accessibility|performance|coverage|ci/i],
  ['git-github', /git|github|branch|commit|pull request|\\bpr\\b|merge|release|workflow|issue|agent lane|parallel agent|integration branch|project board|kanban/i],
  ['operations-reliability', /deploy|deployment|runtime|observability|backup|incident|reliability|operations/i],
  ['documentation-maintenance', /documentation|docs|markdown|agent|skill|instructions|readme/i],
];
const selected = task ? [...new Set(routes.filter(([, pattern]) => pattern.test(task)).map(([name]) => name))] : [];

function read(path) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) {
    console.error(`[ai-context] Context file not found: ${path}`);
    process.exitCode = 1;
    return;
  }
  console.log(`\n========== ${path} ==========`);
  console.log(readFileSync(absolute, 'utf8').trim());
}

console.log('Rademan AI context packet (read-only)');
console.log(`Task: ${task || '(not supplied — no task-specific skills selected)'}`);
console.log(`Selected skills: ${selected.length ? selected.join(', ') : '(none)'}`);
read('AGENTS.md');
read('AI/DEVELOPMENT-GUIDE.md');
read('AI/PROJECT.md');

const references = new Set();
if (selected.includes('architecture-design')) references.add('AI/ARCHITECTURE.md');
if (selected.includes('ui-ux-design') || selected.includes('react-frontend')) references.add('AI/DESIGN-SYSTEM.md');
if (selected.includes('security-review')) references.add('AI/SECURITY.md');
if (selected.includes('git-github')) {
  references.add('AI/DEVELOPMENT-WORKFLOW.md');
  references.add('AI/TASK-MANAGEMENT.md');
}
for (const reference of references) read(reference);
for (const skill of selected) read(`.agents/skills/${skill}/SKILL.md`);

console.log('\n========== TASK HANDOFF ==========');
console.log('Follow the current user request. State important assumptions and acceptance criteria when useful. Choose proportionate verification for the changed boundaries. Update the relevant canonical documentation when it becomes inaccurate. Use the assigned agent lane and a separate task branch. Coordinate shared files and contracts before parallel edits. Keep cross-agent integration owner-directed. Treat historical issues, PRs and AI notes as context only, not as future requirements.');
