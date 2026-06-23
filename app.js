const PAGE_SIZE = 6;
const COLLAPSED_GENRE_LIMIT = 8;

const state = {
  records: [],
  filtered: [],
  selectedGenre: "全部类型",
  showAllGenres: false,
  clouds: { categories: [] },
  selectedCloudCategory: "shooting",
  selectedCloudTrack: "bomb",
  selectedCloudTerm: "",
  selectedCloudRecordIds: [],
  page: 1,
};

const genreMeta = {
  "大战场": "载具、据点与动态前线",
  "军事射击": "现代武器、战场与作战身份",
  "MOBA": "分路、经济、目标与团队团战",
  "策略竞技": "资源、信息与团队决策",
  "格斗": "距离、攻防、资源与对局知识",
  "动作竞技": "操作、反应与即时博弈",
  "1v1竞技": "单人对抗、读招与心理博弈",
  "英雄射击": "职责、能力组合与目标攻防",
  "目标攻防": "占点、运载与空间控制",
  "生存建造": "采集、制作、基地与探索",
  "沙盒": "开放目标、组合规则与创造表达",
  "合作冒险": "分工、准备与共同远征",
  "城市经营": "扩张、人口、资源与城市网络",
  "模拟经营": "生产、需求、预算与反馈循环",
  "策略模拟": "长期规划、权衡与系统后果",
  "全部类型": "查看全部分析",
  "撤离射击": "风险、战利品、撤离窗口",
  "战术射击": "信息、枪械、路线控制",
  "动作冒险": "探索、事件、临场工具",
  "RPG 成长": "构筑、任务、长期目标",
  "系统经济": "交易、资源流、沉没成本",
  "大逃杀": "缩圈、生存、最终胜者",
  "搜打撤": "带装入局、风险收益、撤离兑现",
  "拟真射击": "弹道、通信、组织协同",
  "联合作战": "步兵、载具、后勤与指挥",
  "战争模拟": "战线、资源与阵地消耗",
  "科幻射击": "能力、机动与未来战场",
  "未分类": "待补充标签",
};

const pageType = document.body.dataset.page || "index";

async function loadRecords() {
  const timestamp = Date.now();
  const [response, cloudResponse] = await Promise.all([
    fetch(`./data/analyses.json?ts=${timestamp}`),
    fetch(`./data/aesthetic-clouds.json?ts=${timestamp}`),
  ]);
  if (!response.ok) throw new Error(`数据读取失败：${response.status}`);
  const records = await response.json();
  const clouds = cloudResponse.ok ? await cloudResponse.json() : { categories: [] };
  state.records = Array.isArray(records) ? records : [];
  state.clouds = clouds && Array.isArray(clouds.categories) ? clouds : { categories: [] };
  if (pageType === "detail") renderDetailPage();
  else renderIndexPage();
}

function renderIndexPage() {
  const nodes = {
    cards: document.querySelector("#recordCards"),
    genreList: document.querySelector("#genreList"),
    search: document.querySelector("#searchInput"),
    refresh: document.querySelector("#refreshButton"),
    totalCount: document.querySelector("#totalCount"),
    chainCount: document.querySelector("#chainCount"),
    genreCount: document.querySelector("#genreCount"),
    pagination: document.querySelector("#pagination"),
    resultHint: document.querySelector("#resultHint"),
    emptyTemplate: document.querySelector("#emptyTemplate"),
    cloudCategoryTabs: document.querySelector("#cloudCategoryTabs"),
    cloudTrackTabs: document.querySelector("#cloudTrackTabs"),
    aestheticCloud: document.querySelector("#aestheticCloud"),
    cloudSampleHint: document.querySelector("#cloudSampleHint"),
    cloudMethod: document.querySelector("#cloudMethod"),
    clearCloudFilter: document.querySelector("#clearCloudFilter"),
  };

  nodes.search.addEventListener("input", () => {
    clearCloudFilter(nodes, false);
    state.page = 1;
    applyFilter(nodes);
  });
  nodes.clearCloudFilter.addEventListener("click", () => clearCloudFilter(nodes));
  nodes.refresh.addEventListener("click", loadRecords);
  renderAestheticCloud(nodes);
  applyFilter(nodes);
}

