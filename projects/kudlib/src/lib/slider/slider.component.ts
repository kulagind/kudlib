import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core';

enum Direction {
  left = 'left',
  right = 'right'
}

interface IPartialSliderConfig {
  isCycling?: boolean, // is auto-turning
  direction?: Direction, // turning direction
  interval?: number, // milliseconds between turning
  isPauseByHover?: boolean, // stop turning on hover
  isDefaultButtons?: boolean, // show default buttons
  isSinglyCycle?: boolean // turn one item by one ("false" means to turn a whole page)
  itemsOnDisplayQuantity?: number // number of items on display
}

interface ISliderConfig {
  isCycling: boolean,
  direction: Direction,
  interval: number,
  isPauseByHover: boolean,
  isDefaultButtons: boolean,
  isSinglyCycle: boolean,
  itemsOnDisplayQuantity: number
}

interface ISliderItem {
  item: any;
  position: number;
  transform: number;
}

const DEFAULT_CONFIG: ISliderConfig = {
  isCycling: true,
  direction: Direction.right,
  interval: 5000,
  isPauseByHover: true,
  isDefaultButtons: true,
  isSinglyCycle: true,
  itemsOnDisplayQuantity: 2
}

@Component({
  selector: 'kudlib-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderComponent implements OnInit, OnChanges, AfterViewInit {

  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

  @Input() items: any[];
  @Input() set config(value: IPartialSliderConfig) {
    this._config = {...DEFAULT_CONFIG, ...value};
  };

  @Input() turnEmitter: EventEmitter<Direction>;
  
  @Output() onPagesQuantityChange = new EventEmitter<number>();
  @Output() onCurrentPageChange = new EventEmitter<number>();

  @ViewChild('sliderWrapper') sliderWrapper: ElementRef;
  @ViewChildren('sliderItems') sliderItems: QueryList<ElementRef>;

  private sliderWrapperWidth: number;
  sliderItemWidth: number;
  itemInGroupWidth: number;

  private firstItemPosition: number = 0;
  private currentPage: number = 0;
  private pagesQuantity: number;

  private transform: number = 0;
  private interval: any = 0;

  _config: ISliderConfig;
  private _items: ISliderItem[] = [];
  pages: ISliderItem[] = [];

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this._items = this.items;
  }

  ngOnInit(): void {
    this.setPages();
    this.handleCustomTurning();
  }

  ngAfterViewInit(): void {
    this.setWrapperWidth();
    this.setItemWidth();
    this.setItems();
    this.cycle(this._config.direction);
  }

  private setPages(): void {
    this.pagesQuantity = this._config.isSinglyCycle
      ? this.items.length
      : Math.ceil(this.items.length / this._config.itemsOnDisplayQuantity);

    this.pages = [];
    for (let i=0; i < this.pagesQuantity; i++) {
      this.pages.push({
        item: this.items.slice(
          (i * this._config.itemsOnDisplayQuantity), 
          ((this.items.length - (i * this._config.itemsOnDisplayQuantity)) >= this._config.itemsOnDisplayQuantity)
            ? (this._config.itemsOnDisplayQuantity + (i * this._config.itemsOnDisplayQuantity))
            : ((this.items.length - (i * this._config.itemsOnDisplayQuantity)) + (i * this._config.itemsOnDisplayQuantity))
        ),
        position: i,
        transform: 0
      })
    }
    this.onPagesQuantityChange.emit(this.pagesQuantity);
  }

  private setWrapperWidth(): void {
    this.sliderWrapperWidth = this.sliderWrapper.nativeElement.clientWidth;
  }

  private setItemWidth(): void {
    if (this._config.isSinglyCycle) {
      this.sliderItemWidth = this.sliderWrapperWidth / this._config.itemsOnDisplayQuantity;
    } else {
      this.sliderItemWidth = this.sliderWrapperWidth;
      this.itemInGroupWidth = this.sliderWrapperWidth / this._config.itemsOnDisplayQuantity;
    }
    
    this.cdr.detectChanges();
  }

  private setItems(): void {
    const sliderItems = this._config.isSinglyCycle
      ? this.items
      : this.pages;
    
    this._items = sliderItems.map((item: any, index: number) => {
      return {
        item: this.sliderItems.toArray()[index],
        transform: 0,
        position: index
      }
    });
  }

  cycle(direction: Direction): void {
    if (!this._config.isCycling || !this.isPossibleToCycle()) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this.interval = setInterval((): void => {
        this.transformItem(direction);
      }, this._config.interval);
    });
  }

  isPossibleToCycle(): boolean {
    return this._items.length > this._config.itemsOnDisplayQuantity;
  }

  private transformItem(direction: Direction): void {
    let nextItem: number;
    if (direction === Direction.right) {
      this.firstItemPosition++;

      const pageNumber = ++this.currentPage % this.pagesQuantity;
      this.setCurrentPage(pageNumber);

      if ((this.firstItemPosition + this.sliderWrapperWidth / this.sliderItemWidth - 1) > this.position.getMax()) {
        nextItem = this.position.getItemMin();
        this._items[nextItem].position = this.position.getMax() + 1;
        this._items[nextItem].transform += this._items.length * 100;
        this._items[nextItem].item.nativeElement.style.transform = 'translateX(' + this._items[nextItem].transform + '%)';
      }
      this.transform -= this.step;
    } else {
      this.firstItemPosition--;

      const pageNumber = (this.pagesQuantity + --this.currentPage) % this.pagesQuantity;
      this.setCurrentPage(pageNumber);

      if (this.firstItemPosition < this.position.getMin()) {
        nextItem = this.position.getItemMax();
        this._items[nextItem].position = this.position.getMin() - 1;
        this._items[nextItem].transform -= this._items.length * 100;
        this._items[nextItem].item.nativeElement.style.transform = 'translateX(' + this._items[nextItem].transform + '%)';
      }
      this.transform += this.step;
    }
    this.sliderWrapper.nativeElement.style.transform = 'translateX(' + this.transform + '%)';
  }

  private setCurrentPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.onCurrentPageChange.emit(pageNumber);
  }

  private get step(): number {
    return this.sliderItemWidth / this.sliderWrapperWidth * 100;
  }

  private get position(): any {
    return {
      getItemMin: (): number => {
        let indexItem = 0;
        this._items.forEach((item, index) => {
          if (item.position < this._items[indexItem].position) {
            indexItem = index;
          }
        });
        return indexItem;
      },
      getItemMax: (): number => {
        let indexItem = 0;
        this._items.forEach((item, index) => {
          if (item.position > this._items[indexItem].position) {
            indexItem = index;
          }
        });
        return indexItem;
      },
      getMin: (): number => {
        return this._items[this.position.getItemMin()].position;
      },
      getMax: (): number => {
        return this._items[this.position.getItemMax()].position;
      }
    }
  }

  turn(direction: Direction): void {
    this.transformItem(direction);
    clearInterval(this.interval);
    this.cycle(this._config.direction);
  }

  clearInterval(): void {
    if (this._config.isPauseByHover) {
      clearInterval(this.interval);
    }
  }

  private handleCustomTurning() {
    if (this.turnEmitter) {
      this.turnEmitter.subscribe((direction: Direction) => {
        this.turn(direction);
      });
    }
  }
}
