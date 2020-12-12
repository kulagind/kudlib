# Kudlib

This is a library with angular components/directives.

See [DEMO](https://kulagind.github.io/kudlib/)

Now here is:
1) slider component;

## Using

1) You can install this by:
> npm install kudlib

2) Next you have to add import in your angular module:
> `import { KudlibModule } from 'kudlib';`

3) After that you can use component (don't forget to read up documentation), for example:
> `<kudlib-slider></kudlib-slider>`

## Documentation

### Slider

1) Input parameters:

> items: Array<any>; // subjects of slider
> config: {
>   isCycling: boolean; // is auto-turning (by default true)
>   isPauseByHover: boolean; // turning direction (by default true)
>   isDefaultButtons: boolean; // milliseconds between turning (by default true)
>   isSinglyCycle: boolean; // stop turning on hover (by default true)
>   interval: number; // show default buttons (by default 1000)
>   itemsOnDisplayQuantity: number; // turn one item by one ("false" means to turn a whole page) (by default 3)
>   direction: 'right' | 'left'; // number of items on display (by default 'right')
> };
> turnEmitter: EventEmitter<'left' | 'right'>; // its to use your own buttons instead of default. You need emit a direction (left' | 'right') to turn slider.

2) Output parameters:

> onCurrentPageChange: EventEmitter<number>; // it emits a current page when init a slider and after page or parameters changing;
> onPagesQuantityChange: EventEmitter<number>; // it emits a quantity of pages when init a slider and after parameters changing;

3) Parent's template:

You have to pass ng-template (with let-item="$implicit" to use item's property in a template) into kudlib-slider component and define.

> `<kudlib-slider `
>   `[items]="items"`
>   `[turnEmitter]="turnEmitter"`
>   `[config]="config"`
>   `(onCurrentPageChange)="changeCurrentPage($event)"`
>   `(onPagesQuantityChange)="changePagesCount($event)">`
>   `<ng-template let-item="$implicit">`
>       `<div class="slider__item" [ngStyle]="{'background-color': item.color}">`
>           `<div class="slider__name">{{ item.name }}</div>`
>           `<div class="slider__id">{{ item.id }}</div>`
>       `</div>`
>   `</ng-template>`
> `</kudlib-slider>`