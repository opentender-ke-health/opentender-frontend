import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
/// <reference path="./model/tender.d.ts" />
import Body = Definitions.Body;
import Address = Definitions.Address;
import Price = Definitions.Price;
import {Subscription} from 'rxjs/Subscription';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../services/api.service';

@Component({
	moduleId: __filename,
	selector: 'collapse-expand',
	template: `
		<span *ngIf="o" class="link-no_under" i18n-title title="Click to hide/show this section" (click)="o.open=!o.open">{{o.label}} <i class="icon-chevron-down"
																																		 [ngClass]="{'icon-chevron-down':!o.open,'icon-chevron-up':o.open}"></i></span>
	`
})
export class CollapseExpandComponent {
	@Input()
	public o: { open: boolean; label: string };
}

@Component({
	moduleId: __filename,
	selector: 'tender-body-address',
	template: `
		<div *ngIf="address">
			<div *ngIf="address.street | defined">{{address.street}}</div>
			<div *ngIf="(address.postcode||address.city) | defined"><span *ngIf="address.postcode | defined">{{address.postcode}}, </span>{{address.city}}</div>
			<div *ngIf="(address.ot?address.ot.nutscode:null) | defined"><a [routerLink]="['/region/'+address.ot.nutscode]">{{nutsCode}}</a></div>
			<div *ngIf="address.country | defined">{{address.country | expandCountry}}</div>
		</div>
	`
})
export class TenderBodyAddressComponent {
	@Input() public address: Address;
	public nutsCode = '';
	private subscription: Subscription;
	constructor(private route: ActivatedRoute, private api: ApiService) {}

	ngOnInit(): void {
		this.subscription = this.route.params.subscribe(params => {
			let sub = this.api.getNutsNames().subscribe(
				(result) => {
					this.nutsCode = result[this.address.ot.nutscode];
				},
				(error) => {
					this.nutsCode = `NUTS ${this.address.ot.nutscode}`;
				},
				() => {
					sub.unsubscribe();
				});
		});
	}
}

@Component({
	moduleId: __filename,
	selector: 'tender-body',
	template: `
		<div *ngIf="body">
			Supplier name: <a *ngIf="link" routerLink="{{link}}"> <i *ngIf="icon" class="{{icon}}"></i> {{body.name | nameGuard}}</a><span *ngIf="!link">{{body.name | nameGuard}}</span><br/>
			<tender-body-address *ngIf="body.address" [address]="body.address"></tender-body-address>
		</div>
	`
})
export class TenderBodyComponent {
	@Input()
	public body: Body;
	@Input()
	public link: string;
	@Input()
	public icon: string;
}

@Component({
	moduleId: __filename,
	selector: 'tender-body-line',
	template: `<span *ngIf="body">
	<a *ngIf="link" routerLink="{{link}}"><i *ngIf="icon" class="{{icon}}"></i> {{body.name | nameGuard}}</a><span *ngIf="!link">{{body.name}}</span><span *ngIf="body.address && body.address.city | defined">, {{body.address.city}}</span>
</span>`
})
export class TenderBodyLineComponent {
	@Input()
	public body: Body;
	@Input()
	public link: string;
	@Input()
	public icon: string;
}

@Component({
	moduleId: __filename,
	selector: 'tender-price',
	template: `<span *ngIf="price">
	<div *ngIf="price.netAmountNational | defined"><span>(national)</span> <span>{{price.currencyNational | formatCurrency}}</span> {{price.netAmountNational | formatCurrencyValue}}</div>
	<div *ngIf="price.vat | defined"><span>(VAT)</span> {{price.vat}}%</div>
</span>`
})
export class TenderPriceComponent implements OnChanges {
	@Input()
	public price: Price;

	public ngOnChanges(changes: SimpleChanges): void {

	}
}
