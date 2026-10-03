import React from "react";
import RegisterCard from "../components/auth/RegisterCard";

function Register() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-10 text-[#111111]">
      <div className="relative z-10 w-full max-w-[470px]">
        <RegisterCard />
      </div>
    </div>
  );
}

export default Register;