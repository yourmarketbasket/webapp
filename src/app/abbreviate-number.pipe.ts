import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'abbreviateNumber'
})
export class AbbreviateNumberPipe implements PipeTransform {
  transform(value: number, decimals: number = 2): string {
    if (!value && value !== 0) return '';

    const suffixes = [
      { value: 1, symbol: '' },
      { value: 1e3, symbol: 'K' },
      { value: 1e6, symbol: 'M' },
      { value: 1e9, symbol: 'B' },
      { value: 1e12, symbol: 'T' },
      { value: 1e15, symbol: 'P' },
      { value: 1e18, symbol: 'E' }
    ];

    // Find the appropriate suffix
    const suffix = suffixes
      .slice()
      .reverse()
      .find((s) => value >= s.value);

    if (!suffix) return value.toString(); // If the value is very small, return as is

    const scaledValue = (value / suffix.value).toFixed(decimals);

    return `${scaledValue.replace(/\.0+$/, '')} ${suffix.symbol}`; // Remove trailing zeros
  }
}

// Usage in an Angular Component
// In your template: {{ someNumber | abbreviateNumber:2 }}
