import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {routing} from './tender.routing';
import {CollapseExpandComponent, TenderBodyAddressComponent, TenderBodyComponent, TenderBodyLineComponent, TenderPriceComponent} from './components/tender.components';
import {RouterModule} from '@angular/router';
import {PipesModule} from '../../modules/pipes/pipes.module';
import {TenderPage} from './tender.component';
import {DialogModule} from '../../modules/dialog/dialog.module';
import {GraphsHeatMapGridModule} from '../../modules/graphs/heatmap-grid/graphs-heatmap-grid.module';
import {GraphsValuesGridModule} from '../../modules/graphs/values-grid/graphs-values-grid.module';
import {LoadingModule} from '../../modules/loading/loading.module';
import {BreadcrumbModule} from '../../modules/breadcrumb/breadcrumb.module';
import {InfoButtonModule} from '../../modules/info-button/info-button.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		PipesModule,
		GraphsHeatMapGridModule,
		GraphsValuesGridModule,
		BreadcrumbModule,
		DialogModule,
		LoadingModule,
		routing,
		InfoButtonModule
	],
	declarations: [
		TenderPage,
		CollapseExpandComponent,
		TenderBodyAddressComponent,
		TenderBodyComponent,
		TenderBodyLineComponent,
		TenderPriceComponent
	]
})
export class TenderModule {
}
