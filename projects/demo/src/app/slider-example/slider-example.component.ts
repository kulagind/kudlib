import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-slider-example',
  templateUrl: './slider-example.component.html',
  styleUrls: ['./slider-example.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderExampleComponent implements OnInit {
  
  turnEmitter = new EventEmitter<'left' | 'right'>();
  pagesCount: number = 0;
  currentPage: number = 0;

  items = [
    {
      name: 'Element',
      id: 0,
      color: 'yellow'
    },
    {
      name: 'Another element',
      id: 1,
      color: 'lightblue'
    },
    {
      name: 'Third element',
      id: 2,
      color: 'lightgrey'
    },
    {
      name: 'Just example',
      id: 3,
      color: 'lightgreen'
    },
    {
      name: 'Last element',
      id: 4,
      color: 'pink'
    },
  ];

  config: any = {};

  isCycling: boolean = true;
  isPauseByHover: boolean = true;
  isDefaultButtons: boolean = true;
  isSinglyCycle: boolean = true;
  interval: number = 5000;
  itemsOnDisplayQuantity: number = 3;
  direction: 'right' | 'left' = 'right';

  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.changeConfig();
  }

  do(direction: 'left' | 'right'): void {
    this.turnEmitter.emit(direction);
  }

  changePagesCount(event): void {
    this.pagesCount = event;
    this.cdr.detectChanges();
  }

  /* Add 1 point because array start from 0 and first page means [0] */
  changeCurrentPage(event): void {
    this.currentPage = event + 1;
    this.cdr.detectChanges();
  }

  changeConfig(direction?: 'left' | 'right'): void {
    if (direction) {
      this.direction = direction;
    }
    
    this.config = {
      isCycling: this.isCycling,
      isPauseByHover: this.isPauseByHover,
      isDefaultButtons: this.isDefaultButtons,
      isSinglyCycle: this.isSinglyCycle,
      interval: this.interval,
      itemsOnDisplayQuantity: this.itemsOnDisplayQuantity,
      direction: this.direction,
    };
  }
}
