
import LogoutButton from "./LogoutButton";

const roleLabels = {
  admin: "Administrator",
  staff: "Library Staff",
  student: "Student",
};

export default function Header({ user, title, subtitle }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-9">
      <div>
        <span className="text-[10px] font-bold tracking-[2.5px] text-[#858c83]">
          {roleLabels[user.role]?.toUpperCase()} PORTAL
        </span>

        <h1 className="font-serif text-3xl text-[#1d3028] mt-2">
          {title}
        </h1>

        <p className="text-xs text-[#858c83] mt-2">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#d9e3d8] text-[#214c3a] grid place-items-center font-bold">
          {user.name?.charAt(0)?.toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold text-[#1d3028]">
            {user.name}
          </p>

          <p className="text-[10px] text-[#858c83] mt-1">
            {roleLabels[user.role]}
          </p>
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}
