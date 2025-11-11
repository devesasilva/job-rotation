import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-green-50 flex flex-col items-center">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-300/70 blur-[90px]"></div>
        <div className="absolute -top-56 left-52 w-[28rem] h-[28rem] rounded-full bg-purple-400/50 blur-[100px]"></div>
        <div className="absolute -top-24 right-[-80px] w-[22rem] h-[22rem] rounded-full bg-green-200/60 blur-[100px]"></div>
        <div className="absolute top-32 right-[-60px] w-[20rem] h-[20rem] rounded-full bg-orange-200/60 blur-[90px]"></div>

        <div className="pt-40 pb-8 px-6 flex flex-col items-center relative z-10">
          <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-md">
            {/* <img src="/Mídia.jpeg" alt="logo" className="w-16 h-16 object-contain rounded-full" /> */}
          </div>

          <h1 className="mt-8 text-xl font-extrabold text-gray-700 opacity-90">
            Olá! Boas-vindas
          </h1>

          <p className="mt-4 text-center text-sm text-gray-500 max-w-md leading-relaxed px-4">
            Uma ferramenta que simplifica e automatiza rodízios e escalas.
            Seja no âmbito pessoal ou corporativo, a Plataforma Job Rotation te ajuda.
          </p>


          <button
            onClick={() => navigate("/register")}
            className="mt-6 w-80 max-w-[86%] bg-[#0b0a0f] text-white rounded-xl py-4 font-semibold text-lg cursor-pointer"
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