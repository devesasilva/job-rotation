import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-green-50 flex flex-col items-center">
      <div className="relative w-full max-w-md">
        <div aria-hidden className="absolute -top-24 -left-90 w-[420px] h-[420px] rounded-full bg-red-300 opacity-80 blur-3xl"></div>
        <div aria-hidden className="absolute -top-40 left-90 w-[360px] h-[360px] rounded-full bg-lime-300 opacity-80 blur-2xl"></div>
        <div aria-hidden className="absolute top-20 left-60 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-violet-500 opacity-70 blur-2xl"></div>
        <div aria-hidden className="absolute top-90 right-90 w-[260px] h-[260px] rounded-full bg-fuchsia-400 opacity-60 blur-2xl"></div>

        <div className="pt-40 pb-8 px-6 flex flex-col items-center relative z-10">
          <div className="w-28 h-28 rounded-full flex items-center justify-center">
            {<img src="/black_logo.png" alt="logo" className="w-24 h-24 object-contain rounded-full" />}
          </div>

          <h1 className="mt-8 text-xl font-extrabold text-black-700 opacity-90">
            Olá! Boas-vindas
          </h1>

          <p className="mt-4 text-center text-sm text-gray-700 max-w-md leading-relaxed px-4">
            Uma ferramenta que simplifica e automatiza rodízios e escalas.
            Seja no âmbito pessoal ou corporativo, a Plataforma Job Rotation te ajuda.
          </p>


          <button
            onClick={() => navigate("/register")}
            className="mt-6 w-80 max-w-[86%] bg-[#0b0a0f] text-white rounded-full py-4 font-semibold text-lg cursor-pointer"
          >
            Começar Agora!
          </button>

          <button
            onClick={() => navigate("/login")}
            className="mt-6 text-lg font-semibold text-[#0b0a0f]/100 cursor-pointer"
          >
            Eu já tenho uma conta
          </button>

          <div className="mt-14" />
        </div>
      </div>

      <div className="home-indicator"></div>
    </div>
  );
}

export default Home;