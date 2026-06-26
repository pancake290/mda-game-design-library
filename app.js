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
  "刷宝 ARPG": "战斗、掉落与长期构筑",
  "动作角色扮演": "即时战斗、属性与装备成长",
  "装备构筑": "词缀、技能与组合协同",
  "赛季成长": "周期目标、重置与终局追求",
  "动作 Roguelite": "单局随机、死亡回返与熟练成长",
  "随机地牢": "程序关卡、路线与临场适应",
  "重复挑战": "重开、学习与难度升级",
  "合作 PvE": "任务分工、资源互助与撤离",
  "任务射击": "目标推进、配装与敌潮压力",
  "四人合作": "小队职责、恢复与共同风险",
  "团队协作": "分工、沟通与共同目标",
  "类魂": "高惩罚推进、模式学习与回收",
  "Boss 战": "招式识别、攻防窗口与阶段变化",
  "关卡探索": "地标、捷径、风险与发现",
  "RTS": "实时经济、生产与军队控制",
  "即时战略": "侦察、反制与多线决策",
  "基地经营": "采集、扩张、科技与生产",
  "竞技对抗": "信息、执行与胜负证明",
  "工厂自动化": "物流、产能、瓶颈与规模化",
  "系统优化": "吞吐、约束、反馈与长期效率",
  "建造沙盒": "规则组合、基地表达与自发目标",
  "卡牌 Roguelike": "随机奖励、删改牌组与单局构筑",
  "构筑研究": "组件协同、路线选择与失败复盘",
  "随机策略": "不完全信息、概率与风险收益",
  "开放世界": "地形、远景、自由路线与自发探索",
  "系统解谜": "通用规则、物理反馈与多解法",
  "探索": "未知、地标、路线与发现奖励",
  "潜行": "观察、伪装、警觉与低冲突解法",
  "沉浸模拟": "规则交叉、系统响应与玩家即兴",
  "关卡解谜": "路线、机关、身份与目标处理",
  "竞速": "速度、线路、车辆与驾驶反馈",
  "驾驶模拟": "物理、调校、赛道纪律与车辆理解",
  "汽车收藏": "车库、文化、稀有度与长期目标",
  "JRPG": "队伍、叙事、成长与长期推进",
  "回合制战斗": "弱点、行动经济与队伍构筑",
  "社交成长": "羁绊、日程、角色能力与关系投资",
  "叙事冒险": "角色弧光、旅程压力与情感选择",
  "共斗狩猎": "怪物学习、素材循环与多人职责",
  "4X策略": "探索、扩张、开发、征服与胜利路线",
  "大战略": "长期政治、战争、外交与制度后果",
  "政治模拟": "权力、继承、派系与制度选择",
  "回合策略": "行动顺序、资源规划与长期节奏",
  "社交推理": "隐藏身份、发言、投票与信任崩塌",
  "派对游戏": "低门槛互动、混乱事件与群体笑点",
  "多人合作": "共同目标、信息共享与责任分摊",
  "身份博弈": "阵营、伪装、误导与反制",
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
    featured: document.querySelector("#featuredAnalysis"),
  };

  nodes.search.addEventListener("input", () => {
    clearCloudFilter(nodes, false);
    state.page = 1;
    applyFilter(nodes);
  });
  nodes.clearCloudFilter.addEventListener("click", () => clearCloudFilter(nodes));
  nodes.refresh.addEventListener("click", loadRecords);
  renderFeaturedAnalysis(nodes.featured);
  renderAestheticCloud(nodes);
  applyFilter(nodes);
}

