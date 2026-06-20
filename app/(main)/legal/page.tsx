import { Code2, Heart, ExternalLink, Shield, Mail } from "lucide-react";

export default function CreditsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white">
          About & Credits
        </h1>

        <p className="text-[#9CA3AF] mt-3 max-w-2xl mx-auto">
          Learn more about juggmylittlemovies, the technology behind it,
          and the open-source projects that helped make it possible.
        </p>
      </div>

      <div className="space-y-6">

        {/* About */}
        <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-6">
          <h2 className="text-xl font-semibold text-white mb-3">
            About This Project
          </h2>

          <p className="text-[#9CA3AF] leading-relaxed">
            juggmylittlemovies is a movie discovery and watch-party platform
            designed to make it easy for friends to browse content, create
            rooms, and enjoy synchronized viewing experiences together.
          </p>

          <p className="text-[#9CA3AF] leading-relaxed mt-3">
            The platform focuses on simplicity, speed, and community-driven
            viewing while continuing to evolve through ongoing development
            and feature improvements.
          </p>
        </section>

        {/* Open Source */}
        <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">
              Open Source Foundation
            </h2>
          </div>

          <p className="text-[#9CA3AF] leading-relaxed">
            This project is built upon the foundation created by the team behind
            Zynema. Their open-source work provided much of the inspiration and
            architecture that helped shape this platform.
          </p>

          <p className="text-[#9CA3AF] leading-relaxed mt-3">
            Since then, the project has been customized with its own design,
            watch-party systems, room synchronization features, backend
            integrations, and platform-specific functionality.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <a
              href="https://zynema.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            >
              Visit Zynema
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* Credits */}
        <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">
              Acknowledgements
            </h2>
          </div>

          <p className="text-[#9CA3AF] leading-relaxed">
            We are grateful to the developers, contributors, and open-source
            communities whose projects, tools, and ideas help make platforms
            like this possible.
          </p>
        </section>

        {/* Legal */}
        <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">
              Content & Intellectual Property
            </h2>
          </div>

          <p className="text-[#9CA3AF] leading-relaxed">
            All movies, television shows, logos, artwork, trademarks, and
            related intellectual property belong to their respective owners.
          </p>

          <p className="text-[#9CA3AF] leading-relaxed mt-3">
            juggmylittlemovies does not claim ownership of any third-party
            content and respects the rights of copyright holders.
          </p>
        </section>

        {/* Contact */}
        <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">
              Contact
            </h2>
          </div>

          <p className="text-[#9CA3AF]">
            Questions, feedback, or business inquiries can be sent to:
          </p>

          <a
            href="mailto:osamabinoven@juggmylittlemovies.com"
            className="text-accent hover:underline mt-3 inline-block"
          >
            osamabinoven@juggmylittlemovies.com
          </a>
        </section>

      </div>

      <div className="text-center mt-12 pt-6 border-t border-[#2A2A2A]">
        <p className="text-sm text-[#6B7280]">
          © 2026 juggmylittlemovies
        </p>
      </div>

    </div>
  );
}
