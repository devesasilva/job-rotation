import React from 'react';

function Background() {
  return (
    <>
      <div aria-hidden className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full bg-red-300 opacity-80 blur-[120px]"></div>
      <div aria-hidden className="absolute -top-60 right-[-50px] w-[360px] h-[360px] rounded-full bg-lime-300 opacity-80 blur-[100px]"></div>
      <div aria-hidden className="absolute top-10 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-violet-500 opacity-70 blur-[100px]"></div>
      <div aria-hidden className="absolute bottom-[-10px] left-[-50px] w-[260px] h-[260px] rounded-full bg-fuchsia-400 opacity-60 blur-[90px]"></div>
      <div aria-hidden className="absolute top-1/4 left-[-100px] w-[320px] h-[320px] rounded-full bg-cyan-300/60 opacity-60 blur-[110px]"></div>
      <div aria-hidden className="absolute top-1/4 right-[-100px] w-[280px] h-[280px] rounded-full bg-yellow-300/60 opacity-70 blur-[95px]"></div>
      <div aria-hidden className="absolute bottom-[-100px] right-1/4 w-[380px] h-[380px] rounded-full bg-orange-200/50 opacity-50 blur-[130px]"></div>
      <div aria-hidden className="absolute bottom-[-20px] left-1/4 w-[250px] h-[250px] rounded-full bg-teal-400/70 opacity-70 blur-[80px]"></div>
    </>
  );
}

export default Background;