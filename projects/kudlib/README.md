# Kudlib

This is a library with angular components/directives.

See [DEMO](https://kulagind.github.io/kudlib/)

Now here is:
1) slider component;

## Using

1) You can install this by:
> `npm install kudlib`

2) Next you have to add import in your angular module:
> `import { KudlibModule } from 'kudlib';`

3) After that you can use component (don't forget to read up documentation), for example:
> `<kudlib-slider></kudlib-slider>`

## Documentation

### Slider

1) Input parameters:

> items: Array<any>; // subjects of slider<br />
> config: {<br />
> &nbsp;  isCycling: boolean; // is auto-turning (by default true)<br />
> &nbsp;  isPauseByHover: boolean; // turning direction (by default true)<br />
> &nbsp;  isDefaultButtons: boolean; // milliseconds between turning (by default true)<br />
> &nbsp;  isSinglyCycle: boolean; // stop turning on hover (by default true)<br />
> &nbsp;  interval: number; // show default buttons (by default 1000)<br />
> &nbsp;  itemsOnDisplayQuantity: number; // turn one item by one ("false" means to turn a whole page) (by default 3)<br />
> &nbsp;  direction: 'right' | 'left'; // number of items on display (by default 'right')<br />
> };<br />
> turnEmitter: EventEmitter<'left' | 'right'>; // its to use your own buttons instead of default. You need emit a direction (left' | 'right') to turn slider.

2) Output parameters:

> onCurrentPageChange: EventEmitter<number>; // it emits a current page when init a slider and after page or parameters changing;<br />
> onPagesQuantityChange: EventEmitter<number>; // it emits a quantity of pages when init a slider and after parameters changing;

3) Parent's template:

You have to pass ng-template (with let-item="$implicit" to use item's property in a template) into kudlib-slider component and define.

> `<kudlib-slider `<br />
> &nbsp;  `[items]="items"`<br />
> &nbsp;  `[turnEmitter]="turnEmitter"`<br />
> &nbsp;  `[config]="config"`<br />
> &nbsp;  `(onCurrentPageChange)="changeCurrentPage($event)"`<br />
> &nbsp;  `(onPagesQuantityChange)="changePagesCount($event)">`<br />
> &nbsp;  `<ng-template let-item="$implicit">`<br />
> &nbsp;&nbsp;      `<div class="slider__item" [ngStyle]="{'background-color': item.color}">`<br />
> &nbsp;&nbsp;&nbsp;          `<div class="slider__name">{{ item.name }}</div>`<br />
> &nbsp;&nbsp;&nbsp;          `<div class="slider__id">{{ item.id }}</div>`<br />
> &nbsp;&nbsp;      `</div>`<br />
> &nbsp;  `</ng-template>`<br />
> `</kudlib-slider>`