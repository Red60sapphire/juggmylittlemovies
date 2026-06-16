import Link from "next/link";
import { Gavel, Shield, Trash2, Copyright, Info, Mail } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Gavel className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Legal Information</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            DaMovies operates as a content discovery platform
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-white mb-2">No Hosting Policy</h2>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">
                DaMovies functions solely as an aggregator that indexes publicly available content from across the web. We do not upload, store, or host any media files on our infrastructure. All streams and downloads originate from external third-party platforms.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-5">
          <div className="flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-white mb-2">Content Removal Requests</h2>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">
                Since DaMovies does not host any files, we cannot directly remove content. All removal requests must be submitted to the original hosting platforms where the content actually resides. We have no technical ability to delete files we don't control.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-5">
          <div className="flex items-start gap-3">
            <Copyright className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-white mb-2">Copyright Concerns</h2>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">
                We respect intellectual property rights and operate within legal boundaries. If you're a copyright holder seeking to report content, we're happy to assist by directing you to the source where we discovered the material. Contact us and we'll provide what information we can.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-white mb-2">Disclaimer</h2>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">
                DaMovies only utilizes publicly accessible data and APIs. We maintain no ownership or control over any media content. Users are solely responsible for how they interact with third-party services accessed through our platform.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-5">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-white mb-2">Contact Information</h2>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">
                For general inquiries or to report issues:{" "}
                <a href="mailto:contact@damovies.net" className="text-accent hover:underline">
                  contact@damovies.net
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] p-5">
          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            <strong className="text-white">Important:</strong> DaMovies does not host any content. We aggregate links to publicly available media from third-party sources. For content-specific matters, please reach out directly to the websites hosting the files, as they have full control over their content.
          </p>
          <p className="text-sm text-[#9CA3AF] leading-relaxed mt-3">
            We will cooperate with legitimate legal requests to the extent technically possible, but please understand that we cannot remove content from servers we don't operate.
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-[#555] mt-8">
        &copy; 2026 DaMovies
      </p>
    </div>
  );
}
