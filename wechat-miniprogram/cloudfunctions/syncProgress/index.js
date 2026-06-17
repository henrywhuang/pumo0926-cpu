const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const now = new Date();
  const wordId = String(event.wordId || "");
  const record = event.record || {};
  if (!wordId) return { ok: false, error: "missing_word_id" };

  const progress = db.collection("progress");
  const found = await progress.where({ openid: OPENID, wordId }).limit(1).get();
  const data = {
    openid: OPENID,
    wordId,
    record,
    updatedAt: now
  };

  if (found.data.length) {
    await progress.doc(found.data[0]._id).update({ data });
    return { ok: true, updated: true };
  }

  await progress.add({
    data: {
      ...data,
      createdAt: now
    }
  });
  return { ok: true, created: true };
};
