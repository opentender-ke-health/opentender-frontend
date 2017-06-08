import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnChanges,
	ViewChild,
	SimpleChanges,
	ChangeDetectionStrategy
} from '@angular/core';
import {YAxisTicksComponent} from './y-axis-ticks.component';

@Component({
	selector: 'g[ngx-charts-y-axis]',
	template: `
    <svg:g
      [attr.class]="yAxisClassName"
      [attr.transform]="transform">
      <svg:g ngx-charts-y-axis-ticks
        [tickFormatting]="tickFormatting"
        [tickArguments]="tickArguments"
        [tickStroke]="tickStroke"
        [scale]="yScale"
        [orient]="yOrient"
        [showGridLines]="showGridLines"
        [gridLineWidth]="width"
        [height]="dims.height"
        [defaultWidth]="defaultWidth"
        [minInterval]="minInterval"
        (dimensionsChanged)="emitTicksWidth($event)"
      />

      <svg:g ngx-charts-axis-label
        *ngIf="showLabel"
        [label]="labelText"
        [offset]="labelOffset"
        [orient]="yOrient"
        [height]="dims.height"
        [width]="width">
      </svg:g>
    </svg:g>
  `,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class YAxisComponent implements OnChanges {

	@Input() yScale;
	@Input() dims;
	@Input() defaultWidth: number;
	@Input() tickFormatting;
	@Input() showGridLines = false;
	@Input() showLabel;
	@Input() labelText;
	@Input() minInterval;
	@Input() yAxisTickInterval;

	@Output() dimensionsChanged = new EventEmitter();

	yAxisClassName: string = 'y axis';
	yAxisTickCount: any;
	tickArguments: any;
	offset: any;
	transform: any;
	width: number = 0;
	yAxisOffset: number = -5;
	yOrient: string = 'left';
	labelOffset: number = 80;
	fill: string = 'none';
	stroke: string = '#CCC';
	tickStroke: string = '#CCC';
	strokeWidth: number = 1;

	@ViewChild(YAxisTicksComponent) ticksComponent: YAxisTicksComponent;

	ngOnChanges(changes: SimpleChanges): void {
		this.update();
	}

	update(): void {
		this.width = this.dims.width || this.defaultWidth;
		this.offset = this.yAxisOffset;
		if (this.yOrient === 'right') {
			this.transform = `translate(${this.offset + this.dims.width} , 0)`;
		} else {
			this.transform = `translate(${this.offset} , 0)`;
		}

		if (this.yAxisTickCount !== undefined) {
			this.tickArguments = [this.yAxisTickCount];
		}
	}

	emitTicksWidth({width}): void {
		if (width !== this.labelOffset) {
			this.labelOffset = width;
			setTimeout(() => {
				this.dimensionsChanged.emit({width: width});
			}, 0);
		}
	}

}