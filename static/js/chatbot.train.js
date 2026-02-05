// static/chatbot.train.js


(function () {

  window.ChatbotKnowledge = {};

  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function trainChatbot() {
    if (!Array.isArray(window.records) || !window.records.length) return;

    const columns = window.columns || [];

    const normalizedColumns = columns.map(c => ({
      original: c,
      norm: normalize(c)
    }));

    // store knowledge
    window.ChatbotKnowledge = {
      rows: records.length,
      columns,
      normalizedColumns
    };

    console.log("🤖 Chatbot trained with columns:", columns);
  }

  // expose
  window.trainChatbot = trainChatbot;

})();
