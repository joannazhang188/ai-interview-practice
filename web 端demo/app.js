(function loadApi(){
  var s=document.createElement('script');
  s.src='api.js';
  s.onload=function(){console.log('API loaded')};
  document.head.appendChild(s);
})();
var _apiFallback={getResumes:async function(){return[]},getPortfolios:async function(){return[]},getMatchInstances:async function(){return[]},getInterviews:async function(){return[]},pollResult:async function(){return{status:'timeout'}}};
var api=window.api||_apiFallback;

const app = document.querySelector("#app");
const pageTitle = document.querySelector("#pageTitle");
const topTools = document.querySelector("#topTools");
const navButtons = [...document.querySelectorAll(".nav button")];

const pageMeta = {
  dashboard: ["工作台", "搜索职位、公司、JD 或功能..."],
  resumes: ["简历库", "搜索简历名称、公司、岗位或技能..."],
  portfolio: ["作品库", "搜索作品名称、类型、技能标签..."],
  match: ["匹配度分析", "搜索职位、公司、JD 或功能..."],
  result: ["匹配度分析结果", "搜索职位、公司、JD 或功能..."],
  records: ["分析记录", "搜索公司、JD、岗位..."],
  training: ["面试训练", "搜索职位、公司、JD 或功能..."],
  simulation: ["模拟面试", "搜索职位、公司、JD 或功能..."],
  history: ["面试历史", "搜索公司、岗位、模式或关键词..."],
  report: ["面试报告", "搜索职位、公司、JD 或功能..."],
  settings: ["个人设置", "搜索职位、公司、JD 或功能..."]
};

const companies = [
  ["bd","字节跳动","ByteDance","后端开发工程师","社招 · 北京","86","2024-05-18 10:30"],
  ["ali","阿里巴巴","Alibaba","产品经理","社招 · 杭州","78","2024-05-16 16:45"],
  ["hw","华为技术有限公司","Huawei","算法工程师","校招 · 深圳","72","2024-05-14 09:20"],
  ["tx","腾讯科技","Tencent","后端开发工程师","社招 · 上海","85","2024-05-12 14:10"],
  ["mt","美团","Meituan","数据分析师","社招 · 北京","80","2024-05-10 11:05"],
  ["mi","小米科技","Xiaomi","产品经理","社招 · 北京","82","2024-05-08 15:30"],
  ["jd","京东集团","JD.com","Java开发工程师","社招 · 北京","68","2024-05-06 10:00"],
  ["dd","滴滴出行","DiDi","后端开发工程师","社招 · 杭州","74","2024-05-04 09:15"]
];

function icon(id){ return `<svg><use href="#${id}"/></svg>`; }
function logo(cls, text){ return `<div class="logo ${cls}">${text || clsText(cls)}</div>`; }
function clsText(cls){ return ({bd:"▮",ali:"a",hw:"✦",mi:"mi",tx:"腾讯",mt:"美团",jd:"京东",dd:"D"})[cls] || "AI"; }
function ring(score, size=""){ return `<div class="score-ring ${size}" style="--p:${score}"><span>${score}${size==="lg"?"<small> 分</small>": size==="sm"?"/100":"分"}</span></div>`; }
function matchRing(score, suffix="%"){ return `<div class="score-ring sm match-ring" style="--p:${score}"><span><strong>${score}</strong><small>${suffix}</small><em>匹配度</em></span></div>`; }
function tagList(items, cls=""){ return items.map(t=>`<span class="tag ${cls}">${t}</span>`).join(""); }
function btn(text, cls="", page="", iconId="", action=""){ return `<button class="btn ${cls}" ${page ? `data-page="${page}"` : ""} ${action ? `data-action="${action}"` : ""}>${iconId ? icon(iconId) : ""}${text}</button>`; }
function topSearch(placeholder){ return `<div class="search"><svg><use href="#i-search"/></svg><input placeholder="${placeholder}"></div>`; }
function renderTopTools(page, placeholder){
  const search = topSearch(placeholder);
  if(page === "resumes") return `${search}<button class="top-btn" data-action="filter-resume">${icon("i-list")}筛选</button><button class="top-btn primary" data-action="upload-resume">${icon("i-upload")}上传简历</button>`;
  if(page === "portfolio") return `${search}<div class="dropdown-wrap"><button class="top-btn wide" data-action="toggle-dropdown" data-dropdown="type-filter">全部类型⌄</button><div class="dropdown-menu" id="dropdown-type-filter"><div class="dropdown-item active" data-value="all">全部类型</div><div class="dropdown-item" data-value="doc">文档</div><div class="dropdown-item" data-value="pic">设计</div><div class="dropdown-item" data-value="xls">表格</div><div class="dropdown-item" data-value="ppt">演示</div><div class="dropdown-item" data-value="ps">设计稿</div><div class="dropdown-item" data-value="pdf">PDF</div></div></div>`;
  if(page === "records") return topSearch("搜索公司、JD、岗位或关键词...");
  if(page === "history") return topSearch("搜索公司、岗位、模式或关键词...");
  return search;
}

function setPage(page){
  const meta = pageMeta[page] || pageMeta.dashboard;
  pageTitle.textContent = meta[0];
  topTools.innerHTML = renderTopTools(page, meta[1]);
  navButtons.forEach(b=>{
    const key = b.dataset.page;
    const active = key === page || (page === "result" && key === "match") || (page === "report" && key === "history");
    b.classList.toggle("active", active);
  });
  app.className = `page page-${page}`;
  app.innerHTML = (views[page] || views.dashboard)();
  bindClicks();
  window.scrollTo({top:0,left:0,behavior:"instant"});
}

