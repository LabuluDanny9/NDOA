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
    <div className="min-h-screen bg-transparent">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_58%)]" />
        <div className="absolute right-[-8rem] top-28 h-72 w-72 rounded-full bg-amber-300/18 blur-3xl" />
        <div className="absolute left-[-8rem] top-80 h-80 w-80 rounded-full bg-blue-400/15 blur-3xl" />
      </div>
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
          <div className="mx-auto w-full max-w-none px-4 pb-12 pt-6 sm:px-6 lg:max-w-[calc(100vw-280px)] lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
