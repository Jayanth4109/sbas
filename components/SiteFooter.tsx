import { Text } from "@/components/stepwise/typography";

export function SiteFooter({ storeName }: { storeName: string }) {
  return (
    <footer className="border-t border-[var(--ui-border-subtle)] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 py-10 text-center sm:px-8">
        <Text variant="h6-soft" className="text-[var(--brand-strong)]">
          {storeName}
        </Text>
        <Text variant="caption-soft" className="text-[var(--foreground)]/45">
          Order on WhatsApp - we confirm and ship every order ourselves.
        </Text>
      </div>
    </footer>
  );
}
