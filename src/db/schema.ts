import { integer, pgTable, varchar, text, serial } from "drizzle-orm/pg-core";


export const chatsTable = pgTable('chats',{
    id:serial('id').primaryKey(),
    userId:text('user_id').notNull(),
    title:text('title').notNull(),
    model:text('model').notNull()
});

export const messageTable =pgTable('messages',{
    id:serial('id').primaryKey(),
    userId:integer('chat_id').references(()=>chatsTable.id),
    title:text('role').notNull(),
    content:text('content').notNull()
})

export type ChatModel = typeof chatsTable.$infereSelect
export type MessagesModel = typeof messagesTable.$inferSelect