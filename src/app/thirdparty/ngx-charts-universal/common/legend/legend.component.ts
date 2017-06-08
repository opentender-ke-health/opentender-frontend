import {Component, Input, ChangeDetectionStrategy, Output, EventEmitter, SimpleChanges, OnChanges, ChangeDetectorRef, NgZone} from '@angular/core';
import {formatLabel} from '../../utils/label.helper';

@Component({
	selector: 'ngx-charts-legend',
	template: `
    <div [style.width.px]="width">
      <div class="legend-title">
        <span class="legend-icon icon-eye"></span>
        <span class="legend-title-text">{{title}}</span>
      </div>
      <div class="legend-wrap">
        <ul class="legend-labels"
          [style.max-height.px]="height - 45">
          <li
            *ngFor="let entry of legendEntries; trackBy: trackBy"
            class="legend-label">
            <ngx-charts-legend-entry
              [label]="entry.label"
              [formattedLabel]="entry.formattedLabel"
              [color]="entry.color"
              [isActive]="isActive(entry)"
              (select)="labelClick.emit($event)"
              (activate)="activate($event)"
              (deactivate)="deactivate($event)">
            </ngx-charts-legend-entry>
          </li>
        </ul>
      </div>
    </div>
  `,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendComponent implements OnChanges {

	@Input() data;
	@Input() title;
	@Input() colors;
	@Input() height;
	@Input() width;
	@Input() activeEntries: any[];

	@Output() labelClick: EventEmitter<any> = new EventEmitter();
	@Output() labelActivate: EventEmitter<any> = new EventEmitter();
	@Output() labelDeactivate: EventEmitter<any> = new EventEmitter();

	legendEntries: any[] = [];

	constructor(private cd: ChangeDetectorRef, private zone: NgZone) {
	}

	ngOnChanges(changes: SimpleChanges): void {
		this.update();
	}

	update(): void {
		this.zone.run(() => {
			this.cd.markForCheck();
			this.legendEntries = this.getLegendEntries();
		});
	}

	getLegendEntries(): any[] {
		let items = [];

		for (const label of this.data) {
			const formattedLabel = formatLabel(label);

			let idx = items.findIndex((i) => {
				return i.label === formattedLabel;
			});

			if (idx === -1) {
				items.push({
					label,
					formattedLabel,
					color: this.colors.getColor(label)
				});
			}
		}

		return items;
	}

	isActive(entry): boolean {
		if (!this.activeEntries) return false;
		let item = this.activeEntries.find(d => {
			return entry.label === d.name;
		});
		return item !== undefined;
	}

	activate(item) {
		this.zone.run(() => {
			this.labelActivate.emit(item);
		});
	}

	deactivate(item) {
		this.zone.run(() => {
			this.labelDeactivate.emit(item);
		});
	}

	trackBy(index, item): string {
		return item.label;
	}

}