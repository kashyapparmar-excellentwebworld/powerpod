import Chart from "react-apexcharts";

interface CustomAreaChartProps {
  data: { name: string; value: number }[];
  previousData?: { name: string; value: number }[];
  seriesName?: string;
  previousSeriesName?: string;
  color?: string;
  secondaryColor?: string;
}

export const CustomAreaChart = ({
  data,
  previousData,
  seriesName = "Current Period",
  previousSeriesName = "Previous Period",
  color = "#112B3D",
  secondaryColor = "#008B99",
}: CustomAreaChartProps) => {
  const options: any = {
    chart: {
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
      fontFamily: '"Cairo", sans-serif',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: [3, 2],
      dashArray: [0, 5],
    },
    colors: [color, secondaryColor],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: [4, 0],
      colors: ["#ffffff"],
      strokeColors: color,
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    xaxis: {
      type: "category",
      categories: data.map((d) => d.name),
      axisBorder: { show: false },
      axisTicks: { show: false },
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
          colors: "#707070",
          fontSize: "11px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      decimalsInFloat: 0,
      labels: {
        formatter: (value: number) => Math.floor(value).toString(),
        style: {
          colors: "#707070",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontFamily: '"Cairo", sans-serif',
      fontWeight: 600,
      fontSize: "13px",
      markers: {
        width: 10,
        height: 10,
        radius: 12,
        offsetX: -2,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    tooltip: {
      x: { show: true },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
    },
  };

  const series = [
    {
      name: seriesName,
      data: data.map((d) => d.value),
    },
    {
      name: previousSeriesName,
      data: previousData ? previousData.map((d) => d.value) : [],
    },
  ];

  return (
    <div className="h-full w-full">
      <Chart
        options={options}
        series={series}
        type="area"
        height="260px"
        width="100%"
      />
    </div>
  );
};
