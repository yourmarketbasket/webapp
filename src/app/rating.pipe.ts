// rating.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'rating',
    standalone: false
})
export class RatingPipe implements PipeTransform {
  transform(rating: number, maxStars: number = 5): { full: number; half: number; empty: number } {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = maxStars - fullStars - hasHalfStar;

    return {
      full: fullStars,
      half: hasHalfStar,
      empty: emptyStars
    };
  }
}
