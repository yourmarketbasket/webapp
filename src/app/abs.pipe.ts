import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'abs'
})
export class AbsPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    // Ensure the value is a number before applying Math.abs() and returning a number
    if (typeof value === 'number') {
      return Math.abs(value);
    }
    return 0; // Return 0 if the value is not a number
  }

}
