// static/chatbot.js
(function () {

  /* ===============================
     DOM REFERENCES
  =============================== */
  const chatMessages = document.getElementById("chatMessages");
  const chatInput    = document.getElementById("chatInput");
  const chatSend     = document.getElementById("chatSend");
  const micBtn       = document.getElementById("micBtn");
  const waveform     = document.getElementById("waveform");

  if (!chatMessages || !chatInput || !chatSend) {
    console.warn("Chatbot DOM elements missing");
    return;
  }

  /* ===============================
     SEND BUTTON STATE
  =============================== */
  function updateSendState() {
    chatSend.disabled = chatInput.value.trim() === "";
  }
  chatInput.addEventListener("input", updateSendState);
  updateSendState();

  /* ===============================
     CHAT UI HELPERS
  =============================== */
  function addMessage(text, sender) {
    const div = document.createElement("div");
    div.className = sender;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    hideTyping();
    const div = document.createElement("div");
    div.className = "typing";
    div.id = "typingIndicator";
    div.textContent = "Bot is typing...";
    chatMessages.appendChild(div);
  }

  function hideTyping() {
    const t = document.getElementById("typingIndicator");
    if (t) t.remove();
  }

  function hasAny(q, words) {
    return words.some(w => q.includes(w));
  }
  function getChatbotMode() {
    const modeFromWindow = String(window.ChatbotMode || "").toLowerCase();
    if (modeFromWindow) return modeFromWindow;

    const modeFromDataset = String(document.body?.dataset?.chatMode || "").toLowerCase();
    if (modeFromDataset) return modeFromDataset;

    return String(localStorage.getItem("chatbotMode") || "chat").toLowerCase();
  }


  /* ===============================
     BOT RESULT RESET
  =============================== */
  function clearBotResult() {
    const botResult = document.getElementById("botResult");
    if (!botResult) return null;

    botResult.innerHTML = "";

    const botPanel = document.createElement("div");
    botPanel.id = "dashboardContainer";
    botResult.appendChild(botPanel);

    const chartGrid = document.createElement("div");
    chartGrid.className = "chart-grid";
    botResult.appendChild(chartGrid);

    return { botPanel, chartGrid };
  }
  
  /* ===============================
     CHATBOT INTELLIGENCE
  =============================== */
  function chatbotReply(question) {
    question = question.toLowerCase();

    const fileUploaded = !!window.ChatbotKnowledge?.columns?.length;
    const chatbotMode = getChatbotMode();
    const isFileUploadMode = chatbotMode === "file" || chatbotMode === "file-upload";

    /* GREETING */
    if (hasAny(question, ["hi", "hello", "hey"])) {
      return "Hello 👋 Ask about attendance, marks, gender or results.";
    }

    if (isFileUploadMode && !fileUploaded) {
      return "Please upload file";
    }

    if (hasAny(question, ["upload", "file upload", "upload file", "csv", "import file"])) {
      location.hash = "upload";
      return "Please upload your file in the Upload page.";
    }

    /* GENDER */
    if (hasAny(question, ["gender", "male", "female"])) {
      if (!fileUploaded) return "Please upload file";
      const ctx = clearBotResult();
      Table.renderDashboard();
      Charting.renderGenderChartsAuto(ctx.chartGrid);
      return "Here is the gender distribution 👇";
    }

    /* MARKS */
    if (hasAny(question, ["mark", "marks", "score", "percentage"])) {
      if (!fileUploaded) return "Please upload file";
      const ctx = clearBotResult();

      if (hasAny(question, ["low", "poor"])) {
        Charting.renderLow6ChartsAuto(ctx.chartGrid);
        return "Here are students with low marks 👇";
      }

      if (hasAny(question, ["top", "high", "best"])) {
        Charting.renderTop6ChartsAuto(ctx.chartGrid);
        return "Here are students with top marks 👇";
      }

      Table.renderDashboard();
      Charting.renderMarksChartsAuto(ctx.chartGrid);
      return "Here is the marks analysis 👇";
    }

    /* ATTENDANCE */
    if (hasAny(question, ["attend","attendance", "present"])) {
      if (!fileUploaded) return "Please upload file";
      const ctx = clearBotResult();

      if (hasAny(question, ["low", "poor"])) {
        Charting.renderLowestAttendanceChartsAuto(ctx.chartGrid);
        return "Here are students with low attendance 👇";
      }

      if (hasAny(question, ["top", "high"])) {
        Charting.renderHighestAttendanceChartsAuto(ctx.chartGrid);
        return "Here are students with high attendance 👇";
      }

      Table.renderNameAttendance("dashboardContainer");
      Charting.renderAttendanceChartsAuto(ctx.chartGrid);
      return "Here is the attendance analysis 👇";
    }

    /* RESULT */
    if (hasAny(question, ["result", "pass", "fail"])) {
      if (!fileUploaded) return "Please upload file";
      const ctx = clearBotResult();
      Table.renderDashboard();
      Charting.renderResultChartsAuto(ctx.chartGrid);
      return "Here is the result analysis 👇";
    }

    return "Sorry, I didn’t understand that.";
  }

  /* ===============================
     SEND MESSAGE
  =============================== */
  chatSend.onclick = () => {
    const q = chatInput.value.trim();
    if (!q) return;

    addMessage(q, "user");
    chatInput.value = "";
    updateSendState();

    showTyping();

    setTimeout(() => {
      hideTyping();
      const reply = chatbotReply(q);
      addMessage(reply, "bot");
    }, 500);
  };

  /* ENTER KEY SEND */
  chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatSend.click();
    }
  });

  /* ===============================
     VOICE INPUT (AUTO LANGUAGE)
  =============================== */

  let recognition = null;
  let isListening = false;
  
  function detectLang() {
    const lang = navigator.language || "en-US";
    if (lang.startsWith("ta")) return "ta-IN";
    if (lang.startsWith("hi")) return "hi-IN";
    return "en-US";
  }
  
  if ("webkitSpeechRecognition" in window && micBtn && waveform) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
  
    // ▶ START MIC (MIC BUTTON)
    micBtn.onclick = () => {
      recognition.lang = detectLang();
      recognition.start();
  
      isListening = true;
  
      micBtn.classList.add("hidden");      // hide mic
      waveform.classList.remove("hidden"); // show wave
    };
  
    // ⏹ STOP MIC (WAVE CLICK)
    waveform.onclick = () => {
      if (!isListening) return;
  
      recognition.stop();
  
      isListening = false;
  
      waveform.classList.add("hidden");    // hide wave
      micBtn.classList.remove("hidden");   // show mic
    };
  
    // VOICE RESULT
    recognition.onresult = (e) => {
      chatInput.value = e.results[0][0].transcript;
      updateSendState();
    };
  
    // AUTO STOP (silence / permission)
    recognition.onend = () => {
      isListening = false;
  
      waveform.classList.add("hidden");
      micBtn.classList.remove("hidden");
  
      // optional auto-send
      if (chatInput.value.trim()) {
        chatSend.click();
      }
    };
  
    recognition.onerror = () => {
      isListening = false;
      waveform.classList.add("hidden");
      micBtn.classList.remove("hidden");
    };
  }
  

  

})();
