'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import TopBar from '../../dashboard/TopBar';
import SideMenu from '../../dashboard/SideMenu';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

type FileMeta = {
  url: string;
  type: string;
  name?: string;
};

type ChatMessage = {
  sender: string;
  text: string;
  file_urls: FileMeta[];
  timestamp: string;
};

type User = {
  name: string;
  role: string;
};

export default function ChatPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [newText, setNewText] = useState('');
  const [riderName, setRiderName] = useState('');
  const [bookingStatus] = useState('Accepted');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const router = useRouter();
  const taskId = params?.taskId?.toString();

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data.user))
      .catch(() => router.push('/login'));
  }, [router]);

  useEffect(() => {
    fetch(`${API_BASE}/users`, { credentials: 'include' })
      .then(res => res.json())
      .then((users: User[]) => {
        const rider = users.find(u => u.role === 'rider');
        if (rider) setRiderName(rider.name);
      });
  }, []);

  useEffect(() => {
    if (!taskId) return;
    const fetchChats = () => {
      fetch(`${API_BASE}/chats/${taskId}`, { credentials: 'include' })
        .then(res => res.json())
        .then((data: ChatMessage[]) => setChats(Array.isArray(data) ? data : []))
        .catch(() => setChats([]));
    };
    fetchChats();
    const interval = setInterval(fetchChats, 3000);
    return () => clearInterval(interval);
  }, [taskId]);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
    setShowScrollButton(!nearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      scrollToBottom();
    }
  };

  const sendMessage = async () => {
    if (!taskId || !user?.name || (!newText.trim() && selectedFiles.length === 0)) return;

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
      } catch (error) {
        console.error('❌ Upload error:', error);
      }
    }

    try {
      await fetch(`${API_BASE}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          taskId,
          sender: user.name,
          text: newText.trim(),
          fileUrls: uploadedUrls,
        }),
      });
    } catch (err) {
      console.error('❌ Error sending chat:', err);
    }

    setNewText('');
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    scrollToBottom();
  };

  return (
    <main className="flex flex-col h-screen bg-white font-mono">
      <TopBar name={user?.name || ''} />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex flex-col flex-1 max-w-4xl w-full mx-auto relative">
        {/* Header */}
        <div className="sticky top-[64px] z-30 bg-white border-b border-gray-300 p-4 sm:mt-[56px] mt-[64px]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/customer/dashboard')}
              className="text-orange-600 hover:bg-orange-100 rounded-full p-1"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex-1 text-center">
              <div className="text-md font-bold text-gray-900">Booking #{taskId}</div>
              <div className="text-sm text-gray-500">
                Rider: {riderName || '...'} <br />
                Status: {bookingStatus}
              </div>
            </div>
            <div className="w-6" />
          </div>

          {/* File Previews */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 border-t pt-2">
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="relative">
                    {file.type.startsWith('image/') ? (
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
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-0 right-0 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Bubbles */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 pt-4 pb-40 space-y-4 bg-gray-50"
        >
          {chats.length === 0 ? (
            <p className="text-center text-gray-400">No messages yet.</p>
          ) : (
            chats.map((chat, idx) => {
              const isSender = chat.sender === user?.name;
              const bubbleColor = isSender ? 'bg-yellow-300' : 'bg-gray-300';

              return (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[75%] ${isSender ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <span className="text-xs text-gray-400 mb-1">{chat.sender}</span>
                  <div className={`rounded-xl px-4 py-2 text-sm ${bubbleColor} text-black`}>
                    {chat.text && <p>{chat.text}</p>}
                    {chat.file_urls.map((file, i) =>
                      file.type?.startsWith('image/') ? (
                        <Image
                          key={i}
                          src={file.url}
                          alt={file.name || 'uploaded'}
                          width={200}
                          height={200}
                          className="mt-2 rounded cursor-pointer"
                          onClick={() => setPreviewUrl(file.url)}
                        />
                      ) : (
                        <a
                          key={i}
                          href={file.url}
                          download
                          className="block mt-1 text-blue-600 underline"
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
          <div ref={messagesEndRef} />
        </div>

        {/* Full Image Modal */}
        {previewUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-4 right-4 text-white text-2xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70"
            >
              &times;
            </button>
            <img
              src={previewUrl}
              alt="Full Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-6 bg-orange-500 text-white p-2 rounded-full shadow-lg hover:bg-orange-600 z-30"
          >
            <ChevronDownIcon className="h-6 w-6" />
          </button>
        )}

        {/* Input Bar */}
        <div className="fixed inset-x-0 bottom-0 px-4 pt-3 pb-8 bg-white border-t border-gray-300 flex items-center gap-3 z-30">
          <label className="cursor-pointer">
            <PhotoIcon className="w-6 h-6 text-gray-600" />
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
            <PaperClipIcon className="w-6 h-6 text-gray-600" />
            <input type="file" multiple onChange={handleFileChange} className="hidden" />
          </label>
          <div className="flex-1">
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm text-black"
              placeholder="Type a message..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
          </div>
          <button
            onClick={sendMessage}
            className="text-white bg-orange-500 p-2 rounded-full hover:bg-orange-600"
          >
            <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
          </button>
        </div>
      </div>
    </main>
  );
}
