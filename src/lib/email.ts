import nodemailer from "nodemailer";
import { SITE_NAME } from "@/lib/constants";

const SMTP_CONFIGURED =
  !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

function getTransport() {
  if (!SMTP_CONFIGURED) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM =
  process.env.SMTP_FROM ?? `${SITE_NAME} <noreply@beyrotate.app>`;

interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendMail(opts: SendMailOptions): Promise<boolean> {
  const transport = getTransport();
  if (!transport) {
    console.log(`[mail] SMTP 未設定，信件內容如下：`);
    console.log(`  To: ${opts.to}`);
    console.log(`  Subject: ${opts.subject}`);
    console.log(`  ${opts.text}`);
    return false;
  }

  try {
    await transport.sendMail({ from: FROM, ...opts });
    return true;
  } catch (err) {
    console.error("[mail] 寄信失敗:", err);
    return false;
  }
}

export function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.AUTH_URL ??
    "http://localhost:5001"
  );
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<boolean> {
  const url = `${baseUrl()}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  console.log(`[verify-email] ${email} → ${url}`);

  return sendMail({
    to: email,
    subject: `[${SITE_NAME}] 請驗證你的 Email`,
    text: `歡迎加入 ${SITE_NAME}！\n\n請點擊以下連結驗證你的 Email：\n${url}\n\n此連結 24 小時內有效。\n如果你沒有註冊 ${SITE_NAME}，請忽略此信。`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#0ea5e9;">歡迎加入 ${SITE_NAME}！</h2>
        <p>請點擊下方按鈕驗證你的 Email：</p>
        <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          驗證 Email
        </a>
        <p style="margin-top:16px;color:#666;font-size:14px;">
          或複製以下連結貼到瀏覽器：<br/>
          <a href="${url}" style="color:#0ea5e9;word-break:break-all;">${url}</a>
        </p>
        <p style="color:#999;font-size:12px;margin-top:24px;">此連結 24 小時內有效。如果你沒有註冊 ${SITE_NAME}，請忽略此信。</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<boolean> {
  const url = `${baseUrl()}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  console.log(`[password-reset] ${email} → ${url}`);

  return sendMail({
    to: email,
    subject: `[${SITE_NAME}] 重設密碼`,
    text: `你收到此信是因為有人在 ${SITE_NAME} 要求重設密碼。\n\n請點擊以下連結：\n${url}\n\n此連結 1 小時內有效。\n如果你沒有要求重設密碼，請忽略此信。`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#0ea5e9;">${SITE_NAME} 密碼重設</h2>
        <p>你收到此信是因為有人要求重設密碼。</p>
        <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          重設密碼
        </a>
        <p style="margin-top:16px;color:#666;font-size:14px;">
          或複製以下連結：<br/>
          <a href="${url}" style="color:#0ea5e9;word-break:break-all;">${url}</a>
        </p>
        <p style="color:#999;font-size:12px;margin-top:24px;">此連結 1 小時內有效。如果你沒有要求重設密碼，請忽略此信。</p>
      </div>
    `,
  });
}
