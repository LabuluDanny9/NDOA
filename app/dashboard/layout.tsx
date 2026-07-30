import Sidebar from "@/components/dashboard/Sidebar"
import Topbar from "@/components/dashboard/Topbar"
import { getCurrentViewer, getRoleLabel } from "@/lib/auth/current-user"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const viewer = await getCurrentViewer()
  const userName = viewer?.name ?? "Mode démonstration"
  const userRole = viewer ? getRoleLabel(viewer.role) : "Données locales"

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        userName={userName}
        userRole={userRole}
        userAvatar={viewer?.avatarUrl}
      />

      <div className="lg:pl-[280px]">
        <div className="lg:hidden h-20" />
        <div className="min-h-screen">
          <Topbar
            userName={userName}
            userRole={userRole}
            userAvatar={viewer?.avatarUrl}
          />
          <div className="mx-auto w-full max-w-none px-4 pb-10 pt-6 sm:px-6 lg:max-w-[calc(100vw-280px)] lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
