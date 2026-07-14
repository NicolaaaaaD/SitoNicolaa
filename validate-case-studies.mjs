#!/usr/bin/env node
/**
 * validate-case-studies.mjs
 * Checks all case study HTML files for required sections and structure.
 * Usage: node validate-case-studies.mjs
 * npm script: npm run validate:case-studies
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = dirname(__filename);

const CASE_STUDY_DIRS = [
  'case-studies',
  'it/case-studies',
];

// Slugs that should exist in both EN and IT
const EXPECTED_SLUGS = [
  'cinema-for-peace',
  'the-wall-museum',
  'rhode-island-novelty',
  'duebi-elevatori',
  'star-entertainment',
  'omnitrack',
];

// Required HTML patterns to check per page
const REQUIRED_PATTERNS = [
  { name: 'lang attribute',      pattern: /html lang=/ },
  { name: 'canonical link',      pattern: /rel="canonical"/ },
  { name: 'hreflang en',         pattern: /hreflang="en"/ },
  { name: 'hreflang it',         pattern: /hreflang="it"/ },
  { name: 'GTM container',       pattern: /GTM-KCSZKMWQ/ },
  { name: 'consent default',     pattern: /consent.*default/ },
  { name: 'hero section',        pattern: /class="cs-hero"/ },
  { name: 'eyebrow label',       pattern: /class="eyebrow"/ },
  { name: 'cs-meta',             pattern: /class="cs-meta"/ },
  { name: 'back link bar',       pattern: /class="back-link-bar"/ },
  { name: 'problem statement',   pattern: /class="problem-stmt"/ },
  { name: 'before list',         pattern: /class="before-list"/ },
  { name: 'insight block',       pattern: /class="insight-block"/ },
  { name: 'objective grid',      pattern: /class="obj-grid"/ },
  { name: 'approach list',       pattern: /class="approach-list"/ },
  { name: 'result grid',         pattern: /class="result-grid"/ },
  { name: 'takeaway',            pattern: /class="takeaway"/ },
  { name: 'tech list',           pattern: /class="tech-list"/ },
  { name: 'project nav',         pattern: /class="proj-nav"/ },
  { name: 'CTA final',           pattern: /class="cta-final"/ },
  { name: 'cookie banner',       pattern: /class="cookie-banner"/ },
  { name: 'Calendly widget',     pattern: /calendly\.com/ },
  { name: 'footer',              pattern: /class="footer"/ },
  { name: 'data-anim attributes',pattern: /data-anim/ },
  { name: 'IntersectionObserver',pattern: /IntersectionObserver/ },
];

// Patterns that should NOT appear (common mistakes)
const FORBIDDEN_PATTERNS = [
  { name: 'transition-all (forbidden)', pattern: /transition-all/ },
  { name: 'default Tailwind indigo',    pattern: /indigo-\d{3}/ },
  { name: 'default Tailwind blue',      pattern: /blue-[5-9]\d{2}/ },
];

// DRAFT check: draft pages should not be linked from archive
const DRAFT_SLUGS = [
  'cinema-for-peace',
  'the-wall-museum',
  'rhode-island-novelty',
  'duebi-elevatori',
];

let totalErrors = 0;
let totalWarnings = 0;
const results = [];

function checkFile(filePath) {
  const rel = relative(ROOT, filePath).replace(/\\/g, '/');
  const errors = [];
  const warnings = [];

  let html;
  try {
    html = readFileSync(filePath, 'utf-8');
  } catch (e) {
    errors.push(`Cannot read file: ${e.message}`);
    return { rel, errors, warnings };
  }

  // Required patterns
  for (const { name, pattern } of REQUIRED_PATTERNS) {
    if (!pattern.test(html)) {
      errors.push(`Missing: ${name}`);
    }
  }

  // Forbidden patterns
  for (const { name, pattern } of FORBIDDEN_PATTERNS) {
    if (pattern.test(html)) {
      warnings.push(`Found forbidden: ${name}`);
    }
  }

  // Check [VERIFY:] markers in comments (these are expected on drafts, just count them)
  const verifyMatches = html.match(/\[VERIFY:/g);
  if (verifyMatches) {
    warnings.push(`Has ${verifyMatches.length} [VERIFY:] marker(s) — needs client confirmation before publish`);
  }

  // Check DRAFT comment
  if (!html.includes('DRAFT')) {
    warnings.push(`No DRAFT marker found (add /* DRAFT */ comment if this is unpublished)`);
  }

  // Lang attribute check
  const isIT = rel.startsWith('it/');
  const langMatch = html.match(/html lang="([^"]+)"/);
  if (langMatch) {
    const lang = langMatch[1];
    if (isIT && lang !== 'it') errors.push(`Expected lang="it", found lang="${lang}"`);
    if (!isIT && lang !== 'en') errors.push(`Expected lang="en", found lang="${lang}"`);
  }

  // Logo href on EN pages should not point to /it
  if (!isIT && html.includes('class="logo" href="/it"')) {
    errors.push(`Logo links to /it — should link to / on EN pages`);
  }

  return { rel, errors, warnings };
}

function findCaseStudyFiles() {
  const files = [];
  for (const dir of CASE_STUDY_DIRS) {
    const dirPath = join(ROOT, dir);
    if (!existsSync(dirPath)) {
      console.warn(`  [warn] Directory not found: ${dir}`);
      continue;
    }
    const entries = readdirSync(dirPath);
    for (const slug of entries) {
      if (slug === 'index.html') continue; // skip archive pages
      const slugPath = join(dirPath, slug);
      if (!statSync(slugPath).isDirectory()) continue;
      const indexPath = join(slugPath, 'index.html');
      if (existsSync(indexPath)) {
        files.push(indexPath);
      } else {
        console.warn(`  [warn] Missing index.html in ${dir}/${slug}`);
      }
    }
  }
  return files;
}

function checkArchiveDraftLinks() {
  const archiveChecks = [
    { file: 'case-studies/index.html', label: 'EN archive' },
    { file: 'it/case-studies/index.html', label: 'IT archive' },
  ];
  const issues = [];

  for (const { file, label } of archiveChecks) {
    const filePath = join(ROOT, file);
    if (!existsSync(filePath)) {
      issues.push(`${label}: archive file missing (${file})`);
      continue;
    }
    const html = readFileSync(filePath, 'utf-8');
    for (const slug of DRAFT_SLUGS) {
      // Draft pages should only appear as "coming soon" cards, not as live links
      // Check if there's a clickable href to the draft page (not just a text reference)
      const liveLink = new RegExp(`href="[^"]*/${slug}[^"]*"[^>]*>[^<]*(?<!soon|prossimamente|coming)`, 'i');
      // A simpler check: if the archive has a direct href link to a draft slug
      const hrefPattern = new RegExp(`href="(?:/it)?/case-studies/${slug}"`, 'i');
      if (hrefPattern.test(html)) {
        // Make sure it's not inside a "coming soon" context — this is a heuristic check
        issues.push(`${label}: may have live link to draft page /${slug} — verify it's a "coming soon" card only`);
      }
    }
  }
  return issues;
}

