import Link from "next/link";
import { Gavel, Shield, Copyright, Info, Code2, Mail } from "lucide-react";

export default function LegalPage() {
return ( <div className="max-w-4xl mx-auto py-8 px-4"> <div className="flex items-center gap-3 mb-8"> <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"> <Gavel className="w-5 h-5 text-accent" /> </div>

```
    <div>
      <h1 className="text-3xl font-bold text-white">
        Legal Information
      </h1>

      <p className="text-sm text-[#9CA3AF] mt-1">
        Information regarding platform operation, copyright, attribution,
        and third-party content.
      </p>
    </div>
  </div>

  <div className="space-y-5">

    {/* Platform Overview */}
    <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-6">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-accent mt-1 flex-shrink-0" />

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Platform Overview
          </h2>

          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            juggmylittlemovies is an independent movie discovery and
            watch-party platform. The service provides tools for browsing
            media information, creating shared viewing experiences, and
            accessing content made available through third-party services.
          </p>
        </div>
      </div>
    </div>

    {/* Open Source Attribution */}
    <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-6">
      <div className="flex items-start gap-3">
        <Code2 className="w-5 h-5 text-accent mt-1 flex-shrink-0" />

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Open Source Attribution
          </h2>

       <p className="text-sm text-[#9CA3AF] leading-relaxed">
  Special thanks to{" "}
  <a
    href="https://zynema.co"
    target="_blank"
    rel="noopener noreferrer"
    className="text-accent hover:underline"
  >
    Zynema.co
  </a>
  , whose open-source project served as the foundation for this platform.
  juggmylittlemovies builds upon that work with additional features,
  enhancements, and custom development.
</p>

          <p className="text-sm text-[#9CA3AF] leading-relaxed mt-3">
            Credit belongs to the original Zynema contributors for their
            work. All applicable open-source license requirements and
            attribution obligations are respected where required.
          </p>
        </div>
      </div>
    </div>

    {/* Third Party Content */}
    <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-6">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-accent mt-1 flex-shrink-0" />

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Third-Party Content
          </h2>

          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            Media content displayed through the platform may originate from
            external providers. juggmylittlemovies does not claim ownership
            of third-party movies, television programs, artwork,
            trademarks, logos, or other intellectual property.
          </p>

          <p className="text-sm text-[#9CA3AF] leading-relaxed mt-3">
            Availability of content is determined by the services providing
            it. External providers are responsible for the content they
            host and distribute.
          </p>
        </div>
      </div>
    </div>

    {/* Copyright */}
    <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-6">
      <div className="flex items-start gap-3">
        <Copyright className="w-5 h-5 text-accent mt-1 flex-shrink-0" />

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Copyright Notice
          </h2>

          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            Copyrights, trademarks, service marks, logos, images, and other
            intellectual property displayed through the platform remain the
            property of their respective owners.
          </p>

          <p className="text-sm text-[#9CA3AF] leading-relaxed mt-3">
            If you believe material appearing through the platform infringes
            your rights, please contact us with sufficient details so the
            matter can be reviewed.
          </p>
        </div>
      </div>
    </div>

    {/* Disclaimer */}
    <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-6">
      <div className="flex items-start gap-3">
        <Gavel className="w-5 h-5 text-accent mt-1 flex-shrink-0" />

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Disclaimer
          </h2>

          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            The platform is provided on an "as-is" and "as-available"
            basis. We make no guarantees regarding uptime, availability,
            accuracy of metadata, or uninterrupted access to third-party
            services.
          </p>

          <p className="text-sm text-[#9CA3AF] leading-relaxed mt-3">
            Users are responsible for complying with applicable laws and
            regulations in their jurisdiction when accessing third-party
            services.
          </p>
        </div>
      </div>
    </div>

    {/* Contact */}
    <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-6">
      <div className="flex items-start gap-3">
        <Mail className="w-5 h-5 text-accent mt-1 flex-shrink-0" />

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Contact
          </h2>

          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            Questions regarding this page or platform operations can be
            directed to:
          </p>

          <a
            href="mailto:osamabinoven@juggmylittlemovies.com"
            className="text-accent hover:underline text-sm mt-2 inline-block"
          >
            osamabinoven@juggmylittlemovies.com
          </a>
        </div>
      </div>
    </div>

  </div>

  <div className="mt-10 pt-6 border-t border-[#2A2A2A]">
    <p className="text-center text-xs text-[#6B7280]">
      © 2026 juggmylittlemovies. All rights reserved.
    </p>
  </div>
</div>
```

);
}
