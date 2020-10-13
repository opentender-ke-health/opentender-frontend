/// <reference path="./tender.d.ts" />
import Bidder = Definitions.Bidder;
import Buyer = Definitions.Buyer;
import Price = Definitions.Price;
import Lot = Definitions.Lot;
import Bid = Definitions.Bid;
import {ITableColumnAuthority, ITableColumnCompany, ITableColumnTender, ITableCellLine, IIndicatorInfo, ITableLibrary} from '../app.interfaces';
import {Utils} from './utils';
import Tender = Definitions.Tender;

const ICON = {
	tender: 'icon-newspaper',
	region: 'icon-location',
	authority: 'icon-library',
	company: 'icon-office'
};

const ColumnsFormatUtils = {
	checkEntryCollapse: (list: Array<ITableCellLine>, library: ITableLibrary, amount: number = 10) => {
		if (list.length > amount) {
			return [{collapseName: list.length + ' ' + library.i18n.get('Entries'), collapseLines: list, collapsed: true}];
		}
		return list;
	},
	sortListByContent: (list: Array<ITableCellLine>) => {
		list.sort((a, b) => {
			if (a.content < b.content) {
				return -1;
			}
			if (a.content > b.content) {
				return 1;
			}
			return 0;
		});
		return list;
	},
	formatPriceEURValue: (value: number, library: ITableLibrary) => {
		return library.i18n.formatCurrencyValueEUR(value).replace(/ /g, '\u00a0');
	},
	formatPriceEUR: (price: Price, library: ITableLibrary) => {
		if (price && price.hasOwnProperty('netAmountEur')) {
			return [{content: ColumnsFormatUtils.formatPriceEURValue(price.netAmountEur, library)}];
		}
		return [];
	},
	formatTenderIndicatorGroup: (tender: Tender, group: IIndicatorInfo) => {
		if (!tender.indicators || !group) {
			return [];
		}
		let result: Array<ITableCellLine> = [];
		tender.ot.scores.forEach(score => {
			if (score.status === 'CALCULATED' && score.type === group.id) {
				let collapseLines: Array<ITableCellLine> = [];
				tender.indicators.forEach(indicator => {
					let group_id = indicator.type.split('_')[0];
					if (indicator.status === 'CALCULATED' && group_id === group.id) {
						let def = group.subindicators.find(sub => sub.id === indicator.type);
						if (def) {
							collapseLines.push({score: indicator.value, prefix: def.name, hint: def.desc});
						}
					}
				});
				result.push({collapseName: group.name, score: score.value, hint: group.name, collapseLines: collapseLines, collapsed: true, align: 'center'});
			}
		});
		return result;
	}
};

export const AuthorityColumns: Array<ITableColumnAuthority> = [
	{
		name: 'Name',
		id: 'body.name',
		group: 'Authority',
		sortBy: {
			id: 'body.name.raw',
			ascend: true
		},
		format: (authority, library): Array<ITableCellLine> => [{content: library.i18n.nameGuard(authority.body.name)}]
	},
	{
		name: 'City',
		id: 'body.address.city',
		group: 'Authority',
		sortBy: {
			id: 'body.address.city',
			ascend: true
		},
		format: (authority, library): Array<ITableCellLine> => authority.body && authority.body.address ? [{content: authority.body.address.city}] : []
	},
	{
		name: 'Country',
		id: 'body.address.country',
		group: 'Authority',
		sortBy: {
			id: 'body.address.country',
			ascend: true
		},
		format: (authority, library): Array<ITableCellLine> => authority.body && authority.body.address ? [{content: library.i18n.expandCountry(authority.body.address.country)}] : []
	},
	{
		name: 'Tender Count',
		id: 'count',
		group: 'Authority',
		sortBy: {
			id: 'count',
			ascend: true
		},
		format: (authority, library): Array<ITableCellLine> => [{content: library.i18n.formatValue(authority.count)}]
	},
	{
		name: 'Buyer Type',
		id: 'body.buyerType',
		group: 'Authority',
		sortBy: {
			id: 'body.buyerType',
			ascend: true
		},
		format: (authority, library): Array<ITableCellLine> => [{content: Utils.expandUnderlined(authority.body.buyerType)}]
	},
	{
		name: 'Profile Link',
		id: 'id',
		group: 'Authority',
		format: (authority, library): Array<ITableCellLine> => [{
			icon: ICON.authority + ' icon-large',
			content: '',
			link: '/authority/' + authority.body.id,
			hint: library.i18n.get('Profile Page') + ' ' + library.i18n.nameGuard(authority.body.name),
			align: 'center'
		}]
	}
];

