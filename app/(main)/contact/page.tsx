import { Mail, MessageCircle } from "lucide-react";

const discordUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent">Contact Us</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Get in touch</h1>
        <p className="mt-2 text-sm text-white/45">Reach the juggmylittlemovies team by email or Discord.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <a href="mailto:osamabinoven@juggmylittlemovies.com" className="rounded-2xl border border-white/[0.08] bg-[#141419] p-5 transition hover:border-accent/50 hover:bg-white/[0.04]">
          <Mail className="h-6 w-6 text-accent" />
          <h2 className="mt-4 font-bold text-white">Email</h2>
          <p className="mt-2 break-words text-sm text-white/55">osamabinoven@juggmylittlemovies.com</p>
        </a>
        <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/[0.08] bg-[#141419] p-5 transition hover:border-accent/50 hover:bg-white/[0.04]">
          <MessageCircle className="h-6 w-6 text-accent" />
          <h2 className="mt-4 font-bold text-white">Discord</h2>
          <p className="mt-2 text-sm text-white/55">Join the community server.</p>
        </a>
      </div>
    </div>
  );
}