function bindClicks(){
  app.querySelectorAll("[data-page]").forEach(el=>el.addEventListener("click",()=>setPage(el.dataset.page)));
  app.querySelectorAll("[data-select]").forEach(el=>el.addEventListener("click",()=>{
    app.querySelectorAll("[data-select]").forEach(x=>x.classList.remove("selected","active"));
    el.classList.add(el.classList.contains("chat-item") ? "active" : "selected");
  }));
  app.querySelectorAll("[data-action='toggle-dropdown']").forEach(btn=>{
    btn.addEventListener("click",(e)=>{
      e.stopPropagation();
      const id = "dropdown-" + btn.dataset.dropdown;
      const menu = document.getElementById(id);
      if(menu) menu.classList.toggle("open");
    });
  });
  app.querySelectorAll(".dropdown-item").forEach(item=>{
    item.addEventListener("click",()=>{
      const menu = item.closest(".dropdown-menu");
      menu.querySelectorAll(".dropdown-item").forEach(i=>i.classList.remove("active"));
      item.classList.add("active");
      const btn = menu.previousElementSibling;
      if(btn) btn.textContent = item.textContent + "⌄";
      menu.classList.remove("open");
    });
  });
  app.querySelectorAll("[data-action='upload-resume']").forEach(btn=>{
    btn.addEventListener("click",()=>showUploadModal("上传简历","支持 PDF / Word / 图片格式，单个文件 ≤ 20MB"));
  });
  app.querySelectorAll("[data-action='filter-resume']").forEach(btn=>{
    btn.addEventListener("click",()=>showFilterPanel());
  });
  app.querySelectorAll(".select-like").forEach(el=>{
    el.addEventListener("click",(e)=>{
      const option = e.target.closest(".select-option");
      if(option){
        e.stopPropagation();
        const dd = option.closest(".select-dropdown");
        dd.querySelectorAll(".select-option").forEach(o=>o.classList.remove("active"));
        option.classList.add("active");
        const val = option.dataset.val;
        const parent = dd.parentElement;
        const spanEl = parent.querySelector("span");
        const textNode = parent.childNodes[0];
        if(textNode && textNode.nodeType === 3) textNode.textContent = val + " ";
        dd.classList.remove("open");
        return;
      }
      e.stopPropagation();
      closeAllDropdowns();
      const menu = el.querySelector(".select-dropdown");
      if(menu) menu.classList.toggle("open");
    });
  });
  app.querySelectorAll(".drop").forEach(el=>{
    el.addEventListener("click",()=>{
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx,.png,.jpg";
      input.click();
    });
  });
  app.querySelectorAll("[data-action='reset-filters']").forEach(btn=>{
    btn.addEventListener("click",()=>{
      app.querySelectorAll(".select-like").forEach(s=>{
        const label = s.closest(".field")?.querySelector("label")?.textContent || "";
        s.innerHTML = `全部${label} <span>⌄</span>`;
      });
    });
  });
  app.querySelectorAll("[data-action='apply-filters']").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const toast = document.createElement("div");
      toast.className = "toast";
      toast.textContent = "筛选已应用";
      document.body.appendChild(toast);
      setTimeout(()=>toast.remove(), 2000);
    });
  });
  app.querySelectorAll(".btn svg use[href='#i-expand']").forEach(svg=>{
    const btnEl = svg.closest(".btn");
    if(btnEl){
      btnEl.addEventListener("click",()=>{
        const ta = btnEl.closest(".answer-box")?.querySelector("textarea");
        if(!ta) return;
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.innerHTML = `<div class="modal-box" style="width:800px;max-height:90vh;display:flex;flex-direction:column"><div class="modal-head"><h2>全屏编辑回答</h2><button class="modal-close" data-action="close-modal">${icon("i-x")}</button></div><div class="modal-body" style="flex:1;overflow:auto"><textarea class="txtarea" style="min-height:400px;height:60vh;resize:vertical;font-size:14px;line-height:1.8">${ta.value}</textarea></div><div class="modal-foot"><button class="btn" data-action="close-modal">取消</button> <button class="btn primary" data-action="confirm-expand">确认</button></div></div>`;
        document.body.appendChild(overlay);
        const fullTa = overlay.querySelector("textarea");
        fullTa.focus();
        overlay.querySelectorAll("[data-action='close-modal']").forEach(b=>b.addEventListener("click",()=>overlay.remove()));
        overlay.querySelector("[data-action='confirm-expand']").addEventListener("click",()=>{
          ta.value = fullTa.value;
          overlay.remove();
        });
        overlay.addEventListener("click",(e)=>{ if(e.target===overlay) overlay.remove(); });
      });
    }
  });
  app.querySelectorAll("[data-action='start-analyze']").forEach(btn=>{
    btn.addEventListener("click",async ()=>{
      const textarea = app.querySelector(".match-panel textarea");
      const jobText = textarea ? textarea.value : "";
      btn.disabled = true;
      btn.textContent = "AI 分析中...";
      try {
        const result = await api.analyzeMatch({
          company_name: "腾讯科技（深圳）有限公司",
          job_title: "高级产品经理",
          job_text: jobText,
          resume_id: 1,
          portfolio_ids: [1]
        });
        btn.textContent = "正在生成分析结果...";
        const pollRes = await api.pollResult(result.request_id, {interval: 3000});
        if(pollRes.status === 'done' && pollRes.result) {
          sessionStorage.setItem('currentMatchResult', JSON.stringify({
            instanceId: result.instance_id,
            ...pollRes.result
          }));
          setPage('result');
        } else {
          btn.textContent = "开始分析";
          btn.disabled = false;
          alert("分析超时，请稍后重试。如果你是第一次使用，可能需要我（AI）介入处理分析请求。");
        }
      } catch(e) {
        btn.textContent = "开始分析";
        btn.disabled = false;
        alert("分析失败：" + e.message);
      }
    });
  });
  app.querySelectorAll("[data-action='submit-answer']").forEach(btn=>{
    btn.addEventListener("click",async ()=>{
      const textarea = app.querySelector(".answer-box textarea");
      const answer = textarea ? textarea.value.trim() : "";
      if(!answer) { alert("请先输入你的回答"); return; }
      btn.disabled = true;
      btn.textContent = "AI 评分中...";
      try {
        const interviewId = parseInt(sessionStorage.getItem('currentInterviewId') || '1');
        const qIndex = parseInt(app.querySelector(".interview-head b")?.textContent || '1');
        const result = await api.submitAnswer(interviewId, answer, qIndex - 1);
        const pollRes = await api.pollResult(result.request_id, {interval: 3000});
        if(pollRes.status === 'done' && pollRes.result) {
          const data = pollRes.result;
          if(data.score !== undefined) {
            const evalDiv = app.querySelector(".eval");
            if(evalDiv) {
              evalDiv.innerHTML = `<h3>本题评估结果 <span class="muted">（AI 即时反馈）</span></h3><div class="grid" style="grid-template-columns:180px 1fr"><div><span class="muted">单题得分</span><div class="score-big eval-score">${data.score} <small>/100</small> <span class="pill">${data.score>=80?'优秀':data.score>=60?'良好':'一般'}</span></div><p class="muted">超过了 ${data.score}% 的同岗位候选人</p></div><div class="info-box"><b>本题考察维度</b><br>${tagList(data.dimensions||['逻辑思维','沟通能力'],'green')}</div></div>${(data.feedback||[]).map(f=>`<div class="eval-row"><b>${f.type||'建议'}</b><span class="muted">${f.content||''}</span></div>`).join('')}`;
              evalDiv.style.display = "block";
            }
          }
          if(data.next_question) {
            const qDiv = app.querySelector(".question");
            const ta = app.querySelector(".answer-box textarea");
            if(qDiv) qDiv.innerHTML = `<p class="muted">AI 面试官提问</p><b>${data.next_question}</b><p class="muted">考察维度： 逻辑思维、抗压能力</p>`;
            if(ta) ta.value = "";
            const idxEl = app.querySelector(".interview-head b");
            if(idxEl) idxEl.textContent = qIndex + 1;
          }
        } else {
          alert("评分超时，请稍后重试");
        }
        btn.disabled = false;
        btn.textContent = "提交回答";
      } catch(e) {
        btn.disabled = false;
        btn.textContent = "提交回答";
        alert("提交失败：" + e.message);
      }
    });
  });
  app.querySelectorAll("[data-action='end-interview']").forEach(btn=>{
    btn.addEventListener("click",async ()=>{
      const interviewId = parseInt(sessionStorage.getItem('currentInterviewId') || '0');
      if(interviewId > 0) {
        await api.finishInterview(interviewId);
        setPage('report');
      } else {
        setPage('report');
      }
    });
  });
  app.querySelectorAll("[data-action='start-training']").forEach(btn=>{
    btn.addEventListener("click",async ()=>{
      try {
        const matchData = JSON.parse(sessionStorage.getItem('currentMatchResult') || '{}');
        const matchInstanceId = matchData.instanceId || null;
        const result = await api.startInterview({
          match_instance_id: matchInstanceId,
          mode: 'train',
          company_name: matchData.company_name || '腾讯科技',
          job_title: matchData.job_title || '高级产品经理',
          resume_text: matchData.resume_text || '',
          jd_text: matchData.jd_text || ''
        });
        sessionStorage.setItem('currentInterviewId', result.interview_id);
        sessionStorage.setItem('currentInterviewMode', 'train');
        sessionStorage.setItem('currentInterviewRequestId', result.request_id);
        const pollRes = await api.pollResult(result.request_id, {interval: 3000});
        if(pollRes.status === 'done' && pollRes.result) {
          sessionStorage.setItem('currentQuestion', pollRes.result.question || '请介绍一下你自己');
        } else {
          sessionStorage.setItem('currentQuestion', '请介绍一下你自己');
        }
        setPage('training');
      } catch(e) {
        alert("启动面试失败：" + e.message);
      }
    });
  });
  app.querySelectorAll("[data-action='start-simulation']").forEach(btn=>{
    btn.addEventListener("click",async ()=>{
      try {
        const matchData = JSON.parse(sessionStorage.getItem('currentMatchResult') || '{}');
        const matchInstanceId = matchData.instanceId || null;
        const result = await api.startInterview({
          match_instance_id: matchInstanceId,
          mode: 'sim',
          company_name: matchData.company_name || '腾讯科技',
          job_title: matchData.job_title || '高级产品经理',
          resume_text: matchData.resume_text || '',
          jd_text: matchData.jd_text || ''
        });
        sessionStorage.setItem('currentInterviewId', result.interview_id);
        sessionStorage.setItem('currentInterviewMode', 'sim');
        sessionStorage.setItem('currentInterviewRequestId', result.request_id);
        const pollRes = await api.pollResult(result.request_id, {interval: 3000});
        if(pollRes.status === 'done' && pollRes.result) {
          sessionStorage.setItem('currentQuestion', pollRes.result.question || '请介绍一下你自己');
        } else {
          sessionStorage.setItem('currentQuestion', '请介绍一下你自己');
        }
        setPage('simulation');
      } catch(e) {
        alert("启动面试失败：" + e.message);
      }
    });
  });
}

function closeAllDropdowns(){
  document.querySelectorAll(".dropdown-menu.open").forEach(m=>m.classList.remove("open"));
  document.querySelectorAll(".select-dropdown.open").forEach(m=>m.classList.remove("open"));
}

