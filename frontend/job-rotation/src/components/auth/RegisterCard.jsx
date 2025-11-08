import React from 'react';
import RegisterForm from './RegisterForm';

export default function RegisterCard() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-md overflow-hidden">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-center text-lg font-extrabold text-slate-950">Crie sua conta</h1>
      </div>

      <div className="px-6 pb-8">
        <RegisterForm />
      </div>
    </div>
  );
}
