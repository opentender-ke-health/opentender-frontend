import * as moment from 'moment';
import {IChartData} from '../thirdparty/ngx-charts-universal/chart.interface';
import {ISeriesDataTable} from '../app.interfaces';

export const Utils = {
	dateToUnix: (jsdate: Date) => {
		return moment(jsdate).utc().valueOf();
	},
	expandUnderlined(value: string): string {
		if (value === undefined || value === null) {
			return '';
		}
		return value.split('_').map(t => {
			return t[0].toUpperCase() + t.slice(1).toLowerCase();
		}).join(' ');
	},
	capitalize(value: string): string {
		if (value === undefined || value === null) {
			return '';
		}
		return value[0].toUpperCase() + value.slice(1);
	},
	formatPercent(value): string {
		value = Math.round(value * 100) / 100;
		return value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2}) + '%';
	},
	validateNutsCode(code, level) {
		if (code.length > 1 && code.length < 6) {
			code = code.toUpperCase();
			if (code.match(/[A-Z]{2}[A-Z0-9]{0,3}/)) {
				return code.slice(0, 2 + level);
			}
		}
		return 'invalid';
	},
	formatTrunc(value): string {
		return value.toFixed(0);
	},
	formatYear(value): string {
		return value.toString();
	},
	seriesToTable(data: IChartData[], header, multi: boolean): ISeriesDataTable {
		if (multi) {
			let list = data.map(d => {
				let row: Array<string | number | Date> = d.series.map(val => val.replacement || val.value);
				row.unshift(d.name);
				return row;
			});
			let heads = [];
			let head = data && data.length > 0 ? data[0].series.map(d => d.name) : [];
			head.unshift(header.name);
			let subhead = data && data.length > 0 ? data[0].series.map(d => header.value) : [];
			subhead.unshift('Value');
			heads.push(subhead);
			heads.push(head);
			return {rows: list, heads: heads};
		} else {
			let hasID = header.hasOwnProperty('id');
			let list = data.map(d => {
				return [d.name, d.value];
			});
			return {rows: list, heads: [header.name, header.value]};
		}
	},
	downloadSeries: function(format, data, header, multi: boolean, exportfilename): void {
		if (format === 'csv') {
			Utils.downloadCSVSeries(data, header, multi, exportfilename);
		} else if (format === 'json') {
			Utils.downloadJSON({fields: header, data: data}, exportfilename);
		}
	},
	downloadCSVSeries(data: IChartData[], header, multi: boolean, exportfilename: string): void {
		let table = Utils.seriesToTable(data, header, multi);
		let list = table.heads.map(head => JSON.stringify(head));
		table.rows.forEach(row => list.push(JSON.stringify(row)));
		let csv = list.join('\n').replace(/(^\[)|(\]$)/mg, ''); // remove opening [ and closing ] brackets from each line
		Utils.downloadCSV(csv, exportfilename);
	},
	downloadCSV: function(csvString, exportfilename): void {
		Utils.downloadBlob(csvString, exportfilename, 'csv', 'text/csv;charset=utf8;');
	},
	downloadJSON: function(obj, exportfilename): void {
		Utils.downloadBlob(JSON.stringify(obj, null, '\t'), exportfilename, 'json', 'application/json');
	},
	downloadBlob: function(string, exportfilename, ext, type): void {
		const blob = new Blob([string], {'type': type});
		const filename = exportfilename.toLowerCase().replace(/ /g, '_') + '.' + ext;
		if (window.navigator.msSaveOrOpenBlob) { // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
			window.navigator.msSaveBlob(blob, filename);
		} else {
			const a = window.document.createElement('a');
			a.href = window.URL.createObjectURL(blob);
			a.download = filename;
			a.textContent = 'Download ' + filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
	},
	roundValueTwoDecimals: (value: number): number => {
		return Math.round(value * 100) / 100;
	},
	formatFileSize: (value: number): string => {
		let i = -1;
		const byteUnits = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		do {
			value = value / 1024;
			i++;
		} while (value > 1024);
		return Math.max(value, 0.1).toFixed(1) + ' ' + byteUnits[i];
	},
	scrollToFirst: (className: string): void => {
		let elements = document.getElementsByClassName(className);
		if (elements.length == 0) {
			return;
		}
		elements[0].scrollIntoView();
	},
	triggerResize: (): void => {
		setTimeout(() => {
			let evt = window.document.createEvent('UIEvents');
			evt.initUIEvent('resize', true, false, window, 0);
			window.dispatchEvent(evt);
		}, 0);
	},
	isDefined: (value: any): boolean => {
		if (value === undefined || value === null) {
			return false;
		}
		if (Array.isArray(value) || (typeof value === 'string')) {
			return value.length > 0;
		}
		return true;
	}
};
