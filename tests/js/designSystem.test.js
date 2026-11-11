import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read=(path)=>readFileSync(new URL(path,import.meta.url),'utf8');
const theme=read('../../resources/css/rademan-theme.css');
const css=read('../../resources/css/app.css');
const tailwind=read('../../tailwind.config.js');
const config=read('../../components.json');
const primitives=read('../../resources/js/components/ui/primitives.jsx');
const button=read('../../resources/js/components/ui/button.jsx');
const input=read('../../resources/js/components/ui/input.jsx');
const cards=read('../../resources/js/components/ui/cards.jsx');
const feedback=read('../../resources/js/components/ui/feedback.jsx');

test('Rademan identity is isolated in the theme configuration',()=>{
 for(const token of ['--background','--foreground','--card','--primary','--primary-foreground','--secondary','--muted','--muted-foreground','--accent','--destructive','--border','--input','--ring','--radius','--rademan-canvas','--rademan-terracotta','--rademan-sand','--rademan-olive','--font-persian','--font-latin','--leading-copy','--space-4']) assert.ok(theme.includes(token),`Missing theme token: ${token}`);
 assert.match(theme,/\.dark\s*\{/); assert.ok(css.includes("@import './rademan-theme.css';")); assert.ok(!css.includes('--color-canvas: #F7F5F0'));
});
test('shadcn config uses CSS variables, JavaScript, RTL and existing aliases',()=>{
 assert.match(config,/"style":"new-york"/); assert.match(config,/"tsx":false/); assert.match(config,/"rtl":true/); assert.match(config,/"cssVariables":true/); assert.match(config,/"ui":"@\/components\/ui"/);
 for(const token of ['background:','foreground:','primary:','secondary:','destructive:','muted:','card:','ring:']) assert.ok(tailwind.includes(token),`Missing Tailwind mapping: ${token}`);
});
test('canonical shadcn primitives use semantic tokens and shared cn utility',()=>{
 assert.ok(button.includes('focus-visible:ring-ring')); assert.ok(button.includes('bg-primary')); assert.ok(input.includes('border-input')); assert.ok(input.includes('bg-background'));
 assert.ok(primitives.includes("from './button'")); assert.ok(primitives.includes("from './input'"));
 assert.ok(primitives.includes('aria-busy={loading||undefined}')||primitives.includes('aria-busy={loading || undefined}'));
 assert.ok(primitives.includes("'aria-describedby':describedBy")||primitives.includes("'aria-describedby': describedBy"));
});
test('Rademan domain compositions use shadcn surfaces, not a parallel primitive CSS system',()=>{
 assert.ok(cards.includes('bg-card')); assert.ok(cards.includes('border')); assert.ok(feedback.includes('bg-card')); assert.ok(feedback.includes('bg-muted'));
 assert.ok(!css.includes('.ra-button')); assert.ok(!css.includes('.ra-control')); assert.ok(!css.includes('.ra-surface')); assert.ok(!css.includes('.ra-state'));
});
