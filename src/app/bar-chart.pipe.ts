import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'barChart'
})
export class BarChartPipe implements PipeTransform {
  transform(
    type: string,
    keys: any[],
    values: any[],
    chartID: string,
    colors: string[] = []
  ): void {
    // Reuse your `showBarChart` logic here
    const defaultColors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFC300'];
    const chartColors = colors.length ? colors : defaultColors;

    const options = {
      chart: { type },
      colors: chartColors,
      series: [{ name: 'value', data: values }],
      xaxis: { categories: keys },
      tooltip: { y: { formatter: (val: number) => val } },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toFixed(0),
        style: { fontSize: '14px', fontWeight: 700 }
      },
      plotOptions: type === 'bar' ? {
        bar: {
          horizontal: false,
          distributed: true,
          borderRadius: 5
        }
      } : {}
    };

    const existingChart = ApexCharts.getChartByID(chartID);
    if (existingChart) {
      existingChart.destroy();
    }

    const chart = new ApexCharts(document.querySelector("#" + chartID), options);
    chart.render();
  }
}
