import React from "react";
import LoginForm from "./LoginForm";

export default function LoginCard() {
  return (
    <div className="relative w-full max-w-[470px] overflow-hidden rounded-[24px] border-2 border-[#111111] bg-white shadow-[10px_12px_0_#111111]">
      <div className="absolute right-6 top-6 flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#ff6b5f]" />
        <span className="h-2 w-2 rounded-full bg-[#ffd84d]" />
        <span className="h-2 w-2 rounded-full bg-[#b7dc58]" />
      </div>


      <div className="px-7 pb-5 pt-8">
        <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#111111]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#b7dc58]" />
          Bem-vindo de volta
        </div>

        <h1 className="font-['Space_Grotesk',Arial,sans-serif] text-[clamp(36px,8vw,48px)] font-bold leading-[0.95] tracking-[-0.055em] text-[#111111]">
          Entre na
          <br />
          sua conta.
        </h1>

        <p className="mt-4 max-w-[360px] text-sm leading-relaxed text-[#686864]">
          Acesse sua organização e continue organizando seus rodízios.
        </p>
      </div>

      <div className="border-t-2 border-[#ffff] px-7 pb-8 pt-6">
        <LoginForm />
      </div>
    </div>
  );
}