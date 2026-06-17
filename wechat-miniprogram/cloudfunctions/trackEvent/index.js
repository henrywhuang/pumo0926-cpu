const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const now = new Date();
  const type = String(event.type || "unknown");
  const payload = event.payload || {};
  const day = now.toISOString().slice(0, 10);

  await db.collection("events").add({
    data: {
      openid: OPENID,
      type,
      payload,
      day,
      createdAt: now
    }
  });

  await db.collection("daily_active").where({ openid: OPENID, day }).get().then(async (res) => {
    if (res.data.length) {
      await db.collection("daily_active").doc(res.data[0]._id).update({
        data: {
          lastActiveAt: now,
          eventCount: db.command.inc(1)
        }
      });
    } else {
      await db.collection("daily_active").add({
        data: {
          openid: OPENID,
          day,
          firstActiveAt: now,
          lastActiveAt: now,
          eventCount: 1
        }
      });
    }
  });

  return { ok: true };
};
