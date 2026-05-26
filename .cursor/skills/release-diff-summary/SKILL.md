---
name: release-diff-summary
description: Compare current branch with origin/master and summarize release changes into new features, optimizations, and fixes. Use when user asks for "本次发布内容", "发版总结", "分支差异汇总", "release notes", or requests current branch vs master change summary.
---

# Release Diff Summary

## Goal

Generate a concise release summary by comparing the current branch against `origin/master` (preferred baseline).

## When To Use

- User asks for release notes or release summary.
- User asks what changed between current branch and `master`/`origin/master`.
- User asks to summarize "新增功能点/优化点/修复项".

## Output Style

- Language: Chinese.
- Keep each bullet to one sentence.
- Add one Markdown H1 title in format `# 标题：...` that summarizes major requirement themes of this release.
- Add one standalone Markdown H1 heading `# 描述` before grouped section details, without inline body text.
- Use numbered structure:
  - Top-level sections use Chinese numerals: `一、二、三`.
  - Items inside each section use Arabic numerals: `1、2、3`.
- Group by:
  - `新增功能点`
  - `优化点`
  - `修复项`
- If a section has no items, write `无`.

## Workflow

1. First run ONE helper command and use its output as primary evidence.
2. Ensure base branch `origin/master` is available (fetch if needed).
3. Collect diff scope: `origin/master...HEAD` (or user-specified base).
4. Collect evidence:
   - commit titles and bodies
   - changed files and stats
   - high-signal code hunks for major modules
5. Only run extra git commands when script evidence is insufficient.
6. Classify items:
   - `新增功能点`: new modules/pages/APIs/flows, `feat` style commits
   - `优化点`: perf/refactor/usability/maintainability improvements
   - `修复项`: bug fixes, edge-case handling, regression fixes
7. Merge duplicates and remove implementation noise.
8. Output concise release summary; keep unknown intent out of final text unless user explicitly asks.

## Command Template

Prefer running this helper script first (single command, reduce repeated authorization prompts):

```bash
bash .cursor/skills/release-diff-summary/scripts/generate_release_summary.sh
```

Script output is evidence, not final text. The final release summary must still be rewritten into business-readable bullets.

## Required Validation

- Do not claim functionality without evidence from commits/diff.
- Avoid including pure style/chore unless user explicitly asks.
- When change intent is unclear, mark it as `待确认` instead of guessing.

## Final Response Template

Use this template:

```markdown
# 标题：<一句话概述本次主要需求改动方向，可包含 2-4 个关键词>

# 描述

## 一、新增功能点
1、...

## 二、优化点
1、...

## 三、修复项
#1、...
```
