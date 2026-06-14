import SideNav from "@/components/app/SideNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <SideNav />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