function showUploadModal(title, hint){
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal-box"><div class="modal-head"><h2>${title}</h2><button class="modal-close" data-action="close-modal">${icon("i-x")}</button></div><div class="modal-body"><div class="drop" id="upload-drop" style="min-height:140px;margin:0">${icon("i-upload")}<b>点击或拖拽文件到此处上传</b><small>${hint}</small></div><div id="upload-status" style="margin-top:10px"></div></div><div class="modal-foot"><button class="btn" data-action="close-modal">取消</button></div></div>`;
  document.body.appendChild(overlay);
  overlay.querySelectorAll("[data-action='close-modal']").forEach(b=>b.addEventListener("click",()=>overlay.remove()));
  overlay.addEventListener("click",(e)=>{ if(e.target===overlay) overlay.remove(); });
  overlay.querySelector(".drop").addEventListener("click",()=>{
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.png,.jpg";
    input.onchange = async () => {
      const file = input.files[0];
      if(!file) return;
      const drop = overlay.querySelector(".drop");
      drop.innerHTML = `<b>正在上传：${file.name}</b>`;
      const status = overlay.querySelector("#upload-status");
      try {
        const isResume = title.includes("简历");
        const result = isResume
          ? await api.uploadResume(file)
          : await api.uploadPortfolio(file);
        drop.innerHTML = `<b class="green">✓ 上传成功</b><br><small>${file.name}</small>`;
        status.innerHTML = `<span class="green">解析完成，已添加到${isResume ? '简历库' : '作品库'}</span>`;
        if(isResume){
          const resumes = await api.getResumes();
          window.__resumeData = resumes.map(r=>[r.filename, r.version||'v1.0', ...(r.parsed_data?.skills||['待解析']).slice(0,4), '', r.uploaded_at, '']);
          setPage('resumes');
        }
        setTimeout(()=>overlay.remove(), 1500);
      } catch(e) {
        drop.innerHTML = `<b class="red">✗ 上传失败：${e.message}</b>`;
      }
    };
    input.click();
  });
}

function showFilterPanel(){
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal-box"><div class="modal-head"><h2>筛选简历</h2><button class="modal-close" data-action="close-modal">${icon("i-x")}</button></div><div class="modal-body"><div class="field" style="margin-bottom:14px"><label>解析状态</label><div class="select-like" style="cursor:pointer">全部状态 <span>⌄</span></div></div><div class="field" style="margin-bottom:14px"><label>上传时间</label><div class="select-like" style="cursor:pointer">全部时间 <span>⌄</span></div></div><div class="field" style="margin-bottom:14px"><label>技能标签</label><div class="input-like">${icon("i-search")} 搜索技能标签</div></div></div><div class="modal-foot"><button class="btn" data-action="close-modal">重置</button> <button class="btn primary" data-action="close-modal">应用筛选</button></div></div>`;
  document.body.appendChild(overlay);
  overlay.querySelectorAll("[data-action='close-modal']").forEach(b=>b.addEventListener("click",()=>overlay.remove()));
  overlay.addEventListener("click",(e)=>{ if(e.target===overlay) overlay.remove(); });
}

document.addEventListener("click",()=>closeAllDropdowns());

navButtons.forEach(btn=>btn.addEventListener("click",()=>setPage(btn.dataset.page)));
topTools.addEventListener("click", event=>{
  const dropdownItem = event.target.closest(".dropdown-item");
  if(dropdownItem){
    event.stopPropagation();
    const menu = dropdownItem.closest(".dropdown-menu");
    menu.querySelectorAll(".dropdown-item").forEach(i=>i.classList.remove("active"));
    dropdownItem.classList.add("active");
    const btn = menu.previousElementSibling;
    if(btn) btn.textContent = dropdownItem.textContent + "⌄";
    menu.classList.remove("open");
    return;
  }
  const actionTarget = event.target.closest("[data-action]");
  if(actionTarget){
    event.stopPropagation();
    const action = actionTarget.dataset.action;
    if(action === "toggle-dropdown"){
      const id = "dropdown-" + actionTarget.dataset.dropdown;
      const menu = document.getElementById(id);
      if(menu){
        closeAllDropdowns();
        menu.classList.toggle("open");
      }
    } else if(action === "upload-resume"){
      showUploadModal("上传简历","支持 PDF / Word / 图片格式，单个文件 ≤ 20MB");
    } else if(action === "filter-resume"){
      showFilterPanel();
    }
    return;
  }
  const target = event.target.closest("[data-page]");
  if(target) setPage(target.dataset.page);
});