function checkPairing() {
  const issues = [];
  for (const slug of EXPECTED_SLUGS) {
    const en = join(ROOT, 'case-studies', slug, 'index.html');
    const it = join(ROOT, 'it', 'case-studies', slug, 'index.html');
    if (!existsSync(en)) issues.push(`Missing EN page: case-studies/${slug}/index.html`);
    if (!existsSync(it)) issues.push(`Missing IT page: it/case-studies/${slug}/index.html`);
  }
  return issues;
}

// ── Run ──────────────────────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║          Case Study Validation — NicosDigit              ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// 1. Pairing check
console.log('► Checking EN/IT page pairing...');
const pairingIssues = checkPairing();
if (pairingIssues.length === 0) {
  console.log('  ✓ All expected EN/IT pairs present\n');
} else {
  pairingIssues.forEach(i => console.log(`  ✗ ${i}`));
  console.log();
  totalErrors += pairingIssues.length;
}

// 2. Archive draft-link check
console.log('► Checking archive pages don\'t expose draft links...');
const archiveIssues = checkArchiveDraftLinks();
if (archiveIssues.length === 0) {
  console.log('  ✓ No live links to draft pages found in archives\n');
} else {
  archiveIssues.forEach(i => console.log(`  ! ${i}`));
  console.log();
  totalWarnings += archiveIssues.length;
}

// 3. Per-file structural checks
console.log('► Checking case study page structure...\n');
const files = findCaseStudyFiles();

for (const file of files) {
  const result = checkFile(file);
  results.push(result);

  const hasErrors = result.errors.length > 0;
  const hasWarnings = result.warnings.length > 0;

  const icon = hasErrors ? '✗' : (hasWarnings ? '!' : '✓');
  console.log(`  ${icon} ${result.rel}`);

  for (const err of result.errors) {
    console.log(`      ERROR: ${err}`);
    totalErrors++;
  }
  for (const warn of result.warnings) {
    console.log(`      WARN:  ${warn}`);
    totalWarnings++;
  }
  if (!hasErrors && !hasWarnings) {
    // no output needed
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n──────────────────────────────────────────────────────────');
console.log(`  Files checked:  ${files.length}`);
console.log(`  Errors:         ${totalErrors}`);
console.log(`  Warnings:       ${totalWarnings}`);
console.log('──────────────────────────────────────────────────────────\n');

if (totalErrors > 0) {
  console.log('  RESULT: FAIL — fix errors before publishing\n');
  process.exit(1);
} else if (totalWarnings > 0) {
  console.log('  RESULT: PASS with warnings — review before publishing\n');
  process.exit(0);
} else {
  console.log('  RESULT: PASS — all checks passed\n');
  process.exit(0);
}
