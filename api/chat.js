/**
 * chat.js — Profylift AI Chatbot
 * Handles all chatbot logic. Drop this in your project and include it
 * with <script src="chat.js" defer></script> before </body>.
 */

(function () {
  "use strict";

  /* ── State ── */
  let isWaiting = false; // prevent double-sends

  /* ── DOM refs (resolved after DOMContentLoaded) ── */
  let messagesEl, inputEl;

  /* ── Init ── */
  document.addEventListener("DOMContentLoaded", () => {
    messagesEl = document.getElementById("chat-messages");
    inputEl    = document.getElementById("userInput");

    if (!messagesEl || !inputEl) return; // chatbot not on this page

    /* Toggle open/close */
    const btn = document.getElementById("chatbot-btn");
    const box = document.getElementById("chatbox");
    if (btn && box) {
      btn.addEventListener("click", () => {
        const isOpen = box.style.display === "flex";
        box.style.display = isOpen ? "none" : "flex";
        if (!isOpen) inputEl.focus();
      });
    }

    /* Send on Enter (no shift) */
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMsg();
      }
    });

    /* Send on button click — exposed globally for the onclick="" in HTML */
    window.sendMsg = sendMsg;
  });

  /* ── Core send function ── */
  async function sendMsg() {
    if (!inputEl || !messagesEl) return;

    const text = inputEl.value.trim();
    if (!text || isWaiting) return; // guard against empty / concurrent sends

    isWaiting = true;
    inputEl.value = "";
    inputEl.disabled = true;

    /* Show user bubble */
    appendBubble(text, "user");

    /* Show typing indicator */
    const typingId = showTyping();

    let reply;
    try {
      reply = await callAPI(text);
    } catch (err) {
      reply = "Something went wrong. Try again or reach us on WhatsApp!";
    }

    removeTyping(typingId);
    appendBubble(reply, "bot");

    inputEl.disabled = false;
    inputEl.focus();
    isWaiting = false;
  }

  /* ── API call ── */
  async function callAPI(message) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("API error:", errData);
      throw new Error("API returned " + res.status);
    }

    const data = await res.json();
    return data.reply || "Got it! Anything else?";
  }

  /* ── UI helpers ── */
  function appendBubble(text, role) {
    const wrap = document.createElement("div");
    wrap.style.cssText = [
      "display:flex",
      role === "user" ? "justify-content:flex-end" : "justify-content:flex-start",
      "margin-bottom:8px",
    ].join(";");

    const bubble = document.createElement("div");
    bubble.style.cssText = [
      "max-width:82%",
      "padding:8px 12px",
      "border-radius:" + (role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px"),
      "font-size:13px",
      "line-height:1.5",
      "word-break:break-word",
      role === "user"
        ? "background:#d8b15b;color:#000;font-weight:500"
        : "background:rgba(255,255,255,.08);color:rgba(255,255,255,.88);border:1px solid rgba(255,255,255,.10)",
    ].join(";");

    // Render newlines + basic markdown-ish line breaks
    bubble.innerHTML = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");

    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const id = "typing-" + Date.now();
    const wrap = document.createElement("div");
    wrap.id = id;
    wrap.style.cssText = "display:flex;justify-content:flex-start;margin-bottom:8px;";

    const bubble = document.createElement("div");
    bubble.style.cssText = [
      "padding:10px 14px",
      "border-radius:14px 14px 14px 4px",
      "background:rgba(255,255,255,.06)",
      "border:1px solid rgba(255,255,255,.10)",
      "display:flex;gap:5px;align-items:center",
    ].join(";");

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("span");
      dot.style.cssText = [
        "width:6px;height:6px;border-radius:50%",
        "background:rgba(216,177,91,.7)",
        "display:inline-block",
        "animation:typingBounce 1.2s ease-in-out infinite",
        "animation-delay:" + (i * 0.2) + "s",
      ].join(";");
      bubble.appendChild(dot);
    }

    /* Inject keyframes once */
    if (!document.getElementById("typing-style")) {
      const style = document.createElement("style");
      style.id = "typing-style";
      style.textContent = `
        @keyframes typingBounce {
          0%,60%,100% { transform: translateY(0); opacity:.5 }
          30%          { transform: translateY(-5px); opacity:1 }
        }
      `;
      document.head.appendChild(style);
    }

    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return id;
  }

  function removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
})();
