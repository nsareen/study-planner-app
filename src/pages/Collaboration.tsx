import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Users, Plus, MessageCircle, Video, Share2, BookOpen, Gamepad2, Brain, Send, Heart, Camera, FileText, Palette, X, Sparkles, Trophy, Zap } from 'lucide-react';
import TicTacToe from '../components/games/TicTacToe';

interface StudyRoom {
  id: string;
  name: string;
  host: string;
  participants: string[];
  subject: string;
  isActive: boolean;
}

interface Message {
  id: string;
  user: string;
  avatar: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'screenshot' | 'note';
  attachment?: string;
}

const Collaboration: React.FC = () => {
  const { getCurrentUser, users } = useStore();
  const currentUser = getCurrentUser();
  const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showGames, setShowGames] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomSubject, setRoomSubject] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock study rooms
  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>([
    {
      id: '1',
      name: 'Math Warriors 🔢',
      host: 'Ananya',
      participants: ['Ananya', 'Sara'],
      subject: 'Mathematics',
      isActive: true,
    },
    {
      id: '2',
      name: 'Science Squad 🔬',
      host: 'Saanvi',
      participants: ['Saanvi', 'Arshita'],
      subject: 'Science',
      isActive: true,
    },
  ]);
  
  // Mock online friends
  const onlineFriends = users.filter(u => u.id !== currentUser?.id);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const sendMessage = () => {
    if (newMessage.trim() && currentUser) {
      const message: Message = {
        id: Date.now().toString(),
        user: currentUser.name,
        avatar: currentUser.avatar,
        text: newMessage,
        timestamp: new Date(),
        type: 'text',
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      // In a real app, you'd upload the file
      const message: Message = {
        id: Date.now().toString(),
        user: currentUser.name,
        avatar: currentUser.avatar,
        text: `Shared a screenshot: ${file.name}`,
        timestamp: new Date(),
        type: 'screenshot',
        attachment: URL.createObjectURL(file),
      };
      setMessages([...messages, message]);
    }
  };
  
  const createStudyRoom = () => {
    if (roomName && currentUser) {
      const newRoom: StudyRoom = {
        id: Date.now().toString(),
        name: roomName,
        host: currentUser.name,
        participants: [currentUser.name, ...selectedFriends],
        subject: roomSubject,
        isActive: true,
      };
      setStudyRooms([...studyRooms, newRoom]);
      setActiveRoom(newRoom);
      setShowCreateRoom(false);
      setRoomName('');
      setRoomSubject('');
      setSelectedFriends([]);
      
      // Welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        user: 'Study Hero Bot',
        avatar: '🤖',
        text: `Welcome to ${roomName}! Let's crush this study session together! 🚀`,
        timestamp: new Date(),
        type: 'text',
      };
      setMessages([welcomeMessage]);
    }
  };
  
  const joinRoom = (room: StudyRoom) => {
    setActiveRoom(room);
    // Add join message
    const joinMessage: Message = {
      id: Date.now().toString(),
      user: 'Study Hero Bot',
      avatar: '🤖',
      text: `${currentUser?.name} joined the study room! Welcome! 🎉`,
      timestamp: new Date(),
      type: 'text',
    };
    setMessages([joinMessage]);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
      {/* Left Sidebar - Friends & Rooms */}
      <div className="lg:col-span-1 space-y-4">
        {/* Online Friends */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-4">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            Study Buddies Online
          </h3>
          <div className="space-y-2">
            {onlineFriends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="text-2xl">{friend.avatar}</span>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{friend.name}</p>
                    <p className="text-xs text-gray-500">Level {friend.level}</p>
                  </div>
                </div>
                <button className="p-1.5 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors">
                  <MessageCircle size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Study Rooms */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              Study Rooms
            </h3>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {studyRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => joinRoom(room)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  activeRoom?.id === room.id 
                    ? 'bg-gradient-to-r from-primary-100 to-secondary-100 border-2 border-primary-300' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <p className="font-medium text-sm">{room.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">{room.participants.length} studying</p>
                  {room.isActive && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content - Chat & Activities */}
      <div className="lg:col-span-3 flex flex-col bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl">
        {activeRoom ? (
          <>
            {/* Room Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{activeRoom.name}</h2>
                  <p className="text-sm text-gray-500">
                    {activeRoom.participants.join(', ')} are studying {activeRoom.subject}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowWhiteboard(!showWhiteboard)}
                    className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                    title="Whiteboard"
                  >
                    <Palette size={20} />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Share Screenshot"
                  >
                    <Camera size={20} />
                  </button>
                  <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors" title="Video Call">
                    <Video size={20} />
                  </button>
                  <button
                    onClick={() => setShowGames(!showGames)}
                    className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                    title="Brain Games"
                  >
                    <Gamepad2 size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.user === currentUser?.name ? 'flex-row-reverse' : ''}`}>
                  <span className="text-2xl flex-shrink-0">{msg.avatar}</span>
                  <div className={`max-w-[70%] ${msg.user === currentUser?.name ? 'items-end' : ''}`}>
                    <div className={`rounded-2xl p-3 ${
                      msg.user === currentUser?.name 
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white' 
                        : 'bg-gray-100'
                    }`}>
                      {msg.type === 'screenshot' && msg.attachment && (
                        <img src={msg.attachment} alt="Screenshot" className="rounded-lg mb-2 max-w-full" />
                      )}
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {msg.user} • {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={sendMessage}
                  className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full hover:shadow-lg transition-all"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Users className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">Select or create a study room to start collaborating!</p>
            <p className="text-sm mt-2">Study with friends and make learning fun 🎉</p>
          </div>
        )}
      </div>
      
      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              Create Study Room
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., Math Marathon 🏃‍♂️"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={roomSubject}
                  onChange={(e) => setRoomSubject(e.target.value)}
                  placeholder="e.g., Mathematics"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invite Friends</label>
                <div className="space-y-2">
                  {onlineFriends.map((friend) => (
                    <label key={friend.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFriends.includes(friend.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFriends([...selectedFriends, friend.name]);
                          } else {
                            setSelectedFriends(selectedFriends.filter(f => f !== friend.name));
                          }
                        }}
                        className="rounded text-primary-600"
                      />
                      <span className="text-xl">{friend.avatar}</span>
                      <span className="text-sm">{friend.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={createStudyRoom}
                  className="flex-1 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Create Room
                </button>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Games Panel */}
      {showGames && activeRoom && (
        <div className="fixed bottom-20 right-8 bg-white rounded-2xl shadow-2xl p-4 w-80 z-40">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-orange-500" />
              Brain Break Games
            </h3>
            <button onClick={() => setShowGames(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setActiveGame('sudoku')}
              className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl hover:scale-105 transition-transform"
            >
              <span className="text-2xl mb-2 block">🎯</span>
              <p className="text-sm font-medium">Sudoku</p>
              <p className="text-xs text-gray-500">Coming Soon!</p>
            </button>
            <button 
              onClick={() => setActiveGame('tictactoe')}
              className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl hover:scale-105 transition-transform"
            >
              <span className="text-2xl mb-2 block">⭕</span>
              <p className="text-sm font-medium">Tic Tac Toe</p>
            </button>
            <button 
              onClick={() => setActiveGame('word')}
              className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl hover:scale-105 transition-transform"
            >
              <span className="text-2xl mb-2 block">🧩</span>
              <p className="text-sm font-medium">Word Puzzle</p>
              <p className="text-xs text-gray-500">Coming Soon!</p>
            </button>
            <button 
              onClick={() => setActiveGame('math')}
              className="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl hover:scale-105 transition-transform"
            >
              <span className="text-2xl mb-2 block">🎮</span>
              <p className="text-sm font-medium">Math Quiz</p>
              <p className="text-xs text-gray-500">Coming Soon!</p>
            </button>
          </div>
        </div>
      )}
      
      {/* Games */}
      {activeGame === 'tictactoe' && currentUser && activeRoom && (
        <TicTacToe
          playerName={currentUser.name}
          opponentName={activeRoom.participants.find(p => p !== currentUser.name) || 'Friend'}
          onClose={() => setActiveGame(null)}
        />
      )}
    </div>
  );
};

export default Collaboration;