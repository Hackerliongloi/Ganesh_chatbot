// --- Ganesh Chaturthi AI Chatbot ---
// Offline-first "Blessing Mode" + optional OpenAI "Smart Mode"
(function () {
  const chat = document.getElementById("chat");
  const input = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const clearBtn = document.getElementById("clearBtn");
  const exportBtn = document.getElementById("exportBtn");
  const themeToggle = document.getElementById("themeToggle");
  const modeSelect = document.getElementById("modeSelect");
  const apiBox = document.getElementById("apiBox");
  const apiKeyEl = document.getElementById("apiKey");
  const modelEl = document.getElementById("model");

  // Basic theming
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle(
    "dark",
    localStorage.getItem("theme") === "dark" ||
      (prefersDark && !localStorage.getItem("theme"))
  );
  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  // Mode visibility
  modeSelect.addEventListener("change", () => {
    apiBox.classList.toggle("hidden", modeSelect.value !== "smart");
  });

  // Knowledge base (tiny & hand-curated for offline mode)
  const TEACHINGS = [
    {
      title: "Obstacle Remover",
      quote:
        "Before beginnings, remember me. I soften the hard road and teach patience.",
      tags: [
        "obstacle",
        "problem",
        "stuck",
        "blocked",
        "fail",
        "delay",
        "resistance",
      ],
    },
    {
      title: "Balance of Head and Heart",
      quote:
        "My large head asks you to think big; my small eyes teach you to focus; my big ears remind you to listen more.",
      tags: [
        "stress",
        "anxiety",
        "conflict",
        "decision",
        "listen",
        "focus",
        "overwhelm",
      ],
    },
    {
      title: "Letting Go",
      quote:
        "Like the mouse that carries me, carry only what you need. Offer the rest to time.",
      tags: ["overthink", "attachment", "breakup", "loss", "grief", "minimal"],
    },
    {
      title: "Start Small, Start Now",
      quote:
        "A modak is sweet because it is small and complete. Finish one small thing today.",
      tags: [
        "procrastination",
        "study",
        "exam",
        "work",
        "start",
        "habit",
        "discipline",
      ],
    },
    {
      title: "Gratitude",
      quote:
        "Bow your head before you raise a wish. Gratitude opens closed doors.",
      tags: ["gratitude", "thanks", "pray", "wish", "hope"],
    },
    {
      title: "Community",
      quote:
        "Invite others to share the aarti—joy multiplies when sung together.",
      tags: ["friends", "family", "lonely", "team", "community", "help"],
    },
  ];

  const MANTRAS = [
    "ॐ गं गणपतये नमः (Om Gam Ganapataye Namah)",
    "वक्रतुंड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
    "Shree Ganeshaya Namah — I welcome clarity and courage.",
  ];

  const OPENING =
    "🙏 I am 𝔊𝔞𝔫𝔢𝔰𝔥𝔞-bot. Share your prayer, worry, or question. In Blessing Mode I reply using curated teachings by 𝒊𝒊𝒊𝒕𝒅𝒎 𝒔𝒕𝒖𝒅𝒆𝒏𝒕𝒔.I can respond more deeply.";

  // --- UI helpers ---
  function addBubble(text, who = "bot") {
    const div = document.createElement("div");
    div.className = `bubble ${who}`;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }
  function addHTML(html, who = "bot") {
    const div = document.createElement("div");
    div.className = `bubble ${who}`;
    div.innerHTML = html;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function storeMessage(role, content) {
    const hist = JSON.parse(localStorage.getItem("gc_chat") || "[]");
    hist.push({ role, content, ts: Date.now() });
    localStorage.setItem("gc_chat", JSON.stringify(hist));
  }
  function loadHistory() {
    chat.innerHTML = "";
    const hist = JSON.parse(localStorage.getItem("gc_chat") || "[]");
    if (hist.length === 0) {
      addBubble(OPENING, "bot");
      storeMessage("bot", OPENING);
      return;
    }
    for (const m of hist) {
      addBubble(m.content, m.role === "user" ? "you" : "bot");
    }
  }

  // --- Blessing Mode logic ---
  const STOPWORDS = new Set(
    "the a and or to of in on at for with from is are be am i you me my your about what how can should would".split(
      " "
    )
  );
  function tokenize(s) {
    return s
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w && !STOPWORDS.has(w));
  }

  function scoreTeaching(text, teaching) {
    const toks = tokenize(text);
    let score = 0;
    for (const t of teaching.tags) {
      for (const w of toks) {
        if (w.startsWith(t.slice(0, 4))) score += 1; // loose match
      }
    }
    // reward title keywords
    for (const w of tokenize(teaching.title)) {
      if (toks.includes(w)) score += 0.5;
    }
    return score;
  }

  function blessingResponse(userText) {
    // choose teaching
    let best = TEACHINGS.map((t) => [t, scoreTeaching(userText, t)]).sort(
      (a, b) => b[1] - a[1]
    )[0];
    if (!best || best[1] <= 0) {
      // fallback: general comfort + mantra
      return [
        "I hear you. Breathe slowly with me for three breaths.",
        "Remember: obstacles are teachers in disguise.",
        "Try repeating: " + MANTRAS[Math.floor(Math.random() * MANTRAS.length)],
      ].join("\n\n");
    }
    const [teach, s] = best;
    const tip = nextStepSuggestion(userText, teach.title);
    const mantra = MANTRAS[Math.floor(Math.random() * MANTRAS.length)];
    return `**${teach.title}**\n\n${teach.quote}\n\nNext small step: ${tip}\n\nMantra: ${mantra}`;
  }

  function nextStepSuggestion(text, theme) {
    const t = theme.toLowerCase();
    if (t.includes("start"))
      return "Write a 10‑minute checklist and complete just the first item.";
    if (t.includes("obstacle"))
      return "Name the obstacle in one sentence, then write one action that reduces it by 1% and do it now.";
    if (t.includes("balance"))
      return "Listen to someone you trust for 2 minutes without planning your reply, then summarise what you heard.";
    if (t.includes("letting"))
      return "Place one worry on paper, fold it, and set it aside. You’ll revisit it tomorrow.";
    if (t.includes("community"))
      return "Send a short message asking for help or offering help to a friend.";
    return "Drink water, stretch, and pick one task you can finish in 10 minutes.";
  }

  // --- Smart Mode (OpenAI) ---
  async function smartResponse(userText) {
    const apiKey =
      "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";
    if (!apiKey) {
      throw new Error("API key required for Smart Mode");
    }
    const model = "gpt-4o-mini";
    const systemPrompt =
      "You are a kind, culturally respectful Ganesh Chaturthi guide. Offer practical steps and short blessings from Ganesha's perspective. Keep replies under 180 words and include an optional mantra line. Avoid medical or legal claims.";
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText },
    ];
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({ model, messages, temperature: 0.6 }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error("API error: " + txt);
    }
    const data = await resp.json();
    return (data.choices?.[0]?.message?.content?.trim().replace(/\*/g, "") || "I could not form a reply.");
  }

  // --- Event handlers ---
  async function handleSend() {
  speechSynthesis.cancel(); // stop previous speech
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    addBubble(text, "you");
    storeMessage("user", text);

    try {
      let reply;
      if (modeSelect.value === "smart") {
        addBubble("Thinking (Smart Mode)…", "bot");
        reply = await smartResponse(text);
        chat.lastChild.textContent = reply;
      } else {
        reply = blessingResponse(text);
        // render markdown-like bold and line breaks
        addHTML(
          reply
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br>"),
          "bot"
        );
      }
      storeMessage("bot", reply.replace(/<[^>]*>/g, ""));
    speak(reply.replace(/\*\*(.*?)\*\*/g, "$1"));
    } catch (err) {
      addBubble("⚠️ " + err.message, "bot");
      storeMessage("bot", "Error: " + err.message);
    }
  }

  sendBtn.addEventListener("click", handleSend);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  });

  clearBtn.addEventListener("click", () => {
    localStorage.removeItem("gc_chat");
    loadHistory();
  });

  exportBtn.addEventListener("click", () => {
    const hist = JSON.parse(localStorage.getItem("gc_chat") || "[]");
    const lines = hist.map(
      (m) =>
        `[${new Date(m.ts).toLocaleString()}] ${m.role.toUpperCase()}: ${
          m.content
        }`
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ganesha_chat_export.txt";
    a.click();
  });

  
// === Voice Setup ===
const micBtn = document.getElementById("micBtn");
const voiceToggle = document.getElementById("voiceToggle");
let voiceEnabled = true;

// Speech Recognition (input)
let recognition;
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "en-IN"; // Indian English accent
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    handleSend();
  };

  recognition.onerror = (err) => {
    console.error("Speech recognition error:", err);
  };
}

micBtn.addEventListener("click", () => {
  if (recognition) {
    recognition.start();
  } else {
    alert("Speech Recognition not supported in this browser");
  }
});


const stopBtn = document.getElementById("stopBtn");
stopBtn.addEventListener("click", () => {
  speechSynthesis.cancel();
});

// Speech Synthesis (output)
function speak(text) {
  if (!voiceEnabled) return;
  speechSynthesis.cancel(); // stop any ongoing speech before starting new
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  utterance.pitch = 0.8;
  utterance.rate = 0.9;
  const voices = speechSynthesis.getVoices();
  const indianVoice = voices.find(v => v.lang === "en-IN" || v.name.includes("India"));
  if (indianVoice) utterance.voice = indianVoice;
  speechSynthesis.speak(utterance);
}

voiceToggle.addEventListener("click", () => {
  voiceEnabled = !voiceEnabled;
  voiceToggle.textContent = voiceEnabled ? "🔊" : "🔇";
});

// Show/hide API box on load based on stored mode
  apiBox.classList.toggle("hidden", modeSelect.value !== "smart");

  // Initial message
  loadHistory();
})();
