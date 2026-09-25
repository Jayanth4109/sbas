import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { WhatsappIcon, Location01Icon } from "@hugeicons/core-free-icons";
import { Text } from "@/components/stepwise/typography";
import { STORE_ADDRESS, STORE_MAP_LINK } from "@/lib/store";

export function SiteFooter({ storeName }: { storeName: string }) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <footer className="border-t border-[var(--ui-border-subtle)] bg-[var(--brand-strong)] text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-[13px] font-semibold">
              SB
            </span>
            <Text variant="h6" className="text-white">
              {storeName}
            </Text>
          </div>
          <Text variant="caption-soft" className="text-white/60">
            Trusted Ayurvedic medicines for your family, the same way we&apos;ve always served
            our community.
          </Text>
        </div>

        <div className="flex flex-col gap-3">
          <Text variant="caption" className="uppercase tracking-wide text-white/45">
            Explore
          </Text>
          <Link href="/products">
            <Text variant="body-soft" className="text-white/75 hover:text-white">
              All products
            </Text>
          </Link>
          <Link href="/cart">
            <Text variant="body-soft" className="text-white/75 hover:text-white">
              Your cart
            </Text>
          </Link>
          <Link href="/account/orders">
            <Text variant="body-soft" className="text-white/75 hover:text-white">
              Your orders
            </Text>
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <Text variant="caption" className="uppercase tracking-wide text-white/45">
            Get in touch
          </Text>
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/75 hover:text-white"
            >
              <HugeiconsIcon icon={WhatsappIcon} size={16} strokeWidth={1.8} />
              <Text variant="body-soft">Message us on WhatsApp</Text>
            </a>
          )}
          <a
            href={STORE_MAP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-white/75 hover:text-white"
          >
            <HugeiconsIcon icon={Location01Icon} size={16} strokeWidth={1.8} className="mt-0.5 shrink-0" />
            <Text variant="body-soft">{STORE_ADDRESS}</Text>
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-5 py-5 text-center sm:px-8">
          <Text variant="caption-soft" className="text-white/40">
            {storeName} - order on WhatsApp, we confirm and ship every order ourselves.
          </Text>
        </div>
      </div>
    </footer>
  );
}
