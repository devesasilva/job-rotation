import React from 'react';
import LoginCard from '../components/auth/LoginCard';

function Login() {
  return (
    <div className="h-screen flex items-center justify-center bg-white relative overflow-hidden">
      <div aria-hidden className="absolute -top-24 left-30 w-[420px] h-[420px] rounded-full bg-red-300 opacity-80 blur-3xl"></div>
      <div aria-hidden className="absolute -top-40 left-200 w-[360px] h-[360px] rounded-full bg-lime-300 opacity-80 blur-2xl"></div>
      <div aria-hidden className="absolute top-90 left-150 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-violet-500 opacity-70 blur-2xl"></div>
      <div aria-hidden className="absolute top-50 right-70 w-[260px] h-[260px] rounded-full bg-fuchsia-400 opacity-60 blur-2xl"></div>
      <div className="w-full max-w-md px-4 z-10">
        <LoginCard />
      </div>
    </div>
  );
}

export default Login;