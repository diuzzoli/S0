import nodemailer from "nodemailer";
import { env } from "../env.ts";

// En tests no se envía nada: los mails quedan en `outbox` para poder inspeccionarlos.
const transport =
  env.NODE_ENV === "test"
    ? nodemailer.createTransport({ jsonTransport: true })
    : nodemailer.createTransport(env.SMTP_URL);

export type Mail = { to: string; subject: string; text: string; html?: string };

export const outbox: Mail[] = [];

/** En desarrollo los mails llegan a Mailpit: http://localhost:8025 */
export async function sendMail(mail: Mail) {
  if (env.NODE_ENV === "test") outbox.push(mail);
  await transport.sendMail({ from: env.MAIL_FROM, ...mail });
}
