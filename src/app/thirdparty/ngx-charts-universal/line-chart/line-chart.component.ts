import {Component, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy, ElementRef, NgZone, ChangeDetectorRef} from '@angular/core';
import {UrlId} from '../utils/id.helper';
import d3 from '../d3';
import {IChartLineSettings, IChartData} from '../chart.interface';
import {BaseXYAxisComponent} from '../common/chart/base-axes-chart.component';
import {PlatformService} from '../common/chart/base-chart.component';
import {IDomain, ILegendOptions} from '../common/common.interface';
import {toDate, isDate} from '../utils/date.helper';


@Component({
	selector: 'ngx-charts-line-chart',
	template: `
    <ngx-charts-chart
      [dim]="dim" [chart]="chart" [data]="data"
      [legendOptions]="legendOptions"
      [activeEntries]="activeEntries"
      (legendLabelClick)="onClick($event)"
      (legendLabelActivate)="onActivate($event)"
      (legendLabelDeactivate)="onDeactivate($event)">
      <svg:defs>
        <svg:clipPath [attr.id]="clipId.id">
          <svg:rect
            [attr.width]="viewDim.width + 10"
            [attr.height]="viewDim.height + 10"
            [attr.transform]="'translate(-5, -5)'"/>
        </svg:clipPath>
      </svg:defs>
      <svg:g [attr.transform]="transform" class="line-chart chart">
        <svg:g ngx-charts-x-axis
          *ngIf="chart.xAxis.show"
          [xScale]="xScale"
          [dims]="viewDim"
          [showGridLines]="chart.showGridLines"
          [showLabel]="chart.xAxis.showLabel"
          [labelText]="chart.xAxis.label"
          (dimensionsChanged)="updateXAxisHeight($event)">
        </svg:g>
        <svg:g ngx-charts-y-axis
          *ngIf="chart.yAxis.show"
          [yScale]="yScale"
          [dims]="viewDim"
          [showGridLines]="chart.showGridLines"
          [showLabel]="chart.yAxis.showLabel"
          [labelText]="chart.yAxis.label"
          (dimensionsChanged)="updateYAxisWidth($event)">
        </svg:g>
        <svg:g [attr.clip-path]="clipId.url">
          <svg:g *ngFor="let series of data; trackBy:trackBy">
            <svg:g ngx-charts-line-series
              [xScale]="xScale"
              [yScale]="yScale"
              [colors]="colors"
              [data]="series"
              [activeEntries]="activeEntries"
              [scaleType]="scaleType"
              [curve]="curve"
            />
          </svg:g>
          <svg:g ngx-charts-area-tooltip
            [xSet]="xSet"
            [xScale]="xScale"
            [yScale]="yScale"
            [results]="data"
            [height]="viewDim.height"
            [colors]="colors"
            (hover)="updateHoveredVertical($event)"
          />
          <svg:g *ngFor="let series of data">
            <svg:g ngx-charts-circle-series
              [xScale]="xScale"
              [yScale]="yScale"
              [colors]="colors"
              [data]="series"
              [scaleType]="scaleType"
              [visibleValue]="hoveredVertical"
              [activeEntries]="activeEntries"
              (select)="onClick($event, series)"
              (activate)="onActivate($event)"
              (deactivate)="onDeactivate($event)"
            />
          </svg:g>
        </svg:g>
      </svg:g>
      <svg:g ngx-charts-timeline
        *ngIf="timeline && scaleType === 'time'"
        [attr.transform]="timelineTransform"
        [results]="data"
        [view]="[timelineWidth, height]"
        [height]="timelineHeight"
        [scheme]="chart.colorScheme"
        [customColors]="chart.customColors"
        [scaleType]="scaleType"
        [legend]="chart.legend && chart.legend.show"
        (onDomainChange)="updateDomain($event)">
        <svg:g *ngFor="let series of data; trackBy:trackBy">
          <svg:g ngx-charts-line-series
            [xScale]="timelineXScale"
            [yScale]="timelineYScale"
            [colors]="colors"
            [data]="series"
            [scaleType]="scaleType"
            [curve]="curve"
          />
        </svg:g>
      </svg:g>
    </ngx-charts-chart>
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent extends BaseXYAxisComponent {
	@Input() data: Array<IChartData>;
	@Input() chart: IChartLineSettings;
	@Output() select: EventEmitter<any>;
	@Input() activeEntries: any[];
	@Output() activate: EventEmitter<any>;
	@Output() deactivate: EventEmitter<any>;

	curve = d3.shape.curveLinear;
	xSet: IDomain;
	seriesDomain: IDomain;
	scaleType: string;
	transform: string;
	hoveredVertical: any; // the value of the x axis that is hovered over
	filteredDomain: IDomain;
	clipId = new UrlId();

	timelineWidth: number;
	timelineHeight = 50;
	timelineXScale;
	timelineYScale;
	timelineXDomain: IDomain;
	timelineTransform: string;
	timelinePadding = 10;

	constructor(protected chartElement: ElementRef, protected zone: NgZone, protected cd: ChangeDetectorRef, protected platform: PlatformService) {
		super(chartElement, zone, cd, platform);
	}

	updateDomains(): void {
		if (this.chart.timeline) {
			this.viewDim.height -= (this.timelineHeight + this.margin[2] + this.timelinePadding);
		}
		if (this.filteredDomain) {
			this.xDomain = this.filteredDomain;
		}
		this.seriesDomain = this.getSeriesDomain();
	}

	updateScales(): void {
		this.updateTimeline();
		this.clipId.generate('clip', this.platform.isBrowser);
	}

	getXSet(): IDomain {
		let values = [];
		for (let group of this.data) {
			for (let d of group.series) {
				if (!values.includes(d.name)) {
					values.push(d.name);
				}
			}
		}
		return values;
	}

	getXDomain(): IDomain {
		this.xSet = this.getXSet();
		this.scaleType = this.getScaleType(this.xSet);
		let domain = [];
		if (this.scaleType === 'time') {
			let values = this.xSet.map(v => toDate(v).valueOf());
			let min = Math.min(...values);
			let max = Math.max(...values);
			domain = [min, max];
		} else if (this.scaleType === 'linear') {
			let values = this.xSet.map(v => Number(v));
			let min = Math.min(...values);
			let max = Math.max(...values);
			domain = [min, max];
		} else {
			domain = this.xSet;
		}
		return domain;
	}

	getYDomain(): IDomain {
		let domain = [];

		for (let results of this.data) {
			for (let d of results.series) {
				if (!domain.includes(d.value)) {
					domain.push(d.value);
				}
			}
		}

		let min = Math.min(...domain);
		let max = Math.max(...domain);
		if (!this.chart.autoScale) {
			min = Math.min(0, min);
		}

		return [min, max];
	}

	getXScale() {
		return this._getXScale(this.xDomain, this.viewDim.width);
	}

	getYScale() {
		return this._getYScale(this.yDomain, this.viewDim.height);
	}

	getColorDomain(): IDomain {
		return (this.chart.schemeType === 'ordinal') ? this.seriesDomain : this.yDomain;
	}

	getLegendOptions(): ILegendOptions {
		if (this.chart.schemeType === 'ordinal') {
			return {
				scaleType: this.chart.schemeType,
				colors: this.colors,
				domain: this.seriesDomain
			};
		} else {
			return {
				scaleType: this.chart.schemeType,
				colors: this.colors.scale,
				domain: this.yDomain
			};
		}
	}

	updateTimeline(): void {
		if (this.chart.timeline) {
			this.timelineWidth = this.dim.width;
			if (this.chart.legend && this.chart.legend.show) {
				this.timelineWidth = this.viewDim.width;
			}
			this.timelineXDomain = this.getXDomain();
			this.timelineXScale = this._getXScale(this.timelineXDomain, this.timelineWidth);
			this.timelineYScale = this._getYScale(this.yDomain, this.timelineHeight);
			this.timelineTransform = `translate(${ this.viewDim.xOffset }, ${ -this.margin[2] })`;
		}
	}

	getSeriesDomain(): IDomain {
		return this.data.map(d => d.name);
	}

	_getXScale(domain, width) {
		let scale;

		if (this.scaleType === 'time') {
			scale = d3.scaleTime()
				.range([0, width])
				.domain(domain);
		} else if (this.scaleType === 'linear') {
			scale = d3.scaleLinear()
				.range([0, width])
				.domain(domain);
		} else if (this.scaleType === 'ordinal') {
			scale = d3.scalePoint()
				.range([0, width])
				.padding(0.1)
				.domain(domain);
		}

		return scale;
	}

	_getYScale(domain, height) {
		const scale = d3.scaleLinear()
			.range([height, 0])
			.domain(domain);
		return scale;
	}

	getScaleType(values: IDomain): string {
		let date = true;
		let number = true;
		for (let value of values) {
			if (!isDate(value)) {
				date = false;
			}
			if (typeof value !== 'number') {
				number = false;
			}
		}
		if (date) {
			return 'time';
		}
		if (number) {
			return 'linear';
		}
		return 'ordinal';
	}


	updateDomain(domain: IDomain): void {
		this.filteredDomain = domain;
		this.xDomain = this.filteredDomain;
		this.xScale = this.getXScale();
	}

	updateHoveredVertical(item): void {
		this.hoveredVertical = item.value;
	}

	@HostListener('mouseleave')
	hideCircles(): void {
		this.hoveredVertical = null;
	}

}