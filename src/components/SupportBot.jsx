import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { MessageCircle, X, Send } from "lucide-react";

const SupportBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await api.get("/support/my");
      if (res.data?.success) {
        setMessages(res.data.messages || []);
      }
    } catch {}
  };

  useEffect(() => {
    if (open) fetchMessages();
  }, [open]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);

      const res = await api.post("/support/message", {
        message: message.trim(),
      });

      if (res.data?.success) {
        setMessage("");
        fetchMessages();
      }
    } catch {
      alert("Message send failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[9999] h-14 w-14 rounded-full bg-[#FCD535] text-black shadow-2xl flex items-center justify-center"
      >
        <MessageCircle size={26} />
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[9999] w-[340px] max-w-[calc(100vw-24px)] bg-[#11151c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#0b0e11] px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-sm">Support Chat</h3>
              <p className="text-xs text-slate-500">Admin se baat karein</p>
            </div>

            <button onClick={() => setOpen(false)} className="text-slate-400">
              <X size={18} />
            </button>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.length > 0 ? (
              messages.map((item) => (
                <div
                  key={item._id}
                  className={`flex ${
                    item.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      item.sender === "user"
                        ? "bg-[#FCD535] text-black"
                        : "bg-[#1E2329] text-white"
                    }`}
                  >
                    {item.message}
                    <p className="mt-1 text-[10px] opacity-60">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-slate-500 mt-20">
                No messages yet.
              </p>
            )}
          </div>

          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type message..."
              className="flex-1 bg-[#0b0e11] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="h-10 w-10 rounded-xl bg-[#FCD535] text-black flex items-center justify-center disabled:opacity-60"
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportBot;