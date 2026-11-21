export default function NotificationToast({ notificacao }) {
  return (
    <div className="pointer-events-none fixed right-5 top-20 z-[70] w-[min(360px,calc(100vw-40px))] rounded-[12px] border-2 border-[#111111] bg-white p-4 shadow-[5px_5px_0_#111111]">
      <strong className="block text-sm">
        {notificacao.titulo}
      </strong>
      <p className="mt-1 text-xs font-normal text-[#686864]">
        {notificacao.mensagem}
      </p>
    </div>
  );
}
