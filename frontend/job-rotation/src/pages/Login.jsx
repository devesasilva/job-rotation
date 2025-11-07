import React, { useState } from 'react';
import LoginCard from '../components/auth/LoginCard';

function Login() {
  return (
    <div className="min-h-screen flex items-start justify-center bg-white relative overflow-hidden">
      <div aria-hidden className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-purple-300 opacity-80"></div>
      <div aria-hidden className="absolute -top-40 right-0 w-[360px] h-[360px] rounded-full bg-green-200 opacity-90"></div>
      <div aria-hidden className="absolute top-8 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-pink-300 opacity-90"></div>

      <div className="w-full max-w-md mt-28 px-4">
        <LoginCard />
      </div>
    </div>
  );
}

export default Login;