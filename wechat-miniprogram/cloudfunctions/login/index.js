const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async () => {
  const { OPENID, UNIONID } = cloud.getWXContext();
  const now = new Date();
  const users = db.collection("users");
  const found = await users.where({ openid: OPENID }).limit(1).get();

  if (found.data.length) {
    const user = found.data[0];
    await users.doc(user._id).update({
      data: {
        lastLoginAt: now,
        loginCount: db.command.inc(1)
      }
    });
    return { userId: user._id, openid: OPENID, unionid: UNIONID || user.unionid || "", isNew: false };
  }

  const created = await users.add({
    data: {
      openid: OPENID,
      unionid: UNIONID || "",
      registeredAt: now,
      lastLoginAt: now,
      loginCount: 1,
      profile: {},
      status: "active"
    }
  });

  return { userId: created._id, openid: OPENID, unionid: UNIONID || "", isNew: true };
};
