import { Shield, Mail, Scale } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white">
          Legal & DMCA
        </h1>
        <p className="text-[#9CA3AF] mt-3 max-w-2xl mx-auto">
          Copyright, content policies, and how this platform operates.
        </p>
      </div>

      <div className="space-y-6">

        <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">
              No Content Hosted
            </h2>
          </div>
          <p className="text-[#9CA3AF] leading-relaxed">
            juggmylittlemovies does not host, store, upload, or distribute any
            media files, video streams, or copyrighted content on its servers
            or databases. All video content displayed on this platform is
            embedded from third-party services that are not affiliated with
            juggmylittlemovies.
          </p>
          <p className="text-[#9CA3AF] leading-relaxed mt-3">
            This platform functions solely as a discovery and directory tool,
            linking to publicly available embedded streams from external
            providers. We have no control over the content, uptime, or
            availability of these third-party services.
          </p>
        </section>

        <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">
              DMCA & Copyright
            </h2>
          </div>
          <p className="text-[#9CA3AF] leading-relaxed">
            All movies, television shows, logos, artwork, trademarks, and
            related intellectual property displayed on this platform belong
            to their respective owners. juggmylittlemovies does not claim
            ownership of any third-party content.
          </p>
          <p className="text-[#9CA3AF] leading-relaxed mt-3">
            If you are a copyright holder and believe that your work has been
            made available through this platform in a way that infringes your
            copyright, please contact us with the following information:
          </p>
          <ul className="text-[#9CA3AF] leading-relaxed mt-3 list-disc list-inside space-y-1 text-sm">
            <li>Identification of the copyrighted work claimed to be infringed</li>
            <li>Identification of the material that is claimed to be infringing</li>
            <li>Your contact information, including address, telephone, and email</li>
            <li>A statement that you have a good faith belief that use is not authorized</li>
            <li>A statement, under penalty of perjury, that the information is accurate</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">
              Contact
            </h2>
          </div>
          <p className="text-[#9CA3AF]">
            For DMCA takedown requests or legal inquiries:
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
          &copy; {new Date().getFullYear()} juggmylittlemovies
        </p>
      </div>

    </div>
  );
}
