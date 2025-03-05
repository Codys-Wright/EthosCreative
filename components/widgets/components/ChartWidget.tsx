"use client";

import React from "react";
import { Card } from "@/components/ui/card";

interface ChartWidgetProps {
  width: number;
  height: number;
  className?: string;
}

const getChartContent = (width: number, height: number) => {
  const key = `${width}x${height}`;

  switch (key) {
    // 1x1 - Simple number or icon
    case "1x1":
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-2xl font-bold">42</div>
        </div>
      );

    // 1x2 - Vertical bar chart
    case "1x2":
      return (
        <div className="flex flex-col justify-end h-full gap-1 p-2">
          <div className="bg-primary/20 h-[30%] w-full rounded-sm" />
          <div className="bg-primary/40 h-[50%] w-full rounded-sm" />
          <div className="bg-primary/60 h-[70%] w-full rounded-sm" />
        </div>
      );

    // 2x1 - Horizontal progress bars
    case "2x1":
      return (
        <div className="flex flex-col justify-center h-full gap-2 p-2">
          <div className="w-[70%] h-2 bg-primary/60 rounded-full" />
          <div className="w-[45%] h-2 bg-primary/40 rounded-full" />
        </div>
      );

    // 2x2 - Four quadrant stats
    case "2x2":
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-2 p-3 h-full">
          <div className="flex flex-col items-center justify-center">
            <div className="text-sm text-muted-foreground">Sales</div>
            <div className="text-xl font-bold">$4.2k</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-sm text-muted-foreground">Orders</div>
            <div className="text-xl font-bold">123</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-sm text-muted-foreground">Users</div>
            <div className="text-xl font-bold">1.2k</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-sm text-muted-foreground">Growth</div>
            <div className="text-xl font-bold">+15%</div>
          </div>
        </div>
      );

    // 3x2 - Timeline chart
    case "3x2":
      return (
        <div className="flex flex-col h-full p-4">
          <div className="text-lg font-semibold mb-4">Activity Timeline</div>
          <div className="flex-1 flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1 text-sm">Event {i}</div>
                <div className="text-sm text-muted-foreground">2h ago</div>
              </div>
            ))}
          </div>
        </div>
      );

    // 3x3 - Detailed stats with chart
    case "3x3":
      return (
        <div className="flex flex-col h-full p-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">Performance Overview</h3>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </div>
            <div className="text-2xl font-bold text-primary">+24%</div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-muted/30 rounded-lg p-4">
              {/* Placeholder for actual chart */}
              <div className="h-full flex items-end gap-2">
                {[40, 70, 45, 30, 65, 80, 55].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/60 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">Revenue</div>
                <div className="text-lg font-semibold">$42,500</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">Profit</div>
                <div className="text-lg font-semibold">$12,300</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">Customers</div>
                <div className="text-lg font-semibold">1,234</div>
              </div>
            </div>
          </div>
        </div>
      );

    // 4x4 - Full dashboard
    case "4x4":
      return (
        <div className="grid grid-cols-4 grid-rows-4 gap-4 p-4 h-full">
          <div className="col-span-4 row-span-1 bg-muted/30 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Overview</h2>
            <div className="flex justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  Total Revenue
                </div>
                <div className="text-2xl font-bold">$123,456</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Growth</div>
                <div className="text-2xl font-bold text-primary">+27%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Orders</div>
                <div className="text-2xl font-bold">1,234</div>
              </div>
            </div>
          </div>
          <div className="col-span-2 row-span-2 bg-muted/30 rounded-lg p-4">
            {/* Main chart area */}
            <div className="h-full flex items-end gap-2">
              {[40, 70, 45, 30, 65, 80, 55, 45, 60].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/60 rounded-t"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
          <div className="col-span-2 row-span-2 grid grid-cols-2 gap-4">
            {[
              { label: "Customers", value: "12.5k" },
              { label: "Active Now", value: "1.2k" },
              { label: "Conversion", value: "3.8%" },
              { label: "Avg. Order", value: "$123" },
            ].map((stat, i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-4">
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
                <div className="text-xl font-semibold mt-1">{stat.value}</div>
              </div>
            ))}
          </div>
          <div className="col-span-4 row-span-1 bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center h-full">
              {[
                { label: "Mon", value: 45 },
                { label: "Tue", value: 70 },
                { label: "Wed", value: 55 },
                { label: "Thu", value: 65 },
                { label: "Fri", value: 80 },
                { label: "Sat", value: 45 },
                { label: "Sun", value: 60 },
              ].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-20 w-4 bg-muted rounded overflow-hidden">
                    <div
                      className="bg-primary/60 w-full transition-all"
                      style={{ height: `${day.value}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {day.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    // 6x6 - Full analytics dashboard
    case "6x6":
      return (
        <div className="grid grid-cols-6 grid-rows-6 gap-4 p-4 h-full">
          <div className="col-span-6 row-span-1 bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center h-full">
              <div>
                <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                <p className="text-muted-foreground">
                  Complete overview of your business
                </p>
              </div>
              <div className="flex gap-4">
                {["Daily", "Weekly", "Monthly", "Yearly"].map((period) => (
                  <button
                    key={period}
                    className="px-3 py-1 rounded-md text-sm hover:bg-muted"
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="col-span-4 row-span-3 bg-muted/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
            <div className="h-[calc(100%-2rem)] flex items-end gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-primary/60 rounded-t"
                    style={{ height: `${Math.random() * 80 + 20}%` }}
                  />
                  <div className="text-xs text-muted-foreground">
                    {
                      [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ][i]
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2 row-span-3 bg-muted/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Top Products</h3>
            <div className="space-y-4">
              {[
                { name: "Product A", sales: 1234, growth: "+12%" },
                { name: "Product B", sales: 923, growth: "+8%" },
                { name: "Product C", sales: 825, growth: "+15%" },
                { name: "Product D", sales: 643, growth: "+5%" },
              ].map((product, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.sales} sales
                    </div>
                  </div>
                  <div className="text-primary font-medium">
                    {product.growth}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-3 row-span-2 bg-muted/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20" />
                    <div>
                      <div className="font-medium">Order #{1000 + i}</div>
                      <div className="text-sm text-muted-foreground">
                        2 items • $123
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">2 min ago</div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-3 row-span-2 bg-muted/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">
              Customer Satisfaction
            </h3>
            <div className="flex items-center justify-center h-[calc(100%-2rem)]">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-8 border-primary/20" />
                <div
                  className="absolute inset-0 rounded-full border-8 border-primary"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0)",
                    transform: "rotate(-90deg)",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl font-bold">85%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    // Default case for other sizes
    default:
      return (
        <div className="flex items-center justify-center h-full p-4 text-center">
          <div>
            <div className="text-lg font-semibold">
              Chart {width}x{height}
            </div>
            <div className="text-sm text-muted-foreground">
              Custom size chart content
            </div>
          </div>
        </div>
      );
  }
};

export function ChartWidget({ width, height, className }: ChartWidgetProps) {
  return <Card className={className}>{getChartContent(width, height)}</Card>;
}
