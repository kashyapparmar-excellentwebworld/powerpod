import React from "react";
import Chart from "react-apexcharts";

interface CustomMixedChartProps {
  data: { name: string; value: number }[];
  secondaryData: { name: string; value: number }[];
  seriesName: string;
  secondarySeriesName: string;
  color?: string;
  secondaryColor?: string;
  height?: number | string;
}

export const CustomMixedChart: React.FC<CustomMixedChartProps> = ({
  data,
  secondaryData,
  seriesName,
  secondarySeriesName,
  color = "#6366f1",
  secondaryColor = "#10b981",
  height = 320,
}) => {
  const options: any = {
    chart: {
      height: height,
      type: "line",
      fontFamily: '"Cairo", sans-serif',
      toolbar: { show: false },
    },
    stroke: {
      width: [0, 3],
      curve: "smooth",
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 4,
      },
    },
    colors: [color, secondaryColor],
    fill: {
      opacity: [0.85, 1],
    },
    labels: data.map((d) => d.name),
    markers: {
      size: 4,
    },
    xaxis: {
      type: "category",
      labels: {
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true,
        formatter: (val: string) => {
          if (typeof val === 'string' && val.includes(',')) {
            return val.split(',')[1].trim();
          }
          return val;
        },
        style: {
          colors: "#64748b",
          fontSize: "11px",
        },
      },
    },
    yaxis: [
      {
        title: {
          text: seriesName,
          style: { color: color, fontWeight: 600 },
        },
        labels: {
          style: { colors: color },
          formatter: (val: number) => Math.floor(val),
        },
      },
      {
        opposite: true,
        title: {
          text: secondarySeriesName,
          style: { color: secondaryColor, fontWeight: 600 },
        },
        labels: {
          style: { colors: secondaryColor },
          formatter: (val: number) => val.toLocaleString(),
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (y: number) {
          if (typeof y !== "undefined") {
            return y.toLocaleString();
          }
          return y;
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
    },
  };

  const series = [
    {
      name: seriesName,
      type: "column",
      data: data.map((d) => d.value),
    },
    {
      name: secondarySeriesName,
      type: "line",
      data: secondaryData.map((d) => d.value),
    },
  ];

  return (
    <div className="h-full w-full">
      <Chart
        options={options}
        series={series}
        type="line"
        height={height}
        width="100%"
      />
    </div>
  );
};
