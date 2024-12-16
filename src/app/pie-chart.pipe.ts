import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pieChart'
})
export class PieChartPipe implements PipeTransform {
  transform(
    type: string,
    keys: any[],
    values: any[],
    chartID: string,
    colors: string[] = [],
    centerTitle?: string
  ): void {
    const bootstrapColors = [
      '#80deea', '#f8bbd0', '#e1bee7',
      '#ff80ab', '#ffccbc', '#b2ebf2', '#f3e5f5'
    ];
    const chartColors = colors.length ? colors : bootstrapColors;

    const totalValue = values.reduce((sum, value) => sum + value, 0);

    const options: any = {
      chart: { type },
      colors: chartColors,
      series: values.map(value => (value / totalValue) * 100),
      labels: keys,
      tooltip: {
        y: {
          formatter: (val: number, opts: any) => {
            const originalValue = values[opts.seriesIndex];
            return `${val.toFixed(1)}% (${originalValue})`;
          }
        }
      },
      legend: { show: true, position: 'bottom', horizontalAlign: 'center' },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed()}%`,
        style: { fontSize: '14px', fontWeight: 700 }
      },
      plotOptions: type === 'pie' || type === 'donut' ? {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: !!centerTitle,
              total: {
                show: !!centerTitle,
                label: centerTitle || '',
                fontSize: '18px',
                fontWeight: 700
              }
            }
          }
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
