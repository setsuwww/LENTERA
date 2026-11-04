
"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#214c3a",
  "#d9b878",
  "#78977f",
  "#a9b8a9",
  "#c5a477",
  "#6b7f72",
  "#e0cda5",
];

export default function AdminCharts({ monthlyTransactions, categoryDistribution }) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <section className="rounded-2xl border border-[#e5e7df] bg-white p-5 xl:col-span-3">
        <div className="mb-6">
          <h3 className="font-semibold text-[#1d3028]">
            Transaction Overview
          </h3>
          <p className="mt-1 text-sm text-[#89948b]">
            Monthly borrowing activity this year
          </p>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTransactions}>
              <defs>
                <linearGradient id="borrowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#214c3a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#214c3a" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0e9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="borrowed"
                name="Borrowed"
                stroke="#214c3a"
                strokeWidth={2.5}
                fill="url(#borrowGradient)"
              />
              <Area
                type="monotone"
                dataKey="returned"
                name="Returned"
                stroke="#d9b878"
                strokeWidth={2.5}
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e5e7df] bg-white p-5 xl:col-span-2">
        <div className="mb-6">
          <h3 className="font-semibold text-[#1d3028]">
            Book Categories
          </h3>
          <p className="mt-1 text-sm text-[#89948b]">
            Collection distribution by category
          </p>
        </div>

        {categoryDistribution.length > 0 ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={58}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {categoryDistribution.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[280px] items-center justify-center text-sm text-[#89948b]">
            No category data available.
          </div>
        )}
      </section>
    </div>
  );
}
