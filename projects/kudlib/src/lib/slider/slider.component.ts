import { from, fromEvent, ReplaySubject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
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
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { 
  IPartialSliderConfig, 
  ISliderItem, 
  SliderDirection, 
  SliderService 
} from './slider.service';

@Component({
  selector: 'kudlib-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SliderService]
})
export class SliderComponent implements OnInit, AfterViewInit, OnDestroy {

  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

  @Input() items: any[];
  @Input() set config(value: IPartialSliderConfig) {
    this.sliderService.setConfig(value);
  };
  @Input() turnEmitter: EventEmitter<SliderDirection>;
  
  @Output() onPagesQuantityChange = new EventEmitter<number>();
  @Output() onCurrentPageChange = new EventEmitter<number>();

  @ViewChild('sliderWrapper') sliderWrapper: ElementRef;
  @ViewChildren('sliderItems') sliderItems: QueryList<ElementRef>;

  private refresh$ = new ReplaySubject<void>(1);
  private onDestroy$ = new ReplaySubject<void>(1);

  private sliderWrapperWidth: number;
  sliderItemWidth: number;
  itemInGroupWidth: number;

  private firstItemPosition: number = 0;
  private currentPage: number = 0;
  private pagesQuantity: number;

  private transform: number = 0;
  private intervalRef: any = 0;

  _isCycling: boolean;
  _direction: SliderDirection;
  _interval: number;
  _isPauseByHover: boolean;
  _isDefaultButtons: boolean;
  _isSinglyCycle: boolean;
  _itemsOnDisplayQuantity: number;

  private _items: ISliderItem[] = [];
  pages: ISliderItem[] = [];

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private sliderService: SliderService
  ) { }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  ngOnInit(): void {
    this.init();
    this.handleCustomTurning();

    this.refresh$.pipe(
      debounceTime(100)
    ).subscribe(() => {
      this.clearPosition();
      this.setWrapperWidth();
      this.setItemWidth(); 
      this.setPages(); 
      this.setItems();     
      this.cycle(this._direction);      

      this.cdr.detectChanges();
    });

    fromEvent(window, 'resize').pipe(
      debounceTime(100),
      takeUntil(this.onDestroy$)
    ).subscribe(() => {
      this.setWrapperWidth();
      this.setItemWidth();
    });    
  }

  ngAfterViewInit(): void {
    this.setWrapperWidth();
  }

  private clearPosition(): void {
    this.transform = 0;
    this.currentPage = 0;
    this.firstItemPosition = 0;
    this.clearTransform();
  }

  private init(): void {
    this.sliderService.getOptionsMap().forEach((value$, key) => {
      value$.pipe(
        takeUntil(this.onDestroy$)
      ).subscribe(value => {
        this[`_${key}`] = value;
        this.refresh$.next();
      });
    });
  }

  private setPages(): void {
    this.pagesQuantity = this._isSinglyCycle
      ? this.items.length
      : Math.ceil(this.items.length / this._itemsOnDisplayQuantity);

    this.pages = [];
    for (let i=0; i < this.pagesQuantity; i++) {
      this.pages.push({
        item: this.items.slice(
          (i * this._itemsOnDisplayQuantity), 
          ((this.items.length - (i * this._itemsOnDisplayQuantity)) >= this._itemsOnDisplayQuantity)
            ? (this._itemsOnDisplayQuantity + (i * this._itemsOnDisplayQuantity))
            : ((this.items.length - (i * this._itemsOnDisplayQuantity)) + (i * this._itemsOnDisplayQuantity))
        ),
        position: i,
        transform: 0,
      })
    }

    this.onPagesQuantityChange.emit(this.pagesQuantity);
    this.onCurrentPageChange.emit(this.currentPage);
  }

  private setWrapperWidth(): void {
    if (this.sliderWrapper?.nativeElement) {
      this.sliderWrapperWidth = this.sliderWrapper.nativeElement.clientWidth;
      this.cdr.detectChanges();
    }
  }

  private setItemWidth(): void {
    if (this._isSinglyCycle) {
      this.sliderItemWidth = this.sliderWrapperWidth / this._itemsOnDisplayQuantity;
    } else {
      this.sliderItemWidth = this.sliderWrapperWidth;
      this.itemInGroupWidth = this.sliderWrapperWidth / this._itemsOnDisplayQuantity;
    }
    this.cdr.detectChanges();
  }

  private setItems(): void {
    const sliderItems = this._isSinglyCycle
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

  cycle(direction: SliderDirection): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
    if (!this._isCycling || !this.isPossibleToCycle()) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {      
      this.intervalRef = setInterval((): void => {    
        this.transformItem(direction);
      }, this._interval);
    });
  }

  isPossibleToCycle(): boolean {
    return this.items.length > this._itemsOnDisplayQuantity;
  }

  private clearTransform(): void {
    if (this.sliderWrapper?.nativeElement) {
      this.sliderWrapper.nativeElement.style.transform = 'translateX(' + this.transform + '%)';
      this._items.forEach(item => {
        item.item.nativeElement.style.transform = 'translateX(' + this.transform + '%)';
      });
    }
  }

  private transformItem(direction: SliderDirection): void {
    let nextItem: number;
    let pageNumber;
    
    if (direction === SliderDirection.right) {
      this.firstItemPosition++;

      pageNumber = ++this.currentPage % this.pagesQuantity;
      
      if ((this.firstItemPosition + this.sliderWrapperWidth / this.sliderItemWidth - 1) > this.position.getMax()) {
        nextItem = this.position.getItemMin();
        this._items[nextItem].position = this.position.getMax() + 1;
        this._items[nextItem].transform += this._items.length * 100;        
        this.sliderItems.toArray()[nextItem].nativeElement.style.transform = 'translateX(' + this._items[nextItem].transform + '%)';
      }      
      this.transform -= this.step;
    } else {
      this.firstItemPosition--;

      pageNumber = (this.pagesQuantity + --this.currentPage) % this.pagesQuantity;

      if (this.firstItemPosition < this.position.getMin()) {
        nextItem = this.position.getItemMax();
        this._items[nextItem].position = this.position.getMin() - 1;
        this._items[nextItem].transform -= this._items.length * 100;
        this.sliderItems.toArray()[nextItem].nativeElement.style.transform = 'translateX(' + this._items[nextItem].transform + '%)';
      }
      this.transform += this.step;
    }
    this.sliderWrapper.nativeElement.style.transform = 'translateX(' + this.transform + '%)';
    this.setCurrentPage(pageNumber);
  }

  private setCurrentPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.onCurrentPageChange.emit(this.currentPage);
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

  turn(direction: SliderDirection): void {
    this.transformItem(direction);
    clearInterval(this.intervalRef);
    this.cycle(this._direction);
  }

  clearInterval(): void {
    if (this._isPauseByHover) {
      clearInterval(this.intervalRef);
    }
  }

  private handleCustomTurning() {
    if (this.turnEmitter) {
      this.turnEmitter.subscribe((direction: SliderDirection) => {
        this.turn(direction);
      });
    }
  }
}
