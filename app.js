const STEP_DEFS = [
  { id: "listen", label: "听", title: "听发音", desc: "英式/美式发音，先慢后快三遍。" },
  { id: "learn", label: "学", title: "学单词", desc: "看词形、词义、音标和例句。" },
  { id: "read", label: "读", title: "跟读", desc: "先听领读，再开口跟读。" },
  { id: "translate", label: "译", title: "选释义", desc: "根据英文选择中文意思。" },
  { id: "split", label: "拆分", title: "拆分发音", desc: "按音节和词块理解单词。" },
  { id: "spellread", label: "拼读", title: "词块拼读", desc: "把拆开的词块拼回完整单词。" },
  { id: "spell", label: "拼写", title: "键盘拼写", desc: "从浮出的键盘字母里点出正确拼写。" }
];

const REVIEW_INTERVALS = [
  { days: 1, name: "速刷复习", steps: ["translate"], note: "第 1 天快速回忆" },
  { days: 2, name: "巩固复习", steps: ["translate", "split", "spell"], note: "第 2 天巩固词义和拼写" },
  { days: 4, name: "巩固复习", steps: ["translate", "split", "spell"], note: "第 4 天再次巩固" },
  { days: 7, name: "深度复习", steps: ["listen", "read", "translate", "split", "spellread", "spell"], note: "第 7 天深度复习" },
  { days: 15, name: "深度复习", steps: ["listen", "read", "translate", "split", "spellread", "spell"], note: "第 15 天深度复习" },
  { days: 30, name: "深度复习", steps: ["listen", "read", "translate", "split", "spellread", "spell"], note: "第 30 天长期记忆" }
];

const publishers = ["人教版", "外研版", "译林版", "北师大版", "冀教版", "科普版", "沪教版", "沪外教版", "沪教牛津版", "仁爱版", "鲁教版", "教科版"];
// 先选学制，再选年级；两种学制都把初中年级覆盖完整。
// 六三制：初中三年（七、八、九年级）。五四制：初中四年（六、七、八、九年级）。
const gradeSystems = {
  "六三制": ["七年级上", "七年级下", "八年级上", "八年级下", "九年级上", "九年级下", "九年级全一册"],
  "五四制": ["六年级上", "六年级下", "七年级上", "七年级下", "八年级上", "八年级下", "九年级上", "九年级下", "九年级全一册"]
};
const systems = Object.keys(gradeSystems);
const books = systems.flatMap((system) =>
  publishers.flatMap((publisher) =>
    gradeSystems[system].map((grade) => ({
      id: `${publisher}-${system}-${grade}`,
      publisher,
      system,
      grade,
      title: `${publisher} ${grade}`,
      subtitle: `全国初中英语教材词汇 · ${system}`,
      units: grade.includes("七") || grade.includes("六") ? 12 : 10
    }))
  )
);

