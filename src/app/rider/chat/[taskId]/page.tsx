'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import TopBar from '../../Topbar';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import io, { Socket } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
let socket: Socket;

type FileMeta = {
  url: string;
  type: string;
  name?: string;
};

type Chat = {
  sender: string;
  text: string;
  file_urls: FileMeta[];
  timestamp: string;
};

type User = {
  name: string;
  role: string;
};

type Task = {
  id: string;
  name: string;
  status: string;
};

export default function RiderChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [newText, setNewText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState('');
  const [customerName, setCustomerName] = useState('');
  const params = useParams();
  const router = useRouter();
  const taskId = params?.taskId?.toString();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data.user))
      .catch(() => router.replace('/login'));
  }, [router]);

  // Socket setup
  useEffect(() => {
    if (!taskId || !user) return;

    socket = io(API_BASE, { withCredentials: true });
    socket.emit('join', `chat-${taskId}`);

    // Real-time message
    socket.on('new-message', (message: Chat) => {
      setChats(prev => [...prev, message]);
      scrollToBottom();
    });

    // Real-time status update
    socket.on('status-update', (data: { status: string }) => {
      setBookingStatus(data.status);
      if (data.status === 'completed') {
        router.push('/rider/history');
      }
    });

    // Initial chat + task data
    fetch(`${API_BASE}/chats/${taskId}`, { credentials: 'include' })
      .then(res => res.json())
      .then((data: Chat[]) => setChats(Array.isArray(data) ? data : []))
      .catch(() => setChats([]));

    fetch(`${API_BASE}/tasks/${taskId}`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((task: Task) => {
        setBookingStatus(task.status);
        setCustomerName(task.name);
      })
      .catch(() => {
        setBookingStatus('');
        setCustomerName('');
        router.replace('/login');
      });

    return () => {
      socket.emit('leave', `chat-${taskId}`);
      socket.disconnect();
    };
  }, [taskId, user, router]);

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const sendMessage = async () => {
    if (!newText.trim() && selectedFiles.length === 0) return;

    const uploadedUrls: FileMeta[] = [];

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(`${API_BASE}/chats/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Upload failed');

        const result = await res.json();
        uploadedUrls.push({ url: result.url, type: file.type, name: result.name });
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    await fetch(`${API_BASE}/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        taskId,
        sender: user?.name,
        text: newText,
        fileUrls: uploadedUrls,
      }),
    });

    setNewText('');
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateStatus = async (newStatus: string) => {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) setBookingStatus(newStatus);
  };

  return (
    <main className="flex flex-col h-screen bg-white font-mono text-black">
      <TopBar />

      <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-2">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="text-orange-600 hover:bg-orange-100 p-1 rounded-full"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="text-center flex-1">
              <div className="text-md font-bold">Booking #{taskId}</div>
              <div className="text-sm text-gray-500">Customer: {customerName}</div>
              <div className="text-sm text-gray-500">Status: {bookingStatus}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
              {bookingStatus === 'accepted' && (
                <button
                  onClick={() => updateStatus('on_the_way')}
                  className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
                >
                  On the Way
                </button>
              )}
              {bookingStatus === 'on_the_way' && (
                <button
                  onClick={() => updateStatus('completed')}
                  className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700"
                >
                  Complete
                </button>
              )}
              {(bookingStatus === 'accepted' || bookingStatus === 'on_the_way') && (
                <button
                  onClick={() => updateStatus('cancelled')}
                  className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* File Previews */}
        {selectedFiles.length > 0 && (
          <div className="px-4 py-2 bg-white border-t border-b">
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, idx) => {
                const isImage = file.type.startsWith('image/');
                return (
                  <div key={idx} className="relative">
                    {isImage ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded text-xs text-center px-1">
                        {file.name}
                      </div>
                    )}
                    <button
                      onClick={() =>
                        setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="absolute top-0 right-0 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat Display */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 bg-gray-50"
          style={{ paddingTop: '12px', paddingBottom: '80px' }}
        >
          {chats.length === 0 ? (
            <p className="text-center text-gray-400 mt-4">No messages yet.</p>
          ) : (
            chats.map((chat, i) => {
              const isSender = chat.sender === user?.name;
              const files: FileMeta[] = Array.isArray(chat.file_urls) ? chat.file_urls : [];

              return (
                <div
                  key={i}
                  className={`flex flex-col max-w-[75%] mb-2 ${
                    isSender ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <span className="text-xs text-gray-400">{chat.sender}</span>
                  <div
                    className={`rounded-xl px-4 py-2 mt-1 text-sm ${
                      isSender ? 'bg-yellow-300' : 'bg-gray-300'
                    }`}
                  >
                    {chat.text && <p>{chat.text}</p>}
                    {files.map((file, idx) =>
                      file.type?.startsWith('image/') ? (
                        <Image
                          key={idx}
                          src={file.url}
                          alt={file.name || 'uploaded'}
                          width={200}
                          height={200}
                          className="mt-2 rounded cursor-pointer"
                          onClick={() => setPreviewUrl(file.url)}
                        />
                      ) : (
                        <a
                          key={idx}
                          href={file.url}
                          download
                          className="block mt-2 text-blue-600 underline"
                        >
                          {file.name || file.url.split('/').pop()}
                        </a>
                      )
                    )}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {new Date(chat.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Image Preview Modal */}
        {previewUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <img src={previewUrl} alt="preview" className="max-w-full max-h-full object-contain" />
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-4 right-4 text-white text-2xl font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Message Input */}
        <div className="fixed bottom-0 inset-x-0 bg-white border-t px-2 py-2 flex items-center gap-2 z-20 sm:px-4">
          <label className="cursor-pointer">
            <PhotoIcon className="h-5 w-5 text-gray-500" />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
          </label>
          <label className="cursor-pointer">
            <PaperClipIcon className="h-5 w-5 text-gray-500" />
            <input type="file" multiple onChange={handleFileChange} className="hidden" />
          </label>
          <input
            type="text"
            className="flex-1 min-w-0 border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Type a message..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <button
            onClick={sendMessage}
            className="bg-orange-500 p-2 rounded-full text-white hover:bg-orange-600"
          >
            <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
          </button>
        </div>
      </div>
    </main>
  );
}
