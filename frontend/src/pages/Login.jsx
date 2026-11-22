import React from "react";
import LoginCard from "../components/auth/LoginCard";

function Login() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-10 text-[#111111]">
      <div className="relative z-10 w-full max-w-[470px]">
      <LoginCard />
      </div>
    </div>
  );
}

export default Login;