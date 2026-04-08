import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface CategoryEvent {
  type: 'created' | 'updated' | 'deleted';
}

@Injectable()
export class CategoryEventsService {
  private subject = new Subject<CategoryEvent>();

  emit(event: CategoryEvent) {
    this.subject.next(event);
  }

  subscribe(): Observable<CategoryEvent> {
    return this.subject.asObservable();
  }
}
