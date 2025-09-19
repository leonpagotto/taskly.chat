import { prisma } from './client';
import type { Prisma } from '@prisma/client';

export interface CreateConversationInput {
  projectId?: string | null;
  participants: string[];
  title?: string | null;
  firstMessage?: { role: 'user' | 'assistant' | 'system'; content: string; meta?: any };
}

export interface ConversationRecord {
  id: string;
  projectId?: string | null;
  title?: string | null;
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  tokensEstimate?: number | null;
  meta?: any;
  createdAt: Date;
}

function encodeParticipants(arr: string[]): string {
  return JSON.stringify(arr);
}
function decodeParticipants(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

function encodeMeta(meta: any): string | null {
  if (meta == null) return null;
  try { return JSON.stringify(meta); } catch { return null; }
}
function decodeMeta(raw: string | null): any {
  if (!raw) return undefined;
  try { return JSON.parse(raw); } catch { return undefined; }
}

export class ConversationRepo {
  static async create(input: CreateConversationInput): Promise<ConversationRecord & { firstMessage?: MessageRecord }> {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const convo = await tx.conversation.create({
        data: {
          projectId: input.projectId ?? null,
          title: input.title ?? null,
          participants: encodeParticipants(input.participants),
        }
      });

      let firstMessage: MessageRecord | undefined;
      if (input.firstMessage) {
        const fm = await tx.message.create({
          data: {
            conversationId: convo.id,
            role: input.firstMessage.role,
            content: input.firstMessage.content,
            meta: encodeMeta(input.firstMessage.meta),
          }
        });
        firstMessage = {
          id: fm.id,
            conversationId: fm.conversationId,
            role: fm.role,
            content: fm.content,
            tokensEstimate: fm.tokensEstimate,
            meta: decodeMeta(fm.meta),
            createdAt: fm.createdAt,
        };
      }

      return {
        id: convo.id,
        projectId: convo.projectId,
        title: convo.title,
        participants: decodeParticipants(convo.participants),
        createdAt: convo.createdAt,
        updatedAt: convo.updatedAt,
        firstMessage
      };
    });
  }

  static async get(id: string): Promise<ConversationRecord | null> {
    const convo = await prisma.conversation.findUnique({ where: { id } });
    if (!convo) return null;
    return {
      id: convo.id,
      projectId: convo.projectId,
      title: convo.title,
      participants: decodeParticipants(convo.participants),
      createdAt: convo.createdAt,
      updatedAt: convo.updatedAt,
    };
  }

  static async listByParticipant(userId: string, opts: { limit?: number; offset?: number } = {}): Promise<ConversationRecord[]> {
    const limit = opts.limit ?? 20;
    const offset = opts.offset ?? 0;
  const rows = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      skip: offset,
      take: limit,
    });
  return rows.filter((r: typeof rows[number]) => decodeParticipants(r.participants).includes(userId)).map((r: typeof rows[number]) => ({
      id: r.id,
      projectId: r.projectId,
      title: r.title,
      participants: decodeParticipants(r.participants),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }
}

export class MessageRepo {
  static async append(conversationId: string, input: { role: 'user' | 'assistant' | 'system'; content: string; meta?: any; tokensEstimate?: number | null }): Promise<MessageRecord> {
    const row = await prisma.message.create({
      data: {
        conversationId,
        role: input.role,
        content: input.content,
        meta: encodeMeta(input.meta),
        tokensEstimate: input.tokensEstimate ?? null,
      }
    });
    return {
      id: row.id,
      conversationId: row.conversationId,
      role: row.role,
      content: row.content,
      tokensEstimate: row.tokensEstimate,
      meta: decodeMeta(row.meta),
      createdAt: row.createdAt,
    };
  }

  static async list(conversationId: string, opts: { limit?: number; before?: Date } = {}): Promise<MessageRecord[]> {
    const limit = opts.limit ?? 50;
    const where: any = { conversationId };
    if (opts.before) {
      where.createdAt = { lt: opts.before };
    }
  const rows = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  return rows.map((r: typeof rows[number]) => ({
      id: r.id,
      conversationId: r.conversationId,
      role: r.role,
      content: r.content,
      tokensEstimate: r.tokensEstimate,
      meta: decodeMeta(r.meta),
      createdAt: r.createdAt,
    })).reverse(); // return chronological asc
  }
}
