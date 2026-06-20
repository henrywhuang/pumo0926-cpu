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

const state = {
  screen: "tasks",
  systemFilter: "六三制",
  gradeFilter: "全部",
  bookQuery: "",
  selectedBookId: books[0].id,
  accent: "us",
  session: null,
  pickedChunks: [],
  pickedLetters: [],
  status: "",
  statusType: "",
  choiceAnswered: false,
  progress: loadProgress()
};

const app = document.querySelector("#app");
if (state.progress.plan?.bookId) state.selectedBookId = state.progress.plan.bookId;
if (new URLSearchParams(window.location.search).get("demo") === "1") seedDemoProgress();
loadRealWordbook();

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

function planSteps() {
  return currentPlan()?.steps?.length ? currentPlan().steps : STEP_DEFS.map((step) => step.id);
}

function render() {
  state.progress = normalizeProgress(state.progress);
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

function renderBrandPanel() {
  const total = selectedWords().length;
  const learned = selectedWords().filter((word) => state.progress.records[word.id]?.learned).length;
  const due = getReviewGroups().reduce((sum, group) => sum + group.words.length, 0);
  return `
    <aside class="brand-panel">
      <div class="eyebrow">Junior English Vocabulary</div>
      <h1>初中词汇<br />超级单词表</h1>
      <p>覆盖初中主流教材与册次词书选择，支持每日计划和艾宾浩斯复习推荐。</p>
      <div class="stat-grid">
        <div class="stat"><strong>${total}</strong><span>本书词汇</span></div>
        <div class="stat"><strong>${learned}</strong><span>已学</span></div>
        <div class="stat"><strong>${due}</strong><span>待复习</span></div>
      </div>
      <div class="side-actions">
        <button class="secondary-btn" data-action="showSetup" type="button">选择单词书</button>
        <button class="secondary-btn" data-action="showTasks" type="button" ${currentPlan() ? "" : "disabled"}>今日任务</button>
        <button class="ghost-btn" data-action="resetProgress" type="button">清空学习记录</button>
      </div>
    </aside>
  `;
}

function renderSetup() {
  const filteredBooks = books.filter((book) => {
    const matchSystem = book.system === state.systemFilter;
    const matchGrade = state.gradeFilter === "全部" || book.grade === state.gradeFilter;
    const text = `${book.title} ${book.subtitle}`.toLowerCase();
    return matchSystem && matchGrade && text.includes(state.bookQuery.trim().toLowerCase());
  });
  const plan = currentPlan() || {
    bookId: state.selectedBookId,
    dailyCount: 4,
    steps: STEP_DEFS.map((step) => step.id)
  };
  const selected = books.find((book) => book.id === state.selectedBookId) || books[0];
  const selectedCount = wordsForBook(selected).length;
  const imported = state.progress.importedBooks[state.selectedBookId];
  return `
    <section class="desk-panel">
      <div class="section-head">
        <div>
          <h2>选择单词书</h2>
          <p>先选学制，再选教材版本和册次，最后设置每天新学几个单词。</p>
        </div>
      </div>
      <div class="book-toolbar">
        <select class="select" id="systemFilter" aria-label="选择学制">
          ${systems.map((system) => `<option value="${system}" ${state.systemFilter === system ? "selected" : ""}>${system}</option>`).join("")}
        </select>
        <select class="select" id="gradeFilter" aria-label="选择年级册次">
          ${["全部", ...gradeSystems[state.systemFilter]].map((grade) => `<option value="${grade}" ${state.gradeFilter === grade ? "selected" : ""}>${grade}</option>`).join("")}
        </select>
        <input class="input" id="bookSearch" value="${escapeHtml(state.bookQuery)}" placeholder="搜索：人教版 / 外研版 / 八年级上" />
      </div>
      <div class="book-grid">
        ${filteredBooks.map((book) => `
          <button class="book-card ${state.selectedBookId === book.id ? "active" : ""}" data-book="${book.id}" type="button">
            <strong>${book.title}</strong>
            <span>${book.subtitle} · ${book.units} 个单元</span>
            <span>英式 IPA + 美式 IPA · 七步学练</span>
          </button>
        `).join("")}
      </div>

      <div class="import-card">
        <div>
          <strong>${imported ? "词表已导入" : "导入本书词表"}</strong>
          <p>${selected.title} · 可导入 ${selectedCount} 个核心词 · ${imported ? `导入时间 ${imported.importedAt}` : "导入后才能生成学习计划"}</p>
        </div>
        <button class="${imported ? "secondary-btn" : "primary-btn"}" data-action="importBook" type="button">
          ${imported ? "重新导入" : "导入"}
        </button>
      </div>

      <hr class="divider" />

      <div class="plan-card">
        <div class="section-head">
          <div>
            <h2>学习计划</h2>
            <p>设置每日新学数量，复习由艾宾浩斯曲线自动推荐。</p>
          </div>
        </div>
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
          <button class="primary-btn" data-action="savePlan" type="button" ${imported ? "" : "disabled"}>保存计划并生成今日任务</button>
          <button class="secondary-btn" data-action="selectAllSteps" type="button">七步全选</button>
        </div>
      </div>
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
        <div class="button-row" style="margin-top:18px">
          <button class="primary-btn" data-action="startTask" data-task="new" type="button" ${tasks.newWords.length ? "" : "disabled"}>开始学习</button>
          <button class="secondary-btn" data-action="showWordList" type="button">单词列表</button>
        </div>
        <div id="wordListMount"></div>
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
      <div>
        <div class="teacher-avatar">AI</div>
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
      <div>
        <div class="teacher-avatar">领</div>
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
  const search = document.querySelector("#bookSearch");
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
  search?.addEventListener("input", (event) => {
    state.bookQuery = event.target.value;
    render();
  });
  daily?.addEventListener("input", (event) => {
    document.querySelector("#dailyCountText").textContent = event.target.value;
  });
}

app.addEventListener("click", (event) => {
  const bookButton = event.target.closest("[data-book]");
  const stepToggle = event.target.closest("[data-step-toggle]");
  const actionButton = event.target.closest("[data-action]");
  const accentButton = event.target.closest("[data-accent]");
  const choiceButton = event.target.closest("[data-choice]");
  const chunkButton = event.target.closest("[data-chunk]");
  const keyButton = event.target.closest("[data-key]");

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
  if (!state.progress.importedBooks[state.selectedBookId]) return;
  ensureDraftPlan();
  state.progress.plan.bookId = state.selectedBookId;
  state.progress.plan.dailyCount = Number(dailyInput?.value || state.progress.plan.dailyCount || 4);
  state.progress.plan.createdAt = state.progress.plan.createdAt || todayKey();
  saveProgress();
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
