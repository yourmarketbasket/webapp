import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nipipe'
})
export class NipipePipe implements PipeTransform {

  transform(rating: number, max: number = 5, showAllStars: boolean = true): string {
    if (rating < 0 || rating > max) {
      throw new Error('Rating value must be between 0 and the maximum value.');
    }

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 > 0;
    const emptyStars = max - Math.ceil(rating);

    // Determine the rating category for text color
    let starColorClass = 'text-warning'; // Default for stars
    if (rating < 2.5) {
      starColorClass = 'text-danger'; // If rating is less than 2.5, set to danger
    } else if (rating >= 2.5 && rating <= 4) {
      starColorClass = 'text-warning'; // If rating is between 2.5 and 4, set to warning
    } else if (rating > 4) {
      starColorClass = 'text-success'; // If rating is above 4, set to success
    }

    const fullStarHtml = `<i class="bi-star-fill ${starColorClass}"></i>`; // Full star
    const halfStarHtml = `<i class="bi-star-half ${starColorClass}"></i>`; // Half star
    const emptyStarHtml = `<i class="bi-star ${starColorClass}"></i>`; // Empty star (apply the same color)

    // If showAllStars is true, construct all stars
    let stars = '';
    if (showAllStars) {
      stars = fullStarHtml.repeat(fullStars) +
        (hasHalfStar ? halfStarHtml : '') +
        emptyStarHtml.repeat(emptyStars);
      return `<span class="d-flex align-items-center">${stars} <small class="fs-10">(${rating.toFixed(1)})</small></span>`;
    } else {
      // If showAllStars is false, only show one full star with the rating in brackets
      return `<span class="d-flex align-items-center">${fullStarHtml} <small class="fs-10">(${rating.toFixed(1)})</small></span>`;
    }
  }
}