const views = {
  dashboard(){
    return `
      <section class="hero card">
        <div class="hello">
          <h2>👋 你好，<span>张同学</span></h2>
          <p>欢迎使用 AI 面试陪练，智能分析匹配度，针对性训练，助你拿下心仪 Offer!</p>
          <div class="hero-note"><span>🛡 智能分析</span><b>·</b><span>个性化训练</span><b>·</b><span>提升面试成功率</span></div>
        </div>
        ${actionCard("i-file","开始匹配度分析","上传简历与 JD，精准评估匹配度","match")}
        ${actionCard("i-target","进入面试训练","AI 题库专项训练，提升面试能力","training")}
        ${actionCard("i-user","进入模拟面试","真实场景模拟，全真演练","simulation")}
      </section>
      <section class="stat-row">
        ${stat("i-file","简历数量","8","份","2")}
        ${stat("i-folder","作品数量","5","个","1")}
        ${stat("i-chart","保留分析记录","12","条","3")}
        ${stat("i-user","累计面试次数","23","次","5")}
      </section>
      <section class="two-col">
        <div class="card pad">
          <div class="section-title"><h2>最近分析记录</h2><a data-page="records">全部记录 〉</a></div>
          <table class="mini-table">
            ${companies.slice(0,3).map(c=>`
              <tr>
                <td>${logo(c[0])}</td><td><b>${c[1]}</b><br><span class="muted">${c[2]}</span></td>
                <td><b>${c[3]}</b><br><span class="muted">${c[4]}</span></td><td>${ring(c[5])}</td>
                <td><span class="muted">${c[6]}</span><br>匹配度分析</td>
                <td>${btn("查看详情","ghost-green","result")} ${btn("进入训练","ghost-green","training")} ${btn("进入模拟","primary","simulation")}</td>
              </tr>`).join("")}
          </table>
        </div>
        <div class="card pad">
          <div class="section-title"><h2>最近面试记录</h2><a data-page="history">全部记录 〉</a></div>
          <table class="mini-table">
            ${[["tx","腾讯","后端开发工程师","模拟面试","已完成","85 分"],["mi","小米","产品经理","模拟面试","已完成","82 分"],["mt","美团","数据分析师","面试训练","进行中","—"]].map(r=>`
            <tr><td>${logo(r[0])}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td><span class="pill ${r[4]==="进行中"?"orange":""}">${r[4]}</span></td><td class="green"><b>${r[5]}</b></td></tr>`).join("")}
          </table>
          <div style="text-align:right;margin-top:14px"><a class="green" data-page="history">查看全部面试历史 〉</a></div>
        </div>
      </section>
      <section class="card pad" style="margin-top:20px">
        <h2>快速开始流程</h2>
        <div class="grid quick-flow">
          ${["上传简历/作品|上传你的简历或作品集|i-upload","上传JD/公司资料|粘贴 JD 或公司信息|i-file","匹配度分析|AI 智能评估匹配度|i-chart","进入训练/模拟|针对性训练或模拟面试|i-target","查看报告|获取分析报告与建议|i-file"].map((s,i)=>{
            const [a,b,c]=s.split("|"); return `<div class="flow-step"><b>${i+1}</b>${icon(c)}<p>${a}</p><small>${b}</small></div>`;
          }).join("")}
        </div>
      </section>`;
  },
  resumes(){
    const defaultData = [
      ["产品经理_张同学","v2.0","产品设计","需求分析","项目管理","数据分析","+3","2024-05-18 14:32","默认简历"],
      ["运营专员简历","v1.1","用户运营","活动策划","数据分析","内容运营","","2024-05-15 09:21",""],
      ["数据分析师_张同学","v1.3","SQL","数据建模","可视化分析","Python","+2","2024-05-12 16:45",""],
      ["后端开发工程师简历","v1.0","Java","Spring Boot","MySQL","分布式系统","+2","2024-05-08 11:30",""],
      ["市场营销简历","v1.0","市场分析","品牌推广","活动策划","渠道运营","","2024-05-05 10:12",""]
    ];
    const resumes = window.__resumeData || defaultData;
    const firstResume = resumes[0] || defaultData[0];
    return `
      <section class="card pad" style="display:grid;grid-template-columns:1fr 1fr 1fr;align-items:center;margin-bottom:18px">
        ${statInline("i-file","简历总数","8","份")}
        ${statInline("i-star","默认简历","1","份")}
        ${statInline("i-clock","最近更新","3","份（近 7 天）")}
      </section>
      <section class="resume-layout">
        <div>
          <div class="resume-list">
            ${resumes.map((r,i)=>`<div class="resume-item ${i===0?"selected":""}" data-select>
              <div class="radio"></div>
              <div><h3>${r[0]} <span class="pill">${r[1]}</span></h3><p class="muted">上传时间： ${r[7]}　<span class="green">● 解析成功</span></p>${r[8]?`<span class="pill">${r[8]}</span>`:""} ${tagList(r.slice(2,7).filter(Boolean))}</div>
              <div class="resume-actions">${btn("预览")} ${btn("设为默认")} ${btn("重命名")} ${btn("删除")}</div>
            </div>`).join("")}
          </div>
          <div class="card" style="margin-top:10px;display:flex;align-items:center;gap:14px;padding:0 18px;background:#f4fff8;border-color:#cfefdc"><div class="round-ico">${icon("i-folder")}</div><b>只需上传一次，随时复用</b><span class="muted">上传后，系统将自动解析并保存简历信息。</span><span style="margin-left:auto">×</span></div>
        </div>
        <div class="preview-card card">
          <div class="section-title"><h2>简历预览</h2><span class="muted">当前预览： <b>产品经理_张同学 v2.0</b></span></div>
          ${infoBlock("基本信息",["姓名： 张同学","手机：138****8888","邮箱：zhangtongxue@example.com","城市：北京","求职意向：产品经理","工作年限：3 年","学历：本科","毕业院校：北京邮电大学"])}
          ${infoBlock("工作经历",["2021.07 - 至今　某科技有限公司　产品经理","负责公司核心产品的需求调研与规划，输出 PRD 和原型设计；","推动跨部门协作，跟进项目进度，按时高质量交付；","通过数据分析驱动迭代，提升用户活跃度 25%+。"])}
          ${infoBlock("项目经历",["2023.03 - 2023.11　智能学习平台项目　核心产品负责人","负责产品 0-1 规划与设计，搭建功能框架和用户路径；","协同设计、研发、测试资源，项目按期上线；","上线后月活提升 32%，留存率提升 18%。"])}
          <div class="info-box"><h3>技能标签</h3>${tagList(["需求分析","产品设计","项目管理","数据分析","用户研究","Axure","Figma","SQL","Excel","Python"],"green")}</div>
          <div class="info-box"><h3>AI解析摘要</h3><p class="muted">候选人具备 3 年产品经理经验，擅长需求分析与产品设计，具备从 0 到 1 的产品落地能力。</p></div>
        </div>
      </section>`;
  },
  portfolio(){
    const works = [
      ["华东区域销售增长案例","销售案例","2024-05-18","已解析",["数据分析","客户管理","策略制定"],"doc"],
      ["初中英语教学设计案例","教学案例","2024-05-16","已解析",["课程设计","课堂互动","教学评估"],"pic"],
      ["用户增长运营方案","运营方案","2024-05-14","已解析",["用户增长","数据分析","活动策划"],"xls"],
      ["品牌活动复盘报告","项目报告","2024-05-12","已解析",["活动复盘","数据分析","总结优化"],"ppt"],
      ["UI 设计作品集 2024","设计作品集","2024-05-10","部分解析",["视觉设计","交互设计","用户体验"],"ps"],
      ["智慧校园项目报告","项目报告","2024-05-08","解析失败",["项目管理","需求分析","方案设计"],"pdf"]
    ];
    return `
      <section class="stat-row">
        ${stat("i-file","作品总数","24","个","3")}
        ${stat("i-badge","已解析作品","20","个","4")}
        ${stat("i-star","常用作品","8","个","2")}
        ${stat("i-clock","最近更新","2024-05-18","","更新 2 个")}
      </section>
      <div class="card" style="margin-bottom:14px;display:flex;align-items:center;padding:0 14px;color:#4b5563;font-size:13px">● 在匹配度分析时可选择多个作品，综合评估你的实战能力与岗位适配度。<a class="green" style="margin-left:auto;white-space:nowrap">了解更多 〉</a></div>
      <section class="portfolio-layout">
        <div class="portfolio-list">
          <div class="portfolio-grid">${works.map((w,i)=>workCard(w,i)).join("")}</div>
          <div class="portfolio-pager"><span class="muted">共 24 个作品</span>${btn("‹","icon")}<button class="btn primary icon">1</button>${btn("2","icon")}${btn("3","icon")}${btn("›","icon")}${btn("12 条/页")}</div>
        </div>
        <div class="detail-panel card">
          <div style="display:flex;gap:20px;align-items:center;margin-bottom:22px"><div class="doc">${icon("i-file")}</div><div><h2 style="margin:0 0 10px">华东区域销售增长案例 ☆</h2><p class="muted">销售案例</p><p class="muted">2024-05-18 上传 <span class="pill">已解析</span></p></div><span style="margin-left:auto;font-size:28px;color:#667085">×</span></div>
          <div class="info-box"><h3>作品摘要</h3><p class="muted">本案例围绕华东区域 2023 年度销售增长目标，分析市场环境、客户结构与竞品策略，制定并落地增长方案，最终实现销售额同比增长 28.6%。</p><a class="green">展开⌄</a></div>
          <div class="info-box"><h3>能力标签</h3>${tagList(["数据分析","客户管理","策略制定","市场洞察","结果导向"],"green")}</div>
          <div class="info-box"><h3>关键亮点</h3><p class="muted">✓ 通过数据分析识别高潜客户群体，提升转化率 18%</p><p class="muted">✓ 制定差异化渠道策略，优化资源分配，ROI 提升 32%</p><p class="muted">✓ 搭建销售漏斗看板，实现过程可视化与精细化管理</p></div>
          <div class="info-box"><h3>适配岗位建议</h3>${tagList(["销售经理","大客户经理","区域销售负责人","渠道管理"],"green")}<p class="muted">匹配度为基于内容分析的智能建议，仅供参考。</p></div>
          <h3>原文件预览</h3><div class="thumb-row"><div class="thumb">20 页</div><div class="thumb">图表页</div><div class="thumb dark">+17</div></div>
        </div>
      </section>`;
  },
  match(){
    return `
      <section class="match-panel card">
        <h2>简历匹配度分析</h2>
        <p class="muted">上传公司资料并选择简历与作品，AI 将为你分析匹配度并提供优化建议</p>
        <div class="steps">
          ${["选择资料|上传并选择所需资料","开始分析|AI 进行匹配度分析","查看结果|查看匹配度与建议","进入训练/模拟|基于结果提升并练习"].map((s,i)=>{const [a,b]=s.split("|");return `<div class="step ${i===0?"active":""}"><b>${i+1}</b><div><strong>${a}</strong><br><span class="muted">${b}</span></div></div>`}).join("")}
        </div>
        <div class="match-cols">
          <div class="upload-card card"><h2>上传公司资料</h2>
            <h4><span class="pill">1</span> 上传 JD 文件（图片 / PDF / Word）</h4><div class="file-tile"><div class="file-icon pdf">PDF</div><div><b>产品经理_JD_高级.pdf</b><br><small class="muted">1.24 MB</small></div><span class="pill" style="margin-left:auto">✓</span></div><div class="drop">${icon("i-upload")}点击或拖拽文件到此处上传<br><small>支持 PDF / Word / 图片，单个文件 ≤ 20MB</small></div>
            <h4><span class="pill">2</span> 上传公司介绍（可选）</h4><div class="file-tile"><div class="file-icon word">W</div><div><b>腾讯公司介绍.docx</b><br><small class="muted">2.08 MB</small></div><span class="pill" style="margin-left:auto">✓</span></div><div class="drop">${icon("i-upload")}点击或拖拽文件到此处上传<br><small>支持 PDF / Word / 图片，单个文件 ≤ 20MB</small></div>
            <h4><span class="pill">3</span> 补充岗位说明 / 粘贴文本（可选）</h4><textarea class="txtarea" placeholder="请输入岗位说明或补充文本..." maxlength="1000">负责 B 端产品的规划与设计，能独立推进需求分析、产品方案设计与落地，具备良好的跨团队协作能力和数据驱动意识。</textarea>
          </div>
          <div class="select-card card"><h2>选择调用的简历与作品</h2>
            <h4><span class="pill">1</span> 选择简历</h4><div class="select-like">从简历库选择 <span>⌄</span></div>
            <div class="select-resume"><div class="avatar"></div><div><b>张同学 · 产品经理</b> <span class="pill" style="float:right">当前选中</span><p class="muted">5年经验　杭州｜本科</p><p class="muted">最近更新：2024-05-18 10:30</p><a class="green">查看简历详情 ↗</a></div></div>
            <h4><span class="pill">2</span> 选择作品（可多选） <span class="green" style="float:right">已选择 3 项</span></h4><div class="input-like">${icon("i-search")} 搜索作品名称或关键词</div>
            ${["电商后台管理系统设计|B端后台　数据可视化","智能硬件 APP 设计|移动端　IoT","数据中台可视化看板|可视化　大屏","企业官网改版设计|官网　品牌设计"].map((w,i)=>{const [a,b]=w.split("|");return `<div class="work-select"><span class="${i<3?"pill":""}">${i<3?"✓":""}</span><div class="tiny-img"><i></i></div><div><b>${a}</b><br><span class="muted">${b}</span></div></div>`}).join("")}
            <p class="green">查看全部作品  →</p>
          </div>
          <div class="confirm-card card"><h2>资料预览与确认</h2>
            <div class="confirm-list">${["公司名称|腾讯科技（深圳）有限公司","职位名称|高级产品经理","选择的简历|张同学 · 产品经理","选择的作品|3 项作品"].map(x=>{const [a,b]=x.split("|");return `<div><b class="muted">${a}</b><span>${b}</span></div>`}).join("")}</div>
            <div class="confirm-list"><h3 style="padding:16px;margin:0">资料清单（必备项）</h3>${["JD 文件|产品经理_JD_高级.pdf","公司介绍|腾讯公司介绍.docx","简历|张同学 · 产品经理","作品|已选择 3 项作品"].map(x=>{const [a,b]=x.split("|");return `<div><span class="green">● ${a}</span><span>${b}</span></div>`}).join("")}</div>
            <div class="safety"><b>数据安全与隐私保护</b><p>所有上传资料仅用于匹配度分析，不会用于其他用途，请放心使用。</p></div>
            ${btn("开始分析","primary","","i-target","start-analyze")} ${btn("取消")}
          </div>
        </div>
      </section>`;
  },
  result(){
    let analysisData = null;
    try { analysisData = JSON.parse(sessionStorage.getItem('currentMatchResult') || 'null'); } catch(e) {}
    const score = analysisData?.total_score || 82;
    const subScores = analysisData?.sub_scores || {"岗位经验匹配":16,"专业能力匹配":17,"行业背景匹配":13,"项目/作品匹配":18,"软素质匹配":18};
    const defaultCards = ["评分理由|你在智能硬件产品方向有 3 年完整工作经验，覆盖从 0 到 1 的产品定义与落地，经验高度相关。","优势亮点|在智能门锁项目中主导产品定义与功能规划，推动销量提升 60%，结果导向显著。","短板提醒|行业背景以消费电子为主，对智能家居生态的理解深度可进一步加强。","面试重点表达|重点讲述智能门锁项目从 0 到 1 的完整过程，突出关键决策与取舍思路。","潜在风险点|若无法清晰说明部分项目中的取舍与优先级判断，可能影响对你产品思维的评价。","建议准备方向|深入了解小米产品方法论与核心产品案例，准备 1-2 个更完整的项目细节。"];
    const cards = analysisData?.analysis_cards || defaultCards;
    const company = analysisData?.company_name || "小米科技有限责任公司";
    const jobTitle = analysisData?.job_title || "产品经理（智能硬件方向）";
    const companyCode = analysisData?.company_code || "mi";
    return `
      <section class="result-hero card">
        <div>${ring(score,"lg")}</div>
        <div>${logo(companyCode, companyCode==="mi"?"mi":companyCode==="bd"?"▮":"AI")} <b>${company}</b><h2>${jobTitle}</h2><p class="muted">匹配时间： ${new Date().toLocaleDateString('zh-CN')}　｜　简历： ${analysisData?.resume_name || '张同学_产品经理简历.pdf'}</p></div>
        <div class="safety">${icon("i-badge")} 整体匹配度较高，具备较强的岗位胜任力，建议针对性强化短板，提升面试竞争力。</div>
      </section>
      <section class="grid subscores">
        ${Object.entries(subScores).map(([k,v])=>`<div class="subscore card"><div class="round-ico">${icon("i-folder")}</div><div><span class="muted">${k}</span><div class="big">${v} <small>/20</small></div><b class="green">${v>=16?"较高":v>=12?"中等":"较低"}</b></div></div>`).join("")}
      </section>
      <section class="grid result-grid">${cards.map((c,i)=>{const [h,b]=c.split("|");return `<div class="text-card card"><h3>${icon(["i-file","i-star","i-bell","i-target","i-badge","i-chart"][i])}${h}</h3><ul><li>${b}</li><li>${i%2?"具备跨部门协作与项目推进能力，能高效推动研发、设计、供应链协同落地。":"具备用户研究、需求分析、产品规划到项目推进的完整闭环能力。"}</li><li>${i%3?"数据分析能力优秀，能够基于用户行为数据驱动产品迭代与优化。":"面试中需要清晰呈现你的产品方法论与关键决策思路。"}</li></ul></div>`}).join("")}</section>
      <section class="fixed-actions">${btn("保留分析记录","ghost-green","","i-upload")}${btn("清除本次分析记录","ghost-green","","i-x")}${btn("进入面试训练","primary","","i-target","start-training")}${btn("进入模拟面试","primary","","i-user","start-simulation")}</section>`;
  },
  records(){
    return `
      <section class="stat-row">
        ${stat("i-folder","已保留分析记录","12","条","3")}
        ${stat("i-file","本周新增","5","条","2")}
        ${stat("i-star","高分记录（>85分）","4","条","占比 33%")}
        ${stat("i-user","已进入面试","3","场","1")}
      </section>
      <section class="records-layout">
        <div>
          <div class="filters card"><div class="field"><label>公司</label><div class="select-like" data-action="open-select">全部公司 <span>⌄</span><div class="select-dropdown"><div class="select-option active" data-val="全部公司">全部公司</div><div class="select-option" data-val="字节跳动">字节跳动</div><div class="select-option" data-val="阿里巴巴">阿里巴巴</div><div class="select-option" data-val="华为">华为</div><div class="select-option" data-val="腾讯">腾讯</div><div class="select-option" data-val="美团">美团</div><div class="select-option" data-val="小米">小米</div><div class="select-option" data-val="京东">京东</div><div class="select-option" data-val="滴滴">滴滴</div></div></div></div><div class="field"><label>岗位</label><div class="select-like" data-action="open-select">全部岗位 <span>⌄</span><div class="select-dropdown"><div class="select-option active" data-val="全部岗位">全部岗位</div><div class="select-option" data-val="后端开发工程师">后端开发工程师</div><div class="select-option" data-val="产品经理">产品经理</div><div class="select-option" data-val="算法工程师">算法工程师</div><div class="select-option" data-val="数据分析师">数据分析师</div><div class="select-option" data-val="Java开发工程师">Java开发工程师</div></div></div></div><div class="field"><label>匹配度总分</label><div class="select-like" data-action="open-select">全部匹配度总分 <span>⌄</span><div class="select-dropdown"><div class="select-option active" data-val="全部匹配度总分">全部匹配度总分</div><div class="select-option" data-val="90分以上">90分以上</div><div class="select-option" data-val="80-89分">80-89分</div><div class="select-option" data-val="70-79分">70-79分</div><div class="select-option" data-val="70分以下">70分以下</div></div></div></div><div class="field"><label>分析时间</label><div class="select-like" data-action="open-select">开始日期 ~ 结束日期 <span>⌄</span><div class="select-dropdown"><div class="select-option active" data-val="全部时间">全部时间</div><div class="select-option" data-val="近7天">近7天</div><div class="select-option" data-val="近30天">近30天</div><div class="select-option" data-val="近3个月">近3个月</div><div class="select-option" data-val="自定义">自定义</div></div></div></div><button class="btn" data-action="reset-filters">重置</button><button class="btn primary" data-action="apply-filters">筛选</button></div>
          <div class="data-table card records-table" style="margin-top:20px"><table><colgroup><col><col><col><col><col><col><col><col><col></colgroup><thead><tr><th>公司</th><th>岗位</th><th>匹配度总分</th><th>5项子分数简览</th><th>调用简历</th><th>作品数量</th><th>分析时间</th><th>状态</th><th>操作</th></tr></thead><tbody>
          ${companies.map((c,i)=>`<tr class="${i===0?"active":""}"><td>${logo(c[0])}<b>${c[1]}</b><br><span class="muted">${c[2]}</span></td><td><b>${c[3]}</b><br><span class="muted">${c[4]}</span></td><td><span class="score-big">${c[5]}</span> 分</td><td><span class="green">90　84　88　83　85</span><br><small class="muted">技能　经验　项目　文化　稳定性</small></td><td>张同学_${c[3]}简历.pdf</td><td>${8-i} 个</td><td>${c[6].replace(" ","<br>")}</td><td><span class="pill">${i===2?"已考察":"已完成"}</span></td><td>${btn("查看详情","ghost-green","result")} ${btn("进入训练","ghost-green","training")} ${btn("进入模拟","primary","simulation")} ⋯</td></tr>`).join("")}
          </tbody></table><div style="padding:18px;display:flex;gap:14px;align-items:center"><span>共 12 条</span><span style="margin-left:auto"></span>${btn("‹","icon")}<button class="btn ghost-green icon">1</button>${btn("2","icon")}${btn("›","icon")}${btn("20 条/页")}</div></div>
        </div>
        <aside class="side-detail card"><span class="pill">当前选中 ×</span><h2>字节跳动</h2><p class="muted">后端开发工程师 · 社招 · 北京</p><p class="muted">分析时间：2024-05-18 10:30</p><h3>匹配度总分</h3><div class="side-score"><div><span class="score-big">86</span><span class="muted">/100</span></div></div><span class="pill">已完成</span><h3>5项子分数明细</h3>${["技能匹配度|90","经验匹配度|84","项目匹配度|88","文化匹配度|83","稳定性匹配度|85"].map(x=>barRow(x)).join("")}<h3>面试建议（AI生成）</h3><p><span class="pill">优势亮点</span></p><ul><li>技术栈匹配度高，项目经验丰富</li><li>分布式系统经验符合岗位要求</li><li>编码能力与岗位要求高度契合</li></ul><p><span class="pill red">需要加强</span></p><ul><li>深入掌握字节内部工具链</li><li>对海量数据处理方案可更深入</li></ul>${tagList(["高并发系统设计","分布式缓存","场景题：秒杀系统","代码优化"],"green")}<div class="side-actions">${btn("查看详情","ghost-green","result")}${btn("进入训练","ghost-green","training")}${btn("进入模拟面试","primary","simulation")}</div></aside>
      </section>`;
  },
  training(){
    return interviewPage(false);
  },
  simulation(){
    return interviewPage(true);
  },
  history(){
    return `
      <section class="stat-row">
        ${stat("i-user","总面试次数","23","次","5")}
        ${stat("i-chart","平均得分","82","分","4")}
        ${stat("i-badge","完成率","87","%","6%")}
        ${stat("i-clock","最近一次面试时间","2024-05-18 14:30","","腾讯 · 后台开发工程师")}
      </section>
      <section class="history-layout">
        <div>
          <div class="card pad" style="display:flex;gap:20px;align-items:center;margin-bottom:20px"><div class="input-like" style="width:360px">${icon("i-search")} 搜索公司、岗位或关键词</div><div class="tabs"><button class="active">全部</button><button>训练模式</button><button>模拟模式</button><button>进行中</button><button>已完成</button></div></div>
          <div class="data-table card history-table"><table><colgroup><col><col><col><col><col><col><col><col></colgroup><thead><tr><th>公司</th><th>岗位</th><th>模式</th><th>开始时间</th><th>状态</th><th>最终得分</th><th>关联分析记录</th><th>操作</th></tr></thead><tbody>
            ${[["tx","腾讯","后台开发工程师","模拟模式","2024-05-18 14:30<br>时长 32:14","进行中","—"],["ali","阿里巴巴","产品经理","模拟模式","2024-05-16 16:45<br>时长 28:07","已完成","78 分"],["bd","字节跳动","后端开发工程师","训练模式","2024-05-13 10:30<br>时长 24:18","已完成","86 分"],["hw","华为","算法工程师","模拟模式","2024-05-14 09:20<br>时长 40:33","已完成","72 分"],["mi","小米","产品经理","模拟模式","2024-05-12 15:10<br>时长 29:41","已完成","82 分"],["mt","美团","数据分析师","训练模式","2024-05-10 11:05<br>时长 22:19","已完成","65 分"],["jd","京东","Java开发工程师","模拟模式","2024-05-08 14:20<br>时长 31:07","已完成","90 分"]].map((r,i)=>`<tr><td>${logo(r[0])}${r[1]}</td><td>${r[2]}</td><td><span class="pill ${r[3]==="训练模式"?"blue":""}">${r[3]}</span></td><td>${r[4]}</td><td><span class="pill ${r[5]==="进行中"?"orange":""}">${r[5]} ●</span></td><td><b>${r[6]}</b><br><span class="${parseInt(r[6])>80?"green":""}">${parseInt(r[6])>80?"优秀":parseInt(r[6])>70?"良好":""}</span></td><td>${btn("查看分析","ghost-green","records","i-chart")}</td><td>${btn("继续对话","primary",r[3]==="训练模式"?"training":"simulation")} ${btn("查看报告","ghost-green","report")} ${btn("删除","red")}</td></tr>`).join("")}
          </tbody></table><div style="padding:20px;display:flex;gap:12px">${btn("‹","icon")}<button class="btn primary icon">1</button>${btn("2","icon")}${btn("3","icon")}${btn("…","icon")}${btn("4","icon")}<span style="margin-left:auto">共 23 条　${btn("10 条/页")}</span></div></div>
        </div>
        <aside>
          <div class="chart-box card"><div class="section-title"><h3>得分趋势</h3>${btn("近7次")}</div><div class="line-chart"><svg viewBox="0 0 260 170"><line x1="0" y1="42" x2="260" y2="42" stroke="#eef1f4" stroke-width="1" stroke-dasharray="3,3"/><line x1="0" y1="85" x2="260" y2="85" stroke="#eef1f4" stroke-width="1" stroke-dasharray="3,3"/><line x1="0" y1="128" x2="260" y2="128" stroke="#eef1f4" stroke-width="1" stroke-dasharray="3,3"/><text x="-4" y="45" fill="#9ca3af" font-size="9" text-anchor="end">90</text><text x="-4" y="88" fill="#9ca3af" font-size="9" text-anchor="end">80</text><text x="-4" y="131" fill="#9ca3af" font-size="9" text-anchor="end">70</text><text x="0" y="168" fill="#9ca3af" font-size="9" text-anchor="middle">5/4</text><text x="43" y="168" fill="#9ca3af" font-size="9" text-anchor="middle">5/6</text><text x="86" y="168" fill="#9ca3af" font-size="9" text-anchor="middle">5/8</text><text x="130" y="168" fill="#9ca3af" font-size="9" text-anchor="middle">5/10</text><text x="173" y="168" fill="#9ca3af" font-size="9" text-anchor="middle">5/12</text><text x="216" y="168" fill="#9ca3af" font-size="9" text-anchor="middle">5/16</text><text x="260" y="168" fill="#9ca3af" font-size="9" text-anchor="middle">5/18</text><defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#09a945" stop-opacity="0.2"/><stop offset="100%" stop-color="#09a945" stop-opacity="0.02"/></linearGradient></defs><polygon points="0,110 43,86 86,62 130,86 173,44 216,66 260,40 260,155 0,155" fill="url(#areaGrad)"/><polyline points="0,110 43,86 86,62 130,86 173,44 216,66 260,40" stroke="#09a945" fill="none" stroke-width="2.5" stroke-linejoin="round"/><circle cx="0" cy="110" r="3.5" fill="#fff" stroke="#09a945" stroke-width="2"/><circle cx="43" cy="86" r="3.5" fill="#fff" stroke="#09a945" stroke-width="2"/><circle cx="86" cy="62" r="3.5" fill="#fff" stroke="#09a945" stroke-width="2"/><circle cx="130" cy="86" r="3.5" fill="#fff" stroke="#09a945" stroke-width="2"/><circle cx="173" cy="44" r="3.5" fill="#fff" stroke="#09a945" stroke-width="2"/><circle cx="216" cy="66" r="3.5" fill="#fff" stroke="#09a945" stroke-width="2"/><circle cx="260" cy="40" r="4" fill="#09a945" stroke="#fff" stroke-width="2"/><text x="0" y="103" fill="#09a945" font-size="9" font-weight="700" text-anchor="middle">72</text><text x="43" y="79" fill="#09a945" font-size="9" font-weight="700" text-anchor="middle">78</text><text x="86" y="55" fill="#09a945" font-size="9" font-weight="700" text-anchor="middle">86</text><text x="130" y="79" fill="#09a945" font-size="9" font-weight="700" text-anchor="middle">78</text><text x="173" y="37" fill="#09a945" font-size="9" font-weight="700" text-anchor="middle">90</text><text x="216" y="59" fill="#09a945" font-size="9" font-weight="700" text-anchor="middle">82</text><text x="260" y="33" fill="#09a945" font-size="9" font-weight="700" text-anchor="middle">86</text></svg></div></div>
          <div class="rank card"><h3>高分公司TOP 5</h3>${["京东|90","字节跳动|86","小米|82","阿里巴巴|78","华为|72"].map((x,i)=>{const [a,b]=x.split("|");return `<div class="rank-row"><b style="background:${i>2?"#6b7280":i===1?"#2f80ed":i===2?"#ff7a00":"var(--green)"}">${i+1}</b><span>${a}</span><strong class="green">${b} 分</strong></div>`}).join("")}<p class="green" style="text-align:right">查看全部排名 〉</p></div>
          <div class="rank card" style="margin-top:18px"><h3>面试模式分布</h3><div class="donut">${ring(23,"md")}</div><p><span class="green">●</span> 模拟模式　15 (65%)</p><p><span class="blue">●</span> 训练模式　8 (35%)</p></div>
        </aside>
      </section>`;
  },
  report(){
    return `
      <section class="report-hero card">
        <div>${logo("bd")} <h2 style="display:inline;margin-left:12px">字节跳动 <span class="muted">ByteDance</span></h2><p>职位：后端开发工程师</p><p>面试模式：模拟面试</p><p>完成时间：2024-05-18 10:30</p><p>面试时长：48 分钟</p></div>
        <div style="display:grid;place-items:center">${ring(86,"lg")}<p class="muted">总分（100分）</p></div>
        <div><h2 class="green">表现优秀，超过 86% 的候选人</h2><p class="muted" style="line-height:1.7">整体表现出色，逻辑清晰，沟通顺畅，在专业能力和问题解决方面有较强优势，在抗压能力和总结反思方面仍有提升空间。</p><p class="muted">ⓘ 评分依据：10大维度综合评估</p></div>
      </section>
      <section class="two-col" style="margin-top:18px">
        <div class="radar-box card"><h3>能力维度雷达图</h3><div class="radar"><svg viewBox="0 0 300 300" class="radar-svg"><polygon points="150,26 238,62 274,150 238,238 150,274 62,238 26,150 62,62" fill="none" stroke="#e8ecf0" stroke-width="1"/><polygon points="150,55 220,80 245,150 210,222 150,248 90,222 55,150 80,80" fill="none" stroke="#e8ecf0" stroke-width="1"/><polygon points="150,84 202,98 216,150 192,206 150,222 108,206 84,150 98,98" fill="none" stroke="#e8ecf0" stroke-width="1"/><polygon points="150,113 184,116 187,150 174,190 150,196 126,190 113,150 116,116" fill="none" stroke="#e8ecf0" stroke-width="1"/><line x1="150" y1="26" x2="150" y2="274" stroke="#e8ecf0" stroke-width="1"/><line x1="26" y1="150" x2="274" y2="150" stroke="#e8ecf0" stroke-width="1"/><line x1="62" y1="62" x2="238" y2="238" stroke="#e8ecf0" stroke-width="1"/><line x1="238" y1="62" x2="62" y2="238" stroke="#e8ecf0" stroke-width="1"/><polygon class="radar-area" points="150,55 220,80 245,150 210,222 150,236 82,218 55,150 84,82" fill="rgba(8,169,67,.15)" stroke="#09a945" stroke-width="2"/><circle class="radar-dot" cx="150" cy="55" r="4" fill="#09a945"/><circle class="radar-dot" cx="220" cy="80" r="4" fill="#09a945"/><circle class="radar-dot" cx="245" cy="150" r="4" fill="#09a945"/><circle class="radar-dot" cx="210" cy="222" r="4" fill="#09a945"/><circle class="radar-dot" cx="150" cy="236" r="4" fill="#09a945"/><circle class="radar-dot" cx="82" cy="218" r="4" fill="#09a945"/><circle class="radar-dot" cx="55" cy="150" r="4" fill="#09a945"/><circle class="radar-dot" cx="84" cy="82" r="4" fill="#09a945"/><text class="radar-label" x="150" y="14" text-anchor="middle" fill="#111827" font-size="11" font-weight="600">逻辑思维 9.0</text><text class="radar-label" x="280" y="62" text-anchor="start" fill="#111827" font-size="11" font-weight="600">抗压 6.5</text><text class="radar-label" x="280" y="155" text-anchor="start" fill="#111827" font-size="11" font-weight="600">学习 8.0</text><text class="radar-label" x="248" y="252" text-anchor="start" fill="#111827" font-size="11" font-weight="600">沟通 9.0</text><text class="radar-label" x="52" y="252" text-anchor="end" fill="#111827" font-size="11" font-weight="600">团队协作 8.5</text><text class="radar-label" x="20" y="155" text-anchor="end" fill="#111827" font-size="11" font-weight="600">工具 8.0</text><text class="radar-label" x="20" y="62" text-anchor="end" fill="#111827" font-size="11" font-weight="600">专业 8.5</text><text class="radar-label" x="150" y="296" text-anchor="middle" fill="#111827" font-size="11" font-weight="600">行业 7.0</text></svg></div></div>
        <div class="card pad"><h3>能力维度评分（10分制）</h3><div class="ability-grid">${["逻辑思维能力|9.0|优秀","抗压能力|6.5|一般","学习能力|8.0|良好","沟通能力|9.0|优秀","团队协作能力|8.5|优秀","工具使用能力|8.0|良好","专业知识能力|8.5|优秀","行业领域知识能力|7.0|良好","反应能力|7.5|良好","总结反思能力|6.5|一般"].map(x=>{const [a,b,c]=x.split("|");return `<div class="ability"><span>${a}</span><b class="${parseFloat(b)<7?"orange":parseFloat(b)>=8.5?"green":"blue"}">${b}</b><span class="pill ${parseFloat(b)<7?"orange":parseFloat(b)>=8.5?"":"blue"}">${c}</span></div>`}).join("")}</div></div>
      </section>
      <section class="detail-report" style="margin-top:18px">
        <div class="card pad"><h3>详细报告</h3><div class="report-cards">${["整体表现点评|逻辑表现优秀，思维清晰，表达流畅，技术基础扎实，能够积极分析和解决问题。","优化建议|使用 STAR 法则结构化回答行为类问题，回答技术方案时先给结论再展开细节。","亮点总结|技术基础扎实，项目经验丰富；问题分析有逻辑，方案设计合理；沟通表达清晰。","高频追问复盘|项目难点追问、技术选型追问、职责边界追问需要继续准备。","主要问题|面试压力较强时，情绪管理和节奏把控不足；部分回答缺乏量化结果。","推荐改进方向|高并发系统设计、技术深度拓展、行业理解力提升。"].map(c=>{const [h,b]=c.split("|");return `<div class="text-card card"><h3>${h}</h3><p class="muted">${b}</p></div>`}).join("")}</div></div>
        <div class="card pad"><div class="section-title"><h3>历史问答回顾</h3><a>全部展开⌄</a></div>${["请介绍一下你在过往项目中遇到的最大挑战是什么？","你如何保证接口的高可用性？","如果让你设计一个秒杀系统，你会怎么做？","你对微服务架构有什么理解？"].map(q=>`<div class="qa-row"><b class="green">Q</b> ${q}<br><span class="green">A</span> <span class="muted">我在一个高并发场景下遇到数据库性能瓶颈，通过优化索引...</span></div>`).join("")}</div>
      </section>
      <section class="fixed-actions" style="grid-template-columns:1fr 1fr 1fr">${btn("再次模拟","ghost-green","simulation","i-clock")}${btn("继续训练","primary","training","i-target")}${btn("导出报告","ghost-green","","i-upload")}</section>`;
  },
  settings(){
    return `<div class="card empty">个人设置页面</div>`;
  }
};

function actionCard(i,h,p,page){ return `<div class="action" data-page="${page}"><div class="action-ico">${icon(i)}</div><div><h3>${h}</h3><p>${p}</p></div><button class="go">${icon("i-arrow")}</button></div>`; }
function stat(i,h,n,u,up){ return `<div class="stat-card card"><div class="ico">${icon(i)}</div><div><span class="muted">${h}</span><div class="big">${n} <small class="unit">${u}</small></div><small class="trend">较上周 <span class="up">↑ ${up}</span></small></div></div>`; }
function statInline(i,h,n,u){ return `<div style="display:flex;align-items:center;gap:14px;justify-content:center;border-right:1px solid #e5eaf0"><div class="ico">${icon(i)}</div><div><span class="muted" style="font-size:12px">${h}</span><div class="big" style="font-size:22px">${n}<small style="font-size:13px"> ${u}</small></div></div></div>`; }
function infoBlock(title,lines){ return `<div class="info-box"><h3>${icon("i-user")} ${title}</h3><div class="${lines.length>4?"info-line":""}">${lines.map(l=>`<p class="muted" style="margin:4px 0">${l}</p>`).join("")}</div>${title!=="基本信息"?`<p class="green">查看全部${title} 〉</p>`:""}</div>`; }
function workPreview(type){
  if(type === "doc") return `<div class="work-thumb doc-page"><i></i><b></b><span></span></div>`;
  if(type === "pic") return `<div class="work-thumb cover-page"><i></i><b></b><span></span></div>`;
  return `<div class="work-thumb file-app ${type}">${type==="xls"?"X":type==="ppt"?"P":type==="ps"?"Ps":"PDF"}</div>`;
}
function workCard(w,i){ return `<div class="work-card ${i===0?"selected":""}" data-select><div class="work-check"></div>${workPreview(w[5])}<div class="work-copy"><h3>${w[0]} ${i===0?"<span class='orange'>★</span>":""}</h3><p class="muted">${w[1]}</p><p class="muted">${w[2]} 上传 <span class="pill ${w[3]==="解析失败"?"red":w[3]==="部分解析"?"orange":""}">${w[3]}</span></p>${tagList(w[4])}</div><div class="actions">${btn("预览")} ${btn("重命名")} <span class="red">删除</span> ${btn("加入本次分析","primary")}</div></div>`; }
function barRow(x){ const [a,b]=x.split("|"); return `<div class="bar-row"><span>${a}</span><div class="bar"><i style="width:${b}%"></i></div><b class="green">${b}<small class="muted">/100</small></b></div>`; }

function interviewPage(sim){
  if(sim){
    return `
      <section class="interview-layout simulation">
        ${chatSidebar("历史会话")}
        <main class="main-interview card">
          <div class="interview-head">${logo("mi","mi")}<h2>小米</h2><h2>产品经理</h2><span class="pill">模拟模式</span><span style="margin-left:auto">第 <b>5</b> / 12 题</span></div>
          <div class="safety orange" style="background:#fff8e8;border:1px solid #ffdca8">ⓘ　本模式不即时点评，面试结束后统一生成报告</div>
          <div class="timer"><p>剩余思考时间</p>${ring(6,"md")}</div>
          <div class="question card pad"><p><span class="pill">AI</span> 面试官 ☆</p><h2>如何提升小米商城 App 的用户活跃度？请从用户分层、核心场景和产品策略等角度展开。</h2><p class="muted">你可以结合你过去的项目经验来回答。</p></div>
          <div class="card" style="height:44px;margin:18px 0;display:grid;place-items:center;color:#667085">💡 思考中... 组织你的思路，准备好后开始录音回答</div>
          <div class="voice-card card"><div class="wave"></div><b>00:12</b><div class="mic">${icon("i-mic")}</div><div class="voice-actions"><button>${icon("i-file")}</button><button>${icon("i-x")}</button></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;margin-top:8px;color:#667085"><span>标记稍后回答</span><span>结束录音</span><span>跳过本题</span></div>${btn("结束面试","red","report")}</div>
        </main>
        <aside class="context-panel card"><h2>当前面试上下文</h2>${contextTiles()}<div class="context-tile"><h3>匹配度分析结果</h3><div class="match-summary">${matchRing(86,"/100")}<div><b>匹配度较高</b><p class="muted">你的背景与该职位要求匹配度较高，继续加油！</p></div></div><p class="green">查看详情</p></div><div class="safety"><b>面试规则</b><p>◎ 全程语音作答，AI 将扮演面试官与您对话</p><p>◎ 每题有思考时间，请在倒计时内组织思路</p><p>◎ 本模式不即时点评，结束后统一生成报告</p><p class="green" style="text-align:center"><b>祝你面试顺利！</b></p></div></aside>
      </section>`;
  }
  return `
    <section class="interview-layout">
      ${chatSidebar("历史对话")}
      <main class="main-interview card">
        <div class="interview-head">${logo("bd")}<h2>字节跳动</h2><h2>后端开发工程师</h2><span class="pill">训练模式</span><span style="margin-left:auto">第 <b>3</b> / 12 题</span><div class="progress"><div class="bar"><i style="width:36%"></i></div></div></div>
        <div class="question"><p class="muted">AI 面试官提问</p><b>请你设计一个高并发的短链接服务，要求支持日均 10 亿次访问，短链包含自定义后缀，并需要保证全局唯一和可用性。请说明整体架构设计、核心模块、关键技术选型以及如何保障系统的高可用和可扩展性。</b><p class="muted">考察维度： 系统设计能力、架构思维、数据结构与算法、高并发处理、可用性设计</p></div>
        <div class="answer-box"><div class="section-title"><h3>我的回答</h3><div style="display:flex;gap:8px">${btn("全屏编辑","soft","","i-expand")} ${btn("语音输入","soft","","i-mic")}</div></div><textarea placeholder="在此输入你的回答... （支持 Markdown）"></textarea><div class="answer-actions">${btn("提交回答","primary","","","submit-answer")}${btn("重新作答","","","i-clock")}${btn("结束训练","red","","i-file","end-interview")}<span style="margin-left:auto">${btn("下一题","soft","","i-arrow")}</span></div></div>
        <div class="eval card pad"><h3>本题评估结果 <span class="muted">（AI 即时反馈）</span></h3><div class="grid" style="grid-template-columns:180px 1fr"><div><span class="muted">单题得分</span><div class="score-big eval-score">86 <small>/100</small> <span class="pill">优秀</span></div><p class="muted">超过了 86% 的同岗位候选人</p></div><div class="info-box"><b>本题考察维度</b><br>${tagList(["系统设计能力","高并发处理","架构思维","可用性设计","数据结构与算法"],"green")}</div></div>
          ${["回答亮点|整体架构分层清晰，考虑了读写分离与缓存策略。","问题不足|短链唯一性生成方案部分细节不够，未说明冲突处理机制。","优化建议|补充短链 ID 生成算法、热点 Key 处理、限流降级与容量规划思路。","优化版回答（参考）|整体架构我会从接入层、服务层、存储层和基础设施层的分层设计展开..."].map(x=>{const [a,b]=x.split("|");return `<div class="eval-row"><b>${a}</b><span class="muted">${b}</span></div>`}).join("")}
        </div>
      </main>
      <aside class="context-panel card"><h2>面试上下文</h2>${contextTiles()}<div class="context-tile"><h3>匹配度分析（综合）</h3><div class="match-summary">${matchRing(86,"%")}<div><b>你与该岗位的整体匹配度</b><p class="muted">超过近 100%，匹配度较高</p><p class="green">查看详细分析 〉</p></div></div></div><div class="dimension"><h3>维度得分（5 项）</h3>${["技能匹配|88","项目经验|84","教育背景|80","综合素质|87","岗位契合度|89"].map(x=>barRow(x)).join("")}</div><p class="green" style="text-align:center;margin-top:28px">如何提升匹配度 〉</p></aside>
    </section>`;
}
function chatSidebar(title){ return `<aside class="chat-list card"><h2>${title}</h2><div class="input-like" style="margin-bottom:14px">${icon("i-search")} 搜索对话或公司/岗位</div>${[["bd","字节跳动","后端开发工程师","今天 10:30","训练模式","86"],["ali","阿里巴巴","产品经理","昨天 16:45","训练模式","78"],["hw","华为","算法工程师","05-14 09:20","全真模拟","72"],["tx","腾讯","后台开发工程师","05-13 15:10","训练模式","85"],["mt","美团","数据分析师","05-12 11:08","全真模拟","70"],["mi","小米","产品经理","05-11 14:32","训练模式","82"],["bd","字节跳动","测试开发工程师","05-10 10:15","训练模式","75"],["jd","拼多多","高级运营专员","05-08 17:40","全真模拟","68"]].map((c,i)=>`<div class="chat-item ${i===0?"active":""}" data-select>${logo(c[0])}<div><b>${c[1]}</b><br><span>${c[2]}</span><br><small class="muted">${c[3]}</small> <span class="pill">${c[4]}</span></div>${ring(c[5])}</div>`).join("")}<p class="muted">共 28 条对话</p><div style="text-align:center">${btn("‹","icon")} ${btn("1","soft")} ${btn("2","icon")} ${btn("3","icon")} ${btn("›","icon")}</div></aside>`; }
function contextTiles(){ return ["绑定JD|产品经理（小米商城）.pdf|更新于 2024-05-10","公司介绍|小米科技有限责任公司|查看详情","调用简历|张同学-产品经理简历.pdf|更新于 2024-05-08","作品集|小米商城改版项目|共 3 个项目"].map(x=>{const [a,b,c]=x.split("|");return `<div class="context-tile"><h4>${a}</h4><p>${b}</p><p class="muted">${c}</p><p class="green" style="text-align:right">查看</p></div>`}).join(""); }

setPage("dashboard");
