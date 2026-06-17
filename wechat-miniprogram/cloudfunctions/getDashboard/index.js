const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async () => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const start = new Date(now);
  start.setDate(start.getDate() - 6);
  const startDay = start.toISOString().slice(0, 10);

  const [activeRes, eventRes] = await Promise.all([
    db.collection("daily_active").where({
      day: db.command.gte(startDay)
    }).limit(1000).get(),
    db.collection("events").where({
      day: db.command.gte(startDay)
    }).limit(1000).get()
  ]);

  const activeUsers = new Set(activeRes.data.map((item) => item.openid));
  const eventMap = {};
  let todayEvents = 0;
  let wordComplete = 0;

  eventRes.data.forEach((item) => {
    eventMap[item.type] = (eventMap[item.type] || 0) + 1;
    if (item.day === today) todayEvents += 1;
    if (item.type === "word_complete") wordComplete += 1;
  });

  return {
    metrics: {
      dau7: activeUsers.size,
      todayEvents,
      wordComplete
    },
    events: Object.keys(eventMap).map((type) => ({ type, count: eventMap[type] }))
  };
};
