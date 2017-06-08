import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {calculateViewDimensions} from '../utils/view-dimensions.helper';
import {IChartPieSettings, IChartData} from '../chart.interface';
import {BasePieChartComponent} from './pie-chart-base.component';
import {ILegendOptions} from '../common/common.interface';

@Component({
	selector: 'ngx-charts-pie-chart',
	template: `
    <ngx-charts-chart
      [dim]="dim" [chart]="chart" [data]="data"  
      [legendOptions]="legendOptions"
      [activeEntries]="activeEntries"
      (legendLabelActivate)="onActivate($event)"
      (legendLabelDeactivate)="onDeactivate($event)"
      (legendLabelClick)="onClick($event)">
      <svg:g [attr.transform]="transform" class="pie-chart chart">
        <svg:g ngx-charts-pie-series
          [colors]="colors"
          [showLabels]="chart.labels"
          [series]="piedata"
          [activeEntries]="activeEntries"
          [innerRadius]="innerRadius"
          [outerRadius]="outerRadius"
          [explodeSlices]="chart.explodeSlices"
          [gradient]="chart.gradient"
          (select)="onClick($event)"
          (activate)="onActivate($event)"
          (deactivate)="onDeactivate($event)"
        />
      </svg:g>
    </ngx-charts-chart>
  `,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieChartComponent extends BasePieChartComponent {
	@Input() chart: IChartPieSettings;
	@Input() data: Array<IChartData>;
	@Input() activeEntries: any[];
	@Output() select: EventEmitter<any>;
	@Output() activate: EventEmitter<any>;
	@Output() deactivate: EventEmitter<any>;

	piedata: Array<any>;
	outerRadius: number;
	innerRadius: number;
	legendOptions: any;

	update(): void {
		super.update();

		this.zone.run(() => {
			this.viewDim = calculateViewDimensions({
				width: this.dim.width,
				height: this.dim.height,
				margins: this.margin,
				showLegend: this.chart.legend && this.chart.legend.show,
				columns: 12
			});

			let xOffset = this.margin[3] + this.viewDim.width / 2;
			let yOffset = this.margin[0] + this.viewDim.height / 2;
			this.transform = `translate(${xOffset}, ${yOffset})`;
			this.outerRadius = Math.min(this.viewDim.width, this.viewDim.height);
			if (this.chart.labels) {
				// make room for labels
				this.outerRadius /= 3;
			} else {
				this.outerRadius /= 2;
			}
			this.innerRadius = 0;
			if (this.chart.doughnut) {
				this.innerRadius = this.outerRadius * 0.75;
			}

			this.domain = this.getDomain();

			// sort data according to domain
			this.piedata = this.data.sort((a, b) => {
				return this.domain.indexOf(a.name) - this.domain.indexOf(b.name);
			});

			this.setColors();
			this.legendOptions = this.getLegendOptions();
		});
	}

	getDomain(): any[] {
		let items = [];
		this.data.map(d => {
			let label = d.name;
			if (label instanceof Date) {
				label = label.toLocaleDateString();
			} else {
				label = label.toLocaleString();
			}

			if (items.indexOf(label) === -1) {
				items.push(label);
			}
		});

		return items;
	}

	getLegendOptions(): ILegendOptions {
		return {
			scaleType: 'ordinal',
			domain: this.domain,
			colors: this.colors
		};
	}

}