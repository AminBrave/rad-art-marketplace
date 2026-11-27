import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = path.join(root, ".agents", "skills");
const indexPath = path.join(skillsRoot, "README.md");
const expected = ["## Purpose", "## Use when", "## Workflow", "## Rademan context", "## Quality bar", "## Deliverable"];
const errors = [];
const dirs = readdirSync(skillsRoot, { withFileTypes: true }).filter((x) => x.isDirectory()).map((x) => x.name).sort();
const index = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";
if (!existsSync(indexPath)) errors.push(".agents/skills/README.md is missing");
const names = new Set();

function checkLinks(source, fromDir, label) {
  for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const href = match[1].split("#")[0].split("?")[0];
    if (!href || /^(https?:|mailto:|#)/i.test(href)) continue;
    if (!existsSync(path.resolve(fromDir, href))) errors.push(`${label}: broken link ${href}`);
  }
}

for (const dir of dirs) {
  const file = path.join(skillsRoot, dir, "SKILL.md");
  if (!existsSync(file)) { errors.push(`${dir}: SKILL.md is missing`); continue; }
  const source = readFileSync(file, "utf8");
  const lines = source.split(/\r?\n/);
  const fm = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!fm) { errors.push(`${dir}: frontmatter must be the first block`); continue; }
  const name = fm[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = fm[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  const keys = [...fm[1].matchAll(/^([a-zA-Z0-9_-]+):/gm)].map((m) => m[1]);
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64 || name !== dir) errors.push(`${dir}: invalid name or directory mismatch`);
  if (names.has(name)) errors.push(`${dir}: duplicate name ${name}`);
  names.add(name);
  if (!description || description.length > 1024 || !/\bUse when\b/i.test(description)) errors.push(`${dir}: description must state purpose and activation trigger`);
  if (keys.some((key) => !["name", "description"].includes(key))) errors.push(`${dir}: portable frontmatter must contain only name and description`);
  if (lines.length > 160) errors.push(`${dir}: SKILL.md exceeds 160 lines`);
  const headings = lines.filter((line) => /^## /.test(line));
  if (headings.join("\n") !== expected.join("\n")) errors.push(`${dir}: shared section headings/order mismatch`);
  checkLinks(source, path.dirname(file), dir);
  if (!index.includes(`./${dir}/SKILL.md`)) errors.push(`${dir}: missing from skills index`);
}
checkLinks(index, skillsRoot, "skills index");
if (errors.length) {
  for (const error of errors) process.stderr.write(`ERROR ${error}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Validated ${dirs.length} skills: frontmatter, names, structure, length, links and index coverage.\n`);
}