let vocabulary = [
  w("welcome", "欢迎", "v.", "七年级上", "Starter", "/ˈwelkəm/", "/ˈwelkəm/", ["wel", "come"], ["/w/", "/e/", "/l/", "/k/", "/ə/", "/m/"], "Welcome to our school.", "欢迎来到我们学校。"),
  w("classmate", "同班同学", "n.", "七年级上", "Unit 1", "/ˈklɑːsmeɪt/", "/ˈklæsmeɪt/", ["class", "mate"], ["/k/", "/l/", "/ɑː/", "/s/", "/m/", "/eɪ/", "/t/"], "My classmate is good at English.", "我的同班同学擅长英语。"),
  w("library", "图书馆", "n.", "七年级上", "Unit 2", "/ˈlaɪbrəri/", "/ˈlaɪbreri/", ["li", "bra", "ry"], ["/l/", "/aɪ/", "/b/", "/r/", "/ə/", "/r/", "/i/"], "We read books in the library.", "我们在图书馆读书。"),
  w("dictionary", "词典", "n.", "七年级上", "Unit 2", "/ˈdɪkʃənəri/", "/ˈdɪkʃəneri/", ["dic", "tion", "a", "ry"], ["/d/", "/ɪ/", "/k/", "/ʃ/", "/ə/", "/n/", "/e/", "/r/", "/i/"], "Please use a dictionary.", "请使用词典。"),
  w("favorite", "最喜欢的", "adj.", "七年级上", "Unit 3", "/ˈfeɪvərɪt/", "/ˈfeɪvərət/", ["fa", "vor", "ite"], ["/f/", "/eɪ/", "/v/", "/ə/", "/r/", "/ɪ/", "/t/"], "Math is my favorite subject.", "数学是我最喜欢的科目。"),
  w("subject", "学科", "n.", "七年级上", "Unit 3", "/ˈsʌbdʒekt/", "/ˈsʌbdʒekt/", ["sub", "ject"], ["/s/", "/ʌ/", "/b/", "/dʒ/", "/e/", "/k/", "/t/"], "What subject do you like?", "你喜欢什么学科？"),
  w("because", "因为", "conj.", "七年级上", "Unit 3", "/bɪˈkɒz/", "/bɪˈkɔːz/", ["be", "cause"], ["/b/", "/ɪ/", "/k/", "/ɔː/", "/z/"], "I like it because it is useful.", "我喜欢它，因为它有用。"),
  w("healthy", "健康的", "adj.", "七年级上", "Unit 4", "/ˈhelθi/", "/ˈhelθi/", ["health", "y"], ["/h/", "/e/", "/l/", "/θ/", "/i/"], "Fruit is healthy food.", "水果是健康食品。"),
  w("vegetable", "蔬菜", "n.", "七年级上", "Unit 4", "/ˈvedʒtəbl/", "/ˈvedʒtəbl/", ["veg", "e", "ta", "ble"], ["/v/", "/e/", "/dʒ/", "/t/", "/ə/", "/b/", "/l/"], "We should eat vegetables every day.", "我们应该每天吃蔬菜。"),
  w("breakfast", "早餐", "n.", "七年级上", "Unit 4", "/ˈbrekfəst/", "/ˈbrekfəst/", ["break", "fast"], ["/b/", "/r/", "/e/", "/k/", "/f/", "/ə/", "/s/", "/t/"], "I have milk for breakfast.", "我早餐喝牛奶。"),
  w("birthday", "生日", "n.", "七年级上", "Unit 5", "/ˈbɜːθdeɪ/", "/ˈbɜːrθdeɪ/", ["birth", "day"], ["/b/", "/ɜː/", "/θ/", "/d/", "/eɪ/"], "Her birthday is in May.", "她的生日在五月。"),
  w("festival", "节日", "n.", "七年级上", "Unit 5", "/ˈfestɪvl/", "/ˈfestɪvl/", ["fes", "ti", "val"], ["/f/", "/e/", "/s/", "/t/", "/ɪ/", "/v/", "/l/"], "The Spring Festival is important.", "春节很重要。"),
  w("weather", "天气", "n.", "七年级下", "Unit 1", "/ˈweðə/", "/ˈweðər/", ["weath", "er"], ["/w/", "/e/", "/ð/", "/ə/"], "How is the weather today?", "今天天气怎么样？"),
  w("exercise", "锻炼；练习", "n./v.", "七年级下", "Unit 2", "/ˈeksəsaɪz/", "/ˈeksərsaɪz/", ["ex", "er", "cise"], ["/e/", "/k/", "/s/", "/ə/", "/s/", "/aɪ/", "/z/"], "Exercise keeps us strong.", "锻炼让我们强壮。"),
  w("usually", "通常", "adv.", "七年级下", "Unit 2", "/ˈjuːʒuəli/", "/ˈjuːʒuəli/", ["u", "su", "al", "ly"], ["/j/", "/uː/", "/ʒ/", "/u/", "/ə/", "/l/", "/i/"], "I usually get up at six.", "我通常六点起床。"),
  w("quarter", "一刻钟；四分之一", "n.", "七年级下", "Unit 2", "/ˈkwɔːtə/", "/ˈkwɔːrtər/", ["quar", "ter"], ["/k/", "/w/", "/ɔː/", "/t/", "/ə/"], "It is a quarter past seven.", "现在七点一刻。"),
  w("station", "车站", "n.", "七年级下", "Unit 3", "/ˈsteɪʃn/", "/ˈsteɪʃn/", ["sta", "tion"], ["/s/", "/t/", "/eɪ/", "/ʃ/", "/n/"], "The bus station is near here.", "公交车站就在附近。"),
  w("between", "在两者之间", "prep.", "七年级下", "Unit 4", "/bɪˈtwiːn/", "/bɪˈtwiːn/", ["be", "tween"], ["/b/", "/ɪ/", "/t/", "/w/", "/iː/", "/n/"], "The bank is between the hotel and the park.", "银行在酒店和公园之间。"),
  w("straight", "直地；笔直的", "adv./adj.", "七年级下", "Unit 4", "/streɪt/", "/streɪt/", ["straight"], ["/s/", "/t/", "/r/", "/eɪ/", "/t/"], "Go straight and turn left.", "直走然后左转。"),
  w("delicious", "美味的", "adj.", "七年级下", "Unit 5", "/dɪˈlɪʃəs/", "/dɪˈlɪʃəs/", ["de", "li", "cious"], ["/d/", "/ɪ/", "/l/", "/ɪ/", "/ʃ/", "/ə/", "/s/"], "The noodles are delicious.", "面条很好吃。"),
  w("expensive", "昂贵的", "adj.", "七年级下", "Unit 6", "/ɪkˈspensɪv/", "/ɪkˈspensɪv/", ["ex", "pen", "sive"], ["/ɪ/", "/k/", "/s/", "/p/", "/e/", "/n/", "/s/", "/ɪ/", "/v/"], "This jacket is expensive.", "这件夹克很贵。"),
  w("popular", "受欢迎的", "adj.", "七年级下", "Unit 7", "/ˈpɒpjələ/", "/ˈpɑːpjələr/", ["pop", "u", "lar"], ["/p/", "/ɒ/", "/p/", "/j/", "/ə/", "/l/", "/ə/"], "Basketball is popular in our school.", "篮球在我们学校很受欢迎。"),
  w("museum", "博物馆", "n.", "七年级下", "Unit 8", "/mjuˈziːəm/", "/mjuˈziːəm/", ["mu", "se", "um"], ["/m/", "/j/", "/uː/", "/z/", "/iː/", "/ə/", "/m/"], "We visited a science museum.", "我们参观了一个科学博物馆。"),
  w("excellent", "优秀的", "adj.", "七年级下", "Unit 8", "/ˈeksələnt/", "/ˈeksələnt/", ["ex", "cel", "lent"], ["/e/", "/k/", "/s/", "/ə/", "/l/", "/ə/", "/n/", "/t/"], "She did an excellent job.", "她做得很出色。"),
  w("surprise", "惊讶；使惊讶", "n./v.", "八年级上", "Unit 1", "/səˈpraɪz/", "/sərˈpraɪz/", ["sur", "prise"], ["/s/", "/ə/", "/p/", "/r/", "/aɪ/", "/z/"], "The news was a big surprise.", "这个消息让人很惊讶。"),
  w("wonderful", "精彩的", "adj.", "八年级上", "Unit 1", "/ˈwʌndəfl/", "/ˈwʌndərfl/", ["won", "der", "ful"], ["/w/", "/ʌ/", "/n/", "/d/", "/ə/", "/f/", "/l/"], "We had a wonderful vacation.", "我们度过了一个精彩的假期。"),
  w("activity", "活动", "n.", "八年级上", "Unit 1", "/ækˈtɪvəti/", "/ækˈtɪvəti/", ["ac", "tiv", "i", "ty"], ["/æ/", "/k/", "/t/", "/ɪ/", "/v/", "/ə/", "/t/", "/i/"], "This club has many activities.", "这个社团有很多活动。"),
  w("although", "虽然；尽管", "conj.", "八年级上", "Unit 2", "/ɔːlˈðəʊ/", "/ɔːlˈðoʊ/", ["al", "though"], ["/ɔː/", "/l/", "/ð/", "/əʊ/"], "Although it rained, we had fun.", "虽然下雨了，我们仍然玩得开心。"),
  w("internet", "互联网", "n.", "八年级上", "Unit 2", "/ˈɪntənet/", "/ˈɪntərnet/", ["in", "ter", "net"], ["/ɪ/", "/n/", "/t/", "/ə/", "/n/", "/e/", "/t/"], "We can learn on the Internet.", "我们可以在互联网上学习。"),
  w("program", "节目；程序", "n.", "八年级上", "Unit 2", "/ˈprəʊɡræm/", "/ˈproʊɡræm/", ["pro", "gram"], ["/p/", "/r/", "/əʊ/", "/ɡ/", "/r/", "/æ/", "/m/"], "The TV program is interesting.", "这个电视节目很有趣。"),
  w("competition", "比赛", "n.", "八年级上", "Unit 3", "/ˌkɒmpəˈtɪʃn/", "/ˌkɑːmpəˈtɪʃn/", ["com", "pe", "ti", "tion"], ["/k/", "/ɒ/", "/m/", "/p/", "/ə/", "/t/", "/ɪ/", "/ʃ/", "/n/"], "He won the singing competition.", "他赢得了歌唱比赛。"),
  w("necessary", "必要的", "adj.", "八年级上", "Unit 3", "/ˈnesəsəri/", "/ˈnesəseri/", ["nec", "es", "sa", "ry"], ["/n/", "/e/", "/s/", "/ə/", "/s/", "/e/", "/r/", "/i/"], "It is necessary to listen carefully.", "认真听讲是必要的。"),
  w("comfortable", "舒服的", "adj.", "八年级上", "Unit 4", "/ˈkʌmftəbl/", "/ˈkʌmftərbl/", ["com", "fort", "a", "ble"], ["/k/", "/ʌ/", "/m/", "/f/", "/t/", "/ə/", "/b/", "/l/"], "This seat is comfortable.", "这个座位很舒服。"),
  w("service", "服务", "n.", "八年级上", "Unit 4", "/ˈsɜːvɪs/", "/ˈsɜːrvɪs/", ["ser", "vice"], ["/s/", "/ɜː/", "/v/", "/ɪ/", "/s/"], "The restaurant has good service.", "这家餐厅服务很好。"),
  w("carefully", "仔细地", "adv.", "八年级上", "Unit 4", "/ˈkeəfəli/", "/ˈkerfəli/", ["care", "ful", "ly"], ["/k/", "/eə/", "/f/", "/ə/", "/l/", "/i/"], "Please read the question carefully.", "请仔细读题。"),
  w("discussion", "讨论", "n.", "八年级上", "Unit 5", "/dɪˈskʌʃn/", "/dɪˈskʌʃn/", ["dis", "cus", "sion"], ["/d/", "/ɪ/", "/s/", "/k/", "/ʌ/", "/ʃ/", "/n/"], "We had a discussion in class.", "我们在课堂上进行了讨论。"),
  w("culture", "文化", "n.", "八年级上", "Unit 5", "/ˈkʌltʃə/", "/ˈkʌltʃər/", ["cul", "ture"], ["/k/", "/ʌ/", "/l/", "/tʃ/", "/ə/"], "I want to learn Chinese culture.", "我想学习中国文化。"),
  w("engineer", "工程师", "n.", "八年级下", "Unit 1", "/ˌendʒɪˈnɪə/", "/ˌendʒɪˈnɪr/", ["en", "gi", "neer"], ["/e/", "/n/", "/dʒ/", "/ɪ/", "/n/", "/ɪə/"], "My dream is to be an engineer.", "我的梦想是成为工程师。"),
  w("medicine", "药；医学", "n.", "八年级下", "Unit 1", "/ˈmedsn/", "/ˈmedɪsn/", ["med", "i", "cine"], ["/m/", "/e/", "/d/", "/ɪ/", "/s/", "/n/"], "Take the medicine twice a day.", "这种药一天吃两次。"),
  w("environment", "环境", "n.", "八年级下", "Unit 2", "/ɪnˈvaɪrənmənt/", "/ɪnˈvaɪrənmənt/", ["en", "vi", "ron", "ment"], ["/ɪ/", "/n/", "/v/", "/aɪ/", "/r/", "/ə/", "/n/", "/m/", "/ə/", "/n/", "/t/"], "We should protect the environment.", "我们应该保护环境。"),
  w("pollution", "污染", "n.", "八年级下", "Unit 2", "/pəˈluːʃn/", "/pəˈluːʃn/", ["pol", "lu", "tion"], ["/p/", "/ə/", "/l/", "/uː/", "/ʃ/", "/n/"], "Air pollution is a serious problem.", "空气污染是一个严重问题。"),
  w("possible", "可能的", "adj.", "八年级下", "Unit 2", "/ˈpɒsəbl/", "/ˈpɑːsəbl/", ["pos", "si", "ble"], ["/p/", "/ɒ/", "/s/", "/ə/", "/b/", "/l/"], "Everything is possible if you try.", "只要努力，一切皆有可能。"),
  w("traditional", "传统的", "adj.", "八年级下", "Unit 3", "/trəˈdɪʃənl/", "/trəˈdɪʃənl/", ["tra", "di", "tion", "al"], ["/t/", "/r/", "/ə/", "/d/", "/ɪ/", "/ʃ/", "/ə/", "/n/", "/l/"], "Dumplings are traditional Chinese food.", "饺子是中国传统食物。"),
  w("celebrate", "庆祝", "v.", "八年级下", "Unit 3", "/ˈselɪbreɪt/", "/ˈselɪbreɪt/", ["cel", "e", "brate"], ["/s/", "/e/", "/l/", "/ɪ/", "/b/", "/r/", "/eɪ/", "/t/"], "We celebrate National Day in October.", "我们在十月庆祝国庆节。"),
  w("prepare", "准备", "v.", "八年级下", "Unit 4", "/prɪˈpeə/", "/prɪˈper/", ["pre", "pare"], ["/p/", "/r/", "/ɪ/", "/p/", "/eə/"], "I need to prepare for the test.", "我需要为考试做准备。"),
  w("available", "有空的；可获得的", "adj.", "八年级下", "Unit 4", "/əˈveɪləbl/", "/əˈveɪləbl/", ["a", "vail", "a", "ble"], ["/ə/", "/v/", "/eɪ/", "/l/", "/ə/", "/b/", "/l/"], "Are you available this afternoon?", "你今天下午有空吗？"),
  w("experience", "经历；经验", "n./v.", "八年级下", "Unit 5", "/ɪkˈspɪəriəns/", "/ɪkˈspɪriəns/", ["ex", "pe", "ri", "ence"], ["/ɪ/", "/k/", "/s/", "/p/", "/ɪə/", "/r/", "/i/", "/ə/", "/n/", "/s/"], "This trip was a great experience.", "这次旅行是一次很棒的经历。"),
  w("advice", "建议", "n.", "八年级下", "Unit 5", "/ədˈvaɪs/", "/ədˈvaɪs/", ["ad", "vice"], ["/ə/", "/d/", "/v/", "/aɪ/", "/s/"], "Can you give me some advice?", "你能给我一些建议吗？")
];

const qwertyRows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const API_BASE = "";
const STATIC_DEMO_ONLY = location.hostname.endsWith(".github.io") || location.hostname === "github.io" || new URLSearchParams(location.search).get("staticDemo") === "1";
const DEMO_AUTH_KEYS = {
  users: "superWordDemoUsers",
  sessions: "superWordDemoSessions",
  progress: "superWordDemoProgress",
  events: "superWordDemoEvents"
};

const state = {
  screen: "tasks",
  setupTab: "book",
  authMode: "login",
  systemFilter: "六三制",
  gradeFilter: "全部",
  publisherFilter: "全部",
  selectedBookId: books[0].id,
  accent: "us",
  session: null,
  pickedChunks: [],
  pickedLetters: [],
  status: "",
  statusType: "",
  choiceAnswered: false,
  progress: loadProgress(),
  auth: {
    token: localStorage.getItem("superWordToken") || "",
    user: null,
    analytics: null,
    adminAnalytics: null,
    error: "",
    busy: false,
    ready: false,
    backendOnline: true,
    demoMode: false,
    lastSyncAt: ""
  }
};