function renderFeaturedAnalysis(target) {
  if (!target || !state.records.length) return;
  const record = state.records.find((item) => item.cover_image) || state.records[0];
  const firstChain = record.chains?.[0] || {};
  const systems = (record.comparison_systems || []).slice(0, 4).map((item) => item.system).filter(Boolean);
  target.innerHTML = `
    <div class="featured-copy">
      <p class="eyebrow">Featured Analysis</p>
      <h2>${escapeHtml(record.title || "精选分析")}</h2>
      <p>${escapeHtml(compactText(record.summary || "", 150))}</p>
      <div class="featured-actions">
        <a class="primary-link" href="./detail.html?id=${encodeURIComponent(record.id)}">阅读核心分析</a>
        <a class="secondary-link" href="#analysisIndex">浏览全部</a>
      </div>
    </div>
    <div class="featured-map">
      ${renderMiniMdaRoute(firstChain)}
      <div class="featured-meta">
        <span>${(record.chains || []).length} 条 MDA 链</span>
        <span>${(record.comparison_systems || []).length} 个共同系统</span>
        <span>${(record.judgments || []).length} 个判断</span>
      </div>
      <div class="system-chip-row">
        ${systems.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    </div>
  `;
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
  const firstChain = record.chains?.[0] || {};
  const topSystems = systems.slice(0, 3).map((item) => item.system).filter(Boolean);
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
        <p>${escapeHtml(compactText(record.summary || "暂无摘要。", 132))}</p>
        <div class="card-route">
          <span>A</span><strong>${escapeHtml(compactText(firstChain.aesthetic || "体验目标待读", 18))}</strong>
          <span>D</span><strong>${escapeHtml(compactText(firstChain.dynamic || "玩家动态待读", 18))}</strong>
          <span>M</span><strong>${escapeHtml(compactText(firstChain.mechanic || "机制条件待读", 18))}</strong>
        </div>
        <div class="system-chip-row small">
          ${topSystems.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
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
      ${renderDetailDashboard(record)}
      ${renderDetailNav()}

      <section class="summary-band">
        <span>MDA 对比结论</span>
        <p>${escapeHtml(record.summary || "暂无摘要。")}</p>
      </section>

      ${renderReadingGuide(record.reading_guide || [])}
      ${renderArgumentMap(record)}
      ${renderQuantification(record.quantification, record)}
      ${renderSystemMatrix(record.comparison_systems || [])}

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

function renderDetailDashboard(record) {
  const chains = record.chains || [];
  const systems = record.comparison_systems || [];
  const judgments = record.judgments || [];
  return `
    <section class="detail-dashboard" aria-label="阅读仪表盘">
      <div class="dashboard-summary">
        <p class="eyebrow">Reader Dashboard</p>
        <h2>先用 30 秒抓住这篇的设计问题</h2>
        <p>${escapeHtml(compactText(record.summary || "", 190))}</p>
      </div>
      <div class="dashboard-metrics">
        <div><span>${chains.length}</span><small>MDA 链</small></div>
        <div><span>${systems.length}</span><small>共同系统</small></div>
        <div><span>${judgments.length}</span><small>关键判断</small></div>
      </div>
      <div class="dashboard-route">
        ${renderMiniMdaRoute(chains[0] || {})}
      </div>
    </section>
  `;
}

function renderDetailNav() {
  return `
    <nav class="detail-nav" aria-label="详情页快速导航">
      <a href="#read-first">阅读导引</a>
      <a href="#argument-map">论证脑图</a>
      <a href="#quantified-read">量化速读</a>
      <a href="#system-matrix">系统矩阵</a>
      <a href="#comparison-systems">共同系统</a>
      <a href="#mda-chains">MDA 链</a>
      <a href="#design-read">判断</a>
      <a href="#next-move">建议</a>
    </nav>
  `;
}

function renderMiniMdaRoute(chain) {
  return `
    <div class="mini-mda-route">
      <div><span>A</span><strong>${escapeHtml(compactText(chain.aesthetic || "体验承诺", 34))}</strong></div>
      <div><span>D</span><strong>${escapeHtml(compactText(chain.dynamic || "玩家动态", 42))}</strong></div>
      <div><span>M</span><strong>${escapeHtml(compactText(chain.mechanic || "机制选择", 46))}</strong></div>
    </div>
  `;
}

function renderReadingGuide(items) {
  if (!items.length) return "";
  return `
    <section class="reading-guide" id="read-first" aria-label="阅读导引">
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
    <section class="quant-panel" id="quantified-read" aria-label="MDA 量化速读">
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
    <section class="argument-map" id="argument-map" aria-label="MDA 论证脑图">
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

function renderSystemMatrix(items) {
  if (!items.length) return "";
  return `
    <section class="system-matrix-section" id="system-matrix" aria-label="系统矩阵速览">
      <div class="section-title">
        <div>
          <p class="eyebrow">System Matrix</p>
          <h2>系统矩阵：先看差异落在哪</h2>
        </div>
        <span>${items.length}</span>
      </div>
      <div class="matrix-table-wrap">
        <table class="overview-table">
          <thead>
            <tr>
              <th scope="col">系统</th>
              <th scope="col">美学目标</th>
              <th scope="col">玩家动态</th>
              <th scope="col">机制条件</th>
              <th scope="col">设计影响</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item) => `
              <tr>
                <th scope="row">${escapeHtml(item.system || "")}</th>
                <td>${escapeHtml(compactText(item.mda?.aesthetic || "", 34))}</td>
                <td>${escapeHtml(compactText(item.mda?.dynamic || "", 54))}</td>
                <td>${escapeHtml(compactText(item.mda?.mechanic || "", 54))}</td>
                <td>${escapeHtml(compactText(item.impact || "", 54))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
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
    <div class="record-block wide" id="comparison-systems">
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
    <details class="comparison-card" open>
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
    <div class="record-block wide" id="mda-chains">
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
    <div class="record-block" id="design-read">
      <div class="section-title"><div><p class="eyebrow">Design Read</p><h2>关键判断</h2></div></div>
      <div class="stack-list">${items.map((item) => renderCard(item.issue, item.why, item.impact && `玩家影响：${item.impact}`)).join("")}</div>
    </div>
  `;
}

function renderRecommendations(items) {
  if (!items.length) return "";
  return `
    <div class="record-block" id="next-move">
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

function compactText(value, max = 90) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(max - 1, 0))}…`;
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
