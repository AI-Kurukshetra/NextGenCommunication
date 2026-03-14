export function CodeWindow() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 shadow-[0_32px_80px_rgba(2,6,23,0.22)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-xs uppercase tracking-[0.26em] text-slate-400">API Workflow</span>
      </div>
      <pre className="overflow-x-auto p-5 text-sm leading-7 text-slate-200">
        <code>{`const platform = new CPaaSClient(process.env.API_KEY);

await platform.messages.send({
  to: "+14155550101",
  from: "+14155559000",
  text: "Your technician is 12 minutes away."
});

await platform.voice.call({
  to: "+14155550101",
  from: "+14155559000",
  answerUrl: "https://api.nextgen.app/voice/answer",
  record: true
});

await platform.verify.start({
  to: "+14155550101",
  from: "+14155559000"
});`}</code>
      </pre>
    </div>
  );
}