// 版本+册次 → 官方教材封面缩略图 URL，异步从教材清单加载后填充。
let coverMap = {};

const app = document.querySelector("#app");
if (state.progress.plan?.bookId) state.selectedBookId = state.progress.plan.bookId;
if (new URLSearchParams(window.location.search).get("demo") === "1") seedDemoProgress();
loadRealWordbook();
loadCoverMap();
initAuth();

function w(word, cn, part, grade, unit, uk, us, chunks, phonics, example, exampleCn) {
  return {
    id: `${grade}-${word}`,
    word,
    cn,
    part,
    grade,
    unit,
    uk,
    us,
    chunks,
    phonics,
    example,
    exampleCn
  };
}

async function loadRealWordbook() {
  try {
    const response = await fetch("data/wordbooks.real.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    const officialWords = flattenWordbook(data);
    if (!officialWords.length) return;
    vocabulary = [...vocabulary, ...officialWords];
    render();
  } catch {
    // Static demo still works when the real wordbook file is unavailable.
  }
}

// 加载本地封面映射（「版本-册次 → 本地封面图路径」）。
// 封面图已下载到 data/covers/，避免官方 CDN 防盗链（带站点 referer 会 403）。
async function loadCoverMap() {
  try {
    const response = await fetch("data/wordbook-covers.json", { cache: "no-store" });
    if (!response.ok) return;
    coverMap = await response.json();
    render();
  } catch {
    // 封面缺失时卡片回退到文字占位封面。
  }
}

async function initAuth() {
  if (!state.auth.token) {
    state.auth.ready = true;
    render();
    return;
  }
  try {
    const data = await apiRequest("/api/auth/me");
    state.auth.user = data.user;
    await loadRemoteProgress();
    await refreshAnalytics();
  } catch {
    localStorage.removeItem("superWordToken");
    state.auth.token = "";
    state.auth.user = null;
  } finally {
    state.auth.ready = true;
    render();
  }
}

async function apiRequest(path, options = {}) {
  if (STATIC_DEMO_ONLY) {
    state.auth.backendOnline = false;
    return demoApiRequest(path, options);
  }
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (state.auth.token) headers.Authorization = `Bearer ${state.auth.token}`;
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body
    });
  } catch {
    state.auth.backendOnline = false;
    return demoApiRequest(path, options);
  }
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json") || response.status === 404) {
    state.auth.backendOnline = false;
    return demoApiRequest(path, options);
  }
  state.auth.backendOnline = true;
  state.auth.demoMode = false;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "请求失败");
  return data;
}

async function demoApiRequest(path, options = {}) {
  state.auth.demoMode = true;
  const method = String(options.method || "GET").toUpperCase();
  const body = typeof options.body === "string" ? JSON.parse(options.body || "{}") : (options.body || {});

  if (method === "POST" && path === "/api/auth/register") return demoRegister(body);
  if (method === "POST" && path === "/api/auth/login") return demoLogin(body);
  if (method === "POST" && path === "/api/auth/logout") return demoLogout();
  if (method === "GET" && path === "/api/auth/me") return { user: demoRequireUser() };
  if (method === "GET" && path === "/api/progress") return demoGetProgress();
  if (method === "POST" && path === "/api/progress") return demoSaveProgress(body);
  if (method === "POST" && path === "/api/events") return demoSaveEvent(body);
  if (method === "GET" && path === "/api/analytics/me") return demoMyAnalytics();
  if (method === "GET" && path === "/api/admin/analytics") return demoAdminAnalytics();

  throw new Error("请求失败");
}

function demoRegister(body) {
  const name = String(body.name || "").trim();
  const email = normalizeDemoEmail(body.email);
  const password = String(body.password || "");
  if (name.length < 2) throw new Error("请输入至少 2 个字的昵称");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("请输入有效邮箱");
  if (password.length < 6) throw new Error("密码至少 6 位");

  const users = readDemoStore(DEMO_AUTH_KEYS.users, []);
  if (users.some((user) => user.email === email)) throw new Error("该邮箱已注册");
  const user = {
    id: demoId(),
    name,
    email,
    password: demoPassword(password),
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };
  users.push(user);
  writeDemoStore(DEMO_AUTH_KEYS.users, users);
  const token = createDemoSession(user.id);
  appendDemoEvent(user.id, "register", { source: "static-demo" });
  return { token, user: publicDemoUser(user) };
}

function demoLogin(body) {
  const email = normalizeDemoEmail(body.email);
  const password = String(body.password || "");
  const users = readDemoStore(DEMO_AUTH_KEYS.users, []);
  const user = users.find((item) => item.email === email);
  if (!user || user.password !== demoPassword(password)) throw new Error("邮箱或密码不正确");
  user.lastLoginAt = new Date().toISOString();
  writeDemoStore(DEMO_AUTH_KEYS.users, users);
  const token = createDemoSession(user.id);
  appendDemoEvent(user.id, "login", { source: "static-demo" });
  return { token, user: publicDemoUser(user) };
}

function demoLogout() {
  const token = state.auth.token;
  const sessions = readDemoStore(DEMO_AUTH_KEYS.sessions, []);
  writeDemoStore(DEMO_AUTH_KEYS.sessions, sessions.filter((session) => session.token !== token));
  return { ok: true };
}

function demoRequireUser() {
  const token = state.auth.token;
  const sessions = readDemoStore(DEMO_AUTH_KEYS.sessions, []);
  const session = sessions.find((item) => item.token === token && new Date(item.expiresAt).getTime() > Date.now());
  if (!session) throw new Error("登录已过期，请重新登录");
  const users = readDemoStore(DEMO_AUTH_KEYS.users, []);
  const user = users.find((item) => item.id === session.userId);
  if (!user) throw new Error("用户不存在");
  return publicDemoUser(user);
}

function demoGetProgress() {
  const user = demoRequireUser();
  const progress = readDemoStore(DEMO_AUTH_KEYS.progress, {});
  return { progress: progress[user.id] || null };
}

function demoSaveProgress(body) {
  const user = demoRequireUser();
  const progress = readDemoStore(DEMO_AUTH_KEYS.progress, {});
  const updatedAt = new Date().toISOString();
  progress[user.id] = { value: body.progress || {}, updatedAt };
  writeDemoStore(DEMO_AUTH_KEYS.progress, progress);
  appendDemoEvent(user.id, "progress_sync", {
    learnedCount: Object.values(body.progress?.records || {}).filter((record) => record?.learned).length,
    planBookId: body.progress?.plan?.bookId || ""
  });
  return { ok: true, updatedAt };
}

function demoSaveEvent(body) {
  const user = demoRequireUser();
  appendDemoEvent(user.id, String(body.type || "event"), body.payload || {});
  return { ok: true };
}

function demoMyAnalytics() {
  const user = demoRequireUser();
  const events = readDemoStore(DEMO_AUTH_KEYS.events, []).filter((event) => event.userId === user.id);
  return { analytics: buildDemoUserAnalytics(user, events) };
}

function demoAdminAnalytics() {
  demoRequireUser();
  const users = readDemoStore(DEMO_AUTH_KEYS.users, []);
  const events = readDemoStore(DEMO_AUTH_KEYS.events, []);
  const userRows = users.map((user) => buildDemoUserAnalytics(publicDemoUser(user), events.filter((event) => event.userId === user.id)));
  return {
    analytics: {
      totalUsers: users.length,
      totalEvents: events.length,
      activeUsersToday: new Set(events.filter((event) => event.day === todayKey()).map((event) => event.userId)).size,
      dailyActive: groupDemoEventsByDay(events),
      users: userRows.sort((a, b) => String(b.lastActiveAt || "").localeCompare(String(a.lastActiveAt || "")))
    }
  };
}

function buildDemoUserAnalytics(user, events) {
  return {
    user,
    totalEvents: events.length,
    activeDays: new Set(events.map((event) => event.day)).size,
    learnedWords: events.filter((event) => event.type === "word_completed" && event.payload?.taskType === "new").length,
    reviewedWords: events.filter((event) => event.type === "word_completed" && event.payload?.taskType !== "new").length,
    taskStarts: events.filter((event) => event.type === "task_started").length,
    lastActiveAt: events.at(-1)?.createdAt || user.lastLoginAt || user.createdAt,
    daily: groupDemoEventsByDay(events)
  };
}

function groupDemoEventsByDay(events) {
  const map = new Map();
  for (const event of events) {
    if (!map.has(event.day)) map.set(event.day, { day: event.day, events: 0, learnedWords: 0, reviews: 0, taskStarts: 0 });
    const row = map.get(event.day);
    row.events += 1;
    if (event.type === "word_completed" && event.payload?.taskType === "new") row.learnedWords += 1;
    if (event.type === "word_completed" && event.payload?.taskType !== "new") row.reviews += 1;
    if (event.type === "task_started") row.taskStarts += 1;
  }
  return [...map.values()].sort((a, b) => a.day.localeCompare(b.day));
}

function appendDemoEvent(userId, type, payload = {}) {
  const events = readDemoStore(DEMO_AUTH_KEYS.events, []);
  events.push({
    id: demoId(),
    userId,
    type,
    payload,
    day: todayKey(),
    createdAt: new Date().toISOString()
  });
  writeDemoStore(DEMO_AUTH_KEYS.events, events.slice(-5000));
}

function createDemoSession(userId) {
  const sessions = readDemoStore(DEMO_AUTH_KEYS.sessions, []);
  const token = `demo_${demoId()}`;
  sessions.push({
    token,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
  });
  writeDemoStore(DEMO_AUTH_KEYS.sessions, sessions.filter((item) => new Date(item.expiresAt).getTime() > Date.now()));
  return token;
}

function publicDemoUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };
}

function readDemoStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeDemoStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeDemoEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function demoPassword(password) {
  return btoa(unescape(encodeURIComponent(String(password || ""))));
}

function demoId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function loadRemoteProgress() {
  const data = await apiRequest("/api/progress");
  const remote = data.progress?.value;
  const remoteRecordCount = Object.keys(remote?.records || {}).length;
  const localRecordCount = Object.keys(state.progress.records || {}).length;
  const shouldUseRemote = remote?.plan && (!state.progress.plan || remoteRecordCount >= localRecordCount);
  if (shouldUseRemote) {
    state.progress = normalizeProgress(remote);
    localStorage.setItem("superWordV2", JSON.stringify(state.progress));
  } else {
    await syncProgress("login_sync");
  }
}

async function refreshAnalytics() {
  if (!state.auth.user) return;
  const [mine, admin] = await Promise.allSettled([
    apiRequest("/api/analytics/me"),
    apiRequest("/api/admin/analytics")
  ]);
  if (mine.status === "fulfilled") state.auth.analytics = mine.value.analytics;
  if (admin.status === "fulfilled") state.auth.adminAnalytics = admin.value.analytics;
}

function coverFor(book) {
  return coverMap[`${book.publisher}-${book.grade}`] || "";
}

function flattenWordbook(data) {
  const result = [];
  for (const publisher of data.publishers || []) {
    for (const grade of publisher.grades || []) {
      for (const unit of grade.units || []) {
        for (const [index, item] of (unit.words || []).entries()) {
          result.push({
            id: `${publisher.name}-${grade.name}-${unit.name}-${item.word}-${index}`,
            publisher: publisher.name,
            grade: grade.name,
            unit: unit.name,
            word: item.word,
            cn: item.cn,
            part: item.part,
            uk: item.phonetic?.uk || "",
            us: item.phonetic?.us || item.phonetic?.uk || "",
            chunks: item.chunks?.length ? item.chunks : splitWordIntoChunks(item.word),
            phonics: item.phonics || [],
            example: item.example || "",
            exampleCn: item.exampleCn || ""
          });
        }
      }
    }
  }
  return result;
}

