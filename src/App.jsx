import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are ExcelCoach, a friendly Excel tutor. Teach Excel clearly with practical examples, real cell references, and step-by-step instructions.`;

const TOPICS = [
  { icon: "∑", label: "SUM & Math", prompt: "Teach me SUM, AVERAGE, MIN, MAX in Excel with examples." },
  { icon: "🔍", label: "VLOOKUP", prompt: "Explain VLOOKUP step by step with a practical example." },
  { icon: "🎯", label: "IF Statements", prompt: "How do IF statements work in Excel? Show me examples." },
  { icon: "📊", label: "Pivot Tables", prompt: "How do I create a Pivot Table in Excel?" },
  { icon: "⚡", label: "Shortcuts", prompt: "What are the most useful Excel keyboard shortcuts?" },
  { icon: "🛠", label: "Fix Errors", prompt: "Explain Excel errors like #VALUE! #REF! #DIV/0! and fixes." },
  { icon: "🔗", label: "INDEX/MATCH", prompt: "Teach me INDEX/MATCH and why it beats VLOOKUP." },
  { icon: "🎨", label: "Conditional Format", prompt: "How do I use Conditional Formatting in Excel?" },
];

export default function App() {
  const [step, setStep] = useState("key");
  const [apiKey, setApiKey] = useState(localStorage.getItem("or_key") || "");
const [step, setStep] = useState(localStorage.getItem("or_key") ? "chat" : "key");
  const [keyInput, setKeyInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hi! I'm ExcelCoach — your free AI Excel tutor!\n\nAsk me anything or tap a topic below to start learning!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSetKey() {
    const k = keyInput.trim();
    if (k.length < 10) { setError("Please enter a valid API key"); return; }
    localStorage.setItem("or_key", k);
    setApiKey(k);
    setStep("chat");
    setError("");
  }

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    const updated = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://excelcoach.vercel.app",
          "X-Title": "ExcelCoach",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct:free",
          max_tokens: 800,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...updated,
          ],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.choices?.[0]?.message?.content || "No response received.";
      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch (err) {
      setError("Error: " + err.message);
      setMessages([...updated, { role: "assistant", content: "⚠️ " + err.message }]);
    } finally {
      setLoading(false);
    }
  }

  const s = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a, #0c2340)",
      fontFamily: "sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
    },
    card: {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 20, padding: "40px 28px",
      maxWidth: 400, width: "100%", textAlign: "center", margin: "auto",
    },
    input: {
      width: "100%", padding: "12px 14px",
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: 10, color: "#f1f5f9",
      fontSize: "0.9rem", outline: "none",
      boxSizing: "border-box", marginBottom: 10,
    },
    btn: {
      width: "100%", padding: 12,
      background: "linear-gradient(135deg, #217346, #2ecc71)",
      border: "none", borderRadius: 10,
      color: "#fff", fontSize: "0.95rem",
      fontWeight: 600, cursor: "pointer",
    },
  };

  if (step === "key") return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ fontSize: 50, marginBottom: 14 }}>📗</div>
        <h1 style={{ color: "#f1f5f9", margin: "0 0 6px" }}>ExcelCoach</h1>
        <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0 0 24px" }}>
          Free AI Excel tutor — powered by OpenRouter
        </p>
        <input
          style={s.input}
          type="password"
          placeholder="Paste your OpenRouter key (sk-or-...)"
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSetKey()}
        />
        {error && <p style={{ color: "#f87171", fontSize: "0.8rem", margin: "0 0 10px" }}>{error}</p>}
        <button style={s.btn} onClick={handleSetKey}>Start Learning →</button>
        <p style={{ color: "#475569", fontSize: "0.72rem", marginTop: 14 }}>
          Get free key at <a href="https://openrouter.ai" target="_blank" rel="noreferrer" style={{ color: "#4ade80" }}>openrouter.ai</a>
        </p>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={{ width: "100%", maxWidth: 720, padding: "18px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, fontSize: 20,
            background: "linear-gradient(135deg, #217346, #2ecc71)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>📗</div>
          <div>
            <h1 style={{ margin: 0, color: "#f1f5f9", fontSize: "1.2rem" }}>ExcelCoach</h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.72rem" }}>AI Excel tutor • Free</p>
          </div>
          <span style={{
            marginLeft: "auto", background: "rgba(33,115,70,0.15)",
            border: "1px solid rgba(33,115,70,0.3)", borderRadius: 20,
            padding: "3px 10px", fontSize: "0.7rem", color: "#4ade80",
          }}>● Live</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {TOPICS.map(t => (
            <button key={t.label} onClick={() => sendMessage(t.prompt)} disabled={loading}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20, padding: "4px 11px",
                color: "#cbd5e1", fontSize: "0.74rem", cursor: "pointer",
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        width: "100%", maxWidth: 720, flex: 1,
        padding: "0 16px", display: "flex",
        flexDirection: "column", gap: 10,
        overflowY: "auto", maxHeight: "calc(100vh - 250px)",
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex", gap: 8, alignItems: "flex-end",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
          }}>
            {m.role === "assistant" && (
              <div style={{
                width: 26, height: 26, borderRadius: "50%", fontSize: 12, flexShrink: 0,
                background: "linear-gradient(135deg, #217346, #2ecc71)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>📗</div>
            )}
            <div style={{
              maxWidth: "80%", padding: "10px 14px",
              background: m.role === "user"
                ? "linear-gradient(135deg, #1d6440, #217346)"
                : "rgba(255,255,255,0.06)",
              border: m.role === "user"
                ? "1px solid rgba(33,115,70,0.4)"
                : "1px solid rgba(255,255,255,0.08)",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              color: m.role === "user" ? "#f0fdf4" : "#cbd5e1",
              fontSize: "0.88rem", lineHeight: 1.6, whiteSpace: "pre-wrap",
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", fontSize: 12,
              background: "linear-gradient(135deg, #217346, #2ecc71)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>📗</div>
            <div style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px 16px 16px 4px",
              padding: "12px 16px", display: "flex", gap: 4,
            }}>
              {[0,1,2].map(d => (
                <div key={d} style={{
                  width: 6, height: 6, borderRadius: "50%", background: "#4ade80",
                  animation: "bounce 1.2s infinite", animationDelay: `${d*0.2}s`,
                }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{ width: "100%", maxWidth: 720, padding: "10px 16px 18px" }}>
        <div style={{
          display: "flex", gap: 8,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12, padding: "7px 7px 7px 14px",
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask about any Excel formula or tip..."
            disabled={loading}
            style={{
              flex: 1, background: "transparent", border: "none",
              outline: "none", color: "#f1f5f9", fontSize: "0.88rem",
            }}
          />
          <button onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              width: 36, height: 36, borderRadius: 8, border: "none",
              background: input.trim() && !loading
                ? "linear-gradient(135deg, #217346, #2ecc71)"
                : "rgba(255,255,255,0.08)",
              color: "#fff", fontSize: 15, cursor: "pointer",
            }}>➤</button>
        </div>
      </div>
      <style>{`
        @keyframes bounce {
          0%,60%,100%{transform:translateY(0);opacity:0.4}
          30%{transform:translateY(-5px);opacity:1}
        }
      `}</style>
    </div>
  );
            }