export const CompanyColumns: Array<ITableColumnCompany> = [
	{
		name: 'Name',
		group: 'Company',
		id: 'body.name',
		sortBy: {
			id: 'body.name.raw',
			ascend: true
		},
		format: (company, library): Array<ITableCellLine> => [{content: library.i18n.nameGuard(company.body.name)}]
	},
	{
		name: 'City',
		group: 'Company',
		id: 'body.address.city',
		sortBy: {
			id: 'body.address.city',
			ascend: true
		},
		format: (company, library): Array<ITableCellLine> => company.body && company.body.address ? [{content: company.body.address.city}] : []
	},
	{
		name: 'Country',
		group: 'Company',
		id: 'body.address.country',
		sortBy: {
			id: 'body.address.country',
			ascend: true
		},
		format: (company, library): Array<ITableCellLine> => company.body && company.body.address ? [{content: library.i18n.expandCountry(company.body.address.country)}] : []
	},
	{
		name: 'Bid Count',
		id: 'count',
		group: 'Company',
		sortBy: {
			id: 'count',
			ascend: true
		},
		format: (company, library): Array<ITableCellLine> => [{content: library.i18n.formatValue(company.count)}]
	},
	{
		name: 'Profile Link',
		id: 'id',
		group: 'Company',
		format: (company, library) => [{icon: ICON.company + ' icon-large', content: '', link: '/company/' + company.body.id, hint: library.i18n.get('Profile Page') + ' ' + library.i18n.nameGuard(company.body.name), align: 'center'}]
	}
];

