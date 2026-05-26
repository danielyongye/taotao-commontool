#!/usr/bin/env bash

set -euo pipefail

BASE_BRANCH="${1:-origin/master}"
RANGE="${BASE_BRANCH}...HEAD"

print_section() {
  local title="$1"
  printf "\n===== %s =====\n" "$title"
}

ensure_git_repo() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "错误：当前目录不是 Git 仓库。"
    exit 1
  fi
}

ensure_base_branch() {
  if [[ "${BASE_BRANCH}" == origin/* ]]; then
    local remote_branch="${BASE_BRANCH#origin/}"
    if git show-ref --verify --quiet "refs/remotes/${BASE_BRANCH}"; then
      return
    fi

    echo "本地不存在远端引用 ${BASE_BRANCH}，尝试拉取 origin/${remote_branch}..."
    if git fetch origin "${remote_branch}" >/dev/null 2>&1; then
      echo "已拉取 origin/${remote_branch}。"
      return
    fi

    echo "错误：无法找到远端引用 ${BASE_BRANCH}，且拉取失败。"
    echo "请先确认远端分支存在后重试。"
    exit 1
  fi

  if git show-ref --verify --quiet "refs/heads/${BASE_BRANCH}"; then
    return
  fi

  echo "本地不存在分支 ${BASE_BRANCH}，尝试从 origin 获取..."
  if git fetch origin "${BASE_BRANCH}:${BASE_BRANCH}" >/dev/null 2>&1; then
    echo "已从 origin 获取 ${BASE_BRANCH}。"
    return
  fi

  echo "错误：无法找到本地分支 ${BASE_BRANCH}，且从 origin 获取失败。"
  echo "请先确认分支存在后重试。"
  exit 1
}

print_header() {
  local current_branch
  current_branch="$(git rev-parse --abbrev-ref HEAD)"
  print_section "Release Diff Evidence"
  echo "当前分支: ${current_branch}"
  echo "基线分支: ${BASE_BRANCH}"
  echo "比较范围: ${RANGE}"
}

print_commit_evidence() {
  print_section "Commits (${RANGE})"
  git log --pretty=format:'- %h %s%n  %b' "${RANGE}" || true
}

print_change_stats() {
  print_section "Changed Files Stats"
  git diff --stat "${RANGE}" || true

  print_section "Changed Files Name-Status"
  git diff --name-status "${RANGE}" || true
}

print_high_signal_hunks() {
  print_section "High-Signal Hunks (top 8 changed files)"

  local files
  files="$(
    git diff --numstat "${RANGE}" \
      | awk '{a=$1; d=$2; if (a=="-") a=0; if (d=="-") d=0; print a+d "\t" $3}' \
      | sort -rn \
      | sed -n '1,8p' \
      | awk -F '\t' '{print $2}'
  )"

  if [[ -z "${files}" ]]; then
    echo "无代码差异。"
    return
  fi

  while IFS= read -r file; do
    [[ -z "${file}" ]] && continue
    echo
    echo "--- ${file} ---"
    git diff "${RANGE}" -- "${file}" | sed -n '1,120p'
  done <<< "${files}"
}

main() {
  ensure_git_repo
  ensure_base_branch
  print_header
  print_commit_evidence
  print_change_stats
  print_high_signal_hunks
  print_section "Done"
  echo "以上为证据输出，请基于业务语义整理为【新增功能点 / 优化点 / 修复项】。"
}

main "$@"
