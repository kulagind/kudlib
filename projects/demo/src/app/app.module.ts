import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SliderExampleComponent } from './slider-example/slider-example.component';
import { FormsModule } from '@angular/forms';
import { KudlibModule } from 'projects/kudlib/src/public-api';

@NgModule({
  declarations: [
    AppComponent,
    SliderExampleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    KudlibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
