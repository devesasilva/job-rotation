import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Header com borda ao rolar
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", handleScroll);

    // Animações de entrada
    const revealElements = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-6");
            entry.target.classList.add("opacity-100", "translate-y-0");

            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      revealObserver.disconnect();
    };
  }, []);

  const handleRegister = () => {
    navigate("/register");
  };

  const handleEmailSubmit = (event) => {
    event.preventDefault();

    const email = event.target.email.value.trim();

    if (!email) return;

    sessionStorage.setItem("jobRotationSignupEmail", email);

    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-white text-[#111111] font-['DM_Sans',Arial,sans-serif] text-base leading-[1.5]">
      {/* HEADER */}
      <header
        className={`sticky top-0 z-20 bg-white/[0.94] backdrop-blur-[10px] border-b transition-all duration-300 ${
          scrolled ? "border-[#deded9]" : "border-transparent"
        }`}
      >
        <div className="w-[min(1160px,calc(100%-40px))] mx-auto h-[74px] flex items-center justify-between gap-[30px] max-[620px]:h-16">
          {/* BRAND */}
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            aria-label="Job Rotation"
            className="flex items-center gap-[10px] font-bold tracking-[-0.04em] text-[18px] bg-transparent border-0 p-0 text-[#111111] cursor-pointer"
          >
            <span className="relative w-[30px] h-[30px] border-2 border-[#111111] rounded-lg overflow-hidden grid place-items-center before:content-[''] before:absolute before:w-[7px] before:h-[7px] before:rounded-full before:bg-[#ff6b5f] before:top-[5px] before:left-[5px] after:content-[''] after:absolute after:w-[7px] after:h-[7px] after:rounded-full after:bg-[#b7dc58] after:right-[5px] after:bottom-[5px]" />
            <span>Job Rotation</span>
          </button>

          {/* NAV */}
          <nav
            aria-label="Navegação principal"
            className="flex items-center gap-7 text-[#3f3f3c] text-sm font-medium max-[900px]:hidden"
          >
            <a
              href="#para-quem"
              className="hover:underline hover:underline-offset-4"
            >
              Para quem
            </a>

            <a
              href="#como-funciona"
              className="hover:underline hover:underline-offset-4"
            >
              Como funciona
            </a>

            <a
              href="#valor"
              className="hover:underline hover:underline-offset-4"
            >
              Por que usar
            </a>
          </nav>

          {/* CTA HEADER */}
          <button
            onClick={handleRegister}
            className="px-[17px] py-[10px] bg-[#111111] text-white rounded-lg font-semibold cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 max-[620px]:px-[13px] max-[620px]:py-[9px] max-[620px]:text-[13px]"
          >
            Começar agora
          </button>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="w-[min(1160px,calc(100%-40px))] mx-auto min-h-[650px] grid grid-cols-[1.05fr_0.95fr] items-center gap-[70px] py-[70px] pb-20 max-[900px]:grid-cols-1 max-[900px]:gap-[45px] max-[900px]:pt-[55px] max-[620px]:py-12 max-[620px]:pb-[60px] max-[620px]:min-h-0">
          {/* HERO TEXT */}
          <div className="reveal opacity-0 translate-y-6 transition-[opacity,transform] duration-700 ease-in-out">
            <div className="inline-flex items-center gap-2 text-[13px] font-bold mb-6">
              <span className="w-[9px] h-[9px] rounded-full bg-[#ff6b5f]" />
              Rodízio de funções, sem planilhas
            </div>

            <h1 className="font-['Space_Grotesk',Arial,sans-serif] tracking-[-0.055em] leading-[0.98] m-0 text-[clamp(52px,7vw,86px)] max-w-[700px] max-[620px]:text-[51px]">
              Faça o trabalho{" "}
              <span className="relative inline z-[1] after:content-[''] after:absolute after:z-[-1] after:left-[-5px] after:right-[-5px] after:bottom-[2px] after:h-4 after:bg-[#ffd84d] after:rotate-[-1.5deg]">
                circular.
              </span>
            </h1>

            <p className="max-w-[590px] mt-[27px] text-[19px] text-[#4e4e4a] max-[620px]:text-[17px]">
              O Job Rotation ajuda sua organização a criar rodízios de funções,
              distribuir responsabilidades e avisar cada pessoa quando chega a
              sua vez.
            </p>

            <div className="flex items-center gap-3 mt-8 flex-wrap">
              <button
                onClick={handleRegister}
                className="inline-flex items-center justify-center gap-[9px] min-h-12 px-[21px] border-2 border-[#111111] rounded-[9px] font-bold cursor-pointer transition-all duration-200 bg-[#111111] text-white hover:-translate-y-[3px] hover:shadow-[5px_5px_0_#111111]"
              >
                Criar minha organização →
              </button>

              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-[9px] min-h-12 px-[21px] border-2 border-[#111111] rounded-[9px] font-bold cursor-pointer transition-all duration-200 bg-white text-[#111111] hover:-translate-y-[3px] hover:shadow-[5px_5px_0_#111111]"
              >
                Ver como funciona
              </a>
            </div>

            <div className="text-xs text-[#686864] mt-[14px]">
              Para equipes, projetos, ONGs, comunidades e organizações de
              todos os tamanhos.
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="reveal opacity-0 translate-y-6 transition-[opacity,transform] duration-700 ease-in-out relative min-h-[440px] grid place-items-center max-[900px]:max-w-[590px] max-[900px]:w-full max-[900px]:mx-auto">
            <div className="w-full max-w-[490px] aspect-[1/0.92] border-2 border-[#111111] rounded-[24px] bg-[#f8f7f4] relative p-[26px] shadow-[12px_14px_0_#111111] rotate-[1.3deg] max-[620px]:p-[18px] max-[620px]:shadow-[8px_9px_0_#111111]">
              <div className="flex items-center justify-between pb-[18px] border-b-2 border-[#111111]">
                <div className="font-['Space_Grotesk'] text-xl font-bold">
                  Rodízio semanal
                </div>

                <div className="flex gap-[5px]">
                  <i className="block w-[6px] h-[6px] bg-[#111111] rounded-full" />
                  <i className="block w-[6px] h-[6px] bg-[#111111] rounded-full" />
                  <i className="block w-[6px] h-[6px] bg-[#111111] rounded-full" />
                </div>
              </div>

              <div className="mt-[18px] p-[14px] bg-white border-[1.5px] border-[#111111] rounded-[13px]">
                <strong className="text-[13px]">
                  Equipe de comunicação
                </strong>

                {/* Ana */}
                <div className="grid grid-cols-[42px_1fr_auto] items-center gap-[10px] py-3 border-b border-[#deded9] last:border-b-0">
                  <div className="w-[38px] h-[38px] grid place-items-center border-[1.5px] border-[#111111] rounded-full text-xs font-bold bg-[#ff6b5f]">
                    AM
                  </div>

                  <div>
                    <div className="font-bold text-[13px]">
                      Ana Martins
                    </div>

                    <div className="text-[11px] text-[#686864]">
                      Conteúdo → Atendimento
                    </div>
                  </div>

                  <div className="text-[10px] px-[7px] py-[5px] border border-[#111111] rounded-full font-bold">
                    ATUAL
                  </div>
                </div>

                {/* João */}
                <div className="grid grid-cols-[42px_1fr_auto] items-center gap-[10px] py-3 border-b border-[#deded9]">
                  <div className="w-[38px] h-[38px] grid place-items-center border-[1.5px] border-[#111111] rounded-full text-xs font-bold bg-[#8eb9ff]">
                    JP
                  </div>

                  <div>
                    <div className="font-bold text-[13px]">
                      João Pedro
                    </div>

                    <div className="text-[11px] text-[#686864]">
                      Atendimento → Eventos
                    </div>
                  </div>

                  <div className="text-[10px] px-[7px] py-[5px] border border-[#111111] rounded-full font-bold">
                    PRÓXIMO
                  </div>
                </div>

                {/* Luiza */}
                <div className="grid grid-cols-[42px_1fr_auto] items-center gap-[10px] py-3">
                  <div className="w-[38px] h-[38px] grid place-items-center border-[1.5px] border-[#111111] rounded-full text-xs font-bold bg-[#b7dc58]">
                    LS
                  </div>

                  <div>
                    <div className="font-bold text-[13px]">
                      Luiza Silva
                    </div>

                    <div className="text-[11px] text-[#686864]">
                      Eventos → Conteúdo
                    </div>
                  </div>

                  <div className="text-[10px] px-[7px] py-[5px] border border-[#111111] rounded-full font-bold">
                    DEPOIS
                  </div>
                </div>
              </div>
            </div>

            {/* FLOATING */}
            <div className="absolute top-[23px] right-[-3px] px-[15px] py-3 border-2 border-[#111111] rounded-xl text-xs font-bold bg-[#b7dc58] shadow-[4px_5px_0_#111111] rotate-[5deg] max-[620px]:hidden">
              ✓ Aviso enviado
            </div>

            <div className="absolute bottom-7 left-[-12px] px-[15px] py-3 border-2 border-[#111111] rounded-xl text-xs font-bold bg-[#8eb9ff] shadow-[4px_5px_0_#111111] rotate-[-5deg] max-[620px]:hidden">
              3 funções · 3 pessoas
            </div>
          </div>
        </section>

        {/* STRIP */}
        <div
          className="border-y-2 border-[#111111] overflow-hidden bg-[#ffd84d]"
          aria-hidden="true"
        >
          <div className="flex w-max">
            {[
              "Organize",
              "Compartilhe responsabilidades",
              "Crie rodízios",
              "Avise sua equipe",
              "Organize",
              "Compartilhe responsabilidades",
              "Crie rodízios",
              "Avise sua equipe",
            ].map((item, index) => (
              <div
                key={index}
                className="px-6 py-[13px] font-['Space_Grotesk'] text-sm font-bold whitespace-nowrap after:content-['✦'] after:ml-6"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* PARA QUEM */}
        <section
          id="para-quem"
          className="py-[100px] bg-[#f8f7f4] max-[620px]:py-[75px]"
        >
          <div className="w-[min(1160px,calc(100%-40px))] mx-auto max-[620px]:w-[min(calc(100%-28px),1160px)]">
            <div className="reveal opacity-0 translate-y-6 transition-[opacity,transform] duration-700 ease-in-out max-w-[720px] mb-[52px]">
              <div className="text-xs uppercase tracking-[0.12em] font-bold mb-[15px]">
                Para quem é
              </div>

              <h2 className="font-['Space_Grotesk',Arial,sans-serif] tracking-[-0.055em] leading-[0.98] m-0 text-[clamp(39px,5vw,64px)]">
                Se existe uma equipe, existe um jeito de revezar.
              </h2>

              <p className="mt-[19px] text-[17px] text-[#686864] max-w-[630px]">
                O Job Rotation não foi feito para um único tipo de empresa.
                Ele funciona onde pessoas precisam compartilhar funções e
                responsabilidades.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
              {[
                {
                  icon: "↗",
                  title: "Pequenas empresas",
                  text: "Evite que uma única pessoa concentre uma função e ajude o time a conhecer outras atividades.",
                  color: "#ff6b5f",
                },
                {
                  icon: "◎",
                  title: "Times e departamentos",
                  text: "Crie uma rotina clara para alternar responsabilidades dentro de uma equipe.",
                  color: "#b7dc58",
                },
                {
                  icon: "♡",
                  title: "ONGs e projetos sociais",
                  text: "Organize voluntários e distribua tarefas sem depender de mensagens espalhadas.",
                  color: "#8eb9ff",
                },
                {
                  icon: "✦",
                  title: "Organizações religiosas",
                  text: "Planeje escalas e rodízios de funções de forma simples e transparente.",
                  color: "#ffd84d",
                },
                {
                  icon: "⌘",
                  title: "Projetos acadêmicos",
                  text: "Distribua papéis entre integrantes e facilite a participação ao longo do projeto.",
                  color: "#c7a4f5",
                },
                {
                  icon: "+",
                  title: "Qualquer grupo",
                  text: "Se vocês dividem responsabilidades, o Job Rotation pode ajudar a organizar o revezamento.",
                  color: "#ff6b5f",
                },
              ].map((card, index) => (
                <article
                  key={index}
                  className="reveal opacity-0 translate-y-6 transition-[opacity,transform,translate] duration-700 ease-in-out min-h-[220px] p-[26px] bg-white border-[1.5px] border-[#111111] rounded-[18px] transition-transform hover:-translate-y-1.5 hover:rotate-[-0.5deg]"
                >
                  <div
                    className="w-[46px] h-[46px] grid place-items-center border-[1.5px] border-[#111111] rounded-xl text-[21px] mb-[30px]"
                    style={{ backgroundColor: card.color }}
                  >
                    {card.icon}
                  </div>

                  <h3 className="font-['Space_Grotesk'] text-[23px] tracking-[-0.055em] leading-[0.98] mb-[9px]">
                    {card.title}
                  </h3>

                  <p className="text-sm text-[#686864] m-0">
                    {card.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section
          id="como-funciona"
          className="py-[100px] max-[620px]:py-[75px]"
        >
          <div className="w-[min(1160px,calc(100%-40px))] mx-auto max-[620px]:w-[min(calc(100%-28px),1160px)]">
            <div className="reveal opacity-0 translate-y-6 transition-[opacity,transform] duration-700 ease-in-out max-w-[720px] mb-[52px]">
              <div className="text-xs uppercase tracking-[0.12em] font-bold mb-[15px]">
                Como funciona
              </div>

              <h2 className="font-['Space_Grotesk',Arial,sans-serif] tracking-[-0.055em] leading-[0.98] m-0 text-[clamp(39px,5vw,64px)]">
                Quatro passos. Uma rotina mais organizada.
              </h2>
            </div>

            <div className="grid grid-cols-4 border-y-[1.5px] border-[#111111] max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
              {[
                {
                  number: "01",
                  title: "Crie sua organização",
                  text: "Cadastre seu grupo e defina o espaço onde os rodízios vão acontecer.",
                  color: "#ff6b5f",
                },
                {
                  number: "02",
                  title: "Adicione pessoas",
                  text: "Inclua os membros da equipe e as funções que fazem parte da rotina.",
                  color: "#ffd84d",
                },
                {
                  number: "03",
                  title: "Monte o rodízio",
                  text: "Defina a sequência de funções e organize quem assume cada responsabilidade.",
                  color: "#8eb9ff",
                },
                {
                  number: "04",
                  title: "Cada um é avisado",
                  text: "Quando chegar a hora da troca, o membro recebe o aviso da nova rotação.",
                  color: "#b7dc58",
                },
              ].map((step, index) => (
                <article
                  key={index}
                  className={`reveal opacity-0 translate-y-6 transition-[opacity,transform] duration-700 ease-in-out min-h-[260px] p-[28px_23px] relative border-r-[1.5px] border-[#111111] ${
                    index === 1
                      ? "max-[900px]:border-r-0"
                      : ""
                  } ${
                    index < 2
                      ? "max-[900px]:border-b-[1.5px] max-[900px]:border-[#111111]"
                      : ""
                  } max-[620px]:border-r-0 max-[620px]:border-b-[1.5px] max-[620px]:border-[#111111] ${
                    index === 3
                      ? "border-r-0 max-[620px]:border-b-0"
                      : ""
                  }`}
                >
                  <div
                    className="inline-grid place-items-center w-9 h-9 border-[1.5px] border-[#111111] rounded-full font-bold mb-[75px] max-[620px]:mb-[45px]"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.number}
                  </div>

                  <h3 className="font-['Space_Grotesk'] text-[21px] tracking-[-0.055em] leading-[0.98] mb-[9px]">
                    {step.title}
                  </h3>

                  <p className="text-sm text-[#686864] m-0">
                    {step.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* VALOR */}
        <section
          id="valor"
          className="py-[100px] bg-[#111111] text-white max-[620px]:py-[75px]"
        >
          <div className="w-[min(1160px,calc(100%-40px))] mx-auto grid grid-cols-[0.8fr_1.2fr] gap-20 items-start max-[900px]:grid-cols-1 max-[900px]:gap-[45px] max-[620px]:w-[min(calc(100%-28px),1160px)]">
            <div className="reveal opacity-0 translate-y-6 transition-[opacity,transform] duration-700 ease-in-out">
              <div className="text-xs uppercase tracking-[0.12em] font-bold mb-[15px]">
                Por que usar
              </div>

              <h2 className="font-['Space_Grotesk',Arial,sans-serif] tracking-[-0.055em] leading-[0.98] m-0 text-[clamp(39px,5vw,64px)] max-w-[500px]">
                Menos improviso. Mais participação.
              </h2>

              <p className="text-[#c4c4c0] max-w-[480px] text-base mt-5">
                O produto transforma uma rotina que costuma ficar em
                planilhas, grupos de mensagem ou na cabeça de uma pessoa em
                um processo organizado.
              </p>
            </div>

            <div className="reveal opacity-0 translate-y-6 transition-[opacity,transform] duration-700 ease-in-out border-t border-[#555555]">
              {[
                {
                  number: "01",
                  title: "Distribua responsabilidades",
                  text: "Deixe claro quem participa de cada função e quando acontece a troca.",
                },
                {
                  number: "02",
                  title: "Compartilhe conhecimento",
                  text: "O rodízio cria oportunidades para diferentes pessoas conhecerem diferentes funções.",
                },
                {
                  number: "03",
                  title: "Evite depender de uma pessoa",
                  text: "Uma rotina de revezamento ajuda a tornar o funcionamento do grupo mais distribuído.",
                },
                {
                  number: "04",
                  title: "Tenha tudo em um só lugar",
                  text: "Organização, funções, pessoas e rodízios ficam reunidos em uma única ferramenta.",
                },
              ].map((item) => (
                <div
                  key={item.number}
                  className="grid grid-cols-[50px_1fr] gap-[18px] py-[22px] border-b border-[#555555]"
                >
                  <div className="font-['Space_Grotesk'] text-sm pt-0.5">
                    {item.number}
                  </div>

                  <div>
                    <h3 className="font-['Space_Grotesk'] text-[21px] tracking-[-0.055em] leading-[0.98] mb-1.5">
                      {item.title}
                    </h3>

                    <p className="text-[#aaaaaa] m-0 text-sm">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          id="cadastro"
          className="py-[115px] pb-[120px] text-center max-[620px]:py-[75px]"
        >
          <div className="reveal opacity-0 translate-y-6 transition-[opacity,transform] duration-700 ease-in-out w-[min(1160px,calc(100%-40px))] mx-auto max-w-[880px] relative max-[620px]:w-[min(calc(100%-28px),1160px)]">
            <div className="text-xs uppercase tracking-[0.12em] font-bold mb-[15px]">
              Pronto para começar?
            </div>

            <h2 className="font-['Space_Grotesk',Arial,sans-serif] tracking-[-0.055em] leading-[0.98] m-0 text-[clamp(48px,7vw,82px)]">
              Coloque o rodízio para{" "}
              <em className="not-italic relative z-[1] after:content-[''] after:absolute after:z-[-1] after:left-[-9px] after:right-[-9px] after:bottom-0 after:h-[19px] after:bg-[#b7dc58] after:rotate-[-1deg]">
                funcionar.
              </em>
            </h2>

            <p className="max-w-[560px] mx-auto mt-6 text-[17px] text-[#686864]">
              Crie sua organização, adicione sua equipe e monte seu primeiro
              rodízio. Sem complicação.
            </p>

            <form
              className="mt-8 flex w-[min(510px,100%)] mx-auto gap-2 max-[620px]:flex-col"
              onSubmit={handleEmailSubmit}
            >
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                aria-label="Seu e-mail"
                required
                className="flex-1 min-w-0 h-[52px] border-2 border-[#111111] rounded-[9px] px-4 outline-none bg-white focus:shadow-[4px_4px_0_#ffd84d] max-[620px]:w-full"
              />

              <button
                type="submit"
                className="h-[52px] px-5 border-2 border-[#111111] rounded-[9px] bg-[#111111] text-white font-bold cursor-pointer hover:bg-[#303030] max-[620px]:w-full"
              >
                Começar →
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t-[1.5px] border-[#111111] py-[25px]">
        <div className="w-[min(1160px,calc(100%-40px))] mx-auto flex items-center justify-between gap-5 text-[13px] text-[#555555] max-[620px]:w-[min(calc(100%-28px),1160px)] max-[620px]:flex-col max-[620px]:items-start">
          <div className="flex items-center gap-[10px] font-bold tracking-[-0.04em] text-[18px] text-[#111111]">
            <span className="relative w-[30px] h-[30px] border-2 border-[#111111] rounded-lg overflow-hidden grid place-items-center before:content-[''] before:absolute before:w-[7px] before:h-[7px] before:rounded-full before:bg-[#ff6b5f] before:top-[5px] before:left-[5px] after:content-[''] after:absolute after:w-[7px] after:h-[7px] after:rounded-full after:bg-[#b7dc58] after:right-[5px] after:bottom-[5px]" />
            <span>Job Rotation</span>
          </div>

          <div>Organize. Reveze. Participe.</div>

          <div className="flex gap-5">
            <a href="#para-quem">Para quem</a>
            <a href="#como-funciona">Como funciona</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;