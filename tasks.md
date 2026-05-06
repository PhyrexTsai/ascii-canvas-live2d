# ascii-canvas-live2d Task 清單

`<ascii-canvas-live2d>` 是基於 [`@phyrex/ascii-canvas`](https://www.npmjs.com/package/@phyrex/ascii-canvas) 的 Web Component，內建 Live2D 模型載入與動畫，輸出 ASCII art。

市場研究確認**全球沒有對手**——Arcelyth/live-ascii 是 Rust 終端機版本，瀏覽器端的 Live2D + ASCII 整合是空白市場。本 repo 是傳播載體，也是 ascii-canvas 的旗艦 demo。

**前置條件**：`@phyrex/ascii-canvas@^1.0.1` 已發 npm（2026-05 published），可直接 `npm install`。

---

## 核心原則

- **單職責**：只做「Live2D model → 餵 hidden canvas 給 `<ascii-canvas>`」這一件事，不重做渲染演算法。
- **API 對齊 shikigami `LiveAsciiController`**：`setMode()` / `setHeroAlpha()` 同名同義，shikigami 將來若想反向採用零學習成本。
- **Pixi / Live2D 走 peerDependencies**：絕不打包進 dist。`@phyrex/ascii-canvas` 是 regular dependency（2.3KB 零依賴，不該外漏給 user）。
- **模型授權合規**：demo 只用 Cubism SDK 官方免費範例，不放 shikigami 自家 Maid（Phase 2 替換；Phase 1 dev 期透過 .gitignore 暫用 Maid）。

---

## 既有資產（2026-04-23 prototype）

本 repo 從先前的本機原型直接演化，**不從零開始**。原型已有：

- ✅ Vite + TypeScript 環境（`vite.config.ts`, `tsconfig.json`）
- ✅ `pixi.js@^6.5.10` + `pixi-live2d-display@^0.4.0` 已裝
- ✅ `src/main.ts`（150 行）：Live2D 載入、PIXI Application、ASCII 取樣 loop
- ✅ `src/ascii.ts`（47 行）：ASCII 演算法（與 shikigami 一致）
- ✅ `src/style.css`：版面
- ✅ `index.html`：含即時調參 UI（ramp 切換 / zoom / y-offset slider / fps 顯示 / grid 尺寸顯示）
- ✅ `public/assets/`：（待清點）

**演化路線**：
1. 把現有 standalone 站轉變成 `demo/`（Phase 2 直接用）
2. 把 `src/main.ts` 拆成 `src/element.ts`（Web Component 形態）+ `demo/main.ts`（demo 控制）
3. `src/ascii.ts` **刪掉**——`@phyrex/ascii-canvas` 是 Custom Element，內部自己有 rAF + 採樣，我們只要把 PIXI hidden canvas 設為 `<ascii-canvas>.source`，**不需要 import 任何 named export**。

---

## 變更紀錄

- **2026-05-05**：repo 從先前的 `live2d-ascii/` prototype 重命名而來，套件名定為 `@phyrextsai/ascii-canvas-live2d`（`live2d-ascii` unscoped 雖可用，但採配對命名以反映 ascii-canvas 的依賴關係）。`git init` 完成。
- **2026-05-05**：Phase 0 完成（除推 GitHub 外）。`package.json` 改寫為 scoped + ESM + MIT + peer/dev dependencies 雙列（pixi.js / pixi-live2d-display 同列 peer + dev，lib 不打包但 demo 跑得動），`build` script 留給未來 `tsconfig.lib.json`（Phase 1）。`.gitignore` / `LICENSE` / `README.md` 就位。`npm install` 通過（120 packages，4 個 vulnerability 為 pixi v6 既有，留待後續處理）；`npx tsc --noEmit` exit 0。
- **2026-05-06**：Phase 1 主體完成。Dependency 從 `@phyrextsai/ascii-canvas`（原計畫 sibling repo + `npm link`）改成 `@phyrex/ascii-canvas@^1.0.1`（已發 npm，零依賴 2.3KB，作為 regular dep 不外漏給 user）。實作 `src/element.ts` + `src/index.ts`；刪除 `src/ascii.ts` + `src/main.ts`；demo 移到 `demo/`；新增 `tsconfig.lib.json`；`vite.config.ts` 改為 `root: demo`、`outDir: dist-demo`。Maid model 從 shikigami 拷過來作 dev 測試（已 .gitignore，Phase 2 替換成 Cubism 官方範例前不 commit）。
- **2026-05-06**：Phase 2 部分完成。Demo 模型從 Maid（shikigami 私有）換成 Cubism 官方 sample **Mao**（從 `~/.shikigami/models/Mao` 拷貝；使用 Live2D Free Material License）。`public/assets/live2d/Mao/` 取代 `Maid/`；`.gitignore` 移除 Maid 排除規則（Mao 是可散佈的官方範例，要 commit 進 repo 跟著 demo 一起發）。README + demo footer 加 attribution。剩 GH Pages workflow 跟 2-3/2-4/2-5/2-7 人工驗證未做。

---

## 決策清單

| # | 項目 | 決定 | 狀態 |
|---|---|---|---|
| D1 | Repo 名 | `phyrextsai/ascii-canvas-live2d` | ✅ 2026-05-05 |
| D2 | npm 套件名 | `@phyrextsai/ascii-canvas-live2d` | ✅ 2026-05-05 |
| D3 | License | MIT | ✅ |
| D4 | `ascii-canvas` 取得方式 | `npm install @phyrex/ascii-canvas@^1.0.1`（regular dep，已發 npm） | ✅ 2026-05-06（修正：原計畫 npm link sibling 已過時） |
| D5 | Demo 模型 | Phase 1 dev：shikigami Maid（gitignored）；Phase 2：Cubism 官方 Hiyori 或 Mark | ⏳ Phase 2 替換 |
| D6 | Pixi 與 pixi-live2d-display | peer + dev（lib 用 peer 不打包，demo 用 dev 跑得動）；`@phyrex/ascii-canvas` 走 regular dep | ✅ |
| D7 | Cubism 版本 | 只支援 cubism4（與 shikigami 一致） | ✅ |
| D8 | Build 雙軌 | lib：`tsc` 出 `dist/`；demo：`vite build` 出 `dist-demo/` | ✅ |

---

## Phase 0：Repo 初始化（半天）

- [x] 確認 `@phyrextsai/ascii-canvas-live2d` npm 名稱可用（404）
- [x] 從 `live2d-ascii/` rename 過來
- [x] `git init`（2026-05-05）
- [x] `tasks.md`（本檔）
- [x] 更新 `package.json`：scoped name、license MIT、author、repository、peer + dev dependencies、metadata（2026-05-05）
- [x] `LICENSE`（MIT）（2026-05-05）
- [x] `.gitignore`（node_modules / dist / dist-demo / .DS_Store）（2026-05-05）
- [x] `README.md` placeholder（2026-05-05）
- [ ] 推上 GitHub `phyrextsai/ascii-canvas-live2d`（public）— 等使用者執行 `gh repo create`

**Phase 0 驗證**

| # | 驗證項 | 狀態 |
|---|---|---|
| 0-1 | `npm install` 通過 | ✅ 2026-05-05 |
| 0-2 | `npm run dev` 既有 prototype 仍能跑（確認沒搞壞） | ⏳ 待手動跑 dev server 確認 |
| 0-3 | repo 在 GitHub public 可訪問 | ⏳ 待推送 |

---

## Phase 1：實作（半天到一天）

**前置**：`@phyrex/ascii-canvas@^1.0.1` 已 publish。

- [x] `npm install @phyrex/ascii-canvas`（regular dep）（2026-05-06）
- [x] **刪除** `src/ascii.ts`（演算法整個交給 `<ascii-canvas>`，不需 import）（2026-05-06）
- [x] `src/element.ts`：`AsciiCanvasLive2dElement extends HTMLElement`（2026-05-06）
  - **Attributes**：`model-url`, `zoom`, `x-offset`, `y-offset`, `floating-zoom`, `floating-x-offset`, `floating-y-offset` + 透傳給 `<ascii-canvas>` 的 6 個 attr（`ramp` / `cell-w` / `cell-h` / `font-px` / `alpha-threshold` / `paused`）
  - **Methods**：`setMode('hero' | 'floating')`, `setHeroAlpha(0..1)`
  - **內部**：shadow DOM 包 hidden `<canvas>`（PIXI.Application 的 view）+ `<ascii-canvas>`，把 hidden canvas 設為 `<ascii-canvas>.source`，**不自己跑 sample loop**（`<ascii-canvas>` 自帶 rAF + 採樣）
- [x] `src/index.ts`：export + customElements.define + HTMLElementTagNameMap（2026-05-06）
- [x] **重構** `src/main.ts`（demo 控制邏輯）→ 搬到 `demo/main.ts`，改用 `<ascii-canvas-live2d>` 元素 + 即時調參 UI 透過 attribute 改值（2026-05-06）
- [x] `tsconfig.lib.json`：lib build 配置（出 `dist/`）；保留現有 `tsconfig.json` 給 Vite（2026-05-06）

**Phase 1 驗證**

| # | 驗證項 | 狀態 |
|---|---|---|
| 1-1 | `tsc --noEmit -p tsconfig.lib.json` 通過 | ✅ 2026-05-06 |
| 1-2 | `tsc -p tsconfig.lib.json` emit `dist/` 體積合理（peer 走 import 不打包，真正的 bundle 檢查在 Phase 3 tarball check） | ✅ 48KB（4 個 .js + 4 個 .d.ts） |
| 1-3 | `test ! -e src/ascii.ts && grep -r "drawAscii" src/ demo/` 為空 | ✅ |
| 1-4 | `grep -rn '@phyrextsai/ascii-canvas\b' src/ demo/ package.json package-lock.json README.md vite.config.ts tsconfig*.json \| grep -v 'ascii-canvas-live2d'` 為空 | ✅ |
| 1-5 | API 對齊 shikigami `LiveAsciiController`（setMode / setHeroAlpha 名稱簽章一致） | ✅ 已對齊 |
| 1-6 | `npm run dev` demo 載入 200 OK（index.html / model3.json / moc3 / textures / src 透過 vite transform） | ✅ 2026-05-06 |

---

## Phase 2：Demo 站（半天）

既有 `index.html` + `src/main.ts` 已是現成 demo——這階段把它整理成正式 demo。

- [x] 既有 `index.html` → 改用 `<ascii-canvas-live2d>` 元素，調參 UI 透過 attribute 控制（2026-05-06，Phase 1 順手）
- [x] Cubism 官方範例模型 **Mao**（從 `~/.shikigami/models/Mao` 拷貝），放 `public/assets/live2d/Mao/`，README + demo footer 都有 attribution（2026-05-06）
- [x] `vite.config.ts`：build 輸出到 `dist-demo/`，避免跟 lib `dist/` 衝突（2026-05-06，Phase 1 順手）
- [x] `.github/workflows/`：`ci.yml`（typecheck + lib build + demo build）/ `pages.yml`（push main → 部署 `dist-demo/` 到 GH Pages）/ `release.yml`（`v*` tag → npm publish --provenance + GH Release）（2026-05-06）

**Phase 2 驗證**

| # | 驗證項 | 怎麼驗 | 狀態 |
|---|---|---|---|
| 2-1 | `npm run dev` demo 模型載入、ASCII 動起來 | browser | ⏳ 待人工確認 |
| 2-2 | ramp / zoom / y-offset 即時調參仍能用 | 手動 | ⏳ 待人工確認 |
| 2-3 | mode 切換淡入淡出正確（300ms） | 手動點按鈕 | ⏳ 留待 Phase 2.5（demo UI 還沒掛 mode 切換按鈕，目前只能 console 操作） |
| 2-4 | 故意拿掉 pixi script → demo 壞掉 | 證明 peer 設對 | ⏳ |
| 2-5 | **Shikigami sanity check**：DevTools 手動把 `<ascii-canvas-live2d>` 塞進 shikigami 頁面，視覺等同現有 Hero | 不 commit | ⏳ |
| 2-6 | 模型授權頁正確顯示 attribution | README + demo footer | ✅ 2026-05-06 |
| 2-7 | 行動裝置 4G 跑得動 | 手機實測 | ⏳ |

---

## Phase 3：Publish 前打磨（半天）

- [ ] `README.md`：
  - [ ] **demo gif**（最重要——傳播力來源，30s 內看到 Live2D 變 ASCII）— GH Pages 部署完才能錄
  - [x] Quick start（2026-05-06）
  - [x] API table — Attributes / Methods 兩張（2026-05-06）
  - [x] 強調「市場唯一」（研究證實沒有競品）— 開頭一句話帶過（2026-05-06）
  - [x] 模型授權注意事項 — Cubism Core CDN + Mao Free Material License（2026-05-06）
  - [x] 連結 ascii-canvas（2026-05-06）
  - [x] Constraints 表（cubism4 / pixi v6 / CORS / no motion API）（2026-05-06）
- [x] tarball 檢查：peer deps 真的沒被打包、demo/ 跟 model 沒被 publish（`npm pack --dry-run`：9.6KB packed / 11 files，只含 `dist/` + LICENSE + README + package.json）（2026-05-06）
- [ ] scratch 專案試裝

**Phase 3 驗證**

| # | 驗證項 |
|---|---|
| 3-1 | `npm publish --dry-run --access public` 通過 | ✅ 2026-05-06 |
| 3-2 | scratch 專案手動 install pixi + pixi-live2d-display + @phyrextsai/ascii-canvas-live2d 後能跑 | ⏳ |
| 3-3 | tarball < 30kb（peer 沒被打包應該很小） | ✅ 9.6KB packed / 33.1KB unpacked |

---

## Phase 4：Publish + 對外傳播（半小時 + 看心情）

- [ ] `npm publish --access public`
- [ ] `git tag v0.0.1`
- [ ] **發 Twitter / HN**：30 秒 demo 影片或 gif，one-liner「Live2D in your browser, but ASCII」+ demo URL
- [ ] PR 到 `awesome-web-components`、`awesome-live2d`

---

## 不做清單

- ❌ 自己重做 ASCII 渲染（用 ascii-canvas）
- ❌ 內建模型管理 / 切換 UI
- ❌ Lip-sync / motion control 高階 API（消費者透過 pixi-live2d-display ref 自己玩）
- ❌ Cubism 2 支援
- ❌ 內建 face tracking

---

## 風險紀錄

| 風險 | 緩解 |
|---|---|
| `ascii-canvas` API 還沒穩，這邊先用會 churn | ✅ 已解：`@phyrex/ascii-canvas@1.0.1` 已 publish + 鎖 caret |
| Live2D 模型授權踩雷 | ✅ 已解：demo 用 Cubism 官方 Mao，附 Free Material License attribution |
| pixi-live2d-display 換大版本 | 鎖 peer 範圍與 shikigami 同版 |
| 用戶數 0 | 接受；這是 ascii-canvas 的引流 demo + portfolio piece |
| ~~demo 既有 `Maid.model3.json` 路徑來自 shikigami~~ | ✅ 已解：2026-05-06 換成 Mao |

---

_最後更新：2026-05-06_
