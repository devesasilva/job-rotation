import React from "react";
import { useNavigate } from "react-router-dom";
import Background from "../components/Background";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center bg-white relative overflow-hidden">
      <Background />
      <div className="pt-40 pb-8 px-6 flex flex-col items-center relative z-10">
        <img src="/logo_black.png" alt="logo" className="w-24 h-24 object-contain rounded-full" />

        <h1 className="mt-8 text-2xl font-extrabold text-black-700">Job Rotation</h1>
        <p className="mt-4 text-center text-base text-black max-w-md leading-relaxed px-4 font-bold">
          Movimentando equipes, capacitando pessoas.
        </p>
        <p className="mt-2 text-center text-sm text-black max-w-md leading-relaxed font-medium">
          Uma ferramenta que simplifica e automatiza rodízios e escalas.
          Seja no âmbito pessoal ou corporativo, a Plataforma Job Rotation te ajuda.
        </p>

        <button onClick={() => navigate("/register")} className="mt-6 w-80 max-w-[86%] bg-[#0b0a0f] text-white rounded-xl py-4 font-semibold text-lg cursor-pointer hover:bg-gray-800">
          Começar Agora!
        </button>

        <button onClick={() => navigate("/login")} className="mt-6 text-lg font-semibold text-[#0b0a0f]/100 cursor-pointer">
          Eu já tenho uma conta
        </button>

        <div className="mt-14" />
      </div>

      <div className="home-indicator"></div>
    </div>
  );
}

export default Home;