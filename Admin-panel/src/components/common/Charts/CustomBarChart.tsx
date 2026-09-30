import Chart from "react-apexcharts";

interface CustomBarChartProps {
  data: { name: string; value: number }[];
  previousData?: { name: string; value: number }[];
  seriesName?: string;
  previousSeriesName?: string;
  color?: string;
  secondaryColor?: string;
}

export const CustomBarChart = ({
  data,
  previousData,
  seriesName = "Value",
  previousSeriesName = "Average",
  color = "#112B3D",
  secondaryColor = "#008B99",
}: CustomBarChartProps) => {
  const options: any = {
    chart: {
      type: "bar",
      height: 350,
      fontFamily: '"Cairo", sans-serif',
      toolbar: {
        show: true,
        tools: {
          download: false,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 4,
        distributed: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    colors: [color, secondaryColor],
    xaxis: {
      type: "category",
      categories: data.map((d) => d.name),
      axisBorder: { show: true },
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
      tickPlacement: "on",
    },
    yaxis: {
      decimalsInFloat: 0,
      title: {
        text: seriesName,
        style: {
          color: "#707070",
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: '"Cairo", sans-serif',
        },
      },
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
        horizontal: 20,
        vertical: 5,
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => Math.floor(val),
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      row: {
        colors: ["#fff", "#f8fafc"],
        opacity: 0.5,
      },
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
        type="bar"
        height="260px"
        width="100%"
      />
    </div>
  );
};
