import { Directive, Input, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import ApexCharts from 'apexcharts';

@Directive({
  selector: '[appLineChart]'
})
export class LineChartDirective implements OnChanges {
  @Input() type: string = 'area'; // Default chart type is 'line'
  @Input() keys!: any[]; // X-axis categories (labels)
  @Input() seriesData!: { name: string, data: number[] }[]; // Array of data series
  @Input() chartID!: string; // Unique ID for the chart container
  @Input() colors: string[] = []; // Optional array of line colors
  @Input() strokeWidth: number = 2; // Optional stroke width for the lines
  @Input() showLegend: boolean = true; // Control legend visibility
  @Input() hideAxisLabels: boolean = false; // Control axis labels visibility
  @Input() showLabels: boolean = true; // New input to control all labels visibility (data & axis labels)

  private chartInstance: ApexCharts | null = null; // Variable to store the chart instance

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.keys && this.seriesData) {
      this.renderChart();
    }
  }

  generateRandomColor(): string {
    let randomColor: string;
  
    // Keep generating a random color until it is not white or black
    do {
      randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16); // Generates a random hex color
    } while (randomColor === '#ffffff' || randomColor === '#000000'); // Check for white or black
  
    return randomColor;
  }
  

  renderChart(): void {
    // If no colors are provided, generate random colors for each series
    const chartColors = this.colors.length ? this.colors : this.seriesData.map(() => this.generateRandomColor());

    const options: any = {
      chart: {
        type: this.type,
        id: this.chartID,
        parentHeightOffset: 0,
        sparkline: {
          enabled: true
        },
        toolbar: {
          show: false // Hides the toolbar with zoom, home, and other icons
        },
        background: 'transparent', // Optional: Make chart background transparent to avoid padding issues
        margin: 0, // Ensure no margins are applied by ApexCharts
        padding: 0 // Ensure no padding is applied by ApexCharts
      },
      grid: {
        show: false,
        padding: { left: 0, right: 0, top: 0, bottom: 0 },
      },
      series: this.seriesData,
      xaxis: {
        categories: this.keys,
        labels: {
          show: this.showLabels // Conditionally show/hide x-axis labels
        },
        axisBorder: {
          show: this.showLabels // Hide axis border when labels are hidden
        },
        axisTicks: {
          show: this.showLabels // Hide axis ticks when labels are hidden
        },
      },
      colors: chartColors,
      stroke: {
        width: this.strokeWidth,
        curve: 'smooth' // Optional: makes the line smooth
      },
      markers: {
        size: 4 // Marker size on data points
      },
      tooltip: {
        shared: true,
        intersect: false
      },
      yaxis: {
        labels: {
          formatter: (val: number) => val.toFixed(0),
          show: this.showLabels // Conditionally show/hide y-axis labels
        },
        axisBorder: {
          show: this.showLabels // Hide axis border when labels are hidden
        },
        axisTicks: {
          show: this.showLabels // Hide axis ticks when labels are hidden
        },
      },
      legend: {
        show: this.showLegend, // Control visibility of the legend
        position: 'top',
        horizontalAlign: 'right',
        floating: true, // Optional: Make legend float to avoid taking extra space
        labels: {
          useSeriesColors: true
        }
      },
      dataLabels: {
        enabled: this.showLabels, // Conditionally show/hide data labels
        style: {
          fontSize: '12px',
          fontWeight: 700
        },
        formatter: (val: number) => val.toFixed(0) // Optional: format data label values
      }
    };

    // If an existing chart instance exists, destroy it
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Create a new chart instance and store it
    this.chartInstance = new ApexCharts(this.el.nativeElement, options);
    this.chartInstance.render();
  }
}
