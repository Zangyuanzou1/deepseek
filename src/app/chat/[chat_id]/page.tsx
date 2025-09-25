'use client';

import { useEffect, useRef, useState } from 'react';
import EastIcon from '@mui/icons-material/East';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Page() {
  const [model, setModel] = useState('deepseek-v3');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef?.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleChangeModel = () => {
    setModel(model === 'deepseek-v3' ? 'deepseek-r1' : 'deepseek-v3');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // 创建一个临时的助手消息用于流式更新
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // 处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // 解码文本块
        const chunk = decoder.decode(value, { stream: true });

        // 更新助手消息的内容
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];

          if (lastMessage && lastMessage.role === 'assistant') {
            // 创建新的消息对象以触发重新渲染
            const updatedMessage = {
              ...lastMessage,
              content: lastMessage.content + chunk
            };
            newMessages[newMessages.length - 1] = updatedMessage;
          }

          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);

      // 更新为错误消息
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];

        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content = '抱歉，出现了错误，请重试。';
        }

        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col h-screen justify-between items-center'>
      <div className='flex flex-col w-2/3 gap-8 overflow-y-auto justify-between flex-1'>
        <div className='h-4'></div>
        <div className='flex flex-col gap-8 flex-1'>
          {messages.map(message => (
            <div
              key={message.id}
              className={`rounded-lg flex flex-row ${message?.role === 'assistant' ? 'justify-start mr-18' : "justify-end ml-10"}`}>
              <p className={`inline-block p-2 rounded-lg ${message?.role === 'assistant' ? 'bg-blue-300' : 'bg-slate-100'}`}>
                {message.content}
                {/* 在助手消息末尾显示打字光标 */}
                {message.role === 'assistant' && isLoading && message === messages[messages.length - 1] && (
                  <span className="animate-pulse">|</span>
                )}
              </p>
            </div>
          ))}
        </div>
        <div className='h-4' ref={endRef}></div>
      </div>
      {/*输入框*/}
      <div className="flex flex-col items-center justify-center mt-4 shadow-lg border-[1px] border-gray-300 h-32 rounded-lg w-2/3">
        <form onSubmit={handleSubmit} className="w-full h-full flex flex-col">
          <textarea
            className="w-full rounded-lg p-3 h-30 focus:outline-none flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
          <div className="flex flex-row items-center justify-between w-full h-12 mb-2">
            <div>
              <div className={`flex flex-row items-center justify-center rounded-lg border-[1px] px-2 py-1 ml-2 cursor-pointer ${model === 'deepseek-r1' ? 'border-blue-300 bg-blue-200' : 'border-gray-300'}`}
                onClick={handleChangeModel}>
                <p className="text-sm">
                  深度思考（R1）
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center border-2 mr-4 border-black p-1 rounded-full cursor-pointer disabled:opacity-50"
            >
              <EastIcon></EastIcon>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}