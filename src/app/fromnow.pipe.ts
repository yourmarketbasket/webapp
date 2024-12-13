import { Pipe, PipeTransform, ChangeDetectorRef, NgZone } from '@angular/core';

@Pipe({
  name: 'fromnow',
  pure: false  // This makes the pipe impure and allows for dynamic updates.
})
export class FromnowPipe implements PipeTransform {

  private intervalId: any;

  constructor(private cdRef: ChangeDetectorRef, private ngZone: NgZone) {}

  transform(value: string | Date): string {
    const now = new Date();
    const inputDate = new Date(value);

    // Calculate the time difference in various units
    const seconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30.416);
    const years = Math.floor(months / 12);

    // Return the human-readable format based on the time difference
    let timeAgo: string;
    if (seconds < 60) {
      timeAgo = seconds === 1 ? 'one second ago' : `${seconds} seconds ago`;
    } else if (minutes < 60) {
      timeAgo = minutes === 1 ? 'one minute ago' : `${minutes} minutes ago`;
    } else if (hours < 24) {
      timeAgo = hours === 1 ? 'one hour ago' : `${hours} hours ago`;
    } else if (days < 30) {
      timeAgo = days === 1 ? 'one day ago' : `${days} days ago`;
    } else if (months < 12) {
      timeAgo = months === 1 ? 'one month ago' : `${months} months ago`;
    } else {
      timeAgo = years === 1 ? 'one year ago' : `${years} years ago`;
    }

    // Trigger change detection every second to keep the pipe updated
    this.ngZone.runOutsideAngular(() => {
      if (!this.intervalId) {
        this.intervalId = setInterval(() => {
          this.cdRef.markForCheck();  // Force change detection
        }, 1000); // Update every second
      }
    });

    return timeAgo;
  }

  // Stop the interval when the pipe is destroyed to avoid memory leaks
  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
