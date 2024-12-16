import { Directive, Input, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import ApexCharts from 'apexcharts';

@Directive({
  selector: '[appPieChart]'
})
export class PieChartDirective implements OnChanges {
  @Input() type!: string; // e.g., 'pie' or 'donut'
  @Input() keys!: any[]; // Labels
  @Input() values!: any[]; // Data points
  @Input() chartID!: string; // Unique chart ID
  @Input() colors: string[] = []; // Optional custom colors
  @Input() centerTitle?: string; // Optional title for donut charts

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.keys && this.values) {
      this.renderChart();
    }
  }

  renderChart(): void {
    const defaultColors = ['#80deea', '#ffccbc', '#f8bbd0'];
    const chartColors = this.colors.length ? this.colors : defaultColors;

    const options = {
      chart: { type: this.type },
      series: this.values,
      labels: this.keys,
      colors: chartColors,
      legend: { position: 'bottom' },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: !!this.centerTitle,
              total: {
                show: !!this.centerTitle,
                label: this.centerTitle || '',
                fontSize: '18px',
                fontWeight: 700
              }
            }
          }
        }
      }
    };

    const existingChart = ApexCharts.getChartByID(this.chartID);
    if (existingChart) {
      existingChart.destroy();
    }

    const chart = new ApexCharts(this.el.nativeElement, options);
    chart.render();
  }
}