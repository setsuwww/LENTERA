
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardShell({
  user,
  title,
  subtitle,
  children,
}) {
  return (
    <main className="min-h-screen bg-[#f7f7f2] md:flex">
      <Sidebar role={user.role} />

      <section className="flex-1 min-w-0 p-5 md:p-8 lg:p-10">
        <div className="max-w-[1500px] mx-auto">
          <Header
            user={user}
            title={title}
            subtitle={subtitle}
          />

          {children}
        </div>
      </section>
    </main>
  );
}
