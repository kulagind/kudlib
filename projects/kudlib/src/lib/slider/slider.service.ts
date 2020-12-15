import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

export enum SliderDirection {
    left = 'left',
    right = 'right'
}
  
export interface IPartialSliderConfig {
    isCycling?: boolean, // is auto-turning
    direction?: SliderDirection, // turning direction
    interval?: number, // milliseconds between turning
    isPauseByHover?: boolean, // stop turning on hover
    isDefaultButtons?: boolean, // show default buttons
    isSinglyCycle?: boolean // turn one item by one ("false" means to turn a whole page)
    itemsOnDisplayQuantity?: number // number of items on display
}
  
interface ISliderConfig {
    isCycling: boolean, // is auto-turning
    direction: SliderDirection, // turning direction
    interval: number, // milliseconds between turning
    isPauseByHover: boolean, // stop turning on hover
    isDefaultButtons: boolean, // show default buttons
    isSinglyCycle: boolean // turn one item by one ("false" means to turn a whole page)
    itemsOnDisplayQuantity: number // number of items on display
}

const DEFAULT_CONFIG: ISliderConfig = {
    isCycling: true,
    direction: SliderDirection.right,
    interval: 5000,
    isPauseByHover: true,
    isDefaultButtons: true,
    isSinglyCycle: true,
    itemsOnDisplayQuantity: 3
}
  
export interface ISliderItem {
    item: any;
    position: number;
    transform: number;
}

@Injectable()
export class SliderService {
    private config: ISliderConfig = DEFAULT_CONFIG;

    private isCycling = new BehaviorSubject<boolean>(this.config.isCycling);
    private isPauseByHover = new BehaviorSubject<boolean>(this.config.isPauseByHover);
    private isSinglyCycle = new BehaviorSubject<boolean>(this.config.isSinglyCycle);
    private isDefaultButtons = new BehaviorSubject<boolean>(this.config.isDefaultButtons);
    private direction = new BehaviorSubject<SliderDirection>(this.config.direction);
    private interval = new BehaviorSubject<number>(this.config.interval);
    private itemsOnDisplayQuantity = new BehaviorSubject<number>(this.config.itemsOnDisplayQuantity);

    private items = new ReplaySubject<any[]>(1);

    private optionsMap = new Map<string, BehaviorSubject<any>>(Object.keys(DEFAULT_CONFIG).map(key => ([key, this[key]])));

    setItems(items: any[]): void {
        this.items.next(items);
    }

    setConfig(config: IPartialSliderConfig): void {
        this.config = {...this.config, ...config};

        this.optionsMap.forEach((value: BehaviorSubject<any>, key: string) => {
            value.next(this.config[key]);
        });
    }

    getOptionsMap(): Map<string, BehaviorSubject<any>> {
        return this.optionsMap;
    }

    get isCycling$(): Observable<boolean> {
        return this.isCycling.asObservable();
    }

    get isPauseByHover$(): Observable<boolean> {
        return this.isPauseByHover.asObservable();
    }

    get isSinglyCycle$(): Observable<boolean> {
        return this.isSinglyCycle.asObservable();
    }

    get isDefaultButtons$(): Observable<boolean> {
        return this.isDefaultButtons.asObservable();
    }

    get direction$(): Observable<SliderDirection> {
        return this.direction.asObservable();
    }

    get interval$(): Observable<number> {
        return this.interval.asObservable();
    }

    get itemsOnDisplayQuantity$(): Observable<number> {
        return this.itemsOnDisplayQuantity.asObservable();
    }

    get items$(): Observable<any[]> {
        return this.items.asObservable();
    }
}