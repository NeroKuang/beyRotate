"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MAX_IMAGE_BYTES } from "@/lib/constants";

interface Message {
  id: string;
  sender_id: string;
  body: string | null;
  image_path: string | null;
  created_at: string;
}

export function MessageThread({
  conversationId,
  messages,
  currentUserId,
  sendMessage,
}: {
  conversationId: string;
  messages: Message[];
  currentUserId: string;
  sendMessage: (formData: FormData) => Promise<void>;
}) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImagePreview(null);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert(`圖片不可超過 ${MAX_IMAGE_BYTES / 1024 / 1024}MB`);
      e.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("請選擇圖片檔案");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (fd: FormData) => {
    if (imagePreview) {
      fd.set("image", imagePreview);
    }
    setSending(true);
    try {
      await sendMessage(fd);
      clearImage();
      formRef.current?.reset();
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="mb-4 min-h-[300px] flex-1 space-y-3 overflow-y-auto">
        {messages.map((m) => {
          const isMine = m.sender_id === currentUserId;
          return (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                isMine
                  ? "ml-auto bg-gradient-to-r from-sky-600 to-indigo-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              {m.image_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.image_path}
                  alt="附圖"
                  className="mb-2 max-h-48 rounded-lg object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}
              <p className="mt-1 text-[10px] opacity-60">
                {new Date(m.created_at).toLocaleString("zh-TW")}
              </p>
            </div>
          );
        })}
      </div>

      {imagePreview && (
        <div className="relative mb-2 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="預覽"
            className="max-h-32 rounded-lg border border-sky-200 dark:border-indigo-800"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
          >
            ✕
          </button>
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="flex gap-2">
        <input type="hidden" name="conversation_id" value={conversationId} />
        <input
          name="body"
          maxLength={500}
          placeholder="輸入訊息…"
          className="bey-input min-w-0 flex-1"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => fileRef.current?.click()}
          className="shrink-0 px-2"
          title="附圖片"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909-4.22-4.22a.75.75 0 0 0-1.06 0L2.5 11.06Zm12.25-3.31a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" clipRule="evenodd" />
          </svg>
        </Button>
        <Button
          type="submit"
          disabled={sending}
          className={sending ? "cursor-wait" : undefined}
        >
          {sending && (
            <span className="mr-1.5 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
          )}
          {sending ? "送出中…" : "送出"}
        </Button>
      </form>
    </>
  );
}
