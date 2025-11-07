import React from 'react';
import LoginForm from './LoginForm';

export default function LoginCard() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-t-3xl shadow-md overflow-hidden">
      {/* Top rounded header */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-center text-lg font-extrabold text-gray-400">Entre na sua conta</h1>
      </div>

      <div className="px-6 pb-8">
        <LoginForm />
      </div>
    </div>
  );
}
