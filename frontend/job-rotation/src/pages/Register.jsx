import React from 'react';
import RegisterCard from '../components/auth/RegisterCard';
import Background from '../components/Background';

function Register() {
  return (
    <div className="h-screen flex items-center justify-center bg-white relative overflow-hidden">
      <Background />
      <div className="w-full max-w-md px-4 z-10">
        <RegisterCard />
      </div>
    </div>
  );
}

export default Register;