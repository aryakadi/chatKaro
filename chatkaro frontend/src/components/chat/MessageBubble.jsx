import React from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { timeAgo } from "../../config/helper";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

const MessageBubble = ({ message, isMine }) => {
  const [copiedCode, setCopiedCode] = React.useState(null);

  const getInitials = (name) => {
    return name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "U";
  };

  const copyToClipboard = (text, id = "msg") => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success("Copied to clipboard", { duration: 2000 });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className={cn("flex w-full group", isMine ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] md:max-w-[75%] items-end gap-2", isMine ? "flex-row-reverse" : "flex-row")}>
        <Avatar className="w-8 h-8 shrink-0 mb-1 shadow-sm">
          <AvatarFallback className={cn("text-[10px]", isMine ? "bg-indigo-600" : "bg-slate-700")}>
            {getInitials(message.sender)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-1 max-w-[calc(100%-2.5rem)]">
          <div className={cn("flex items-baseline gap-2 px-1", isMine ? "flex-row-reverse" : "flex-row")}>
            <span className="text-xs font-medium text-slate-300">{message.sender}</span>
            <span className="text-[10px] text-slate-500">{timeAgo(message.timeStamp)}</span>
          </div>

          <div
            className={cn(
              "relative px-4 py-3 rounded-2xl shadow-sm text-sm overflow-hidden",
              isMine
                ? "bg-indigo-600 text-slate-50 rounded-br-sm"
                : "bg-slate-800 border border-slate-700/50 text-slate-100 rounded-bl-sm"
            )}
          >
            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");
                    return !inline && match ? (
                      <div className="relative mt-2 mb-2 rounded-lg overflow-hidden border border-slate-700 bg-[#1E1E1E]">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700">
                          <span className="text-xs text-slate-400 lowercase">{match[1]}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(codeString, codeString); }}
                            className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
                          >
                            {copiedCode === codeString ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, padding: "1rem", fontSize: "0.85rem", background: "transparent" }}
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={cn("bg-black/20 px-1.5 py-0.5 rounded-md text-[0.85em]", className)} {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({children}) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                  a: ({children, href}) => <a href={href} target="_blank" rel="noreferrer" className="text-indigo-300 hover:underline">{children}</a>
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Quick Copy Message action on hover */}
            <button
              onClick={() => copyToClipboard(message.content)}
              className={cn(
                "absolute top-2 right-2 p-1.5 rounded-md bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm",
                isMine ? "right-auto left-2" : "right-2"
              )}
              title="Copy message"
            >
              {copiedCode === 'msg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
