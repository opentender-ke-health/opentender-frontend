import {Component, Input, ChangeDetectionStrategy, Output, EventEmitter, ChangeDetectorRef, NgZone, ElementRef} from '@angular/core';
import d3 from '../d3';
import {BaseXYAxisComponent} from '../common/chart/base-axes-chart.component';
import {IChartHeatmapSettings, IChartData} from '../chart.interface';
import {ColorHelper} from '../utils/color.helper';
import {calculateViewDimensions} from '../utils/view-dimensions.helper';
import {IDomain, ILegendOptions} from '../common/common.interface';
import {formatDates} from '../utils/data.helper';
import {PlatformService} from '../../../services/platform.service';


interface IRect {
	x: number;
	y: number;
	rx: number;
	width: number;
	height: number;
	fill: string;
}

@Component({
	selector: 'ngx-charts-heat-map',
	template: `
    <ngx-charts-chart
      [dim]="dim" [chart]="chart" [data]="data"
      [legendOptions]="legendOptions"
      (legendLabelActivate)="onActivate($event)"
      (legendLabelDeactivate)="onDeactivate($event)"
      (legendLabelClick)="onClick($event)">
      <svg:g [attr.transform]="transform" class="heat-map chart">
        <svg:g ngx-charts-x-axis
          *ngIf="xAxis"
          [xScale]="xScale"
          [dims]="viewDim"
          [showLabel]="showXAxisLabel"
          [labelText]="xAxisLabel"
          (dimensionsChanged)="updateXAxisHeight($event)">
        </svg:g>
        <svg:g ngx-charts-y-axis
          *ngIf="yAxis"
          [yScale]="yScale"
          [dims]="viewDim"
          [showLabel]="showYAxisLabel"
          [labelText]="yAxisLabel"
          (dimensionsChanged)="updateYAxisWidth($event)">
        </svg:g>
        <svg:rect *ngFor="let rect of rects"
          [attr.x]="rect.x"
          [attr.y]="rect.y"
          [attr.rx]="rect.rx"
          [attr.width]="rect.width"
          [attr.height]="rect.height"
          [attr.fill]="rect.fill"
        />
        <svg:g ngx-charts-heat-map-cell-series
          [xScale]="xScale"
          [yScale]="yScale"
          [colors]="colors"
          [data]="results"
          [gradient]="gradient"
          (select)="onClick($event)"
        />
      </svg:g>
    </ngx-charts-chart>
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatMapComponent extends BaseXYAxisComponent {
	@Input() chart: IChartHeatmapSettings;
	@Input() data: Array<IChartData>;
	@Input() activeEntries: any[];
	@Output() select: EventEmitter<any>;
	@Output() activate: EventEmitter<any>;
	@Output() deactivate: EventEmitter<any>;

	valueDomain: IDomain;
	rects: Array<IRect>;

	constructor(protected chartElement: ElementRef, protected zone: NgZone, protected cd: ChangeDetectorRef, protected platform: PlatformService) {
		super(chartElement, zone, cd, platform);
	}

	updateDomains(): void {
		this.valueDomain = this.getValueDomain();
	}

	updateViewDim(): void {
		this.viewDim = calculateViewDimensions({
			width: this.dim.width,
			height: this.dim.height,
			margins: this.margin,
			showXAxis: this.chart.xAxis.show,
			showYAxis: this.chart.yAxis.show,
			xAxisHeight: this.xAxisHeight,
			yAxisWidth: this.yAxisWidth,
			showXLabel: this.chart.xAxis.showLabel,
			showYLabel: this.chart.yAxis.showLabel,
			showLegend: this.chart.legend && this.chart.legend.show,
			legendType: 'linear'
		});
	};

	update(): void {
		formatDates(this.data);
		super.update();
		this.rects = this.getRects();
	}

	getXDomain(): IDomain {
		let domain = [];
		for (let group of this.data) {
			if (!domain.includes(group.name)) {
				domain.push(group.name);
			}
		}
		return domain;
	}

	getYDomain(): IDomain {
		let domain = [];
		for (let group of this.data) {
			for (let d of group.series) {
				if (!domain.includes(d.name)) {
					domain.push(d.name);
				}
			}
		}
		return domain;
	}

	getColorDomain(): IDomain {
		return this.valueDomain;
	}

	getXScale() {
		const scale = d3.scaleBand<number>()
			.rangeRound([0, this.viewDim.width])
			.paddingInner(0.1)
			.domain(this.xDomain.map(i => {
				return <number>i;
			}));
		return scale;
	}

	getYScale() {
		const scale = d3.scaleBand<number>()
			.rangeRound([this.viewDim.height, 0])
			.paddingInner(0.1)
			.domain(this.yDomain.map(i => {
				return <number>i;
			}));
		return scale;
	}

	setColors(): void {
		this.colors = new ColorHelper(this.chart.colorScheme, 'linear', this.valueDomain);
	}

	getLegendOptions(): ILegendOptions {
		return {
			scaleType: 'linear',
			domain: this.valueDomain,
			colors: this.colors.scale
		};
	}

	getValueDomain(): IDomain {
		let domain = [];
		for (let group of this.data) {
			for (let d of group.series) {
				if (!domain.includes(d.value)) {
					domain.push(d.value);
				}
			}
		}
		let min = Math.min(0, ...domain);
		let max = Math.max(...domain);
		return [min, max];
	}

	getRects(): Array<IRect> {
		let rects: Array<IRect> = [];

		this.xDomain.map((xVal) => {
			this.yDomain.map((yVal) => {
				rects.push({
					x: this.xScale(xVal),
					y: this.yScale(yVal),
					rx: 3,
					width: this.xScale.bandwidth(),
					height: this.yScale.bandwidth(),
					fill: 'rgba(200,200,200,0.03)'
				});
			});
		});

		return rects;
	}

}