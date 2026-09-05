import React from 'react';
import LoginForm from './LoginForm';
import ButtonBack from '../ButtonBack';

export default function LoginCard() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-md overflow-hidden">
      <ButtonBack />
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-center text-xl font-extrabold text-slate-950">Entre na sua conta</h1>
      </div>

      <div className="px-6 pb-8">
        <LoginForm />
      </div>
    </div>
  );
}
