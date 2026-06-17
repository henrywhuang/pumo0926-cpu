const app = getApp();

const steps = [
  { id: "listen", label: "听", enabled: true },
  { id: "learn", label: "学", enabled: true },
  { id: "read", label: "读", enabled: true },
  { id: "translate", label: "译", enabled: true },
  { id: "split", label: "拆分", enabled: true },
  { id: "spellread", label: "拼读", enabled: true },
  { id: "spell", label: "拼写", enabled: true }
];

const books = [
  { id: "外研版-八年级上", title: "外研版 八年级上", grade: "八年级上" },
  { id: "人教版-七年级上", title: "人教版 七年级上", grade: "七年级上" },
  { id: "译林版-七年级下", title: "译林版 七年级下", grade: "七年级下" }
];

const vocab = [
  { id: "surprise", word: "surprise", cn: "惊讶；使惊讶", part: "n./v.", grade: "八年级上", uk: "/səˈpraɪz/", us: "/sərˈpraɪz/", chunks: ["sur", "prise"] },
  { id: "wonderful", word: "wonderful", cn: "精彩的", part: "adj.", grade: "八年级上", uk: "/ˈwʌndəfl/", us: "/ˈwʌndərfl/", chunks: ["won", "der", "ful"] },
  { id: "activity", word: "activity", cn: "活动", part: "n.", grade: "八年级上", uk: "/ækˈtɪvəti/", us: "/ækˈtɪvəti/", chunks: ["ac", "tiv", "i", "ty"] },
  { id: "welcome", word: "welcome", cn: "欢迎", part: "v.", grade: "七年级上", uk: "/ˈwelkəm/", us: "/ˈwelkəm/", chunks: ["wel", "come"] }
];

Page({
  data: {
    books,
    selectedBook: books[0],
    imported: false,
    dailyCount: 2,
    steps,
    wordCount: 0,
    newWords: [],
    review: { quick: [], solid: [], deep: [] }
  },

  onLoad() {
    app.track("page_view", { page: "home" });
    this.refresh();
  },

  refresh() {
    const words = this.wordsForBook();
    const learned = wx.getStorageSync("learned") || {};
    const newWords = words.filter((item) => !learned[item.id]).slice(0, this.data.dailyCount);
    this.setData({
      wordCount: words.length,
      newWords,
      review: this.reviewGroups(words, learned)
    });
  },

  wordsForBook() {
    return vocab.filter((item) => item.grade === this.data.selectedBook.grade);
  },

  onBookChange(event) {
    const selectedBook = books[Number(event.detail.value)];
    this.setData({ selectedBook, imported: false });
    app.track("select_book", { bookId: selectedBook.id });
    this.refresh();
  },

  importBook() {
    this.setData({ imported: true });
    app.track("import_book", { bookId: this.data.selectedBook.id, count: this.data.wordCount });
    wx.showToast({ title: "导入成功" });
  },

  onDailyChange(event) {
    this.setData({ dailyCount: event.detail.value });
    this.refresh();
  },

  toggleStep(event) {
    const id = event.currentTarget.dataset.id;
    const next = this.data.steps.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item);
    if (next.every((item) => !item.enabled)) return;
    this.setData({ steps: next });
  },

  savePlan() {
    const plan = {
      bookId: this.data.selectedBook.id,
      dailyCount: this.data.dailyCount,
      steps: this.data.steps.filter((item) => item.enabled).map((item) => item.id)
    };
    wx.setStorageSync("plan", plan);
    app.track("save_plan", plan);
    wx.showToast({ title: "计划已保存" });
  },

  startStudy() {
    const plan = wx.getStorageSync("plan") || {};
    wx.setStorageSync("sessionWords", this.data.newWords);
    wx.setStorageSync("sessionSteps", plan.steps || steps.map((item) => item.id));
    app.track("start_study", { count: this.data.newWords.length });
    wx.navigateTo({ url: "/pages/study/study?type=new" });
  },

  reviewGroups(words, learned) {
    const today = new Date();
    const diff = (dateText) => Math.floor((today - new Date(`${dateText}T00:00:00`)) / 86400000);
    const quick = [];
    const solid = [];
    const deep = [];
    words.forEach((word) => {
      const record = learned[word.id];
      if (!record) return;
      const days = diff(record.firstLearned);
      if ([1].includes(days)) quick.push(word);
      if ([2, 4].includes(days)) solid.push(word);
      if ([7, 15, 30].includes(days)) deep.push(word);
    });
    return { quick, solid, deep };
  }
});