export const TenderColumns: Array<ITableColumnTender> = [
	{
		name: 'Supplier',
		id: 'lots.bids.bidders.name',
		group: 'Supplier',
		sortBy: {
			id: 'lots.bids.bidders.name.slug',
			ascend: true
		},
		format: (tender, library) => {
			if (!tender.lots) {
				return [];
			}
			let companies = {};
			tender.lots.forEach((lot: Lot, index_l: number) => {
				if (lot.bids) {
					lot.bids.forEach((bid: Bid) => {
						if (bid.bidders) {
							bid.bidders.forEach((bidder: Bidder) => {
								companies[bidder.id] = companies[bidder.name] || {bidder: bidder, lots: [], hint: library.i18n.get('Profile Page') + ' ' + library.i18n.nameGuard(bidder.name), link: '/company/' + bidder.id};
								companies[bidder.id].lots.push(index_l + 1);
							});
						}
					});
				}
			});
			let result: Array<ITableCellLine> = [];
			Object.keys(companies).forEach(key => {
				let c = companies[key];
				let prefix = undefined;
				if (tender.lots.length > 1) {
					if (c.lots.length > 5) {
						c.lots = c.lots.slice(0, 5);
						c.lots.push('…');
					}
					prefix = library.i18n.get('Lot') + ' ' + c.lots.join(',');
				}
				result.push({prefix: prefix, icon: ICON.company, content: library.i18n.nameGuard(c.bidder.name), hint: library.i18n.get('Profile Page') + ' ' + library.i18n.nameGuard(c.bidder.name), link: c.link});
			});
			return ColumnsFormatUtils.checkEntryCollapse(ColumnsFormatUtils.sortListByContent(result), library);
		}
	},
	{
		name: 'Supplier Type',
		id: 'lots.bids.bidder.body.bidderType',
		group: 'Supplier',
		sortBy: {
			id: 'lots.bids.bidder.body.bidderType',
			ascend: true
		},
		format: (tender, library) => {
			if (!tender.lots) {
				return [];
			}
			let result: Array<ITableCellLine> = [];
			tender.lots.forEach((lot: Lot) => {
				if (lot.bids) {
					lot.bids.forEach((bid: Bid) => {
						if (bid.bidders) {
							bid.bidders.forEach((bidder: Bidder) => {
								if (bidder.bidderType) {
									result.push({
										content: bidder.bidderType
									});
								}
							});
						}
					});
				}
			});
			return ColumnsFormatUtils.checkEntryCollapse(ColumnsFormatUtils.sortListByContent(result), library);
		}
	},
	{
		name: 'Buyer',
		id: 'buyers.name',
		group: 'Buyer',
		sortBy: {
			id: 'buyers.name.slug',
			ascend: true
		},
		format: (tender, library) => {
			if (!tender.buyers) {
				return [];
			}
			let result = tender.buyers.map((buyer: Buyer) => {
				return {icon: ICON.authority, content: library.i18n.nameGuard(buyer.name), hint: (library.i18n.get('Profile Page') + ' ' + library.i18n.nameGuard(buyer.name)), link: '/authority/' + buyer.id};
			});
			return ColumnsFormatUtils.checkEntryCollapse(ColumnsFormatUtils.sortListByContent(result), library);
		}
	},
	{
		name: 'Buyer Region',
		id: 'buyer.address.ot.nutscode',
		group: 'Buyer',
		sortBy: {
			id: 'buyers.address.ot.nutscode',
			ascend: true
		},
		format: (tender, library) => {
			if (!tender.buyers) {
				return [];
			}
			let result: Array<ITableCellLine> = [];
			tender.buyers.forEach((buyer: Buyer) => {
				if (buyer.address && buyer.address.ot && buyer.address.ot.nutscode) {
					let nut = buyer.address.ot.nutscode;
					let city = buyer.address.city;
					result.push({icon: ICON.region, content: city, hint: library.i18n.get('Profile Page') + ' NUTS ' + nut, link: '/region/' + nut});
				}
			});
			return ColumnsFormatUtils.checkEntryCollapse(ColumnsFormatUtils.sortListByContent(result), library);
		}
	},
	{
		name: 'Good Procurement Score',
		id: 'indicators',
		group: 'Indicators',
		sortBy: {
			id: 'ot.score.TENDER',
			ascend: false
		},
		format: (tender, library) => {
			if (!tender.indicators) {
				return [];
			}
			let result: Array<ITableCellLine> = [];
			let collapseLines: Array<ITableCellLine> = [];
			tender.ot.scores.forEach(score => {
				if (score.status === 'CALCULATED' && score.type !== library.TENDER.id) {
					let group = library.indicators.find(g => g.id == score.type);
					if (group) {
						collapseLines.push({score: score.value, prefix: group.name, hint: group.name});
					}
				}
			});
			let tenderscore = tender.ot.scores.find(s => s.type === library.TENDER.id);
			if (tenderscore) {
				result.push({collapseName: library.TENDER.name, score: tenderscore.value, hint: library.TENDER.name, collapseLines: collapseLines, collapsed: true, align: 'center'});
			}
			return result;
		}
	},
	{
		name: 'Integrity Indicator',
		id: 'indicators.pii',
		group: 'Indicators',
		sortBy: {
			id: 'ot.score.INTEGRITY',
			ascend: false
		},
		format: (tender, library) => {
			return ColumnsFormatUtils.formatTenderIndicatorGroup(tender, library.indicators.find(group => group.id === 'INTEGRITY'));
		}
	},
	{
		name: 'Transparency Indicator',
		id: 'indicators.ti',
		group: 'Indicators',
		sortBy: {
			id: 'ot.score.TRANSPARENCY',
			ascend: false
		},
		format: (tender, library) => {
			return ColumnsFormatUtils.formatTenderIndicatorGroup(tender, library.indicators.find(group => group.id === 'TRANSPARENCY'));
		}
	},
	{
		name: 'Main Sector',
		id: 'cpvs.main.names',
		group: 'Sector',
		sortBy: {
			id: 'cpvs.code',
			ascend: true
		},
		format: (tender, library) => {
			if (!tender.cpvs) {
				return [];
			}
			return tender.cpvs.filter(cpv => cpv.isMain).map(cpv => {
				if (cpv['valid']) {
					return {content: cpv['name'] || cpv.code, hint: library.i18n.get('Profile Page') + ' ' + cpv['name'], link: '/sector/' + cpv.code};
				} else {
					return {content: (cpv['name'] || '') + ' ' + cpv.code};
				}
			});
		}
	},
	{
		name: 'Sectors',
		id: 'cpvs.names',
		group: 'Sector',
		sortBy: {
			id: 'cpvs.code',
			ascend: true
		},
		format: (tender, library) => {
			if (!tender.cpvs) {
				return [];
			}
			let result = tender.cpvs.map(cpv => {
				if (cpv['valid']) {
					return {list: true, content: cpv['name'] || cpv.code, hint: library.i18n.get('Profile Page') + ' ' + cpv['name'], link: '/sector/' + cpv.code};
				} else {
					return {list: true, content: (cpv['name'] || '') + ' ' + cpv.code};
				}
			});
			return ColumnsFormatUtils.checkEntryCollapse(ColumnsFormatUtils.sortListByContent(result), library);
		}
	},
	{
		name: 'Main CPV Code',
		id: 'cpvs.main.codes',
		group: 'Sector',
		sortBy: {
			id: 'cpvs.code',
			ascend: true
		},
		format: (tender, library) => {
			if (!tender.cpvs) {
				return [];
			}
			let result = tender.cpvs.filter(cpv => cpv.isMain).map(cpv => {
				if (cpv['valid']) {
					return {content: cpv.code, hint: library.i18n.get('Profile Page') + ' ' + cpv['name'], link: '/sector/' + cpv.code};
				} else {
					return {content: cpv.code};
				}
			});
			return ColumnsFormatUtils.checkEntryCollapse(ColumnsFormatUtils.sortListByContent(result), library);
		}
	},
	{
		name: 'CPV Codes',
		id: 'cpvs.codes',
		group: 'Sector',
		sortBy: {
			id: 'cpvs.code',
			ascend: true
		},
		format: (tender, library) => {
			if (!tender.cpvs) {
				return [];
			}
			let result = tender.cpvs.map(cpv => {
				if (cpv['valid']) {
					return {list: true, content: cpv.code, hint: library.i18n.get('Profile Page') + ' ' + cpv['name'], link: '/sector/' + cpv.code};
				} else {
					return {list: true, content: cpv.code};
				}
			});
			return ColumnsFormatUtils.checkEntryCollapse(ColumnsFormatUtils.sortListByContent(result), library);
		}
	},
	{
		name: 'Title',
		id: 'title',
		group: 'Tender',
		sortBy: {
			id: 'title.raw',
			ascend: true
		},
		format: (tender, library) => {
			return tender.title ? [{content: tender.title, link: '/tender/' + tender.id, hint: library.i18n.get('Profile Page') + ' ' + tender.title}] :
			[{icon: ICON.tender + ' icon-large', content: '', link: '/tender/' + tender.id, hint: library.i18n.get('Profile Page') + ' ' + tender.title}];
		}
	},
	{
		name: 'Description',
		id: 'description',
		group: 'Tender',
		sortBy: {
			id: 'description',
			ascend: true
		},
		format: tender => [{content: tender.description}]
	},
	{
		name: 'Procedure Type',
		id: 'procedureType',
		group: 'Tender',
		sortBy: {
			id: 'procedureType',
			ascend: true
		},
		format: tender => [{content: Utils.expandUnderlined(tender.procedureType)}]
	},
	{
		name: 'Supply Type',
		id: 'supplyType',
		group: 'Tender',
		sortBy: {
			id: 'supplyType',
			ascend: true
		},
		format: tender => [{content: Utils.expandUnderlined(tender.supplyType)}]
	},

	{
		name: 'Final Price',
		id: 'finalPrice',
		group: 'Prices',
		sortBy: {
			id: 'finalPrice.netAmountEur',
			ascend: false
		},
		format: (tender, library) => ColumnsFormatUtils.formatPriceEUR(tender.finalPrice, library)
	},
	{
		name: 'Bid Price',
		id: 'lots.bids.price',
		group: 'Prices',
		sortBy: {
			id: 'lots.bids.price.netAmountEur',
			ascend: false
		},
		format: (tender, library) => {
			if (!tender.lots) {
				return [];
			}
			let result: Array<ITableCellLine> = [];
			tender.lots.forEach((lot: Lot, index_l: number) => {
				if (lot.bids) {
					lot.bids.forEach((bid: Bid, index_b: number) => {
						if (bid.price && Utils.isDefined(bid.price.netAmountEur)) {
							result.push({
								prefix: (tender.lots.length > 1 ? library.i18n.get('Lot') + ' ' + (index_l + 1) : '') + (lot.bids.length > 1 ? ' ' + library.i18n.get('Bid') + ' ' + (index_b + 1) : ''),
								content: ColumnsFormatUtils.formatPriceEURValue(bid.price.netAmountEur, library)
							});
						}
					});
				}
			});
			return ColumnsFormatUtils.checkEntryCollapse(result, library);
		}
	},
	{
		name: 'Award Decision Date',
		id: 'lots.awardDecisionDate',
		group: 'Dates',
		sortBy: {
			id: 'lots.awardDecisionDate',
			ascend: false
		},
		format: (tender, library) => {
			if (!tender.lots) {
				return [];
			}
			let dates = {};
			tender.lots.forEach((lot: Lot, index_l: number) => {
				if (lot.awardDecisionDate) {
					dates[lot.awardDecisionDate] = dates[lot.awardDecisionDate] || {date: lot.awardDecisionDate, lots: []};
					dates[lot.awardDecisionDate].lots.push(index_l + 1);
				}
			});
			let result: Array<ITableCellLine> = [];
			let datekeys = Object.keys(dates);
			datekeys.forEach(key => {
					let c = dates[key];
					if (c.lots.length > 5) {
						c.lots = c.lots.slice(0, 5);
						c.lots.push('…');
					}
					result.push({content: library.i18n.formatDate(c.date), hint: library.i18n.get('Lot') + ' ' + c.lots.join(',')});
				}
			);
			return ColumnsFormatUtils.checkEntryCollapse(result, library);
		}
	},
	{
		name: 'Committee Approval Date',
		id: 'lots.committeeApprovalDate',
		group: 'Dates',
		sortBy: {
			id: 'lots.committeeApprovalDate',
			ascend: false
		},
		format: (tender, library) => {
			if (!tender.lots) {
				return [];
			}
			let dates = {};
			tender.lots.forEach((lot: Lot, index_l: number) => {
				if (lot.committeeApprovalDate) {
					dates[lot.committeeApprovalDate] = dates[lot.committeeApprovalDate] || {date: lot.committeeApprovalDate, lots: []};
					dates[lot.committeeApprovalDate].lots.push(index_l + 1);
				}
			});
			let result: Array<ITableCellLine> = [];
			let datekeys = Object.keys(dates);
			datekeys.forEach(key => {
					let c = dates[key];
					if (c.lots.length > 5) {
						c.lots = c.lots.slice(0, 5);
						c.lots.push('…');
					}
					result.push({content: library.i18n.formatDate(c.date), hint: library.i18n.get('Lot') + ' ' + c.lots.join(',')});
				}
			);
			return ColumnsFormatUtils.checkEntryCollapse(result, library);
		}
	},
	{
		name: 'Head Of Entity Approval Date',
		id: 'lots.headOfEntityApprovalDate',
		group: 'Dates',
		sortBy: {
			id: 'lots.headOfEntityApprovalDate',
			ascend: false
		},
		format: (tender, library) => {
			if (!tender.lots) {
				return [];
			}
			let dates = {};
			tender.lots.forEach((lot: Lot, index_l: number) => {
				if (lot.headOfEntityApprovalDate) {
					dates[lot.headOfEntityApprovalDate] = dates[lot.headOfEntityApprovalDate] || {date: lot.headOfEntityApprovalDate, lots: []};
					dates[lot.headOfEntityApprovalDate].lots.push(index_l + 1);
				}
			});
			let result: Array<ITableCellLine> = [];
			let datekeys = Object.keys(dates);
			datekeys.forEach(key => {
					let c = dates[key];
					if (c.lots.length > 5) {
						c.lots = c.lots.slice(0, 5);
						c.lots.push('…');
					}
					result.push({content: library.i18n.formatDate(c.date), hint: library.i18n.get('Lot') + ' ' + c.lots.join(',')});
				}
			);
			return ColumnsFormatUtils.checkEntryCollapse(result, library);
		}
	},
	{
		name: 'Endorsement Date',
		id: 'lots.endorsementDate',
		group: 'Dates',
		sortBy: {
			id: 'lots.endorsementDate',
			ascend: false
		},
		format: (tender, library) => {
			if (!tender.lots) {
				return [];
			}
			let dates = {};
			tender.lots.forEach((lot: Lot, index_l: number) => {
				if (lot.endorsementDate) {
					dates[lot.endorsementDate] = dates[lot.endorsementDate] || {date: lot.endorsementDate, lots: []};
					dates[lot.endorsementDate].lots.push(index_l + 1);
				}
			});
			let result: Array<ITableCellLine> = [];
			let datekeys = Object.keys(dates);
			datekeys.forEach(key => {
					let c = dates[key];
					if (c.lots.length > 5) {
						c.lots = c.lots.slice(0, 5);
						c.lots.push('…');
					}
					result.push({content: library.i18n.formatDate(c.date), hint: library.i18n.get('Lot') + ' ' + c.lots.join(',')});
				}
			);
			return ColumnsFormatUtils.checkEntryCollapse(result, library);
		}
	},
	{
		name: 'Cabinet Approval Date',
		id: 'lots.cabinetApprovalDate',
		group: 'Dates',
		sortBy: {
			id: 'lots.cabinetApprovalDate',
			ascend: false
		},
		format: (tender, library) => {
			if (!tender.lots) {
				return [];
			}
			let dates = {};
			tender.lots.forEach((lot: Lot, index_l: number) => {
				if (lot.cabinetApprovalDate) {
					dates[lot.cabinetApprovalDate] = dates[lot.cabinetApprovalDate] || {date: lot.cabinetApprovalDate, lots: []};
					dates[lot.cabinetApprovalDate].lots.push(index_l + 1);
				}
			});
			let result: Array<ITableCellLine> = [];
			let datekeys = Object.keys(dates);
			datekeys.forEach(key => {
					let c = dates[key];
					if (c.lots.length > 5) {
						c.lots = c.lots.slice(0, 5);
						c.lots.push('…');
					}
					result.push({content: library.i18n.formatDate(c.date), hint: library.i18n.get('Lot') + ' ' + c.lots.join(',')});
				}
			);
			return ColumnsFormatUtils.checkEntryCollapse(result, library);
		}
	},

	{
		name: 'Creation Date',
		id: 'created',
		group: 'Tender Meta Data',
		sortBy: {
			id: 'created',
			ascend: false
		},
		format: (tender, library) => [{content: library.i18n.formatDatetime(tender.created)}]
	},
	{
		name: 'Modification Date',
		id: 'modified',
		group: 'Tender Meta Data',
		sortBy: {
			id: 'modified',
			ascend: false
		},
		format: (tender, library) => [{content: library.i18n.formatDatetime(tender.modified)}]
	},
	{
		name: 'Country',
		id: 'country',
		group: 'Tender Meta Data',
		sortBy: {
			id: 'country',
			ascend: true
		},
		format: (tender, library) => {
			if (!tender.country) {
				return [];
			}
			return [{content: library.i18n.expandCountry(tender.country)}];
		}
	},
	{
		name: 'Source',
		id: 'publications.source',
		group: 'Tender Meta Data',
		sortBy: {
			id: 'publications.source',
			ascend: true
		},
		format: (tender, library) => {
			if (!tender.publications) {
				return [];
			}
			let result = [];
			tender.publications.forEach(pub => {
				if (pub.source && result.indexOf(pub.source) < 0) {
					result.push(pub.source);
				}
			});
			return result.map(s => {
				return {content: s};
			});
		}
	},
	{
		name: 'Bids Count',
		id: 'lots.bidsCount',
		group: 'Lots',
		sortBy: {
			id: 'lots.bidsCount',
			ascend: false
		},
		format: (tender, library) => {
			if (!tender.lots) {
				return [];
			}
			let result: Array<ITableCellLine> = [];
			tender.lots.forEach((lot: Lot, index_l: number) => {
				if (Utils.isDefined(lot.bidsCount)) {
					result.push({
						prefix: (tender.lots.length > 1) ? library.i18n.get('Lot') + ' ' + (index_l + 1) : undefined,
						content: lot.bidsCount.toString()
					});
				}
			});
			return ColumnsFormatUtils.checkEntryCollapse(result, library);
		}
	},
	{
		name: 'Requested Bids Count',
		id: 'lots.requestedBidsCount',
		group: 'Lots',
		sortBy: {
			id: 'lots.requestedBidsCount',
			ascend: false
		},
		format: (tender, library) => {
			if (!tender.lots) {
				return [];
			}
			let result: Array<ITableCellLine> = [];
			tender.lots.forEach((lot: Lot, index_l: number) => {
				if (Utils.isDefined(lot.requestedBidsCount)) {
					result.push({
						prefix: (tender.lots.length > 1) ? library.i18n.get('Lot') + ' ' + (index_l + 1) : undefined,
						content: lot.requestedBidsCount.toString()
					});
				}
			});
			return ColumnsFormatUtils.checkEntryCollapse(result, library);
		}
	}
];
