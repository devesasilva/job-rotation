import React from 'react';
import { useNavigate } from "react-router-dom";
import RegisterForm from './RegisterForm';
import ButtonBack from '../ButtonBack';

export default function RegisterCard() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-md overflow-hidden">
      <ButtonBack />
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-center text-xl font-extrabold text-slate-950">Crie sua conta</h1>
      </div>
      <div className="px-6 pb-8">
        <RegisterForm />
      </div>
    </div>
  );
}
