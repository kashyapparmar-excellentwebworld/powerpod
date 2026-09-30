import React from "react";
import Chart from "react-apexcharts";

interface HorizontalBarData {
  name: string;
  value: number;
}

interface CustomHorizontalBarChartProps {
  data: HorizontalBarData[];
  height?: number;
  label?: string;
}

export const CustomHorizontalBarChart: React.FC<
  CustomHorizontalBarChartProps
> = ({ data, height = 300, label = "Revenue" }) => {
  const options: any = {
    chart: {
      type: "bar",
      fontFamily: '"Cairo", sans-serif',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: true,
        barHeight: "60%",
        distributed: true,
      },
    },
    colors: [
      "#112B3D",
      "#008B99",
      "#10b981",
      "#3b82f6",
      "#8b5cf6",
      "#f43f5e",
      "#06b6d4",
    ],
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      style: {
        colors: ["#fff"],
        fontSize: "12px",
        fontWeight: 600,
      },
      formatter: function (val: number) {
        return val.toLocaleString();
      },
      offsetX: 0,
    },
    xaxis: {
      categories: data.map((d) => d.name),
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#1e293b",
          fontSize: "13px",
          fontWeight: 700,
        },
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      theme: "light",
      y: {
        title: {
          formatter: () => label,
        },
      },
    },
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: label,
      data: data.map((d) => d.value),
    },
  ];

  return (
    <div className="h-full w-full">
      <Chart
        options={options}
        series={series}
        type="bar"
        height={height}
        width="100%"
      />
    </div>
  );
};
