import React from 'react';
import LoginCard from '../components/auth/LoginCard';
import Background from '../components/Background';

function Login() {
  return (
    <div className="h-screen flex items-center justify-center bg-white relative overflow-hidden">
      <Background />
      <div className="w-full max-w-md px-4 z-10">
        <LoginCard />
      </div>
    </div>
  );
}

export default Login;