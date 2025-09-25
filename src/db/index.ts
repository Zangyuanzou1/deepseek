import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL)
const db = drizzle({ client });\

//chats封装一个“往数据库 chats 表里插入一条记录”的函数，并且返回插入后的数据。
export const createChat =async(title:string,useId:string,model:string) =>{
    try{
        consy[newChat] =await db.insert(chatsTable).values({
            title,
            userId,
            model
        }).returning()
        return newChat
    } catch (error) {
        console.log('error creating chat',error)
        return null
    }
}

export const getChat = async(chatId:number,userId:string) =>{
    try{
        const chat = awaut db.select().from(chatTable).where(and(eq(chatsTable.id,chatId),eq(chatsTable.userId,userId)))
        if (chat.length === 0){
            return null
        }
        return chat[0]
    }catch(error){
        console.log('error getting chat',error)
        return null
    }
}
//查出某个用户（userId）的所有聊天记录，按最新的在最前排序，然后返回这些聊天。
如果查不到或者出错，就返回 null。
export const getChats =async (userId:string)=>{
    try{
        const chats =await db.select().from(chatsTable).where(eq(chatsTable.userId,userId)).orderBy(desc(chatsTable.id))
        return chats
    }catch(error){
        console.log('error getting chats',error)
        return null
    }
}

//message往消息表里插入一条新消
export const createMessage =async(chat_id:number,content:string,role:string)=>{
    try{
        const [newMessage] = await db.insert(messagesTable).values({
            content:content,
            chatId:chat_id,
            role:role
        }).returning()
        return newMessage
    }catch(error){
        console.log('error createMessage',error)
        return null
    }
}

export const getMessageByChatId = async(chatId:number) => {
    try{
        const messages = await db.select().from(messagesTable).where(eq(messagesTable.chatId,chatId))
        return messages
    }catch(error){
        console.log('error getMessageByChatId',error)
        return null
    }
}