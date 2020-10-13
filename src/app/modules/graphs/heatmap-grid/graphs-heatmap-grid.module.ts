import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GraphFooterModule} from '../../graph-footer/graph-footer.module';
import {CommonTooltipModule} from '../../../thirdparty/ngx-charts-universal/common/tooltip/common-tooltip.module';
import {HeatMapGridModule} from '../../../thirdparty/ngx-charts-universal/heat-map-grid/heat-map-grid.module';
import {GraphBenchmarksDistributionComponent} from './benchmarks-distribution.component';
import {FormsModule} from '@angular/forms';
import {InfoButtonModule} from '../../info-button/info-button.module';

@NgModule({
	imports: [
		CommonModule,
		HeatMapGridModule,
		FormsModule,
		GraphFooterModule,
		CommonTooltipModule,
		InfoButtonModule
	],
	declarations: [
		GraphBenchmarksDistributionComponent
	],
	exports: [
		GraphBenchmarksDistributionComponent
	]
})
export class GraphsHeatMapGridModule {
}
