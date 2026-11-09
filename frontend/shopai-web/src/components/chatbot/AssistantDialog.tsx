import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { askAssistant, type ChatMessage, type ChatReply } from "../../services/shopping";
import { currency } from "../../utils/currency";

type Turn = ChatMessage & { reply?: ChatReply };
const welcome: Turn = { role: "assistant", content: "Hi! Tell me who you’re shopping for, what they enjoy, and your budget. I’ll find options from our catalog." };
const starters = ["Gift for my dad under ₹2000", "Something for my desk", "Headphones under ₹10000"];

export function AssistantDialog({ open, close }: { open: boolean; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [turns, setTurns] = useState<Turn[]>([welcome]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState<{ message: string; history: ChatMessage[] } | null>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  useEffect(() => { if (open) end.current?.scrollIntoView({ block: "nearest" }); }, [turns, pending, failed, open]);
  useEffect(() => () => controller.current?.abort(), []);

  async function send(message: string, retryHistory?: ChatMessage[]) {
    message = message.trim();
    if (!message || pending || message.length > 1000) return;
    const history = retryHistory ?? turns.slice(-12).map(({ role, content }) => ({ role, content }));
    if (!retryHistory) setTurns(current => [...current, { role: "user", content: message }]);
    setInput(""); setFailed(null); setPending(true);
    controller.current = new AbortController();
    try {
      const reply = await askAssistant(message, history, controller.current.signal);
      setTurns(current => [...current, { role: "assistant", content: reply.message, reply }]);
    } catch {
      if (!controller.current.signal.aborted) setFailed({ message, history });
    } finally { setPending(false); }
  }
  const latest = turns[turns.length - 1];
  const suggestions = latest.reply?.suggestions || starters;
  return (
    <dialog ref={dialog} className="assistant-dialog shopping-dialog" aria-labelledby="assistant-title"
      onCancel={close} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <header className="chat-header">
        <span className="chat-avatar"><Sparkles size={23} /></span>
        <div><span className="eyebrow">YOUR SHOPPING SIDEKICK</span><h2 id="assistant-title">A good find starts here.</h2></div>
        <button className="icon-button" aria-label="Start a new conversation" disabled={pending}
          onClick={() => { setTurns([welcome]); setFailed(null); setInput(""); }}><RotateCcw size={17} /></button>
        <button className="icon-button" onClick={close} aria-label="Close assistant"><X size={20} /></button>
      </header>
      <div className="chat-transcript" role="log" aria-label="Shopping conversation" aria-live="polite" aria-busy={pending}>
        {turns.map((turn, index) => <div className={`chat-turn ${turn.role}`} key={index}>
          <span className="chat-speaker">{turn.role === "assistant" ? "ShopAI" : "You"}</span>
          <p className="chat-bubble">{turn.content}</p>
          {turn.reply?.items.map(({ product, reason }) => <Link key={product.id} to={`/products/${product.id}`}
            className="chat-product" onClick={close}>
            <img src={product.images[0] || "/favicon.svg"} alt="" loading="lazy" />
            <div><small>{product.brand} · {product.category.name}</small><h3>{product.name}</h3>
              <strong>{currency(product.price, product.currency)}</strong><p>{reason}</p></div>
            <ArrowUpRight size={17} />
          </Link>)}
          {turn.reply && <small className="chat-source">{turn.reply.mode === "model" ? "AI assisted · Live catalog picks" : "Catalog matching · Live prices"}</small>}
        </div>)}
        {pending && <p className="chat-loading" role="status"><Sparkles size={15} /> Finding your kind of good…</p>}
        {failed && <div className="chat-error" role="alert">I couldn’t reach the shopping service. Your message is saved.
          <button className="text-link" onClick={() => void send(failed.message, failed.history)}>Try again</button></div>}
        <div ref={end} />
      </div>
      <div className="chat-composer">
        {!pending && !failed && <div className="chat-suggestions" aria-label="Suggested messages">{suggestions.map(suggestion =>
          <button key={suggestion} onClick={() => void send(suggestion)}>{suggestion}</button>)}</div>}
        <form onSubmit={e => { e.preventDefault(); void send(input); }}>
          <label className="sr-only" htmlFor="shopping-message">Message your shopping assistant</label>
          <input id="shopping-message" value={input} onChange={e => setInput(e.target.value)} maxLength={1000}
            placeholder="A gift, a budget, a little inspiration…" autoComplete="off" disabled={pending} />
          <button type="submit" aria-label="Send message" disabled={pending || !input.trim()}><Send size={18} /></button>
        </form>
        <p className="chat-footnote">Recommendations from our development catalog. Check product details before choosing.</p>
      </div>
    </dialog>
  );
}
