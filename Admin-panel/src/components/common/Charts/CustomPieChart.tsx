import React from "react";
import Chart from "react-apexcharts";

interface PieChartData {
  name: string;
  value: number;
}

interface CustomPieChartProps {
  data: PieChartData[];
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = [
  "#112B3D", // Primary Cyan
  "#008B99", // Secondary Teal
  "#10b981", // Emerald
  "#f43f5e", // Rose
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
];

export const CustomPieChart: React.FC<CustomPieChartProps> = ({
  data,
  colors = DEFAULT_COLORS,
  height = 300,
}) => {
  const options: any = {
    chart: {
      type: "donut",
      fontFamily: '"Cairo", sans-serif',
    },
    colors: colors,
    labels: data.map((d) => d.name),
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: (w: any) => {
                return w.globals.seriesTotals.reduce((a: number, b: number) => {
                  return a + b;
                }, 0);
              },
              style: {
                fontSize: "14px",
                fontWeight: 600,
                color: "#94a3b8",
              },
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 900,
              color: "#1e293b",
              offsetY: 8,
              formatter: (val: string) => val,
            },
          },
        },
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "12px",
      fontWeight: 600,
      fontFamily: '"Cairo", sans-serif',
      markers: {
        width: 10,
        height: 10,
        radius: 12,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 8,
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} units`,
      },
    },
    stroke: {
      show: false,
    },
  };

  const series = data.map((d) => d.value);

  return (
    <div className="h-full w-full flex items-center justify-center">
      <Chart
        options={options}
        series={series}
        type="donut"
        height={height}
        width="100%"
      />
    </div>
  );
};
