import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SelectYearRangeComponent} from './select-year-range.component';
import {SliderModule} from '../slider/silder.module';
import {InfoButtonModule} from '../info-button/info-button.module';

@NgModule({
	imports: [
		CommonModule,
		SliderModule,
		InfoButtonModule
	],
	declarations: [
		SelectYearRangeComponent,
	],
	exports: [
		SelectYearRangeComponent
	],
	providers: [
	]
})
export class SelectYearRangeModule {
}
