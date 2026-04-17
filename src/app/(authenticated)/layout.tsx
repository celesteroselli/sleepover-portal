import { SpacePageShell } from "@/components/SpacePageShell";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SpacePageShell>{children}</SpacePageShell>;
}
