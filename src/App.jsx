import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are ExcelCoach, a friendly and expert Excel tutor. Your job is to teach Excel in a clear, practical way.

You help users with:
- Excel formulas and functions (SUM, VLOOKUP, INDEX/MATCH, IF, COUNTIF, SUMIF, etc.)
- Data analysis techniques (pivot tables, charts, conditional formatting)
- Shortcuts and productivity tips
- Troubleshooting formula errors (#VALUE!, #REF!, #DIV/0!, etc.)
- Best practices for spreadsheet design

Response style:
- Be concise but thorough. Use examples with real cell references (e.g., =SUM(A1:A10)).
- When showing formulas, wrap them in backticks like \`=VLOOKUP(A2,B:C,2,0)\`
- Use numbered steps for multi-step processes
- Always offer a quick example when explaining a formula
- End with a tip or a follow-up question to keep learning going

Keep responses focused on Excel.`;

const LESSON_TOPICS = [
  { icon: "∑", label: "SUM & Basic Math", prompt: "Teach me the basic math formulas in Excel: SUM, AVERAGE, MIN, MAX with examples." },
  { icon: "🔍", label: "VLOOKUP", prompt: "Explain VLOOKUP step by step with a practical example." },
  { icon: "🎯", label: "IF Statements", prompt: "How do IF statements work in Excel? Show me simple and nested IF examples." },
  { icon: "📊", label: "Pivot Tables", prompt: "How do I create a Pivot Table in Excel? Walk me through it." },
  { icon: "⚡", label: "Shortcuts", prompt: "What are the most useful Excel keyboard shortcuts I should know?" },
  { icon: "🛠", label: "Fix Errors", prompt: "Explain common Excel errors like #VALUE!, #REF!, #DIV/0! and how to fix them." },
  { icon: "🔗", label: "INDEX/MATCH", prompt: "Teach me INDEX/MATCH and why it's better than VLOOKUP." },
  { icon: "🎨", label: "Conditional Format", prompt: "How do I use Conditional Formatting to highlight data in Excel?" },
];

function formatMessage(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    const formatted = parts.map((part, j) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={j} style={{
            background: "#1e3a5f", color: "#7dd3fc",
            padding: "2px 7px", borderRadius: "4px",
            fontFamily: "'Courier New', monospace",
            fontSize: "0.88em", fontWeight: 600,
          }}>{part.slice(1, -1)}</code>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j} style={{ color: "#e2e8f0" }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return <span key={i}>{formatted}{i < lines.length - 1 ? <br /> : null}</span>;
  });
}

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [apiKeySet, setApiKeySet] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hey there! I'm ExcelCoach — your personal Excel tutor.\n\nAsk me anything about Excel formulas, functions, pivot tables, shortcuts, and more. Or pick a lesson topic below to get started!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSetApiKey() {
    if (apiKeyInput.trim().startsWith("sk-ant-")) {
      setApiKey(apiKeyInput.trim());
      setApiKeySet(true);
    } else {
      alert("Invalid API key. It should start with sk-ant-");
    }
  }

  async function sendMessage(userText) {
    if (!userText.trim() || loading) return;
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.map((c) => c.text || "").join("\n") || "Sorry, I couldn't get a response.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ Something went wrong. Check your API key and try again." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  if (!apiKeySet) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #0c2340 60%, #0f172a 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', 'Segoe UI', sans-serif", padding: 20,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20, padding: "40px 32px",
          maxWidth: 420, width: "100%", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📗</div>
          <h1 style={{ color: "#f1f5f9", fontSize: "1.5rem", margin: "0 0 8px", fontWeight: 700 }}>
            ExcelCoach
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0 0 28px" }}>
            Enter your Anthropic API key to start learning Excel with AI
          </p>
          <input
            type="password"
            placeholder="sk-ant-..."
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSetApiKey()}
            style={{
              width: "100%", padding: "12px 16px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, color: "#f1f5f9",
              fontSize: "0.9rem", outline: "none",
              boxSizing: "border-box", marginBottom: 12,
              fontFamily: "monospace",
            }}
          />
          <button onClick={handleSetApiKey} style={{
            width: "100%", padding: "12px",
            background: "linear-gradient(135deg, #217346, #2ecc71)",
            border: "none", borderRadius: 10,
            color: "#fff", fontSize: "0.95rem",
            fontWeight: 600, cursor: "pointer",
          }}>
            Start Learning →
          </button>
          <p style={{ color: "#475569", fontSize: "0.75rem", marginTop: 16 }}>
            Get a free API key at{" "}
            <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
              style={{ color: "#4ade80" }}>console.anthropic.com</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #0c2340 60%, #0f172a 100%)",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{ width: "100%", maxWidth: 760, padding: "24px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 42, height: 42,
            background: "linear-gradient(135deg, #217346, #2ecc71)",
            borderRadius: 10, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 22,
            boxShadow: "0 4px 14px rgba(33,115,70,0.4)",
          }}>📗</div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "#f1f5f9" }}>ExcelCoach</h1>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>AI-powered Excel tutor</p>
          </div>
          <div style={{
            marginLeft: "auto",
            background: "rgba(33,115,70,0.15)",
            border: "1px solid rgba(33,115,70,0.3)",
            borderRadius: 20, padding: "4px 12px",
            fontSize: "0.72rem", color: "#4ade80", fontWeight: 600,
          }}>● Live</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, margin: "16px 0 12px" }}>
          {LESSON_TOPICS.map((topic) => (
            <button key={topic.label} onClick={() => sendMessage(topic.prompt)} disabled={loading}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20, padding: "5px 13px",
                color: "#cbd5e1", fontSize: "0.76rem", fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 5,
                opacity: loading ? 0.5 : 1,
              }}>
              <span>{topic.icon}</span>{topic.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        width: "100%", maxWidth: 760, flex: 1,
        padding: "0 20px", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 16,
        minHeight: 340, maxHeight: "calc(100vh - 280px)",
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            alignItems: "flex-end", gap: 8,
          }}>
            {msg.role === "assistant" && (
              <div style={{
                width: 30, height: 30, flexShrink: 0,
                background: "linear-gradient(135deg, #217346, #2ecc71)",
                borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 14, marginBottom: 2,
              }}>📗</div>
            )}
            <div style={{
              maxWidth: "78%",
              background: msg.role === "user"
                ? "linear-gradient(135deg, #1d6440, #217346)"
                : "rgba(255,255,255,0.06)",
              border: msg.role === "user"
                ? "1px solid rgba(33,115,70,0.5)"
                : "1px solid rgba(255,255,255,0.08)",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "12px 16px",
              color: msg.role === "user" ? "#f0fdf4" : "#cbd5e1",
              fontSize: "0.9rem", lineHeight: 1.65,
            }}>
              {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{
              width: 30, height: 30, flexShrink: 0,
              background: "linear-gradient(135deg, #217346, #2ecc71)",
              borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>📗</div>
            <div style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "18px 18px 18px 4px",
              padding: "14px 18px", display: "flex", gap: 5, alignItems: "center",
            }}>
              {[0, 1, 2].map(d => (
                <div key={d} style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#4ade80", animation: "bounce 1.2s infinite",
                  animationDelay: `${d * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ width: "100%", maxWidth: 760, padding: "14px 20px 24px" }}>
        <div style={{
          display: "flex", gap: 10,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14, padding: "8px 8px 8px 16px",
        }}>
          <textarea
            ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a formula, function, or Excel tip..."
            disabled={loading} rows={1}
            style={{
              flex: 1, background: "transparent", border: "none",
              outline: "none", color: "#f1f5f9", fontSize: "0.9rem",
              resize: "none", lineHeight: 1.5, padding: "6px 0",
              fontFamily: "inherit",
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: input.trim() && !loading
                ? "linear-gradient(135deg, #217346, #2ecc71)"
                : "rgba(255,255,255,0.08)",
              border: "none",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, flexShrink: 0, alignSelf: "flex-end", marginBottom: 1,
            }}>
            {loading ? "⏳" : "➤"}
          </button>
        </div>
        <p style={{ textAlign: "center", color: "#334155", fontSize: "0.7rem", margin: "8px 0 0" }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        textarea::placeholder { color: #475569; }
      `}</style>
    </div>
  );
}
