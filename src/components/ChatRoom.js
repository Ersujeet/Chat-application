import React from 'react';
import { Navigate } from 'react-router-dom';

const ChatRoom = () => {
  const token = localStorage.getItem('token');
  return <Navigate to={token ? '/chat' : '/login'} replace />;
};

export default ChatRoom;
