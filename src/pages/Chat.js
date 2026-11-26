import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import {
  FiSearch,
  FiPlus,
  FiX,
  FiArrowLeft,
  FiRefreshCw,
  FiInfo,
  FiSmile,
  FiSend,
  FiChevronRight,
  FiChevronDown,
  FiMessageSquare,
  FiUsers,
  FiAlertCircle,
} from 'react-icons/fi';
import './../CSS files/chat.css';

const API_BASE = 'https://backendapp-beige.vercel.app/api';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #10b981, #14b8a6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #8b5cf6, #d946ef)',
];

const QUICK_EMOJIS = [
  '😀', '😂', '😍', '🥳', '😎', '🤔', '🙌',
  '👍', '👏', '🔥', '❤️', '✨', '🎉', '💯',
  '🚀', '💡', '✅', '👀', '🙏', '🤝', '💬',
];

const getInitials = (name = '') => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '#';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const getAvatarGradient = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

const formatMessageTime = (message) => {
  if (message.timestamp) return message.timestamp;
  if (message.createdAt) {
    const parsed = new Date(message.createdAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }
  return '';
};

const Chat = () => {
  const token = localStorage.getItem('token');
  const userid = localStorage.getItem('userid');

  const [chatroom, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const emojiContainerRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView?.({ behavior });
  }, []);

  const fetchGroups = useCallback(async () => {
    if (!token) return;
    setIsLoadingGroups(true);
    try {
      const response = await axios.get(`${API_BASE}/groups/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setErrorBanner('Could not load groups. Please try refreshing.');
    } finally {
      setIsLoadingGroups(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiContainerRef.current &&
        !emojiContainerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((group) =>
      (group.groupName || '').toLowerCase().includes(q)
    );
  }, [groups, searchQuery]);

  const fetchMessagesForGroup = async (group) => {
    if (!group?._id) return;
    setRoom(group);
    setShowGroupInfo(false);
    setShowEmojiPicker(false);
    setErrorBanner('');
    localStorage.setItem('selectedgroup', group._id);
    setIsLoadingMessages(true);

    try {
      const response = await axios.get(`${API_BASE}/message/${group._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setMessages([]);
      setErrorBanner('Failed to fetch messages for this group.');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      setErrorBanner('Please enter a group name.');
      return;
    }

    setIsCreatingGroup(true);
    setErrorBanner('');
    try {
      const res = await axios.post(
        `${API_BASE}/groups/create`,
        { groupName: trimmed, createdBy: userid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdGroup = res.data?.group;
      setNewGroupName('');
      setShowCreateGroup(false);

      if (createdGroup && createdGroup._id) {
        setGroups((prev) => [createdGroup, ...prev]);
        fetchMessagesForGroup(createdGroup);
      } else {
        await fetchGroups();
      }
    } catch (error) {
      setErrorBanner(
        error.response?.data?.message || 'Unable to create group right now.'
      );
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleSendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !chatroom?._id || isSending) return;

    setIsSending(true);
    setErrorBanner('');
    setShowEmojiPicker(false);

    try {
      const response = await axios.post(
        `${API_BASE}/message/send`,
        {
          groupId: chatroom._id,
          messageText: trimmed,
          userId: userid,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const savedText = response.data?.message?.messageText || trimmed;
      const newMessageObject = {
        _id: response.data?.message?._id || `${Date.now()}`,
        sender: 'me',
        messageText: savedText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, newMessageObject]);
      setNewMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      setErrorBanner('Message could not be sent. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleTextareaChange = (e) => {
    setNewMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleComposerKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInsertEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(distanceFromBottom > 180);
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="chat-shell">
      <div className={`chat-layout ${chatroom ? 'view-chat' : 'view-list'}`}>
        {/* Sidebar: Groups */}
        <aside className="chat-sidebar" aria-label="Chat groups">
          <div className="sidebar-header">
            <div className="sidebar-title-wrap">
              <h1 className="sidebar-title">Groups</h1>
              <span className="sidebar-count">{groups.length}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateGroup((prev) => !prev)}
              className={`new-group-toggle-btn ${showCreateGroup ? 'is-open' : ''}`}
              aria-expanded={showCreateGroup}
            >
              {showCreateGroup ? (
                <>
                  <FiX aria-hidden="true" />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <FiPlus aria-hidden="true" />
                  <span>New Group</span>
                </>
              )}
            </button>
          </div>

          <div className="sidebar-search-wrap">
            <div className="sidebar-search-box">
              <span className="sidebar-search-icon" aria-hidden="true">
                <FiSearch />
              </span>
              <input
                type="search"
                className="sidebar-search-input"
                placeholder="Search groups..."
                aria-label="Search groups"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="sidebar-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          {showCreateGroup && (
            <form className="create-group-panel" onSubmit={handleCreateGroup}>
              <label htmlFor="new-group-name" className="create-group-label">
                Create a new group channel
              </label>
              <div className="create-group-row">
                <input
                  id="new-group-name"
                  type="text"
                  className="create-group-input"
                  placeholder="e.g. Design Team"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  disabled={isCreatingGroup}
                  autoFocus
                />
                <button
                  type="submit"
                  className="create-group-submit"
                  disabled={isCreatingGroup || !newGroupName.trim()}
                >
                  {isCreatingGroup ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          )}

          {isLoadingGroups ? (
            <div className="group-list" aria-busy="true">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="skeleton-row">
                  <div className="skeleton-avatar" />
                  <div className="skeleton-lines">
                    <div className="skeleton-line" style={{ width: '65%' }} />
                    <div className="skeleton-line" style={{ width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="sidebar-state-box">
              <FiUsers size={26} />
              <strong>
                {searchQuery ? 'No matching groups' : 'No groups yet'}
              </strong>
              <p>
                {searchQuery
                  ? `Try a different keyword instead of "${searchQuery}".`
                  : 'Create your first group to start messaging.'}
              </p>
            </div>
          ) : (
            <div className="group-list" role="list">
              {filteredGroups.map((group) => {
                const isActive = chatroom?._id === group._id;
                return (
                  <button
                    key={group._id || group.groupName}
                    type="button"
                    onClick={() => fetchMessagesForGroup(group)}
                    className={`group-item-btn ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span
                      className="avatar-badge"
                      style={{ background: getAvatarGradient(group.groupName) }}
                      aria-hidden="true"
                    >
                      {getInitials(group.groupName)}
                    </span>
                    <span className="group-item-meta">
                      <div className="group-item-name">{group.groupName}</div>
                      <div className="group-item-sub">Tap to open conversation</div>
                    </span>
                    <FiChevronRight className="group-item-arrow" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Main Chat Area */}
        <section className="chat-main" aria-label="Conversation">
          {errorBanner && (
            <div className="chat-error-banner" role="alert">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FiAlertCircle />
                {errorBanner}
              </span>
              <button
                type="button"
                className="chat-error-close"
                onClick={() => setErrorBanner('')}
                aria-label="Dismiss error"
              >
                <FiX />
              </button>
            </div>
          )}

          {!chatroom ? (
            <div className="chat-empty-room">
              <div className="chat-empty-icon" aria-hidden="true">
                <FiMessageSquare />
              </div>
              <h2>Select a group to start chatting</h2>
              <p>
                Pick an existing conversation from the sidebar or create a new
                group channel to collaborate in real time.
              </p>
            </div>
          ) : (
            <>
              <header className="chat-header">
                <div className="chat-header-left">
                  <button
                    type="button"
                    className="mobile-back-btn"
                    onClick={() => setRoom(null)}
                    aria-label="Back to groups"
                  >
                    <FiArrowLeft />
                  </button>
                  <span
                    className="avatar-badge avatar-badge-sm"
                    style={{ background: getAvatarGradient(chatroom.groupName) }}
                    aria-hidden="true"
                  >
                    {getInitials(chatroom.groupName)}
                  </span>
                  <div className="chat-header-info">
                    <h2 className="chat-header-title">{chatroom.groupName}</h2>
                    <p className="chat-header-sub">
                      <span className="online-dot" aria-hidden="true" />
                      <span>
                        {messages.length}{' '}
                        {messages.length === 1 ? 'message' : 'messages'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="chat-header-actions">
                  <button
                    type="button"
                    className="icon-action-btn"
                    onClick={() => fetchMessagesForGroup(chatroom)}
                    aria-label="Refresh messages"
                    title="Refresh messages"
                  >
                    <FiRefreshCw
                      className={isLoadingMessages ? 'spin-icon' : ''}
                    />
                  </button>
                  <button
                    type="button"
                    className={`icon-action-btn ${showGroupInfo ? 'is-active' : ''}`}
                    onClick={() => setShowGroupInfo((prev) => !prev)}
                    aria-label="Group details"
                    aria-expanded={showGroupInfo}
                    title="Group details"
                  >
                    <FiInfo />
                  </button>
                </div>
              </header>

              {showGroupInfo && (
                <div className="group-info-bar">
                  <span>
                    Channel: <strong>{chatroom.groupName}</strong>
                  </span>
                  <span className="group-info-pill">
                    {messages.length} total messages
                  </span>
                </div>
              )}

              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className="chat-messages-area"
              >
                {isLoadingMessages ? (
                  <div className="messages-loading-wrap">
                    <div className="spinner-lg" aria-hidden="true" />
                    <span>Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="messages-empty-wrap">
                    <strong>No messages here yet</strong>
                    <p>Send the first message to kick off the conversation.</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isSent =
                      message.sender === 'me' ||
                      message.userId?._id === userid ||
                      message.userId === userid;
                    const senderName =
                      !isSent &&
                      (message.userId?.username || message.senderName);
                    const timeLabel = formatMessageTime(message);

                    return (
                      <div
                        key={message._id || index}
                        className={`message-row ${isSent ? 'sent' : 'received'}`}
                      >
                        {senderName && (
                          <span className="message-sender">{senderName}</span>
                        )}
                        <div className="message-bubble">
                          <div>{message.messageText}</div>
                          {timeLabel && (
                            <div className="message-meta">
                              <span>{timeLabel}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {showScrollBottom && (
                <button
                  type="button"
                  className="scroll-bottom-btn"
                  onClick={() => scrollToBottom('smooth')}
                >
                  <FiChevronDown aria-hidden="true" />
                  <span>Latest</span>
                </button>
              )}

              <div className="chat-composer-wrap" ref={emojiContainerRef}>
                {showEmojiPicker && (
                  <div
                    className="emoji-popover"
                    role="dialog"
                    aria-label="Choose an emoji"
                  >
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="emoji-btn"
                        onClick={() => handleInsertEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div className="chat-composer">
                  <button
                    type="button"
                    className={`composer-icon-btn ${showEmojiPicker ? 'is-active' : ''}`}
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    aria-label="Toggle emoji picker"
                    aria-expanded={showEmojiPicker}
                  >
                    <FiSmile />
                  </button>
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    className="composer-textarea"
                    placeholder={`Message ${chatroom.groupName}...`}
                    aria-label="Message input"
                    value={newMessage}
                    onChange={handleTextareaChange}
                    onKeyDown={handleComposerKeyDown}
                    disabled={isSending}
                  />
                  <button
                    type="button"
                    className="composer-send-btn"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    aria-label="Send message"
                  >
                    <FiSend />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default Chat;
