const app = getApp();

const labels = {
  listen: "听",
  learn: "学",
  read: "读",
  translate: "译",
  split: "拆分",
  spellread: "拼读",
  spell: "拼写"
};

Page({
  data: {
    type: "new",
    words: [],
    steps: [],
    displaySteps: [],
    wordIndex: 0,
    stepIndex: 0,
    current: null,
    step: "",
    stepName: "",
    letters: [],
    lastStep: false
  },

  onLoad(query) {
    const words = wx.getStorageSync("sessionWords") || [];
    const steps = wx.getStorageSync("sessionSteps") || ["listen", "learn", "read", "translate", "split", "spellread", "spell"];
    this.setData({
      type: query.type || "new",
      words,
      steps,
      displaySteps: steps.map((id) => ({ id, label: labels[id] || id }))
    });
    this.refresh();
    app.track("study_page_view", { type: query.type || "new", count: words.length });
  },

  stepLabel(id) {
    return labels[id] || id;
  },

  refresh() {
    const current = this.data.words[this.data.wordIndex];
    const step = this.data.steps[this.data.stepIndex];
    this.setData({
      current,
      step,
      stepName: labels[step] || step,
      letters: current ? current.word.split("") : [],
      lastStep: this.data.stepIndex === this.data.steps.length - 1
    });
  },

  playTriple() {
    wx.showToast({ title: "播放三遍", icon: "none" });
    app.track("play_audio", { word: this.data.current.word, mode: "triple" });
  },

  markStepDone() {
    app.track("step_done", { word: this.data.current.word, step: this.data.step });
  },

  prevStep() {
    if (this.data.stepIndex > 0) {
      this.setData({ stepIndex: this.data.stepIndex - 1 });
      this.refresh();
    }
  },

  nextStep() {
    this.markStepDone();
    if (!this.data.lastStep) {
      this.setData({ stepIndex: this.data.stepIndex + 1 });
      this.refresh();
      return;
    }
    this.completeWord();
    if (this.data.wordIndex < this.data.words.length - 1) {
      this.setData({ wordIndex: this.data.wordIndex + 1, stepIndex: 0 });
      this.refresh();
      return;
    }
    wx.navigateBack();
  },

  completeWord() {
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const learned = wx.getStorageSync("learned") || {};
    learned[this.data.current.id] = learned[this.data.current.id] || {
      learned: true,
      firstLearned: date,
      lastLearned: date
    };
    learned[this.data.current.id].lastLearned = date;
    wx.setStorageSync("learned", learned);
    wx.cloud.callFunction({
      name: "syncProgress",
      data: { wordId: this.data.current.id, record: learned[this.data.current.id] }
    });
    app.track("word_complete", { word: this.data.current.word, type: this.data.type });
  }
});
