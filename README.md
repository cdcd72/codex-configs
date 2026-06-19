# Codex 設定

本儲存庫用於集中管理 Codex 的自訂環境設定與工作流程，包含技能定義、掛鉤腳本、規則說明與安全限制。它的目的在於提供一套可重複使用的開發環境。

## 目前結構

```text
.
├─ .agents/
│  └─ skills/
│     ├─ commit/
│     ├─ commit-push/
│     ├─ commit-push-pr/
│     ├─ review/
│     └─ test/
├─ .codex/
│  ├─ hooks/
│  │  ├─ auto-backup.js
│  │  ├─ auto-commit.js
│  │  ├─ block-dangerous.js
│  │  └─ format-lint.js
│  └─ hooks.json
├─ AGENTS.md
├─ LICENSE
└─ README.md
```

## 目錄與檔案說明

- `.agents/skills/`：提供 Codex 可直接使用的工作流程技能。
  - `commit/`：建立符合 Conventional Commits 的提交流程。
  - `commit-push/`：完成提交與推送。
  - `commit-push-pr/`：完成提交、推送與建立 PR。
  - `review/`：進行程式碼審查與風險檢查。
  - `test/`：執行測試、修復失敗案例並補充關鍵測試。

- `.codex/hooks.json`：註冊 Codex 的掛鉤事件與自動化流程。
  - `PreToolUse`：在執行工具前做安全檢查與備份。
  - `PostToolUse`：在檔案修改後進行格式化與 lint 修正。
  - `Stop`：在工作流程結束時自動提交。

- `.codex/hooks/`：實際的自動化腳本。
  - `auto-backup.js`：在編輯前建立備份提交。
  - `auto-commit.js`：在有變更時自動提交。
  - `block-dangerous.js`：阻止高風險指令（例如 `rm -rf /`、`mkfs`、`shutdown` 等）。
  - `format-lint.js`：在檔案變更後嘗試執行 Prettier / ESLint 修正。

- `AGENTS.md`：本倉庫的開發規則與 PowerShell 使用限制。

- `LICENSE`：專案授權條款。

## 主要功能

### 1. PowerShell 優先環境

本專案偏好在 Windows 環境中使用 PowerShell，避免不必要的 Bash 相依，並在規則中明確限制危險操作。

### 2. 危險命令防護

透過 `block-dangerous.js`，可以在 Codex 執行工具指令前攔截高風險命令，降低誤操作風險。

### 3. 自動備份與自動提交

透過掛鉤流程，這個專案可在編輯前建立備份提交，並在工作完成後進行自動整理與提交。

### 4. 可重複使用的工作流程技能

透過 `.agents/skills/` 可快速套用常見開發流程，例如提交、推送、審查與測試，讓 Codex 的操作更一致。

## 快速上手

1. 將此倉庫作為 Codex 的設定範本使用。
2. 若要調整自動化行為，可修改 `.codex/hooks.json` 或 `.codex/hooks/` 的腳本。
3. 若要新增工作流程，可在 `.agents/skills/` 建立新的技能檔。
4. 若要調整規則與限制，可更新 `AGENTS.md`。

## 維護建議

- 新增或修改技能、掛鉤或規則後，請同步更新本 README。
- 保持安全規則與自動化流程可控，避免過度放寬權限。
- 若變更需要額外依賴（例如 Prettier、ESLint），請確認環境中已具備對應工具。

## 貢獻

歡迎針對設定、流程、安全規則與自動化腳本提出建議或改善內容。
