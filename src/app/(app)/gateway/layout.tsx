import { SectionTabs } from "@/src/components/ui/section-tabs";

const items = [
  { label: "Overview", href: "/gateway" },
  { label: "Devices", href: "/gateway/devices" },
  { label: "Wi-Fi settings", href: "/gateway/wifi" },
];

export default function GatewayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="space-y-4">
      <SectionTabs items={items} />
      {children}
    </div>
  );
}