function renderAestheticCloud(nodes) {
  const categories = state.clouds.categories || [];
  if (!nodes.aestheticCloud || !categories.length) return;

  const category = categories.find((item) => item.id === state.selectedCloudCategory) || categories[0];
  state.selectedCloudCategory = category.id;
  const track = (category.tracks || []).find((item) => item.id === state.selectedCloudTrack) || category.tracks?.[0];
  if (!track) return;
  state.selectedCloudTrack = track.id;

  nodes.cloudCategoryTabs.innerHTML = categories
    .map((item) => `<button type="button" class="cloud-tab${item.id === category.id ? " active" : ""}" data-cloud-category="${escapeAttribute(item.id)}">${escapeHtml(item.label)}</button>`)
    .join("");
  nodes.cloudTrackTabs.innerHTML = (category.tracks || [])
    .map((item) => `<button type="button" class="cloud-track${item.id === track.id ? " active" : ""}" data-cloud-track="${escapeAttribute(item.id)}">${escapeHtml(item.label)}</button>`)
    .join("");
  nodes.aestheticCloud.innerHTML = (track.terms || [])
    .map((item, index) => {
      const size = 15 + Number(item.weight || 1) * 5;
      return `<button class="cloud-word" type="button" data-cloud-term="${escapeAttribute(item.label)}" data-tone="${index % 4}" style="--cloud-size:${size}px" aria-label="查看「${escapeAttribute(item.label)}」相关分析，命中 ${Number(item.count || 0)} 次"><strong>${escapeHtml(item.label)}</strong><small>${Number(item.count || 0)}</small></button>`;
    })
    .join("");
  nodes.cloudSampleHint.textContent = `${track.description} · ${track.sample_count || 0} 篇样本`;
  nodes.cloudMethod.textContent = state.clouds.method || "";

  for (const button of nodes.cloudCategoryTabs.querySelectorAll("[data-cloud-category]")) {
    button.addEventListener("click", () => {
      clearCloudFilter(nodes, false);
      const nextCategory = categories.find((item) => item.id === button.dataset.cloudCategory);
      state.selectedCloudCategory = nextCategory?.id || categories[0].id;
      state.selectedCloudTrack = nextCategory?.tracks?.[0]?.id || "";
      renderAestheticCloud(nodes);
    });
  }
  for (const button of nodes.cloudTrackTabs.querySelectorAll("[data-cloud-track]")) {
    button.addEventListener("click", () => {
      clearCloudFilter(nodes, false);
      state.selectedCloudTrack = button.dataset.cloudTrack;
      renderAestheticCloud(nodes);
    });
  }
  for (const button of nodes.aestheticCloud.querySelectorAll("[data-cloud-term]")) {
    button.addEventListener("click", () => {
      const term = (track.terms || []).find((item) => item.label === button.dataset.cloudTerm);
      state.selectedCloudTerm = term?.label || "";
      state.selectedCloudRecordIds = term?.record_ids || track.record_ids || [];
      state.selectedGenre = "全部类型";
      state.showAllGenres = false;
      state.page = 1;
      nodes.search.value = "";
      applyFilter(nodes);
      document.querySelector("#analysisIndex")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function clearCloudFilter(nodes, render = true) {
  state.selectedCloudTerm = "";
  state.selectedCloudRecordIds = [];
  if (render) {
    state.page = 1;
    applyFilter(nodes);
  }
}

function applyFilter(nodes) {
  const query = nodes.search.value.trim().toLowerCase();
  state.filtered = state.records.filter((record) => {
    const genres = getGenres(record);
    const matchesGenre = state.selectedGenre === "全部类型" || genres.includes(state.selectedGenre);
    const matchesCloudTerm = !state.selectedCloudRecordIds.length || state.selectedCloudRecordIds.includes(record.id);
    const haystack = collectSearchText(record, genres).toLowerCase();
    return matchesGenre && matchesCloudTerm && haystack.includes(query);
  });

  const genres = collectGenres();
  nodes.totalCount.textContent = state.records.length.toString();
  nodes.chainCount.textContent = state.records.reduce((sum, record) => sum + (record.chains || []).length, 0).toString();
  nodes.genreCount.textContent = Math.max(genres.length - 1, 0).toString();
  nodes.resultHint.textContent = state.selectedCloudTerm
    ? `美学词条「${state.selectedCloudTerm}」 · ${state.filtered.length} 篇相关分析`
    : `${state.filtered.length} 条结果 · 第 ${state.filtered.length ? state.page : 0} 页`;
  nodes.clearCloudFilter.hidden = !state.selectedCloudTerm;
  renderGenres(nodes, genres);
  renderCards(nodes);
  renderPagination(nodes);
}

function renderGenres(nodes, genres) {
  const allGenre = genres.find(({ name }) => name === "全部类型");
  const rankedGenres = genres
    .filter(({ name }) => name !== "全部类型")
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
  let visibleGenres = state.showAllGenres
    ? genres
    : [allGenre, ...rankedGenres.slice(0, COLLAPSED_GENRE_LIMIT - 1)].filter(Boolean);

  if (!state.showAllGenres && state.selectedGenre !== "全部类型" && !visibleGenres.some(({ name }) => name === state.selectedGenre)) {
    const selected = genres.find(({ name }) => name === state.selectedGenre);
    if (selected) visibleGenres = [...visibleGenres.slice(0, -1), selected];
  }

  const canToggle = genres.length > COLLAPSED_GENRE_LIMIT;
  nodes.genreList.classList.toggle("expanded", state.showAllGenres);
  nodes.genreList.innerHTML = visibleGenres
    .map(({ name, count }) => {
      const active = name === state.selectedGenre ? " active" : "";
      return `
        <button class="genre-chip${active}" type="button" data-genre="${escapeAttribute(name)}">
          <strong>${escapeHtml(name)}</strong>
          <span>${escapeHtml(genreMeta[name] || "自定义板块")}</span>
          <em>${count}</em>
        </button>
      `;
    })
    .join("") + (canToggle
      ? `<button class="genre-toggle" type="button" aria-expanded="${state.showAllGenres}">
          ${state.showAllGenres ? "收起类型" : `展开全部类型（${genres.length - 1}）`}
        </button>`
      : "");

  for (const button of nodes.genreList.querySelectorAll(".genre-chip")) {
    button.addEventListener("click", () => {
      clearCloudFilter(nodes, false);
      state.selectedGenre = button.dataset.genre || "全部类型";
      state.page = 1;
      applyFilter(nodes);
    });
  }

  nodes.genreList.querySelector(".genre-toggle")?.addEventListener("click", () => {
    state.showAllGenres = !state.showAllGenres;
    renderGenres(nodes, genres);
  });
}

function renderCards(nodes) {
  nodes.cards.innerHTML = "";
  if (!state.filtered.length) {
    nodes.cards.appendChild(nodes.emptyTemplate.content.cloneNode(true));
    return;
  }

  const start = (state.page - 1) * PAGE_SIZE;
  const pageRecords = state.filtered.slice(start, start + PAGE_SIZE);
  nodes.cards.innerHTML = pageRecords.map(renderIndexCard).join("");
}

function renderIndexCard(record) {
  const systems = record.comparison_systems || [];
  const gaps = record.system_gaps || [];
  const cover = record.cover_image || "";
  return `
    <article class="record-card">
      <div class="record-cover">
        ${cover ? `<img src="${escapeAttribute(cover)}" alt="${escapeAttribute(record.cover_alt || record.title || "分析专题封面")}" loading="lazy" decoding="async" />` : ""}
        <span>${escapeHtml(getGenres(record)[0] || "游戏分析")}</span>
      </div>
      <div class="record-card-body">
        <div class="card-topline">
          <span>${escapeHtml(formatDate(record.updated_at || record.created_at))}</span>
          <span>${systems.length} 个共同系统</span>
        </div>
        <h3>${escapeHtml(record.title || "未命名分析")}</h3>
        <p>${escapeHtml(record.summary || "暂无摘要。")}</p>
        <div class="tag-row small">
          ${getGenres(record).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <div class="card-metrics">
          <span>${(record.chains || []).length} 条 MDA 链</span>
          <span>${gaps.length} 个覆盖差异</span>
        </div>
        <a class="primary-link" href="./detail.html?id=${encodeURIComponent(record.id)}">查看完整对比</a>
      </div>
    </article>
  `;
}

function renderPagination(nodes) {
  const totalPages = Math.max(Math.ceil(state.filtered.length / PAGE_SIZE), 1);
  if (state.page > totalPages) state.page = totalPages;
  if (totalPages <= 1) {
    nodes.pagination.innerHTML = "";
    return;
  }

  nodes.pagination.innerHTML = `
    <button type="button" ${state.page === 1 ? "disabled" : ""} data-page="${state.page - 1}">上一页</button>
    <span>${state.page} / ${totalPages}</span>
    <button type="button" ${state.page === totalPages ? "disabled" : ""} data-page="${state.page + 1}">下一页</button>
  `;

  for (const button of nodes.pagination.querySelectorAll("button")) {
    button.addEventListener("click", () => {
      state.page = Number(button.dataset.page);
      renderCards(nodes);
      renderPagination(nodes);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

function renderDetailPage() {
  const root = document.querySelector("#detailRoot");
  const emptyTemplate = document.querySelector("#emptyTemplate");
  const id = new URLSearchParams(window.location.search).get("id");
  const record = state.records.find((item) => item.id === id) || state.records[0];

  if (!record) {
    root.appendChild(emptyTemplate.content.cloneNode(true));
    return;
  }

  document.title = `${record.title} - 游戏 MDA 策划分析库`;
  root.innerHTML = renderRecordDetail(record);
}

function renderRecordDetail(record) {
  const cover = record.cover_image || "";
  return `
    <article class="analysis-record">
      <header class="record-header${cover ? " has-cover" : ""}">
        ${cover ? `<img class="record-header-image" src="${escapeAttribute(cover)}" alt="${escapeAttribute(record.cover_alt || record.title || "分析专题封面")}" loading="eager" decoding="async" />` : ""}
        ${cover ? `<div class="record-header-shade" aria-hidden="true"></div>` : ""}
        <div class="record-header-content">
          <div class="record-header-copy">
            <p class="eyebrow">${escapeHtml(formatDate(record.updated_at || record.created_at))}</p>
            <h1>${escapeHtml(record.title || "未命名分析")}</h1>
          </div>
          <div class="tag-row">
            ${[...getGenres(record), ...(record.subjects || [])].map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </div>
      </header>

      ${renderVisualRoutes(record.visual_routes || [], record)}

      <section class="summary-band">
        <span>MDA 对比结论</span>
        <p>${escapeHtml(record.summary || "暂无摘要。")}</p>
      </section>

      ${renderReadingGuide(record.reading_guide || [])}
      ${renderArgumentMap(record)}
      ${renderQuantification(record.quantification, record)}

      <section class="record-grid">
        ${renderComparisonSystems(record.comparison_systems || [], record)}
        ${renderSystemGaps(record.system_gaps || [], record)}
        ${renderMdaChains(record.chains || [])}
        ${renderJudgments(record.judgments || [])}
        ${renderRecommendations(record.recommendations || [])}
        ${renderSources(record.sources || [])}
      </section>
    </article>
  `;
}

function renderReadingGuide(items) {
  if (!items.length) return "";
  return `
    <section class="reading-guide" aria-label="阅读导引">
      <div class="section-title">
        <div>
          <p class="eyebrow">Read First</p>
          <h2>先看这三件事</h2>
        </div>
      </div>
      <div class="guide-grid">
        ${items
          .map(
            (item, index) => `
              <article class="guide-card">
                <span>${String(index + 1).padStart(2, "0")}</span>
                <strong>${escapeHtml(item.point || "")}</strong>
                <p>${escapeHtml(item.text || "")}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderVisualRoutes(items, record) {
  if (!items.length) return "";
  return `
    <section class="visual-section" aria-label="视觉路线对照">
      <div class="section-title visual-section-title">
        <div>
          <p class="eyebrow">Visual Routes</p>
          <h2>${escapeHtml(record.visual_heading || `${(record.subjects || []).join(" / ")} 体验路线`)}</h2>
        </div>
        <p>先看整体感受，再进入 MDA 论证。</p>
      </div>
      <div class="visual-routes">
        ${items
          .map(
            (item) => `
              <article class="visual-card">
                <img src="${escapeAttribute(item.image || "")}" alt="${escapeAttribute(item.alt || item.title || "视觉路线图")}" loading="eager" />
                <div class="visual-copy">
                  <span>${escapeHtml(item.title || "")}</span>
                  <strong>${escapeHtml(item.takeaway || "")}</strong>
                  <p>${escapeHtml(item.caption || "")}</p>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderQuantification(quantification, record) {
  const dimensions = quantification?.dimensions || [];
  if (!dimensions.length) return "";
  return `
    <section class="quant-panel" aria-label="MDA 量化速读">
      <div class="section-title">
        <div>
          <p class="eyebrow">Quantified Read</p>
          <h2>量化速读：系统倾向强度</h2>
        </div>
        <span>${dimensions.length}</span>
      </div>
      <div class="quant-note">
        <strong>口径</strong>
        <p>${escapeHtml(quantification.scale || "1-5 表示相对强度。")}</p>
        <p>${escapeHtml(quantification.method || "基于 MDA 拆解进行策划判断。")}</p>
      </div>
      <div class="quant-grid">
        ${dimensions.map((item) => renderQuantDimension(item, record)).join("")}
      </div>
    </section>
  `;
}

function renderQuantDimension(item, record) {
  const scores = getScoreEntries(item, record);
  const values = scores.map((entry) => entry.score);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const leaders = scores.filter((entry) => entry.score === max).map((entry) => entry.label);
  const leader = max === min ? "接近持平" : `${leaders.join(" / ")}更强`;
  return `
    <article class="quant-card">
      <div class="quant-card-head">
        <strong>${escapeHtml(item.dimension || "")}</strong>
        <span class="delta even">${escapeHtml(leader)}${max === min ? "" : ` ${max - min}`}</span>
      </div>
      <p class="quant-link">${escapeHtml(item.mda_link || "")}</p>
      ${scores.map((entry, index) => renderScoreBar(entry.label, entry.score, index)).join("")}
      <p class="quant-reading">${escapeHtml(item.reading || "")}</p>
    </article>
  `;
}

function getScoreEntries(item, record) {
  if (Array.isArray(item.scores) && item.scores.length) {
    return item.scores.map((entry) => ({ label: entry.label, score: clampScore(entry.score) }));
  }
  return [
    { label: record.subjects?.[0] || "ARC Raiders", score: clampScore(item.arc) },
    { label: record.subjects?.[1] || "逃离塔科夫", score: clampScore(item.tarkov) },
  ];
}

function renderScoreBar(label, score, index) {
  const percent = (score / 5) * 100;
  return `
    <div class="score-row score-${index % 4}">
      <span>${escapeHtml(label)}</span>
      <div class="score-track"><i style="width: ${percent}%"></i></div>
      <strong>${score}/5</strong>
    </div>
  `;
}

function renderArgumentMap(record) {
  const chains = record.chains || [];
  const configuredRoutes = record.argument_map?.routes || [];
  const arcChain = findChain(chains, ["可进入", "冒险", "工具"], 0);
  const tarkovChain = findChain(chains, ["硬核", "军事", "信息"], 1);
  const sharedSystems = (record.comparison_systems || []).map((item) => item.system).filter(Boolean);
  const gapSystems = (record.system_gaps || []).map((item) => item.system).filter(Boolean);

  return `
    <section class="argument-map" aria-label="MDA 论证脑图">
      <div class="section-title">
        <div>
          <p class="eyebrow">Argument Map</p>
          <h2>论证脑图：同类系统，不同 MDA 链条</h2>
        </div>
      </div>

      <div class="map-body">
        <div class="map-core">
          <span>核心命题</span>
          <strong>${escapeHtml(record.argument_map?.core || "两款游戏共享同类玩法骨架，但服务的美学目标不同，机制取舍也随之分叉。")}</strong>
        </div>

        <div class="map-branches">
          ${configuredRoutes.length
            ? configuredRoutes.map((route, index) => renderMapRoute(route.title, route.thesis, chains[route.chain_index ?? index], index === 0 ? "arc" : "tarkov")).join("")
            : `${renderMapRoute("ARC Raiders 路线", "先让玩家进入冒险，再用风险制造张力", arcChain, "arc")}${renderMapRoute("逃离塔科夫路线", "先让玩家感到生存压力，再用不透明和损失放大谨慎", tarkovChain, "tarkov")}`}
        </div>

        <div class="map-lanes">
          ${renderMapChipGroup("共同系统", "两边都有，但 MDA 权重不同", sharedSystems, "shared")}
          ${renderMapChipGroup("覆盖差异", "一方更强调，另一方弱化或没有", gapSystems, "gap")}
        </div>
      </div>
    </section>
  `;
}

function renderMapRoute(title, thesis, chain, variant) {
  return `
    <article class="map-route ${variant}">
      <div class="map-route-head">
        <span>${escapeHtml(title)}</span>
        <strong>${escapeHtml(thesis)}</strong>
      </div>
      <div class="map-node-list">
        <div><span>A 美学</span><p>${escapeHtml(chain?.aesthetic || "待补充美学目标")}</p></div>
        <div><span>D 动态</span><p>${escapeHtml(chain?.dynamic || "待补充玩家动态")}</p></div>
        <div><span>M 机制</span><p>${escapeHtml(chain?.mechanic || "待补充实现机制")}</p></div>
      </div>
    </article>
  `;
}

function renderMapChipGroup(title, note, items, variant) {
  if (!items.length) return "";
  return `
    <div class="map-chip-group ${variant}">
      <div>
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(note)}</span>
      </div>
      <div class="map-chip-cloud">
        ${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    </div>
  `;
}

function findChain(chains, keywords, fallbackIndex) {
  return (
    chains.find((chain) => {
      const text = [chain.aesthetic, chain.dynamic, chain.mechanic, chain.evidence].filter(Boolean).join(" ");
      return keywords.some((keyword) => text.includes(keyword));
    }) || chains[fallbackIndex] || chains[0] || null
  );
}

function renderComparisonSystems(items, record) {
  if (!items.length) return "";
  return `
    <div class="record-block wide">
      <div class="section-title">
        <div>
          <p class="eyebrow">Shared Systems With MDA</p>
          <h2>共同系统：逐项展开看差异</h2>
        </div>
        <span>${items.length}</span>
      </div>
      <div class="comparison-cards">
        ${items.map((item) => renderComparisonRow(item, record)).join("")}
      </div>
    </div>
  `;
}

function renderComparisonRow(item, record) {
  const games = getGameEntries(item, record);
  return `
    <details class="comparison-card">
      <summary>
        <span>${escapeHtml(item.system || "")}</span>
        <strong>${escapeHtml(item.impact || "")}</strong>
      </summary>
      <div class="comparison-detail">
        <div class="system-name">
          <strong>共同点</strong>
          <span>${escapeHtml(item.shared || "")}</span>
        </div>
        ${renderMdaCell(item.mda || {})}
        <div class="game-compare">
          ${games.map((game) => `
            <div>
              <span>${escapeHtml(game.label)}</span>
              <p>${escapeHtml(game.text || "")}</p>
              ${game.example ? `<aside class="game-example"><strong>设计例子</strong><p>${escapeHtml(game.example)}</p></aside>` : ""}
            </div>
          `).join("")}
      </div>
    </details>
  `;
}

function renderMdaCell(mda) {
  return `
    <div class="mda-cell">
      <div><span>A 美学</span><p>${escapeHtml(mda.aesthetic || "")}</p></div>
      <div><span>D 动态</span><p>${escapeHtml(mda.dynamic || "")}</p></div>
      <div><span>M 机制</span><p>${escapeHtml(mda.mechanic || "")}</p></div>
    </div>
  `;
}

function getGameEntries(item, record) {
  if (Array.isArray(item.games) && item.games.length) {
    return item.games.map((game) => ({ ...game, example: game.example || item.examples?.[game.label] || "" }));
  }
  return [
    { label: record.subjects?.[0] || "ARC Raiders", text: item.arc || "", example: item.examples?.[record.subjects?.[0] || "ARC Raiders"] || "" },
    { label: record.subjects?.[1] || "逃离塔科夫", text: item.tarkov || "", example: item.examples?.[record.subjects?.[1] || "逃离塔科夫"] || "" },
  ];
}

function renderSystemGaps(items, record) {
  if (!items.length) return "";
  return `
    <div class="record-block wide">
      <div class="section-title">
        <div>
          <p class="eyebrow">System Coverage</p>
          <h2>一方更强调、另一方弱化或没有的系统</h2>
        </div>
        <span>${items.length}</span>
      </div>
      <div class="gap-grid">
        ${items
          .map(
            (item) => `
              <article class="gap-card">
                <strong>${escapeHtml(item.system || "")}</strong>
                ${getGameEntries(item, record).map((game) => `<div><span>${escapeHtml(game.label)}</span><p>${escapeHtml(game.text || "")}</p></div>`).join("")}
              </article>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderMdaChains(chains) {
  if (!chains.length) return "";
  return `
    <div class="record-block wide">
      <div class="section-title">
        <div>
          <p class="eyebrow">MDA Chain</p>
          <h2>完整 MDA 链条解释</h2>
        </div>
        <span>${chains.length}</span>
      </div>
      <div class="chain-grid">${chains.map(renderChain).join("")}</div>
    </div>
  `;
}

function renderChain(chain) {
  const confidence = String(chain.confidence || "Medium").toLowerCase();
  return `
    <article class="chain-card">
      <div class="chain-stage aesthetic">
        <span>美学目标</span>
        <strong>${escapeHtml(chain.aesthetic || "")}</strong>
      </div>
      <div class="chain-stage dynamic">
        <span>玩家动态</span>
        <p>${escapeHtml(chain.dynamic || "")}</p>
      </div>
      <div class="chain-stage mechanic">
        <span>实现机制</span>
        <p>${escapeHtml(chain.mechanic || "")}</p>
      </div>
      <div class="chain-footer">
        <span class="confidence ${confidence}">${translateConfidence(chain.confidence || "Medium")}</span>
        <small>${escapeHtml(chain.evidence || "")}</small>
      </div>
    </article>
  `;
}

function renderJudgments(items) {
  if (!items.length) return "";
  return `
    <div class="record-block">
      <div class="section-title"><div><p class="eyebrow">Design Read</p><h2>关键判断</h2></div></div>
      <div class="stack-list">${items.map((item) => renderCard(item.issue, item.why, item.impact && `玩家影响：${item.impact}`)).join("")}</div>
    </div>
  `;
}

function renderRecommendations(items) {
  if (!items.length) return "";
  return `
    <div class="record-block">
      <div class="section-title"><div><p class="eyebrow">Next Move</p><h2>设计建议</h2></div></div>
      <div class="stack-list">${items.map((item) => renderCard(item.goal, item.change, item.impact && `玩家影响：${item.impact}`, item.risk && `风险：${item.risk}`)).join("")}</div>
    </div>
  `;
}

function renderSources(items) {
  if (!items.length) return "";
  return `
    <div class="record-block wide compact">
      <div class="section-title"><div><p class="eyebrow">Evidence</p><h2>资料来源</h2></div></div>
      <div class="source-list">${items.map(renderSource).join("")}</div>
    </div>
  `;
}

function renderCard(title, ...lines) {
  return `
    <article class="stack-card">
      <strong>${escapeHtml(title || "")}</strong>
      <p>${lines.filter(Boolean).map(escapeHtml).join("<br />")}</p>
    </article>
  `;
}

function renderSource(source) {
  const label = source.label || source.url || "资料来源";
  return `<a href="${escapeAttribute(source.url || "#")}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
}

function collectGenres() {
  const counts = new Map([["全部类型", state.records.length]]);
  for (const record of state.records) {
    for (const genre of getGenres(record)) {
      counts.set(genre, (counts.get(genre) || 0) + 1);
    }
  }
  return ["全部类型", ...Array.from(counts.keys()).filter((genre) => genre !== "全部类型").sort((a, b) => a.localeCompare(b, "zh-CN"))].map((genre) => ({
    name: genre,
    count: counts.get(genre) || 0,
  }));
}

function getGenres(record) {
  const explicit = record.genre_tags || record.genres || [];
  if (explicit.length) return explicit;

  const text = collectSearchText(record, []).toLowerCase();
  const genres = [];
  if (text.includes("extraction") || text.includes("撤离") || text.includes("pvpve")) genres.push("撤离射击");
  if (text.includes("tarkov") || text.includes("战术") || text.includes("弹药") || text.includes("military")) genres.push("战术射击");
  if (text.includes("adventure") || text.includes("探索") || text.includes("机器")) genres.push("动作冒险");
  if (text.includes("skill tree") || text.includes("workshop") || text.includes("成长")) genres.push("RPG 成长");
  if (text.includes("market") || text.includes("economy") || text.includes("交易") || text.includes("经济")) genres.push("系统经济");
  return genres.length ? [...new Set(genres)] : ["未分类"];
}

function collectSearchText(record, genres) {
  return [
    record.title,
    record.summary,
    ...(record.subjects || []),
    ...genres,
    ...(record.reading_guide || []).flatMap((item) => [item.point, item.text]),
    ...(record.visual_routes || []).flatMap((item) => [item.title, item.caption, item.takeaway]),
    ...(record.comparison_systems || []).flatMap((item) => [
      item.system,
      item.shared,
      item.mda?.aesthetic,
      item.mda?.dynamic,
      item.mda?.mechanic,
      item.arc,
      item.tarkov,
      ...(item.games || []).flatMap((game) => [game.label, game.text]),
      ...Object.values(item.examples || {}),
      item.impact,
    ]),
    ...(record.system_gaps || []).flatMap((item) => [item.system, item.arc, item.tarkov, ...(item.games || []).flatMap((game) => [game.label, game.text])]),
    record.quantification?.scale,
    record.quantification?.method,
    ...(record.quantification?.dimensions || []).flatMap((item) => [item.dimension, item.mda_link, item.reading, ...(item.scores || []).flatMap((score) => [score.label, score.score])]),
    ...(record.chains || []).flatMap((chain) => [chain.aesthetic, chain.dynamic, chain.mechanic, chain.evidence]),
    ...(record.judgments || []).flatMap((item) => [item.issue, item.why, item.impact]),
    ...(record.recommendations || []).flatMap((item) => [item.goal, item.change, item.impact, item.risk]),
  ]
    .filter(Boolean)
    .join(" ");
}

function translateConfidence(value) {
  const normalized = String(value).toLowerCase();
  if (normalized === "high") return "高可信";
  if (normalized === "low") return "低可信";
  return "中可信";
}

function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.min(Math.max(score, 0), 5);
}

function formatDate(value) {
  if (!value) return "未知时间";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

loadRecords().catch((error) => {
  const target = document.querySelector("#recordCards") || document.querySelector("#detailRoot");
  if (target) target.innerHTML = `<article class="empty-state"><h2>数据读取失败</h2><p>${escapeHtml(error.message)}</p></article>`;
});
