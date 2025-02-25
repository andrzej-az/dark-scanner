export namespace settings {
	
	export class ScanParams {
	    StartIp: string;
	    EndIp: string;
	
	    static createFrom(source: any = {}) {
	        return new ScanParams(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.StartIp = source["StartIp"];
	        this.EndIp = source["EndIp"];
	    }
	}
	export class Settings {
	    ScanParams: ScanParams;
	    Ports: number[];
	    NumWorkers: number;
	
	    static createFrom(source: any = {}) {
	        return new Settings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ScanParams = this.convertValues(source["ScanParams"], ScanParams);
	        this.Ports = source["Ports"];
	        this.NumWorkers = source["NumWorkers"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

