import { OwnerShell } from "@/components/shell/OwnerShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <OwnerShell>{children}</OwnerShell>;
}
