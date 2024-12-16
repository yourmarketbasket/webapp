import { Directive, Input, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import ApexCharts from 'apexcharts';

@Directive({
  selector: '[appBarChart]'
})
export class BarChartDirective implements OnChanges {
  @Input() type!: string; // e.g., 'bar'
  @Input() keys!: any[]; // Categories (x-axis labels)
  @Input() values!: any[]; // Data points (y-axis values)
  @Input() chartID!: string; // Unique chart ID for rendering
  @Input() colors: string[] = []; // Optional custom colors

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.keys && this.values) {
      this.renderChart();
    }
  }

  renderChart(): void {
    const defaultColors = ['#FF5733', '#33FF57', '#3357FF'];
    const chartColors = this.colors.length ? this.colors : defaultColors;

    const options = {
      chart: { type: this.type },
      series: [{ data: this.values }],
      xaxis: { categories: this.keys },
      colors: chartColors,
    };

    const existingChart = ApexCharts.getChartByID(this.chartID);
    if (existingChart) {
      existingChart.destroy();
    }

    const chart = new ApexCharts(this.el.nativeElement, options);
    chart.render();
  }
}