function splitWordIntoChunks(text) {
  if (!/^[a-zA-Z][a-zA-Z'-]*$/.test(text)) return [text];
  const chunks = text.match(/[bcdfghjklmnpqrstvwxyz]*[aeiouy]+[bcdfghjklmnpqrstvwxyz]*/gi);
  return chunks?.length ? chunks : [text];
}

function loadProgress() {
  const fallback = {
    plan: null,
    importedBooks: {},
    assignments: {},
    records: {},
    completedToday: 0,
    today: todayKey()
  };
  try {
    const saved = JSON.parse(localStorage.getItem("superWordV2"));
    return normalizeProgress(saved || fallback);
  } catch {
    return fallback;
  }
}

function normalizeProgress(progress) {
  const normalized = {
    plan: progress.plan || null,
    importedBooks: progress.importedBooks || {},
    assignments: progress.assignments || {},
    records: progress.records || {},
    completedToday: progress.completedToday || 0,
    today: progress.today || todayKey()
  };
  if (normalized.today !== todayKey()) {
    normalized.today = todayKey();
    normalized.completedToday = 0;
  }
  return normalized;
}

function saveProgress() {
  state.progress = normalizeProgress(state.progress);
  localStorage.setItem("superWordV2", JSON.stringify(state.progress));
  scheduleProgressSync("progress_saved");
}

function seedDemoProgress() {
  const bookId = "外研版-八年级上";
  const demoPlan = {
    bookId,
    dailyCount: 2,
    steps: STEP_DEFS.map((step) => step.id),
    createdAt: todayKey(),
    demo: true
  };
  const demoWords = vocabulary.filter((item) => item.grade === "八年级上");
  const assigned = demoWords.slice(0, 2).map((word) => word.id);
  const intervals = [1, 2, 4, 7, 15, 30];
  const records = {};
  demoWords.slice(2, 8).forEach((word, index) => {
    const learnedAt = addDays(todayKey(), -intervals[index]);
    records[word.id] = {
      learned: true,
      firstLearned: learnedAt,
      lastLearned: learnedAt,
      reviewCount: 0,
      reviewedIntervals: []
    };
  });
  state.progress = normalizeProgress({
    plan: demoPlan,
    importedBooks: {
      [bookId]: {
        importedAt: todayKey(),
        count: demoWords.length
      }
    },
    assignments: {
      [`${todayKey()}|${bookId}|${demoPlan.dailyCount}`]: assigned
    },
    records,
    completedToday: 0,
    today: todayKey()
  });
  state.selectedBookId = bookId;
  state.screen = "tasks";
  saveProgress();
}

function todayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(fromText, toText = todayKey()) {
  const from = new Date(`${fromText}T00:00:00`);
  const to = new Date(`${toText}T00:00:00`);
  return Math.round((to - from) / 86400000);
}

function currentPlan() {
  return state.progress.plan;
}

function selectedBook() {
  const bookId = state.screen === "setup" ? state.selectedBookId : currentPlan()?.bookId || state.selectedBookId;
  return books.find((book) => book.id === bookId) || books[0];
}

function selectedWords() {
  return wordsForBook(selectedBook());
}

function wordsForBook(book) {
  const officialWords = vocabulary.filter((item) => item.publisher === book.publisher && item.grade === book.grade);
  if (officialWords.length) return officialWords;
  return vocabulary.filter((item) => !item.publisher && item.grade === book.grade);
}

// 仅返回词库中实际存在词条的版本，按主版本列表顺序排列。
// 真实词表异步加载完成前回退到完整版本列表，避免下拉为空。
function availablePublishers() {
  const present = new Set(vocabulary.filter((item) => item.publisher).map((item) => item.publisher));
  const inLibrary = publishers.filter((publisher) => present.has(publisher));
  return inLibrary.length ? inLibrary : publishers;
}

function planSteps() {
  return currentPlan()?.steps?.length ? currentPlan().steps : STEP_DEFS.map((step) => step.id);
}

function render() {
  state.progress = normalizeProgress(state.progress);
  if (!state.auth.ready) {
    app.innerHTML = `<section class="auth-shell"><div class="auth-card"><strong>正在连接用户服务...</strong></div></section>`;
    return;
  }
  if (!state.auth.user) {
    renderAuth();
    return;
  }
  if (!currentPlan()) {
    state.screen = "setup";
  }
  if (state.screen === "study") {
    renderStudy();
    return;
  }
  app.innerHTML = `
    <div class="app-frame">
      ${renderBrandPanel()}
      ${state.screen === "setup" ? renderSetup() : renderTasks()}
    </div>
  `;
  bindDynamicInputs();
}

function renderAuth() {
  const isRegister = state.authMode === "register";
  app.innerHTML = `
    <section class="auth-shell">
      <div class="auth-card">
        <div class="eyebrow">H5 User Center</div>
        <h1>初中词汇<br />超级单词表</h1>
        <p>注册登录后使用学习计划、七步学练和复习任务，系统会保留学习记录并生成活跃度数据。</p>
        ${state.auth.demoMode ? `<div class="auth-alert auth-alert-soft">当前为静态 demo 体验，数据保存在本机浏览器。</div>` : ""}
        ${!state.auth.demoMode && !state.auth.backendOnline ? `<div class="auth-alert">后端服务未连接，请使用 <code>node server.js</code> 启动 H5 后端，或继续使用静态 demo。</div>` : ""}
        ${state.auth.error ? `<div class="auth-alert">${escapeHtml(state.auth.error)}</div>` : ""}
        <form class="auth-form" data-auth-form="${isRegister ? "register" : "login"}">
          ${isRegister ? `<label>昵称<input class="input" name="name" autocomplete="name" placeholder="学生昵称" required /></label>` : ""}
          <label>邮箱<input class="input" name="email" type="email" autocomplete="email" placeholder="student@example.com" required /></label>
          <label>密码<input class="input" name="password" type="password" autocomplete="${isRegister ? "new-password" : "current-password"}" placeholder="至少 6 位" required /></label>
          <button class="primary-btn" type="submit" ${state.auth.busy ? "disabled" : ""}>${isRegister ? "注册并登录" : "登录"}</button>
        </form>
        <button class="ghost-btn auth-switch" data-action="${isRegister ? "showLogin" : "showRegister"}" type="button">
          ${isRegister ? "已有账号，去登录" : "没有账号，先注册"}
        </button>
      </div>
      <div class="auth-side">
        <div class="auth-metric"><strong>47</strong><span>官方教材册次</span></div>
        <div class="auth-metric"><strong>17,173</strong><span>校验后词条</span></div>
        <div class="auth-metric"><strong>1/2/4/7/15/30</strong><span>复习间隔</span></div>
      </div>
    </section>
  `;
}

// 学神星 IP 吉祥物：引用 index.html 中的共享 SVG 符号
function starMascot(size = 96, extraClass = "") {
  return `<svg class="ip-star ${extraClass}" width="${size}" height="${size}" aria-hidden="true"><use href="#ip-star" xlink:href="#ip-star"></use></svg>`;
}

// 学神等级：把已掌握词量映射为 R / SR / SSR 三阶成长，驱动养成动力
function studyLevel() {
  const learned = selectedWords().filter((word) => state.progress.records[word.id]?.learned).length;
  let rank = "R";
  let name = "见习学神";
  let floor = 0;
  let ceil = 100;
  if (learned >= 300) {
    rank = "SSR";
    name = "超级学神";
    floor = 300;
    ceil = Math.ceil((learned + 1) / 100) * 100;
  } else if (learned >= 100) {
    rank = "SR";
    name = "进阶学神";
    floor = 100;
    ceil = 300;
  }
  const progress = ceil > floor ? Math.min(100, Math.round(((learned - floor) / (ceil - floor)) * 100)) : 100;
  const remain = Math.max(0, ceil - learned);
  return { rank, name, learned, floor, ceil, progress, remain };
}

function renderBrandPanel() {
  const total = selectedWords().length;
  const learned = selectedWords().filter((word) => state.progress.records[word.id]?.learned).length;
  const due = getReviewGroups().reduce((sum, group) => sum + group.words.length, 0);
  return `
    <aside class="brand-panel">
      <div class="eyebrow">Junior English Vocabulary</div>
      <h1>初中词汇<br />超级单词表</h1>
      <p>覆盖初中主流教材与册次词书选择，支持每日计划和艾宾浩斯复习推荐。</p>
      ${(() => {
        const lv = studyLevel();
        return `
      <div class="level-card">
        ${starMascot(58)}
        <div class="level-meta">
          <strong>${lv.name} · ${lv.rank}</strong>
          <div class="level-bar"><i style="width:${lv.progress}%"></i></div>
          <span>${lv.rank === "SSR" ? `已掌握 ${lv.learned} 词 · 学神满阶 ✨` : `距下一阶还差 ${lv.remain} 词`}</span>
        </div>
      </div>`;
      })()}
      <div class="stat-grid">
        <div class="stat"><strong>${total}</strong><span>本书词汇</span></div>
        <div class="stat gold"><strong>${learned}</strong><span>已掌握</span></div>
        <div class="stat"><strong>${due}</strong><span>待复习</span></div>
      </div>
      <div class="account-card">
        <strong>${escapeHtml(state.auth.user?.name || "已登录")}</strong>
        <span>${escapeHtml(state.auth.user?.email || "")}</span>
        <small>${state.auth.demoMode ? "静态 demo 数据保存在本机" : (state.auth.lastSyncAt ? `最近同步 ${state.auth.lastSyncAt}` : "学习记录将自动同步")}</small>
        <div class="account-actions">
          <button class="secondary-btn" data-action="syncNow" type="button">同步</button>
          <button class="ghost-btn" data-action="logout" type="button">退出</button>
        </div>
      </div>
      <div class="side-actions">
        ${currentPlan() ? `
          <button class="primary-btn" data-action="showTasks" type="button">今日任务</button>
          <button class="secondary-btn" data-action="showSetup" type="button">重新选择单词书</button>
        ` : `
          <button class="secondary-btn" data-action="showSetup" type="button">选择单词书</button>
          <button class="secondary-btn" data-action="showTasks" type="button" disabled>今日任务</button>
        `}
        <button class="ghost-btn" data-action="resetProgress" type="button">清空学习记录</button>
      </div>
    </aside>
  `;
}

function renderSetup() {
  const libraryPublishers = new Set(availablePublishers());
  const filteredBooks = books.filter((book) => {
    const matchSystem = book.system === state.systemFilter;
    const matchGrade = state.gradeFilter === "全部" || book.grade === state.gradeFilter;
    const inLibrary = libraryPublishers.has(book.publisher);
    const matchPublisher = state.publisherFilter === "全部" || book.publisher === state.publisherFilter;
    return matchSystem && matchGrade && inLibrary && matchPublisher;
  });
  const plan = currentPlan() || {
    bookId: state.selectedBookId,
    dailyCount: 4,
    steps: STEP_DEFS.map((step) => step.id)
  };
  const selected = books.find((book) => book.id === state.selectedBookId) || books[0];
  const selectedCount = wordsForBook(selected).length;
  const imported = state.progress.importedBooks[state.selectedBookId];
  const activeTab = state.setupTab === "plan" ? "plan" : "book";
  const bookPanel = `
      <div class="section-head">
        <div>
          <h2>选择单词书</h2>
          <p>先选学制，再选教材版本和册次。</p>
        </div>
      </div>
      <div class="book-toolbar">
        <select class="select" id="systemFilter" aria-label="选择学制">
          ${systems.map((system) => `<option value="${system}" ${state.systemFilter === system ? "selected" : ""}>${system}</option>`).join("")}
        </select>
        <select class="select" id="gradeFilter" aria-label="选择年级册次">
          ${["全部", ...gradeSystems[state.systemFilter]].map((grade) => `<option value="${grade}" ${state.gradeFilter === grade ? "selected" : ""}>${grade}</option>`).join("")}
        </select>
        <select class="select" id="publisherFilter" aria-label="选择教材版本">
          ${["全部", ...availablePublishers()].map((publisher) => `<option value="${publisher}" ${state.publisherFilter === publisher ? "selected" : ""}>${publisher === "全部" ? "全部版本" : publisher}</option>`).join("")}
        </select>
      </div>

      <div class="import-card ${imported ? "is-imported" : ""}">
        <div>
          <strong>${imported ? "✓ 词表已导入" : "导入本书词表"}</strong>
          <p>${selected.title} · 可导入 ${selectedCount} 个核心词 · ${imported ? `导入时间 ${imported.importedAt}` : "导入后才能生成学习计划"}</p>
        </div>
        <button class="${imported ? "import-done-btn" : "primary-btn"}" data-action="importBook" type="button">
          ${imported ? "重新导入" : "导入"}
        </button>
      </div>

      <div class="book-grid">
        ${filteredBooks.map((book) => {
          const cover = coverFor(book);
          return `
          <button class="book-card ${state.selectedBookId === book.id ? "active" : ""}" data-book="${book.id}" type="button">
            <div class="book-cover">
              ${cover ? `<img src="${cover}" alt="${escapeHtml(book.title)} 封面" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()" />` : ""}
              <span class="cover-fallback">${book.publisher}<br />${book.grade}</span>
            </div>
            <div class="book-card-body">
              <strong>${book.title}</strong>
              <span>${book.subtitle} · ${book.units} 个单元</span>
              <span>英式 IPA + 美式 IPA · 七步学练</span>
            </div>
          </button>
        `;
        }).join("")}
      </div>`;
  const planPanel = `
      <div class="plan-card">
        <div class="section-head">
          <div>
            <h2>学习计划</h2>
            <p>设置每日新学数量，复习由艾宾浩斯曲线自动推荐。</p>
          </div>
        </div>
        ${selectedCount > 0 ? "" : `<p class="plan-hint">当前册次暂无可用词表，请在「选择单词书」中换一本。</p>`}
        <div class="range-row">
          <input id="dailyCount" type="range" min="2" max="20" step="1" value="${plan.dailyCount}" />
          <div class="daily-number" id="dailyCountText">${plan.dailyCount}</div>
        </div>
        <div class="section-head">
          <div>
            <h2>学练一体步骤设置</h2>
            <p>可选择启用步骤，默认七步全开。</p>
          </div>
        </div>
        <div class="steps-grid">
          ${STEP_DEFS.map((step) => `
            <button class="step-toggle ${plan.steps.includes(step.id) ? "active" : ""}" data-step-toggle="${step.id}" type="button">
              <span class="bubble">${step.label}</span>
            </button>
          `).join("")}
        </div>
        <div class="button-row">
          <button class="primary-btn" data-action="savePlan" type="button" ${selectedCount > 0 ? "" : "disabled"}>保存计划并生成今日任务</button>
          <button class="secondary-btn" data-action="selectAllSteps" type="button">七步全选</button>
        </div>
      </div>`;
  return `
    <section class="desk-panel">
      <div class="setup-tabs">
        <button class="setup-tab ${activeTab === "book" ? "active" : ""}" data-tab="book" type="button">选择单词书</button>
        <button class="setup-tab ${activeTab === "plan" ? "active" : ""}" data-tab="plan" type="button">学习计划</button>
      </div>
      ${activeTab === "book" ? bookPanel : planPanel}
    </section>
  `;
}

function renderTasks() {
  const tasks = getTodayTasks();
  const book = selectedBook();
  return `
    <section class="phone">
      <header class="phone-header">
        <button class="icon-button" data-action="showSetup" type="button" aria-label="返回选书">‹</button>
        <div class="phone-title">今日任务</div>
        <div class="header-icons">
          <button class="icon-button" data-action="showWordList" type="button" aria-label="单词列表">☰</button>
          <button class="icon-button" data-action="showSetup" type="button" aria-label="设置">⚙</button>
        </div>
      </header>
      <div class="phone-body">
        <div class="section-head">
          <div>
            <h2>${book.title}</h2>
            <p>每日新学 ${currentPlan().dailyCount} 个 · ${planSteps().length} 个学练步骤</p>
          </div>
          <span class="badge">复习逻辑 i</span>
        </div>
        <div class="task-list">
          ${renderTaskCard("new", "▣", `今日新学 (${tasks.newWords.length}/${currentPlan().dailyCount}词)`, `今天学习的 ${tasks.newWords.length} 个词汇需要进行今日新学。`, planSteps(), tasks.newWords.length ? "进行中" : "已完成")}
          ${renderTaskCard("deep", "▤", `任务一：深度复习 (${tasks.deep.length}词)`, reviewText(tasks.deep, "7/15/30 天"), ["listen", "read", "learn", "translate", "split", "spellread", "spell"], tasks.deep.length ? "可学习" : "待解锁", !tasks.deep.length)}
          ${renderTaskCard("solid", "▥", `任务二：巩固复习 (${tasks.solid.length}词)`, reviewText(tasks.solid, "2/4 天"), ["translate", "split", "spell"], tasks.solid.length ? "可学习" : "待解锁", !tasks.solid.length)}
          ${renderTaskCard("quick", "▦", `任务三：速刷复习 (${tasks.quick.length}词)`, reviewText(tasks.quick, "1 天"), ["translate"], tasks.quick.length ? "可学习" : "待解锁", !tasks.quick.length)}
        </div>
        ${renderAnalyticsPanel()}
        <div class="button-row" style="margin-top:18px">
          <button class="primary-btn" data-action="startTask" data-task="new" type="button" ${tasks.newWords.length ? "" : "disabled"}>开始学习</button>
          <button class="secondary-btn" data-action="showWordList" type="button">单词列表</button>
        </div>
        <div id="wordListMount"></div>
      </div>
    </section>
  `;
}

function renderAnalyticsPanel() {
  const mine = state.auth.analytics || {};
  const admin = state.auth.adminAnalytics || {};
  const latest = admin.dailyActive?.at(-1);
  return `
    <section class="analytics-panel">
      <div class="section-head">
        <div>
          <h2>数据留存观测</h2>
          <p>记录登录、选书、计划、学习完成和复习行为。</p>
        </div>
        <button class="secondary-btn" data-action="refreshAnalytics" type="button">刷新</button>
      </div>
      <div class="analytics-grid">
        <div><strong>${mine.activeDays || 0}</strong><span>我的活跃天数</span></div>
        <div><strong>${mine.learnedWords || 0}</strong><span>新学完成</span></div>
        <div><strong>${mine.reviewedWords || 0}</strong><span>复习完成</span></div>
        <div><strong>${admin.totalUsers || 0}</strong><span>注册用户</span></div>
        <div><strong>${admin.activeUsersToday || 0}</strong><span>今日活跃</span></div>
        <div><strong>${latest?.events || 0}</strong><span>今日事件</span></div>
      </div>
    </section>
  `;
}

function renderTaskCard(type, icon, title, desc, steps, badge, locked = false) {
  return `
    <article class="task-card">
      <div class="task-icon">${icon}</div>
      <div>
        <h3>${title}</h3>
        <p>${desc}</p>
        <div class="mini-steps">${steps.map((id) => `<span>${stepById(id).label}</span>`).join("")}</div>
      </div>
      <button class="badge ${locked ? "locked" : ""}" data-action="startTask" data-task="${type}" type="button" ${locked ? "disabled" : ""}>${badge}</button>
    </article>
  `;
}

function reviewText(words, range) {
  if (!words.length) return `${range}前学习的单词到期后会自动进入这里。`;
  return `${range}前学习的 ${words.length} 个词汇需要复习。`;
}

function getTodayTasks() {
  const plan = currentPlan();
  const assignedIds = getTodayAssignedIds(plan);
  const newWords = assignedIds
    .map((id) => selectedWords().find((word) => word.id === id))
    .filter((word) => word && !state.progress.records[word.id]?.learned);
  const groups = getReviewGroups();
  return {
    newWords,
    deep: groups.find((group) => group.type === "deep")?.words || [],
    solid: groups.find((group) => group.type === "solid")?.words || [],
    quick: groups.find((group) => group.type === "quick")?.words || []
  };
}

function assignmentKey(plan) {
  return `${todayKey()}|${plan.bookId}|${plan.dailyCount}`;
}

function getTodayAssignedIds(plan) {
  const key = assignmentKey(plan);
  if (!state.progress.assignments[key]) {
    state.progress.assignments[key] = selectedWords()
      .filter((word) => !state.progress.records[word.id]?.learned)
      .slice(0, plan.dailyCount)
      .map((word) => word.id);
    saveProgress();
  }
  return state.progress.assignments[key];
}

function getReviewGroups() {
  const dueWords = selectedWords().filter((word) => {
    const record = state.progress.records[word.id];
    return record?.learned && isDueForReview(record);
  });
  const deep = [];
  const solid = [];
  const quick = [];
  dueWords.forEach((word) => {
    const record = state.progress.records[word.id];
    const age = daysBetween(record.firstLearned);
    if (age >= 7) deep.push(word);
    else if (age >= 2) solid.push(word);
    else quick.push(word);
  });
  return [
    { type: "deep", words: deep },
    { type: "solid", words: solid },
    { type: "quick", words: quick }
  ];
}

function isDueForReview(record) {
  const age = daysBetween(record.firstLearned);
  const reviewed = record.reviewedIntervals || [];
  return REVIEW_INTERVALS.some((rule) => age >= rule.days && !reviewed.includes(rule.days));
}

function startTask(type) {
  const tasks = getTodayTasks();
  let wordsForTask = tasks.newWords;
  let steps = planSteps();
  if (type === "deep") {
    wordsForTask = tasks.deep;
    steps = REVIEW_INTERVALS[3].steps.filter((id) => planSteps().includes(id));
  }
  if (type === "solid") {
    wordsForTask = tasks.solid;
    steps = REVIEW_INTERVALS[1].steps.filter((id) => planSteps().includes(id));
  }
  if (type === "quick") {
    wordsForTask = tasks.quick;
    steps = ["translate"].filter((id) => planSteps().includes(id));
  }
  if (!wordsForTask.length) return;
  state.session = {
    type,
    words: wordsForTask,
    steps: steps.length ? steps : ["translate"],
    wordIndex: 0,
    stepIndex: 0
  };
  trackEvent("task_started", {
    taskType: type,
    bookId: currentPlan()?.bookId || "",
    wordCount: wordsForTask.length,
    steps
  });
  resetExerciseState();
  state.screen = "study";
  render();
}

function renderStudy() {
  const session = state.session;
  const word = session.words[session.wordIndex];
  const stepId = session.steps[session.stepIndex];
  const step = stepById(stepId);
  app.innerHTML = `
    <section class="study-shell">
      <div class="study-top">
        <button class="icon-button" data-action="exitStudy" type="button" aria-label="返回任务">‹</button>
        <div class="study-title">${session.type === "new" ? "今日新学" : "今日复习"} (${session.wordIndex + 1}/${session.words.length})</div>
        <div class="header-icons">
          <button class="icon-button" data-action="favorite" type="button" aria-label="收藏">☆</button>
          <button class="icon-button" data-action="showSetup" type="button" aria-label="设置">⚙</button>
        </div>
      </div>
      ${renderStepTrack(session)}
      <article class="learn-card">
        ${renderStepContent(stepId, word)}
        <p class="status-line ${state.statusType}" id="modeStatus">${state.status || step.desc}</p>
      </article>
      <div class="learn-actions">
        <button class="secondary-btn" data-action="prevStep" type="button">${session.stepIndex === 0 ? "上一个词" : "上一步"}</button>
        <button class="primary-btn" data-action="nextStep" type="button">${isLastStep() ? "完成本词" : "下一步"}</button>
      </div>
    </section>
  `;
}

function renderStepTrack(session) {
  const items = session.steps.map((id, index) => `
    <span class="track-step ${index === session.stepIndex ? "active" : index < session.stepIndex ? "done" : ""}">${stepById(id).label}</span>
    ${index < session.steps.length - 1 ? "<span class=\"track-line\"></span>" : ""}
  `).join("");
  return `<div class="step-track"><div class="track-group">${items}</div></div>`;
}

function renderStepContent(stepId, word) {
  if (stepId === "listen") return renderListenStep(word);
  if (stepId === "learn") return renderLearnStep(word);
  if (stepId === "read") return renderReadStep(word);
  if (stepId === "translate") return renderTranslateStep(word);
  if (stepId === "split") return renderSplitStep(word);
  if (stepId === "spellread") return renderSpellReadStep(word);
  if (stepId === "spell") return renderSpellStep(word);
  return "";
}

function renderWordDisplay(word) {
  const chunks = splitWordForColor(word);
  return `
    <div class="word-display">
      <div class="word"><span class="head">${chunks[0]}</span><span class="tail">${chunks[1]}</span></div>
      <div class="ipa-row">
        <span class="ipa-pill">英 ${word.uk}</span>
        <span class="ipa-pill">美 ${word.us}</span>
      </div>
      <div class="accent-row">
        <button class="accent-btn ${state.accent === "uk" ? "active" : ""}" data-accent="uk" type="button">英式发音</button>
        <button class="accent-btn ${state.accent === "us" ? "active" : ""}" data-accent="us" type="button">美式发音</button>
      </div>
    </div>
  `;
}

function renderListenStep(word) {
  return `
    <div class="teacher-stage">
      <span class="stage-rank">★ ${studyLevel().rank} 学神领读</span>
      <div>
        ${starMascot(118, "teacher-star")}
        <p style="margin-top:12px;font-weight:900">发音模式 1</p>
      </div>
    </div>
    ${renderWordDisplay(word)}
    <div class="meaning-line">${word.part} ${word.cn}</div>
    <div class="button-row" style="justify-content:center;margin-top:18px">
      <button class="primary-btn" data-action="playTriple" type="button">▶ 慢-中-快三遍</button>
      <button class="secondary-btn" data-action="playWord" type="button">单次播放</button>
    </div>
  `;
}

function renderLearnStep(word) {
  return `
    ${renderWordDisplay(word)}
    <div class="meaning-line">${word.part} ${word.cn}</div>
    <p class="hint-line">${selectedBook().title} · ${word.unit}</p>
    <hr class="divider" />
    <div class="example-card">
      <strong>${highlightWord(word.example, word.word)}</strong>
      <p>${word.exampleCn}</p>
      <div class="button-row" style="justify-content:center;margin-top:16px">
        <button class="secondary-btn" data-action="playExample" type="button">▶ 例句</button>
        <button class="secondary-btn" data-action="playWord" type="button">▶ 单词</button>
      </div>
    </div>
  `;
}

function renderReadStep(word) {
  return `
    <div class="teacher-stage">
      <span class="stage-rank">★ ${studyLevel().rank} 学神领读</span>
      <div>
        ${starMascot(118, "teacher-star")}
        <p style="margin-top:12px;font-weight:900">真人领读 · 跟读模式</p>
      </div>
    </div>
    ${renderWordDisplay(word)}
    <div class="button-row" style="justify-content:center;margin-top:18px">
      <button class="primary-btn" data-action="playWord" type="button">▶ 先听</button>
      <button class="secondary-btn" data-action="record" type="button">● 跟读</button>
      <button class="secondary-btn" data-action="markRead" type="button">✓ 我读对了</button>
    </div>
  `;
}

function renderTranslateStep(word) {
  const options = shuffle([word, ...shuffle(selectedWords().filter((item) => item.id !== word.id)).slice(0, 2)]);
  return `
    ${renderWordDisplay(word)}
    <hr class="divider" />
    <div class="answer-grid">
      ${options.map((item) => `
        <button class="answer-option" data-choice="${item.id}" type="button">${item.part} ${item.cn}</button>
      `).join("")}
    </div>
  `;
}

function renderSplitStep(word) {
  return `
    ${renderWordDisplay(word)}
    <div class="meaning-line">${word.part} ${word.cn}</div>
    <div class="button-row" style="justify-content:center;margin-top:18px">
      <button class="primary-btn" data-action="playChunks" type="button">拆分发音</button>
      <button class="secondary-btn" data-action="playWord" type="button">完整发音</button>
    </div>
    <hr class="divider" />
    <div class="chip-row">
      ${word.phonics.map((sound, index) => `<span class="sound-chip ${index === 0 ? "active" : ""}">${sound}</span>`).join("")}
    </div>
    <div class="example-card" style="margin-top:22px">
      <strong>词块：${word.chunks.join(" · ")}</strong>
      <p>先看词块，再连成完整发音。</p>
    </div>
  `;
}

function renderSpellReadStep(word) {
  const slots = word.chunks.map((chunk, index) => `<span class="slot ${state.pickedChunks[index] ? "" : "empty"}">${state.pickedChunks[index] || chunk}</span>`).join("");
  const options = shuffle(word.chunks.map((chunk, index) => ({ chunk, id: `${chunk}-${index}` })));
  return `
    <div class="chunk-word">${word.chunks.map((chunk) => `<span>${chunk}</span>`).join("<span>·</span>")}</div>
    <div class="meaning-line">${word.part} ${word.cn}</div>
    <hr class="divider" />
    <div class="slot-row">${slots}</div>
    <div class="chip-row" style="margin-top:28px">
      ${options.map((item) => `
        <button class="chunk-chip ${state.pickedChunks.includes(item.chunk) ? "active" : ""}" data-chunk="${item.chunk}" type="button">${item.chunk}</button>
      `).join("")}
    </div>
    <div class="button-row" style="justify-content:center;margin-top:22px">
      <button class="secondary-btn" data-action="clearChunks" type="button">重来</button>
      <button class="secondary-btn" data-action="hintChunk" type="button">提示</button>
    </div>
  `;
}

function renderSpellStep(word) {
  const letters = wordLetters(word);
  const slots = letters.map((letter, index) => `<span class="letter-slot ${state.pickedLetters[index] ? "" : "empty"}">${state.pickedLetters[index] || letter}</span>`).join("");
  return `
    <div class="teacher-stage" style="min-height:160px">
      <div>
        <div class="meaning-line" style="color:#fff">${word.part} ${word.cn}</div>
        <p style="margin-top:12px;font-weight:900">${state.accent === "uk" ? word.uk : word.us}</p>
      </div>
    </div>
    <div class="letter-slots">${slots}</div>
    ${renderKeyboard(word)}
    <div class="button-row" style="justify-content:center;margin-top:16px">
      <button class="secondary-btn" data-action="deleteLetter" type="button">⌫ 删除</button>
      <button class="secondary-btn" data-action="hintLetter" type="button">提示</button>
      <button class="danger-btn" data-action="clearLetters" type="button">清空</button>
    </div>
  `;
}

function renderKeyboard(word) {
  return `
    <div class="keyboard">
      ${qwertyRows.map((row) => `
        <div class="key-row">
          ${row.split("").map((letter) => {
            const enabled = canUseLetter(word, letter);
            return `<button class="key ${enabled ? "enabled" : ""}" data-key="${letter}" type="button" ${enabled ? "" : "disabled"}>${letter}</button>`;
          }).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function bindDynamicInputs() {
  const system = document.querySelector("#systemFilter");
  const grade = document.querySelector("#gradeFilter");
  const publisher = document.querySelector("#publisherFilter");
  const daily = document.querySelector("#dailyCount");
  system?.addEventListener("change", (event) => {
    state.systemFilter = event.target.value;
    // 切换学制后，若当前年级不属于新学制则重置为“全部”。
    if (state.gradeFilter !== "全部" && !gradeSystems[state.systemFilter].includes(state.gradeFilter)) {
      state.gradeFilter = "全部";
    }
    // 若已选单词书不属于新学制，自动切换到该学制下的第一本。
    const current = books.find((book) => book.id === state.selectedBookId);
    if (!current || current.system !== state.systemFilter) {
      const first = books.find((book) => book.system === state.systemFilter);
      if (first) state.selectedBookId = first.id;
    }
    render();
  });
  grade?.addEventListener("change", (event) => {
    state.gradeFilter = event.target.value;
    render();
  });
  publisher?.addEventListener("change", (event) => {
    state.publisherFilter = event.target.value;
    render();
  });
  daily?.addEventListener("input", (event) => {
    document.querySelector("#dailyCountText").textContent = event.target.value;
  });
}

app.addEventListener("click", (event) => {
  const tabButton = event.target.closest("[data-tab]");
  const bookButton = event.target.closest("[data-book]");
  const stepToggle = event.target.closest("[data-step-toggle]");
  const actionButton = event.target.closest("[data-action]");
  const accentButton = event.target.closest("[data-accent]");
  const choiceButton = event.target.closest("[data-choice]");
  const chunkButton = event.target.closest("[data-chunk]");
  const keyButton = event.target.closest("[data-key]");

  if (tabButton) {
    state.setupTab = tabButton.dataset.tab;
    render();
    return;
  }
  if (bookButton) {
    state.selectedBookId = bookButton.dataset.book;
    render();
    return;
  }
  if (stepToggle) {
    togglePlanStep(stepToggle.dataset.stepToggle);
    render();
    return;
  }
  if (accentButton) {
    state.accent = accentButton.dataset.accent;
    render();
    return;
  }
  if (choiceButton) {
    chooseTranslation(choiceButton);
    return;
  }
  if (chunkButton) {
    pickChunk(chunkButton.dataset.chunk);
    return;
  }
  if (keyButton) {
    pickLetter(keyButton.dataset.key);
    return;
  }
  if (!actionButton) return;
  handleAction(actionButton);
});

app.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-auth-form]");
  if (!form) return;
  event.preventDefault();
  submitAuthForm(form);
});

function handleAction(button) {
  const action = button.dataset.action;
  if (action === "showSetup") {
    state.screen = "setup";
    state.session = null;
    render();
  }
  if (action === "showTasks") {
    state.screen = "tasks";
    state.session = null;
    render();
  }
  if (action === "showRegister") {
    state.authMode = "register";
    state.auth.error = "";
    render();
  }
  if (action === "showLogin") {
    state.authMode = "login";
    state.auth.error = "";
    render();
  }
  if (action === "logout") logout();
  if (action === "syncNow") syncProgress("manual_sync").then(() => refreshAnalytics()).then(() => render());
  if (action === "refreshAnalytics") refreshAnalytics().then(() => render());
  if (action === "savePlan") savePlan();
  if (action === "importBook") importBook();
  if (action === "selectAllSteps") {
    ensureDraftPlan();
    state.progress.plan.steps = STEP_DEFS.map((step) => step.id);
    saveProgress();
    render();
  }
  if (action === "resetProgress") {
    localStorage.removeItem("superWordV2");
    state.progress = loadProgress();
    state.screen = "setup";
    render();
  }
  if (action === "startTask") startTask(button.dataset.task);
  if (action === "showWordList") toggleWordList();
  if (action === "exitStudy") {
    state.screen = "tasks";
    state.session = null;
    render();
  }
  if (action === "playWord") speak(currentWord().word);
  if (action === "playExample") speak(currentWord().example);
  if (action === "playTriple") playTriple(currentWord().word);
  if (action === "playChunks") playChunks(currentWord());
  if (action === "record") startRecognition();
  if (action === "markRead") setStatus("跟读完成，继续下一步。", "success");
  if (action === "prevStep") prevStep();
  if (action === "nextStep") nextStep();
  if (action === "clearChunks") {
    state.pickedChunks = [];
    setStatus("已清空词块。");
    render();
  }
  if (action === "hintChunk") hintChunk();
  if (action === "deleteLetter") {
    state.pickedLetters.pop();
    setStatus("已删除一个字母。");
    render();
  }
  if (action === "hintLetter") hintLetter();
  if (action === "clearLetters") {
    state.pickedLetters = [];
    setStatus("已清空拼写。");
    render();
  }
}

async function submitAuthForm(form) {
  const mode = form.dataset.authForm;
  const formData = new FormData(form);
  state.auth.busy = true;
  state.auth.error = "";
  render();
  try {
    const data = await apiRequest(mode === "register" ? "/api/auth/register" : "/api/auth/login", {
      method: "POST",
      body: {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password")
      }
    });
    state.auth.token = data.token;
    state.auth.user = data.user;
    localStorage.setItem("superWordToken", data.token);
    await loadRemoteProgress();
    await refreshAnalytics();
    trackEvent(mode === "register" ? "register_success" : "login_success", {});
  } catch (error) {
    state.auth.error = error.message;
  } finally {
    state.auth.busy = false;
    render();
  }
}

async function logout() {
  try {
    await apiRequest("/api/auth/logout", { method: "POST", body: {} });
  } catch {
    // Local logout still proceeds when the server is unreachable.
  }
  localStorage.removeItem("superWordToken");
  state.auth.token = "";
  state.auth.user = null;
  state.auth.analytics = null;
  state.auth.adminAnalytics = null;
  state.auth.error = "";
  state.screen = "setup";
  render();
}

async function syncProgress(reason = "auto_sync") {
  if (!state.auth.user || !state.auth.token) return;
  try {
    const data = await apiRequest("/api/progress", {
      method: "POST",
      body: { progress: state.progress, reason }
    });
    state.auth.lastSyncAt = (data.updatedAt || "").slice(11, 19);
  } catch (error) {
    state.auth.error = error.message;
  }
}

function scheduleProgressSync(reason) {
  if (!state.auth.user) return;
  window.clearTimeout(scheduleProgressSync.timer);
  scheduleProgressSync.timer = window.setTimeout(() => {
    syncProgress(reason).then(() => refreshAnalytics()).then(() => {
      if (state.screen === "tasks") render();
    });
  }, 350);
}

function trackEvent(type, payload = {}) {
  if (!state.auth.user || !state.auth.token) return;
  apiRequest("/api/events", {
    method: "POST",
    body: { type, payload }
  }).then(() => refreshAnalytics()).catch(() => {});
}

function ensureDraftPlan() {
  if (!state.progress.plan) {
    state.progress.plan = {
      bookId: state.selectedBookId,
      dailyCount: 4,
      steps: STEP_DEFS.map((step) => step.id),
      createdAt: todayKey()
    };
  }
}

function togglePlanStep(stepId) {
  ensureDraftPlan();
  const steps = state.progress.plan.steps;
  if (steps.includes(stepId)) {
    state.progress.plan.steps = steps.filter((id) => id !== stepId);
  } else {
    state.progress.plan.steps = STEP_DEFS.map((step) => step.id).filter((id) => [...steps, stepId].includes(id));
  }
  if (!state.progress.plan.steps.length) state.progress.plan.steps = [stepId];
  saveProgress();
}

function savePlan() {
  const dailyInput = document.querySelector("#dailyCount");
  const book = books.find((item) => item.id === state.selectedBookId) || books[0];
  if (wordsForBook(book).length === 0) return;
  // 未单独导入时，保存计划即自动导入该册词表，避免按钮被卡住。
  if (!state.progress.importedBooks[state.selectedBookId]) {
    state.progress.importedBooks[state.selectedBookId] = {
      importedAt: todayKey(),
      count: wordsForBook(book).length
    };
  }
  ensureDraftPlan();
  state.progress.plan.bookId = state.selectedBookId;
  state.progress.plan.dailyCount = Number(dailyInput?.value || state.progress.plan.dailyCount || 4);
  state.progress.plan.createdAt = state.progress.plan.createdAt || todayKey();
  saveProgress();
  trackEvent("plan_saved", {
    bookId: state.progress.plan.bookId,
    dailyCount: state.progress.plan.dailyCount,
    steps: state.progress.plan.steps
  });
  state.screen = "tasks";
  render();
}

function importBook() {
  const book = books.find((item) => item.id === state.selectedBookId) || books[0];
  state.progress.importedBooks[state.selectedBookId] = {
    importedAt: todayKey(),
    count: wordsForBook(book).length
  };
  saveProgress();
  trackEvent("book_imported", {
    bookId: state.selectedBookId,
    publisher: book.publisher,
    grade: book.grade,
    count: wordsForBook(book).length
  });
  render();
}

function toggleWordList() {
  const mount = document.querySelector("#wordListMount");
  if (!mount) return;
  if (mount.innerHTML.trim()) {
    mount.innerHTML = "";
    return;
  }
  mount.innerHTML = `
    <div class="word-list">
      ${selectedWords().map((word) => {
        const learned = state.progress.records[word.id]?.learned;
        return `
          <div class="word-row">
            <div><strong>${word.word}</strong><span>${word.uk} · ${word.part} ${word.cn}</span></div>
            <span>${learned ? "已学" : word.unit}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function currentWord() {
  return state.session?.words[state.session.wordIndex] || selectedWords()[0] || vocabulary[0];
}

function stepById(id) {
  return STEP_DEFS.find((step) => step.id === id) || STEP_DEFS[0];
}

function splitWordForColor(word) {
  const text = word.word;
  const mid = Math.max(1, Math.ceil(text.length / 2));
  return [text.slice(0, mid), text.slice(mid)];
}

function setStatus(text, type = "") {
  state.status = text;
  state.statusType = type;
  const node = document.querySelector("#modeStatus");
  if (node) {
    node.textContent = text;
    node.className = `status-line ${type}`;
  }
}

function resetExerciseState() {
  state.pickedChunks = [];
  state.pickedLetters = [];
  state.status = "";
  state.statusType = "";
  state.choiceAnswered = false;
}

function isLastStep() {
  const session = state.session;
  return session.stepIndex === session.steps.length - 1;
}

function prevStep() {
  const session = state.session;
  if (!session) return;
  if (session.stepIndex > 0) {
    session.stepIndex -= 1;
    resetExerciseState();
    render();
    return;
  }
  if (session.wordIndex > 0) {
    session.wordIndex -= 1;
    session.stepIndex = session.steps.length - 1;
    resetExerciseState();
    render();
  }
}

function nextStep() {
  const session = state.session;
  if (!session) return;
  if (!isLastStep()) {
    session.stepIndex += 1;
    resetExerciseState();
    render();
    return;
  }
  completeCurrentWord();
  if (session.wordIndex < session.words.length - 1) {
    session.wordIndex += 1;
    session.stepIndex = 0;
    resetExerciseState();
    render();
    return;
  }
  state.screen = "tasks";
  state.session = null;
  resetExerciseState();
  render();
}

function completeCurrentWord() {
  const word = currentWord();
  const today = todayKey();
  const existing = state.progress.records[word.id] || {};
  const record = {
    learned: true,
    firstLearned: existing.firstLearned || today,
    lastLearned: today,
    reviewCount: (existing.reviewCount || 0) + (state.session.type === "new" ? 0 : 1),
    reviewedIntervals: existing.reviewedIntervals || []
  };
  if (state.session.type !== "new") {
    const age = daysBetween(record.firstLearned);
    REVIEW_INTERVALS.forEach((rule) => {
      if (age >= rule.days && !record.reviewedIntervals.includes(rule.days)) {
        record.reviewedIntervals.push(rule.days);
      }
    });
  }
  state.progress.records[word.id] = record;
  if (state.session.type === "new") state.progress.completedToday += 1;
  saveProgress();
  trackEvent("word_completed", {
    taskType: state.session.type,
    bookId: currentPlan()?.bookId || "",
    wordId: word.id,
    word: word.word,
    unit: word.unit,
    reviewCount: record.reviewCount
  });
}

function chooseTranslation(button) {
  if (state.choiceAnswered) return;
  const word = currentWord();
  const correct = button.dataset.choice === word.id;
  state.choiceAnswered = true;
  document.querySelectorAll("[data-choice]").forEach((node) => {
    node.disabled = true;
    node.classList.toggle("correct", node.dataset.choice === word.id);
  });
  button.classList.toggle("wrong", !correct);
  setStatus(correct ? "释义选择正确。" : `不对，正确释义是：${word.part} ${word.cn}`, correct ? "success" : "error");
}

function pickChunk(chunk) {
  const word = currentWord();
  if (state.pickedChunks.length >= word.chunks.length) return;
  state.pickedChunks.push(chunk);
  const answer = state.pickedChunks.join("");
  const target = word.chunks.join("");
  if (state.pickedChunks.length === word.chunks.length) {
    const correct = answer === target;
    setStatus(correct ? "词块拼读正确。" : "词块顺序不对，再试一次。", correct ? "success" : "error");
    if (!correct) {
      setTimeout(() => {
        state.pickedChunks = [];
        render();
      }, 650);
    }
  } else {
    setStatus(`已选择：${state.pickedChunks.join(" · ")}`);
  }
  render();
}

function hintChunk() {
  const word = currentWord();
  const next = word.chunks[state.pickedChunks.length];
  if (next) pickChunk(next);
}

function wordLetters(word) {
  return word.word.toLowerCase().replace(/[^a-z]/g, "").split("");
}

function canUseLetter(word, letter) {
  const letters = wordLetters(word);
  const needed = letters.filter((item) => item === letter).length;
  const used = state.pickedLetters.filter((item) => item === letter).length;
  return needed > used;
}

function pickLetter(letter) {
  const word = currentWord();
  if (!canUseLetter(word, letter)) return;
  state.pickedLetters.push(letter);
  const answer = state.pickedLetters.join("");
  const target = wordLetters(word).join("");
  if (state.pickedLetters.length === target.length) {
    const correct = answer === target;
    setStatus(correct ? "拼写正确。" : `拼写不对：${answer}`, correct ? "success" : "error");
    if (!correct) {
      setTimeout(() => {
        state.pickedLetters = [];
        render();
      }, 700);
    }
  } else {
    setStatus(`当前拼写：${answer}`);
  }
  render();
}

function hintLetter() {
  const word = currentWord();
  const target = wordLetters(word);
  const next = target[state.pickedLetters.length];
  if (next) pickLetter(next);
}

function speak(text, rate = 0.86) {
  if (!("speechSynthesis" in window)) {
    setStatus("当前浏览器不支持发音播放。", "error");
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = state.accent === "uk" ? "en-GB" : "en-US";
  utter.rate = rate;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

function playTriple(text) {
  setStatus("正在播放：慢速、标准、快速。");
  [0.62, 0.86, 1.05].forEach((rate, index) => {
    setTimeout(() => speak(text, rate), index * 1300);
  });
}

function playChunks(word) {
  setStatus(`拆分发音：${word.chunks.join(" · ")}`);
  word.chunks.forEach((chunk, index) => {
    setTimeout(() => speak(chunk, 0.72), index * 850);
  });
}

function startRecognition() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    setStatus("当前浏览器不支持语音识别，可用“我读对了”继续。", "error");
    return;
  }
  const recognition = new Recognition();
  recognition.lang = state.accent === "uk" ? "en-GB" : "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  setStatus("正在听，请读出单词。");
  recognition.start();
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results[0]).map((item) => item.transcript.toLowerCase()).join(" ");
    const matched = transcript.split(/\s+/).some((item) => normalizeWord(item) === normalizeWord(currentWord().word));
    setStatus(matched ? `识别到：${transcript}，读对了。` : `识别到：${transcript}，可以再读一次。`, matched ? "success" : "error");
  };
  recognition.onerror = () => setStatus("语音识别失败，请检查麦克风权限或换用 Chrome。", "error");
}

function normalizeWord(text) {
  return text.toLowerCase().replace(/[^a-z]/g, "");
}

function highlightWord(sentence, word) {
  const pattern = new RegExp(`(${word})`, "ig");
  return escapeHtml(sentence).replace(pattern, "<span style=\"color:#2ba7d8\">$1</span>");
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

render();
