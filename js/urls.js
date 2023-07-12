const url = `https://api.shoonya.com/NorenWClientTP`;
function getCookie(name) {
	// Split cookie string and get all individual name=value pairs in an array
	let cookieArr = document.cookie.split(";");

	// Loop through the array elements
	for (let i = 0; i < cookieArr.length; i++) {
		let cookiePair = cookieArr[i].split("=");

		/* Removing whitespace at the beginning of the cookie name
								and compare it with the given string */
		if (name == cookiePair[0].trim()) {
			// Decode the cookie value and return
			return decodeURIComponent(cookiePair[1]);
		}
	}

	// Return null if not found
	return null;
}
if ("susertoken" in localStorage && getCookie("loggedIn")) {
	if (document.title === "Dashboard") {
		window.onload = dash;
	} else if (document.title === "Orders") {
		window.onload = order;
	} else if (document.title === "Holdings") {
		window.onload = hold;
	} else if (document.title === "Limits") {
		window.onload = limits;
	} else if (document.title === "Positions") {
		window.onload = pos;
	} else if (document.title === "Option Chain") {
		window.onload = options;
	} else if (document.title === "Indices") {
		window.onload = indices;
	} else if (document.title === "Hedge") {
		window.onload = hedge;
	} else if (document.title === "Adjustment") {
		window.onload = adjustment;
	}
} else {
	alert("Not Logged In");
	window.location.replace("login.html");
	localStorage.clear();
}
function all(values, reply) {
	let string = JSON.stringify(values);
	return fetch(`${url}/${reply}`, {
		method: "POST",
		body: `jData=${string}&jKey=${localStorage.getItem("susertoken")}`,
		headers: { "Content-Type": "text/plain" },
	})
		.then((response) => response.json())
		.catch((error) => {
			console.error("Error:", error);
		});
}
// request handler
function randomInteger(max) {
	return Math.floor(Math.random() * (max + 1));
}
// rgb randomizer
function randomRgbColor() {
	let r = randomInteger(255);
	let g = randomInteger(255);
	let b = randomInteger(255);
	string = `rgb(${r},${g},${b})`
	return string;
}
//rgb randomizer mixer
let timeOut = null;
async function dash() {
	document.getElementById("myAudio").muted = true;
	document.getElementById("myAudio").play();
}
//dashboard
function buttons(button) {
	let buttons = document.getElementsByClassName("buttons")[0];
	buttons.classList.remove("d-none");
	buttons.style.top = `${button.getBoundingClientRect().top + window.scrollY + 5
		}px`;
	buttons.style.left = `${button.getBoundingClientRect().left + window.scrollX + 20
		}px`;
	buttons.setAttribute("id", button.id);
	clearTimeout(timeOut);
	timeOut = setTimeout(function () {
		document.getElementsByClassName("buttons")[0].classList.add("d-none");
	}, 3000);
}
// show buttons onmouseover dashboard option chain elements
async function buy() {
	let bvalue = {
		uid: localStorage.getItem("uid"),
		actid: localStorage.getItem("actid"),
		exch: "NFO",
		tsym: document.getElementById("btsym").innerHTML,
		qty: document.getElementById("bqty").value,
		prc: document.getElementById("bprice").value,
		prd: document.getElementById("bprdt").value == "MIS" ? "I" : "M",
		trgprc: document.getElementById("bprice").value,
		trantype: "B",
		prctyp: document.getElementById("bptype").value,
		ret: "DAY",
	};
	await all(bvalue, "PlaceOrder");
}
// buy button in dashboard
async function sell() {
	let svalue = {
		uid: localStorage.getItem("uid"),
		actid: localStorage.getItem("actid"),
		exch: "NFO",
		tsym: document.getElementById("stsym").innerHTML,
		qty: document.getElementById("sqty").value,
		prc: document.getElementById("sprice").value,
		prd: document.getElementById("sprdt").value == "MIS" ? "I" : "M",
		trgprc: document.getElementById("sprice").value,
		trantype: "S",
		prctyp: document.getElementById("sptype").value,
		ret: "DAY",
	};
	await all(svalue, "PlaceOrder");
}
// sell button in dashboard
async function b(buyButton) {
	let token = await buyButton.parentElement.id;
	let getsc = {
		uid: localStorage.getItem("uid"),
		exch: "NFO",
		token: token,
	};
	let sc = await all(getsc, "GetSecurityInfo");
	if (document.title == 'Dashboard') {
		document.getElementById("btsym").innerHTML = sc.tsym;
		document.getElementById("bqty").setAttribute("step", sc.ls);
		document.getElementById("bqty").setAttribute("value", sc.ls);
		document.getElementById("bqty").setAttribute("min", sc.ls);
		document.getElementById("bprice").value = 0;
		document.getElementById("bptype").value = "MKT";
		document.getElementById("bptype").removeAttribute("disabled");
		document.getElementById("bprdt").removeAttribute("disabled");
		document.getElementById("bqty").removeAttribute("disabled");
		document.getElementById("bbutton").removeAttribute("disabled");
		chart("bchart", sc.token, "NFO");
		getMarginB();
	}
}
//set buy chart div, buy div
async function s(sellButton) {
	let token = sellButton.parentElement.id;
	let getsc = {
		uid: localStorage.getItem("uid"),
		exch: "NFO",
		token: token,
	};
	let sc = await all(getsc, "GetSecurityInfo");
	if (document.title == 'Dashboard') {
		document.getElementById("stsym").innerHTML = sc.tsym;
		document.getElementById("sqty").setAttribute("step", sc.ls);
		document.getElementById("sqty").setAttribute("value", sc.ls);
		document.getElementById("sprice").value = 0;
		document.getElementById("sptype").value = "MKT";
		document.getElementById("sptype").removeAttribute("disabled");
		document.getElementById("sprdt").removeAttribute("disabled");
		document.getElementById("sqty").removeAttribute("disabled");
		document.getElementById("sbutton").removeAttribute("disabled");
		chart("schart", sc.token, "NFO");
		sendMessageToSocket(`{ "t": "t", "k": "NFO|${sc.token}" }`);
		getMarginS();
	}
}
//set sell chart div, sell div
function changeValue() {
	let x = document.getElementById("sptype");
	if (!x.disabled) {
		if (x.value == "MKT") {
			document.getElementById("sprice").toggleAttribute("disabled");
			document.getElementById("sprice").value = 0;
			getMarginS();
		} else {
			document.getElementById("sprice").toggleAttribute("disabled");
			getMarginS();
		}
	}
	let y = document.getElementById("bptype");
	if (!y.disabled) {
		if (y.value == "MKT") {
			document.getElementById("bprice").toggleAttribute("disabled");
			document.getElementById("bprice").value = 0;
			getMarginB();
		} else {
			document.getElementById("bprice").toggleAttribute("disabled");
			getMarginB();
		}
	}
}
// disable price on mkt
async function getMarginB() {
	let mV = {
		uid: localStorage.getItem("uid"),
		actid: localStorage.getItem("actid"),
		exch: "NFO",
		tsym: btsym.innerHTML,
		qty: document.getElementById("bqty").value,
		prc: document.getElementById("bprice").value,
		prd: document.getElementById("bprdt").value == "MIS" ? "I" : "M",
		trantype: "B",
		prctyp: document.getElementById("bptype").value,
		rorgqty: "0",
		rorgprc: "0",
	};
	let marg = await all(mV, "GetOrderMargin");
	document.getElementById("breq").innerHTML = marg.marginused;
	marg.remarks == "Order Success"
		? document.getElementById("breq").setAttribute("class", "green")
		: document.getElementById("breq").setAttribute("class", "red");
}
// get Req Margin
async function getMarginS() {
	let mV = {
		uid: localStorage.getItem("uid"),
		actid: localStorage.getItem("actid"),
		exch: "NFO",
		tsym: stsym.innerHTML,
		qty: document.getElementById("sqty").value,
		prc: document.getElementById("sprice").value,
		prd: document.getElementById("sprdt").value == "MIS" ? "I" : "M",
		trantype: "S",
		prctyp: document.getElementById("sptype").value,
		rorgqty: "0",
		rorgprc: "0",
	};
	let marg = await all(mV, "GetOrderMargin");
	document.getElementById("sreq").innerHTML = marg.marginused;
	marg.remarks == "Order Success"
		? document.getElementById("sreq").setAttribute("class", "green")
		: document.getElementById("sreq").setAttribute("class", "red");
}
// get Req Margin
async function pos() {
	let posvalues = {
		uid: localStorage.getItem("uid"),
		actid: localStorage.getItem("actid"),
	};
	let pos = await all(posvalues, "PositionBook");
	if (pos.stat == "Not_Ok") {
		document.getElementById("NSEHeader").classList.add("d-none");
		document.getElementById("noP").classList.remove("d-none");
	} else {
		let posbody = document.getElementById("posBody");
		const chartProperties1 = {
			width: 1112,
			height: 500,
			timeScale: {
				timeVisible: true,
				secondsVisible: true,
			},
			layout: {
				background: {
					type: 'solid',
					color: '#000000',
				},
				textColor: 'rgba(255, 255, 255, 1)',
			},
			rightPriceScale: {
				scaleMargins: {
					top: 0.3,
					bottom: 0.25,
				},
				//mode: LightweightCharts.PriceScaleMode.Percentage,
			},
			grid: {
				vertLines: {
					color: "rgba(120, 123, 134, 0)",
				},
				horzLines: {
					color: "rgba(120, 123, 134, 0)",
				},
			},
			crosshair: {
				mode: LightweightCharts.CrosshairMode.Normal,
				vertLine: {
					color: "#fff",
				},
				horzLine: {
					color: "#fff",
				},
			},
		};
		const chartDiv = document.getElementById(`ok`);
		chartDiv.innerHTML = "";
		const chart = LightweightCharts.createChart(chartDiv, chartProperties1);
		async function reverseP(ohlcs) {
			let chartdata = await ohlcs.map((ohlc) => {
				let timestamp = new Date(ohlc.ssboe * 1000).getTime() / 1000;
				//open: parseFloat(ohlc.into), high: parseFloat(ohlc.inth), low: parseFloat(ohlc.intl), close: parseFloat(ohlc.intc)
				//value: parseFloat(ohlc.intc)
				return {
					time: timestamp + 19800,
					value: parseFloat(ohlc.intc),
				};
			});
			return chartdata.reverse();
		}
		async function reverseV(ohlcs) {
			let chartdata = await ohlcs.map((ohlc) => {
				let timestamp = new Date(ohlc.ssboe * 1000).getTime() / 1000;
				//open: parseFloat(ohlc.into), high: parseFloat(ohlc.inth), low: parseFloat(ohlc.intl), close: parseFloat(ohlc.intc)
				//value: parseFloat(ohlc.intc)
				return {
					time: timestamp + 19800,
					value: parseFloat(ohlc.oi),
				};
			});
			return chartdata.reverse();
		}
		pos.sort((a, b) => {
			return a.netqty - b.netqty;
		});
		setTimeout(() => {
			let fnoScirpts = [
				{ value: '26009', name: 'BANKNIFTY' },
				{ value: '26000', name: 'NIFTY' },
				{ value: '26037', name: 'FINNIFTY' },
				{ value: '26074', name: 'MIDCPNIFTY' },
				{ value: '7', name: 'AARTIIND' },
				{ value: '13', name: 'ABB' },
				{ value: '17903', name: 'ABBOTINDIA' },
				{ value: '21614', name: 'ABCAPITAL' },
				{ value: '30108', name: 'ABFRL' },
				{ value: '22', name: 'ACC' },
				{ value: '25', name: 'ADANIENT' },
				{ value: '15083', name: 'ADANIPORTS' },
				{ value: '11703', name: 'ALKEM' },
				{ value: '100', name: 'AMARAJABAT' },
				{ value: '1270', name: 'AMBUJACEM' },
				{ value: '157', name: 'APOLLOHOSP' },
				{ value: '163', name: 'APOLLOTYRE' },
				{ value: '212', name: 'ASHOKLEY' },
				{ value: '236', name: 'ASIANPAINT' },
				{ value: '14418', name: 'ASTRAL' },
				{ value: '263', name: 'ATUL' },
				{ value: '21238', name: 'AUBANK' },
				{ value: '275', name: 'AUROPHARMA' },
				{ value: '5900', name: 'AXISBANK' },
				{ value: '16669', name: 'BAJAJ - AUTO' },
				{ value: '16675', name: 'BAJAJFINSV' },
				{ value: '317', name: 'BAJFINANCE' },
				{ value: '335', name: 'BALKRISIND' },
				{ value: '341', name: 'BALRAMCHIN' },
				{ value: '2263', name: 'BANDHANBNK' },
				{ value: '4668', name: 'BANKBARODA' },
				{ value: '371', name: 'BATAINDIA' },
				{ value: '383', name: 'BEL' },
				{ value: '404', name: 'BERGEPAINT' },
				{ value: '422', name: 'BHARATFORG' },
				{ value: '10604', name: 'BHARTIARTL' },
				{ value: '438', name: 'BHEL' },
				{ value: '11373', name: 'BIOCON' },
				{ value: '2181', name: 'BOSCHLTD' },
				{ value: '526', name: 'BPCL' },
				{ value: '547', name: 'BRITANNIA' },
				{ value: '6994', name: 'BSOFT' },
				{ value: '10794', name: 'CANBK' },
				{ value: '583', name: 'CANFINHOME' },
				{ value: '637', name: 'CHAMBLFERT' },
				{ value: '685', name: 'CHOLAFIN' },
				{ value: '694', name: 'CIPLA' },
				{ value: '20374', name: 'COALINDIA' },
				{ value: '11543', name: 'COFORGE' },
				{ value: '15141', name: 'COLPAL' },
				{ value: '4749', name: 'CONCOR' },
				{ value: '739', name: 'COROMANDEL' },
				{ value: '17094', name: 'CROMPTON' },
				{ value: '5701', name: 'CUB' },
				{ value: '1901', name: 'CUMMINSIND' },
				{ value: '772', name: 'DABUR' },
				{ value: '8075', name: 'DALBHARAT' },
				{ value: '19943', name: 'DEEPAKNTR' },
				{ value: '15044', name: 'DELTACORP' },
				{ value: '10940', name: 'DIVISLAB' },
				{ value: '21690', name: 'DIXON' },
				{ value: '14732', name: 'DLF' },
				{ value: '881', name: 'DRREDDY' },
				{ value: '910', name: 'EICHERMOT' },
				{ value: '958', name: 'ESCORTS' },
				{ value: '676', name: 'EXIDEIND' },
				{ value: '1023', name: 'FEDERALBNK' },
				{ value: '14304', name: 'FSL' },
				{ value: '4717', name: 'GAIL' },
				{ value: '7406', name: 'GLENMARK' },
				{ value: '13528', name: 'GMRINFRA' },
				{ value: '1174', name: 'GNFC' },
				{ value: '10099', name: 'GODREJCP' },
				{ value: '17875', name: 'GODREJPROP' },
				{ value: '11872', name: 'GRANULES' },
				{ value: '1232', name: 'GRASIM' },
				{ value: '13197', name: 'GSPL' },
				{ value: '10599', name: 'GUJGASLTD' },
				{ value: '2303', name: 'HAL' },
				{ value: '9819', name: 'HAVELLS' },
				{ value: '7229', name: 'HCLTECH' },
				{ value: '1330', name: 'HDFC' },
				{ value: '4244', name: 'HDFCAMC' },
				{ value: '1333', name: 'HDFCBANK' },
				{ value: '467', name: 'HDFCLIFE' },
				{ value: '1348', name: 'HEROMOTOCO' },
				{ value: '1363', name: 'HINDALCO' },
				{ value: '17939', name: 'HINDCOPPER' },
				{ value: '1406', name: 'HINDPETRO' },
				{ value: '1394', name: 'HINDUNILVR' },
				{ value: '3417', name: 'HONAUT' },
				{ value: '30125', name: 'IBULHSGFIN' },
				{ value: '4963', name: 'ICICIBANK' },
				{ value: '21770', name: 'ICICIGI' },
				{ value: '18652', name: 'ICICIPRULI' },
				{ value: '14366', name: 'IDEA' },
				{ value: '11957', name: 'IDFC' },
				{ value: '11184', name: 'IDFCFIRSTB' },
				{ value: '220', name: 'IEX' },
				{ value: '11262', name: 'IGL' },
				{ value: '1512', name: 'INDHOTEL' },
				{ value: '1515', name: 'INDIACEM' },
				{ value: '10726', name: 'INDIAMART' },
				{ value: '11195', name: 'INDIGO' },
				{ value: '5258', name: 'INDUSINDBK' },
				{ value: '29135', name: 'INDUSTOWER' },
				{ value: '1594', name: 'INFY' },
				{ value: '5926', name: 'INTELLECT' },
				{ value: '1624', name: 'IOC' },
				{ value: '1633', name: 'IPCALAB' },
				{ value: '13611', name: 'IRCTC' },
				{ value: '1660', name: 'ITC' },
				{ value: '6733', name: 'JINDALSTEL' },
				{ value: '13270', name: 'JKCEMENT' },
				{ value: '11723', name: 'JSWSTEEL' },
				{ value: '18096', name: 'JUBLFOOD' },
				{ value: '1922', name: 'KOTAKBANK' },
				{ value: '24948', name: 'L & TFH' },
				{ value: '11654', name: 'LALPATHLAB' },
				{ value: '19234', name: 'LAURUSLABS' },
				{ value: '1997', name: 'LICHSGFIN' },
				{ value: '11483', name: 'LT' },
				{ value: '17818', name: 'LTI' },
				{ value: '18564', name: 'LTTS' },
				{ value: '10440', name: 'LUPIN' },
				{ value: '2031', name: 'M & M' },
				{ value: '13285', name: 'M & MFIN' },
				{ value: '19061', name: 'MANAPPURAM' },
				{ value: '4067', name: 'MARICO' },
				{ value: '10999', name: 'MARUTI' },
				{ value: '10447', name: 'MCDOWELL - N' },
				{ value: '31181', name: 'MCX' },
				{ value: '9581', name: 'METROPOLIS' },
				{ value: '2142', name: 'MFSL' },
				{ value: '17534', name: 'MGL' },
				{ value: '14356', name: 'MINDTREE' },
				{ value: '4204', name: 'MOTHERSON' },
				{ value: '4503', name: 'MPHASIS' },
				{ value: '2277', name: 'MRF' },
				{ value: '23650', name: 'MUTHOOTFIN' },
				{ value: '6364', name: 'NATIONALUM' },
				{ value: '13751', name: 'NAUKRI' },
				{ value: '14672', name: 'NAVINFLUOR' },
				{ value: '17963', name: 'NESTLEIND' },
				{ value: '15332', name: 'NMDC' },
				{ value: '11630', name: 'NTPC' },
				{ value: '20242', name: 'OBEROIRLTY' },
				{ value: '10738', name: 'OFSS' },
				{ value: '2475', name: 'ONGC' },
				{ value: '14413', name: 'PAGEIND' },
				{ value: '2412', name: 'PEL' },
				{ value: '18365', name: 'PERSISTENT' },
				{ value: '11351', name: 'PETRONET' },
				{ value: '14299', name: 'PFC' },
				{ value: '2664', name: 'PIDILITIND' },
				{ value: '24184', name: 'PIIND' },
				{ value: '10666', name: 'PNB' },
				{ value: '9590', name: 'POLYCAB' },
				{ value: '14977', name: 'POWERGRID' },
				{ value: '13147', name: 'PVR' },
				{ value: '15337', name: 'RAIN' },
				{ value: '2043', name: 'RAMCOCEM' },
				{ value: '18391', name: 'RBLBANK' },
				{ value: '15355', name: 'RECLTD' },
				{ value: '2885', name: 'RELIANCE' },
				{ value: '2963', name: 'SAIL' },
				{ value: '17971', name: 'SBICARD' },
				{ value: '21808', name: 'SBILIFE' },
				{ value: '3045', name: 'SBIN' },
				{ value: '3103', name: 'SHREECEM' },
				{ value: '3150', name: 'SIEMENS' },
				{ value: '3273', name: 'SRF' },
				{ value: '4306', name: 'SRTRANSFIN' },
				{ value: '3351', name: 'SUNPHARMA' },
				{ value: '13404', name: 'SUNTV' },
				{ value: '10243', name: 'SYNGENE' },
				{ value: '3405', name: 'TATACHEM' },
				{ value: '3721', name: 'TATACOMM' },
				{ value: '3432', name: 'TATACONSUM' },
				{ value: '3456', name: 'TATAMOTORS' },
				{ value: '3426', name: 'TATAPOWER' },
				{ value: '3499', name: 'TATASTEEL' },
				{ value: '11536', name: 'TCS' },
				{ value: '13538', name: 'TECHM' },
				{ value: '3506', name: 'TITAN' },
				{ value: '3518', name: 'TORNTPHARM' },
				{ value: '13786', name: 'TORNTPOWER' },
				{ value: '1964', name: 'TRENT' },
				{ value: '8479', name: 'TVSMOTOR' },
				{ value: '16713', name: 'UBL' },
				{ value: '11532', name: 'ULTRACEMCO' },
				{ value: '11287', name: 'UPL' },
				{ value: '3063', name: 'VEDL' },
				{ value: '3718', name: 'VOLTAS' },
				{ value: '18011', name: 'WHIRLPOOL' },
				{ value: '3787', name: 'WIPRO' },
				{ value: '3812', name: 'ZEEL' },
				{ value: '7929', name: 'ZYDUSLIFE' }
			]
			let data1 = [];
			pos.forEach((element) => {
				if (element.exch == "NSE" || element.exch == "BSE" || element.exch == "MCX" || element.exch == "CDS" || element.exch == "BCD") {
					let row = posbody.insertRow(-1);
					row.classList.add("posTr");
					element.netqty == 0 ? row.classList.add('fade-pos') : row.classList.remove('fade-pos');
					// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
					row.insertCell(0).innerHTML =
						element.netqty != 0
							? `<input type="checkbox" name="click" onclick="show()" class= "cb">`
							: ""; //check box
					let cell2 = row.insertCell(1); //product
					cell2.innerHTML =
						element.prd == "M" || element.prd == "C" ? "NRML" : "MIS";
					cell2.classList.add("badge");
					cell2.classList.add("bg-secondary");
					row.insertCell(
						2
					).innerHTML = `<button class="convert" onclick = "convert(this)"><i class="fa-solid fa-rotate"></i></button> <button class="exit" onclick = "exit(this)"><i class="fa-solid fa-xmark"></i></button>`; //modify
					row.insertCell(3).innerHTML = element.dname ? element.dname : element.tsym;
					row.insertCell(4).innerHTML = element.exch;
					row.insertCell(5).innerHTML = element.netqty;
					row.insertCell(6).innerHTML =
						element.daybuyqty == "0" && element.daysellqty == "0"
							? element.upldprc
							: element.netavgprc;
					row.insertCell(7).setAttribute("id", element.token);
					let cell12 = row.insertCell(8);
					cell12.innerHTML = "0.00";
					cell12.setAttribute("class", "green");
					let cell10 = row.insertCell(9);
					let a = 0;
					if (parseInt(element.cfbuyqty) == 0 && parseInt(element.cfsellqty) == 0)
						a = parseFloat(element.rpnl);
					else if (parseInt(element.daybuyqty) > 0 && parseInt(element.daybuyqty) > parseInt(element.daysellqty)) {
						a = (parseFloat(element.upldprc) - parseFloat(element.daybuyavgprc)) * parseInt(element.cfsellqty);
						a += (parseFloat(element.daysellavgprc) - parseFloat(element.daybuyavgprc)) * parseInt(element.daysellqty);
					}
					else if (parseInt(element.daysellqty) > 0 && parseInt(element.daysellqty) > parseInt(element.daybuyqty)) {
						console.log('here')
						a = (parseFloat(element.daysellavgprc) - parseFloat(element.upldprc)) * parseInt(element.cfbuyqty);
						a += (parseFloat(element.daysellavgprc) - parseFloat(element.daybuyavgprc)) * parseInt(element.daybuyqty);
					}
					cell10.innerHTML = a.toFixed(2);
					parseFloat(cell10.innerHTML) >= 0
						? cell10.setAttribute("class", "green")
						: cell10.setAttribute("class", "red");
					row.insertCell(10).innerHTML = 0;
					row.insertCell(11).innerHTML = 0;
					row.insertCell(12).innerHTML = 0;
					let cell14 = row.insertCell(13);
					cell14.innerHTML = element.tsym;
					cell14.setAttribute('class', 'd-none')
					sendMessageToSocket(`{"t":"t","k":"${element.exch}|${element.token}"}`);
					sendMessageToSocket(`{"t":"d","k":"${element.exch}|${element.token}"}`);
					setInterval(function () {
						let rows = document.getElementById("posBody").children;
						let m = 0;
						let r = 0;
						for (let i = 0; i < rows.length; i++) {
							const element = rows[i];
							m += parseFloat(element.children[8].innerHTML);
							r += parseFloat(element.children[9].innerHTML);
						}
						let pp = parseFloat(document.getElementById("prevPnl").value);
						document.getElementById("total").innerHTML = (m + r + pp).toFixed(2);
						document.getElementById("mtm").innerHTML = m.toFixed(2);
						document.getElementById("rpnl").innerHTML = r.toFixed(2);
						m.toFixed(2) >= 0
							? document.getElementById("mtm").setAttribute("class", "green")
							: document.getElementById("mtm").setAttribute("class", "red");
						r.toFixed(2) >= 0
							? document.getElementById("rpnl").setAttribute("class", "green")
							: document.getElementById("rpnl").setAttribute("class", "red");
						document.getElementById("total").innerHTML >= 0
							? document.getElementById("total").setAttribute("class", "green")
							: document.getElementById("total").setAttribute("class", "red");
						let a = document.getElementById('total').innerHTML
						b = document.getElementById('margin').innerHTML
						a = parseFloat(a) / parseFloat(b) * 100;
						document.getElementById('marginused').innerHTML = a.toFixed(2) + " %";
					}, 1);
					if (element.netqty != 0) {
						async function ab() {
							chartDiv.classList.remove("d-none");
							let timeValues = {
								uid: localStorage.getItem("uid"),
								exch: element.exch,
								token: element.token,
								st: `${Math.round((Date.now() - 3456000000) / 1000)}`,
								et: `${Math.round(Date.now() / 1000)}`,
								// intrv: '1'
							};
							let barData = await all(timeValues, "TPSeries");
							let colorS = randomRgbColor();
							let candleSeries = chart.addLineSeries({
								color: colorS,
								lineWidth: 2,
							});
							let volSeries = null;
							if (element.netqty < 0) {
								volSeries = chart.addLineSeries({
									color: "black",
									lineWidth: 2,
									priceFormat: {
										type: "volume",
									},
									priceScaleId: "",
									scaleMargins: {
										top: 0.8,
										bottom: 0.015,
									},
								});
								let vdata = await reverseV(barData);
								volSeries.setData(vdata);
							}
							let pdata = await reverseP(barData);
							candleSeries.setData(pdata);
							let lastIndex = barData.length - 1;
							let currentIndex = lastIndex + 1;
							let currentBar = {
								value: null,
								time: Math.round(Date.now() / 1000) + 19800,
							};
							let currentVol = {
								value: null,
								time: Math.round(Date.now() / 1000) + 19800,
							};
							function mergeTickToBar(result) {
								currentBar.value = result.lp;
								candleSeries.update(currentBar);
								if (result.oi && volSeries != null) {
									currentVol.value = result.oi;
									volSeries.update(currentVol);
								}
							}
							let avgPriceLine = {
								price:
									element.daybuyqty == "0" && element.daysellqty == "0"
										? element.upldprc
										: element.netavgprc,
								color: colorS,
								lineWidth: 2,
								lineStyle: LightweightCharts.LineStyle.Dotted,
								axisLabelVisible: true,
								title: element.netqty,
							};
							candleSeries.createPriceLine(avgPriceLine);
							worker.port.addEventListener("message", function (msg) {
								let result = msg.data;
								if (result.tk == element.token) {
									if (result.lp == undefined) {
										null;
									} else {
										mergeTickToBar(result);
										if (new Date().getSeconds() == 0) {
											// move to next bar
											currentIndex++;
											let timestamp = Math.round(Date.now() / 1000);
											currentBar = {
												value: null,
												time: timestamp + 19800,
											};
											currentVol = {
												value: null,
												time: timestamp + 19800,
											};
										}
									}
								}
							});
						}
						ab();
						const renderOHLC = (d) => {
							let coloredValues = document.createElement("span");
							coloredValues.innerHTML = d.value + " ";
							legend.appendChild(coloredValues);
						};
						chart.subscribeCrosshairMove((param) => {
							legend.innerHTML = "";
							param.seriesData.forEach((ele) => {
								renderOHLC(ele);
							});
						});
						let legend = document.getElementById("lengends");
						legend.className = "three-line-tooltip";
						legend.style.display = "block";
						legend.style.color = "white";
						legend.style.position = "absolute";
						legend.style.font = "20px";
						legend.style.left = `${chartDiv.getBoundingClientRect().left + window.scrollX + 20
							}px`;
						legend.style.top = `${chartDiv.getBoundingClientRect().top + window.scrollY + 2
							}px`;
						legend.style.zIndex = "50";
					}
				}
			});
			for (let i = 0; i < fnoScirpts.length; i++) {
				let arr = pos.filter(function (element) {
					return element.exch == "NFO" && element.dname.split(" ")[0] == fnoScirpts[i].name;
				})
				//console.log(arrR)
				arr.length > 0 ? data1.push([fnoScirpts[i].value, fnoScirpts[i].name, arr]) : null;
			};
			data1.forEach(element => {
				table(element)
			});
			setTimeout(() => {
				roi();
				setInterval(() => {
					if (parseInt(document.getElementById('sl').value) != 0) {
						let total = parseInt(document.getElementById('total').innerHTML);
						let sl = parseInt(document.getElementById('sl').value);
						if (total == sl) {
							let formdata1 = new FormData();
							let dated = new Date;
							let time = {
								content: dated.toLocaleTimeString() + `@everyone SL is hit ${sl}`
							}
							time = JSON.stringify(time);
							formdata1.append("payload_json", time);
							let requestOptions = {
								method: 'POST',
								body: formdata1,
							};
							fetch(document.getElementById("webhook").value, requestOptions)
								.then(response => response.text())
								.then(result => null)
								.catch(error => console.log('error', error));
						} else if (total - sl <= 50) {
							let formdata1 = new FormData();
							let dated = new Date;
							let time = {
								content: dated.toLocaleTimeString() + ` @everyone SL is near ${sl}`
							}
							time = JSON.stringify(time);
							formdata1.append("payload_json", time);
							let requestOptions = {
								method: 'POST',
								body: formdata1,
							};
							fetch(document.getElementById("webhook").value, requestOptions)
								.then(response => response.text())
								.then(result => null)
								.catch(error => console.log('error', error));
						}
					}
					roi();
				}, 60000);
			}, 1000);
		}, 500);
	}
}
//positions
function table(element) {
	let div = document.createElement('div');
	let infoDiv = document.createElement('div');
	infoDiv.setAttribute('onclick', 'hideTables(this)');
	infoDiv.setAttribute('class', 'order-head')
	let nameSpan = document.createElement('span');
	nameSpan.innerHTML = element[1] + ` `;
	let token = document.createElement('span');
	token.id = element[0];
	let table = document.createElement("TABLE");
	table.classList.add('table', 'table-striped', 'position-table', 'd-none')
	let thead = table.createTHead();
	let tbody = document.createElement('tbody');
	table.appendChild(tbody);
	let row = thead.insertRow();
	row.innerHTML = `<th><input id="topCB" type="checkbox" name="click" onclick="checkAll(this)"></th>
	<th>Product</th>
	<th>Convert</th>
	<th>Script</th>
	<th>Qty</th>
	<th>Average</th>
	<th>LTP</th>
	<th>MTM</th>
	<th>R P&L</th>
	<th>% Chg</th>
	<th>IV</th>
	<th>EXP</th>
	<th>SPREAD</th>`;
	infoDiv.appendChild(nameSpan);
	infoDiv.appendChild(token);
	div.appendChild(infoDiv);
	div.appendChild(table);
	let tabContent = document.getElementsByClassName('tab-content')[0];
	nseTable = tabContent.querySelector('#NSEHeader');
	tabContent.insertBefore(div, nseTable);
	element[2].forEach(element => {
		let row = tbody.insertRow(-1);
		row.classList.add("posTr");
		element.netqty == 0 ? row.classList.add('fade-pos') : row.classList.remove('fade-pos');
		// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
		row.insertCell(0).innerHTML =
			element.netqty != 0
				? `<input type="checkbox" name="click" onclick="show()" class= "cb">`
				: ""; //check box
		let cell2 = row.insertCell(1); //product
		cell2.innerHTML =
			element.prd == "M" || element.prd == "C" ? "NRML" : "MIS";
		cell2.classList.add("badge");
		cell2.classList.add("bg-secondary");
		row.insertCell(
			2
		).innerHTML = `<button class="convert" onclick = "convert(this)"><i class="fa-solid fa-rotate"></i></button> <button class="exit" onclick = "exit(this)"><i class="fa-solid fa-xmark"></i></button>`; //modify
		row.insertCell(3).innerHTML = element.dname;
		row.insertCell(4).innerHTML = element.netqty;
		row.insertCell(5).innerHTML =
			element.daybuyqty == "0" && element.daysellqty == "0"
				? element.upldprc
				: element.netavgprc;
		row.insertCell(6).setAttribute("id", element.token);
		let cell12 = row.insertCell(7);
		cell12.innerHTML = "0.00";
		cell12.setAttribute("class", "green");
		let cell10 = row.insertCell(8);
		let a = 0;
		if (parseInt(element.cfbuyqty) == 0 && parseInt(element.cfsellqty) == 0)
			a = parseFloat(element.rpnl);
		else if (parseInt(element.daybuyqty) > 0 && parseInt(element.daybuyqty) > parseInt(element.daysellqty)) {
			a = (parseFloat(element.upldprc) - parseFloat(element.daybuyavgprc)) * parseInt(element.cfsellqty);
			a += (parseFloat(element.daysellavgprc) - parseFloat(element.daybuyavgprc)) * parseInt(element.daysellqty);
		}
		else if (parseInt(element.daysellqty) > 0 && parseInt(element.daysellqty) > parseInt(element.daybuyqty)) {
			a = (parseFloat(element.daysellavgprc) - parseFloat(element.upldprc)) * parseInt(element.cfbuyqty);
			a += (parseFloat(element.daysellavgprc) - parseFloat(element.daybuyavgprc)) * parseInt(element.daybuyqty);
		}
		cell10.innerHTML = a.toFixed(2);
		parseFloat(cell10.innerHTML) >= 0
			? cell10.setAttribute("class", "green")
			: cell10.setAttribute("class", "red");
		row.insertCell(9).innerHTML = 0;
		row.insertCell(10).innerHTML = 50;
		row.insertCell(11).innerHTML = element.dname.split(" ")[1];
		row.insertCell(12).innerHTML = 0;
		let cell14 = row.insertCell(13);
		cell14.innerHTML = element.tsym;
		cell14.setAttribute('class', 'd-none')
		sendMessageToSocket(`{"t":"t","k":"${element.exch}|${element.token}"}`);
		sendMessageToSocket(`{"t":"d","k":"${element.exch}|${element.token}"}`);
	});
	let tfoot = document.createElement('tfoot');
	tfoot.innerHTML = `<tr>
	   <td><button id="eSB" class="d-none" onclick="exitS(this)">Exit</button></td>
	   <td></td>
	   <td></td>
	   <td><input class="form-control" placeholder="Discord Api" onchange="webhook(this)"></td>
	   <td></td>
	   <td>Total</td>
	   <td></td>
	   <td></td>
	   <td></td>
	   <td><button onclick="posGraph(this)" class="graphbutton" >Graph</button></td>
	   <td></td>
	   <td style="width: 8%;"><input type="number" class="form-control" value="0"
			 style="width:80%;margin:auto;"></td>
	   <td style="width: 8%;"><input type="number" class="form-control" value="0"></td>
	</tr>`
	table.appendChild(tfoot);
	setInterval(function () {
		let rows = tbody.children;
		let tFootRow = tfoot.children[0];
		let m = 0;
		let r = 0;
		for (let i = 0; i < rows.length; i++) {
			const element = rows[i];
			m += parseFloat(element.children[7].innerHTML);
			r += parseFloat(element.children[8].innerHTML);
		}
		let pp = parseFloat(tFootRow.children[11].children[0].value);
		tFootRow.children[6].innerHTML = (m + r + pp).toFixed(2);
		tFootRow.children[7].innerHTML = m.toFixed(2);
		tFootRow.children[8].innerHTML = r.toFixed(2);
		m.toFixed(2) >= 0
			? tFootRow.children[7].setAttribute("class", "green")
			: tFootRow.children[7].setAttribute("class", "red");
		r.toFixed(2) >= 0
			? tFootRow.children[8].setAttribute("class", "green")
			: tFootRow.children[8].setAttribute("class", "red");
		tFootRow.children[6].innerHTML >= 0
			? tFootRow.children[6].setAttribute("class", "green")
			: tFootRow.children[6].setAttribute("class", "red");
		let a = tFootRow.children[4].innerHTML
		b = tFootRow.children[5].innerHTML
		a = parseFloat(a) / parseFloat(b) * 100;
		tFootRow.children[10].innerHTML = a.toFixed(2) + " %";
	}, 1);
	sendMessageToSocket(
		`{"t":"t","k":"NSE|${element[0]}"}`
	);
}
//add NFO tables
function hideTables(posTables) {
	let tables = document.querySelectorAll('table');
	tables.forEach(element => {
		if (element.parentElement.classList.contains('tv-lightweight-charts')) {
			return;
		} else {
			element.classList.add('d-none');
			if (document.title === "Adjustment") {
				element.nextElementSibling ? element.nextElementSibling.classList.add('d-none') : null;
			}
		}
	});
	let table = posTables.nextElementSibling;
	table.classList.remove('d-none');
	if (document.title === "Adjustment") {
		table.nextElementSibling ? table.nextElementSibling.classList.remove('d-none') : null;
	}
}
//hide Other Tables in Positions
function checkAll(boxes) {
	if (boxes.checked == true) {
		let checkboxes = document.getElementsByClassName("cb");
		for (let checkbox of checkboxes) {
			checkbox.checked = true;
		}
		show();
	} else {
		let checkboxes = document.getElementsByClassName("cb");
		for (let checkbox of checkboxes) {
			checkbox.checked = false;
		}
		show();
	}
}
//check uncheck positions
function show() {
	let checkboxes = document.getElementsByClassName("cb");
	for (let checkbox of checkboxes) {
		if (checkbox.checked == true) {
			document.getElementById("eSB").classList.remove("d-none");
			break;
		} else {
			document.getElementById("eSB").classList.add("d-none");
		}
	}
}
// show exit button
async function exitS(exitB) {
	let table = exitB.parentElement.parentElement.parentElement.parentElement
	let checkboxes = table.getElementsByClassName("cb");
	let rows = [];
	for (let checkbox of checkboxes) {
		if (checkbox.checked == true) {
			let row = await checkbox.parentElement.parentElement;
			rows.push(row);
		}
	}
	setTimeout(() => {
		// rows.sort((a, b) => {
		// 	return a.qty - b.qty;
		// });
		let exch = rows[0].parentElement.id == "posBody" ? "Other" : "NFO"
		rows.forEach((row, i) => {
			setTimeout(
				function () {
					let value = {
						uid: localStorage.getItem("uid"),
						actid: localStorage.getItem("actid"),
						exch: exch == "other" ? row.children[4].innerHTML : "NFO",
						tsym: row.children[13].innerHTML,
						qty: exch == "other" ? `${Math.abs(row.children[5].innerHTML)}` : `${Math.abs(row.children[4].innerHTML)}`,
						prc: "0",
						prd:
							row.children[1].innerHTML == "MIS"
								? "I"
								: exch == "NFO"
									? "M"
									: "C",
						trantype: '0',
						prctyp: "MKT",
						ret: "DAY",
					};
					if (exch == "other") { value.trantype = parseInt(row.children[5].innerHTML) > 0 ? "S" : "B" }
					else {
						value.trantype = parseInt(row.children[4].innerHTML) > 0 ? "S" : "B"
					}
					all(value, "PlaceOrder");
				}, i * 100)
		});
	}, 200);
}
//exit selected
function convert(convertB) {
	let row = convertB.parentNode.parentNode.parentNode;
	let exch = row.parentElement.id == "posBody" ? "Other" : "NFO"
	let convertValues = {
		uid: localStorage.getItem("uid"),
		actid: localStorage.getItem("actid"),
		exch: exch == "other" ? row.children[4].innerHTML : "NFO",
		tsym: row.children[14].innerHTML,
		qty: exch == "other" ? `${Math.abs(row.children[5].innerHTML)}` : `${Math.abs(row.children[4].innerHTML)}`,
		prd:
			row.children[1].innerHTML == "NRML"
				? "I"
				: exch == "NFO"
					? "M"
					: "C",
		prevprd:
			row.children[1].innerHTML == "MIS"
				? "I"
				: exch == "NFO"
					? "M"
					: "C",
		trantype: parseInt(row.children[5].innerHTML) > 0 ? "B" : "S",
		postype: "DAY",
	};
	if (exch == "other") { convertValues.trantype = parseInt(row.children[5].innerHTML) > 0 ? "S" : "B" }
	else {
		convertValues.trantype = parseInt(row.children[4].innerHTML) > 0 ? "S" : "B"
	}
	all(convertValues, "ProductConversion").then((ans) => {
		if (ans.stat == "Ok") {
			alert("Conveted");
			location.reload();
		} else if (ans.stat == "Not_Ok") {
			alert("Not Converted");
		}
	});
}
//convert position
function exit(exitButton) {
	let row = exitButton.parentElement.parentElement.parentElement;
	let buttons = document.getElementById("exitP");
	buttons.style.zIndex = 100;
	buttons.style.top = `${exitButton.getBoundingClientRect().top + window.scrollY - 10
		}px`;
	buttons.style.left = `${exitButton.getBoundingClientRect().left + window.scrollX
		}px`;
	buttons.style.position = "absolute";
	buttons.style.width = "100%";
	if (parseInt(row.children[5].innerHTML) != 0) {
		buttons.classList.remove("d-none");
		let infoValues = {
			uid: localStorage.getItem("uid"),
			exch: row.children[4].innerHTML,
			token: row.children[7].id,
		};
		all(infoValues, "GetSecurityInfo").then((scripDetail) => {
			document.getElementById("qtyB").step = scripDetail.ls;
			document.getElementById("qtyB").min = scripDetail.ls;
		});
		document.getElementById("qtyB").value = Math.abs(row.children[5].innerHTML);
		parseInt(row.children[5].innerHTML) < 0
			? document.getElementById("qtyB").classList.add("green")
			: document.getElementById("qtyB").classList.add("red");
		parseInt(row.children[5].innerHTML) > 0
			? document.getElementById("qtyB").classList.remove("green")
			: document.getElementById("qtyB").classList.remove("red");
		document.getElementById("tsym").innerHTML = row.children[13].innerHTML;
		document.getElementById("exch").innerHTML = row.children[4].innerHTML;
		document.getElementById("prdtype").innerHTML = row.children[1].innerHTML;
		clearTimeout(timeOut);
		timeOut = setTimeout(() => {
			buttons.classList.add("d-none");
		}, 10000);
	}
}
//show popup for exit
function exitB() {
	let value = {
		uid: localStorage.getItem("uid"),
		actid: localStorage.getItem("actid"),
		exch: document.getElementById("exch").innerHTML,
		tsym: document.getElementById("tsym").innerHTML,
		qty: document.getElementById("qtyB").value,
		prc: document.getElementById("priceB") ? document.getElementById("priceB").value : '0',
		prd:
			document.getElementById("prdtype").innerHTML == "MIS"
				? "I"
				: document.getElementById("exch").innerHTML == "NFO"
					? "M"
					: "C",
		trgprc: document.getElementById("trgprice") ? document.getElementById("trgprice").value : '0',
		trantype: document.getElementById("qtyB").classList.contains("red")
			? "S"
			: "B",
		prctyp: document.getElementById("optionS") ? document.getElementById("optionS").value : "MKT",
		ret: "DAY",
	};
	all(value, "PlaceOrder");
}
//exit button in position popup
function changePrice() {
	document.getElementById("optionS").value == "MKT" ||
		document.getElementById("optionS").value == "LMT"
		? document.getElementById("trgprice").classList.add("d-none")
		: document.getElementById("trgprice").classList.remove("d-none");
	document.getElementById("optionS").value == "MKT" ||
		document.getElementById("optionS").value == "LMT"
		? (document.getElementById("trgprice").value = 0)
		: null;
	document.getElementById("optionS").value == "MKT"
		? (document.getElementById("priceB").value = 0)
		: null;
}
//change Price in pos exit pop up
function webhook(discordUrl) {
	let date = new Date;
	let preSession = new Date;
	let postSession = new Date;
	preSession.setHours(9, 14, 0, 0);
	postSession.setHours(15, 32, 0, 0);
	setInterval(() => {
		if (date >= preSession && date <= postSession) {
			console.log(date, preSession)
			function dataURLtoFile(dataurl, filename) {
				let arr = dataurl.split(','),
					mime = arr[0].match(/:(.*?);/)[1],
					bstr = atob(arr[1]),
					n = bstr.length,
					u8arr = new Uint8Array(n);
				while (n--) {
					u8arr[n] = bstr.charCodeAt(n);
				}
				return new File([u8arr], filename, { type: mime });
			}
			htmlToImage.toJpeg(discordUrl.parentElement.parentElement.parentElement.parentElement)
				.then(function (dataUrl) {
					//let img = canvas.toDataURL("image/png");
					let formdata1 = new FormData();
					let file = dataURLtoFile(dataUrl, 'unknown.jpeg');
					formdata1.append("file1", file);
					let dated = new Date;
					let time = {
						content: dated.toLocaleTimeString()
					}
					time = JSON.stringify(time);
					formdata1.append("payload_json", time);
					let requestOptions = {
						method: 'POST',
						body: formdata1,
					};
					fetch(discordUrl.value, requestOptions)
						.then(response => response.text())
						.then(result => null)
						.catch(error => console.log('error', error));
				});
		}
	}, 60000);
};
//send position ss
async function chart(element, iT, tex) {
	let timeValues = {
		uid: localStorage.getItem("uid"),
		exch: `${tex}`,
		token: `${iT}`,
		st: `${Math.round((Date.now() - 3456000000) / 1000)}`,
		et: `${Math.round(Date.now() / 1000)}`,
	};
	let c1M = await all(timeValues, "TPSeries");
	timeValues.intrv = "5";
	let c5M = await all(timeValues, "TPSeries");
	timeValues.intrv = "15";
	let c15M = await all(timeValues, "TPSeries");
	timeValues.intrv = "30";
	let c30M = await all(timeValues, "TPSeries");
	timeValues.intrv = "60";
	let c60M = await all(timeValues, "TPSeries");

	async function reversePrice(ohlcs) {
		let chartdata = await ohlcs.map((ohlc) => {
			let timestamp = new Date(ohlc.ssboe * 1000).getTime() / 1000;
			//open: parseFloat(ohlc.into), high: parseFloat(ohlc.inth), low: parseFloat(ohlc.intl), close: parseFloat(ohlc.intc)
			//value: parseFloat(ohlc.intc)
			return {
				time: timestamp + 19800,
				open: parseFloat(ohlc.into),
				high: parseFloat(ohlc.inth),
				low: parseFloat(ohlc.intl),
				close: parseFloat(ohlc.intc),
			};
		});
		return chartdata.reverse();
	}
	async function reverseVol(ohlcs) {
		let chartdata = await ohlcs.map((ohlc) => {
			let timestamp = new Date(ohlc.ssboe * 1000).getTime() / 1000;
			//open: parseFloat(ohlc.into), high: parseFloat(ohlc.inth), low: parseFloat(ohlc.intl), close: parseFloat(ohlc.intc)
			//value: parseFloat(ohlc.intc)
			return {
				time: timestamp + 19800,
				value: ohlc.oi,
			};
		});
		return chartdata.reverse();
	}

	if (c1M.stat == "Not_Ok") {
		const chartDiv = document.getElementById(`${element}`);
		chartDiv.innerHTML = "No Data";
		chartDiv.style.color = "white";
		let legend = chartDiv.nextElementSibling;
		legend.innerHTML = "";
		let switcherElement = legend.nextElementSibling;
		switcherElement.innerHTML = "";
		let button = switcherElement.nextElementSibling;
		button.innerHTML = "";
	} else {
		const chartDiv = document.getElementById(`${element}`);
		chartDiv.innerHTML = "";
		const chartProperties1 = {
			width: chartDiv.innerWidth,
			height: chartDiv.innerHeight,
			timeScale: {
				timeVisible: true,
				secondsVisible: true,
			},
			layout: {
				textColor: "#000000",
				background: {
					type: "solid",
					color: "rgba(120, 123, 134, 1)",// rgba(93, 96, 107, 1),
				}
			},
			rightPriceScale: {
				scaleMargins: {
					top: 0.3,
					bottom: 0.25,
				},
			},
			grid: {
				vertLines: {
					color: "rgba(120, 123, 134, 0)",
				},
				horzLines: {
					color: "rgba(120, 123, 134, 0)",
				},
			},
			crosshair: {
				mode: LightweightCharts.CrosshairMode.Normal,
				vertLine: {
					color: "#fff",
				},
				horzLine: {
					color: "#fff",
				},
			},
		};
		const chart = LightweightCharts.createChart(chartDiv, chartProperties1);

		let p1M = await reversePrice(c1M);
		let p5M = await reversePrice(c5M);
		let p15M = await reversePrice(c15M);
		let p30M = await reversePrice(c30M);
		let p60M = await reversePrice(c60M);
		let v1M = await reverseVol(c1M);
		let v5M = await reverseVol(c5M);
		let v15M = await reverseVol(c15M);
		let v30M = await reverseVol(c30M);
		let v60M = await reverseVol(c60M);
		////// data feed
		const renderOHLC = (price, vol) => {
			const { open, high, low, close } = price;
			let coloredValues = `<p>O<span class="${open > close ? "red" : "green"
				}">${open}</span> H<span class="${open > close ? "red" : "green"
				}">${high}</span> L<span class="${open > close ? "red" : "green"
				}">${low}</span> C<span class="${open > close ? "red" : "green"
				}">${close}</span> <span>OI ${vol.value}</span> </p>`;
			legend.children[1].innerHTML = coloredValues;
		};
		let ohlcValues = null;
		let volValues = null;
		chart.subscribeCrosshairMove((param) => {
			ohlcValues = param.seriesData.get(priceSeries);
			volValues = param.seriesData.get(volSeries);
			ohlcValues ? renderOHLC(ohlcValues, volValues) : null;
		});
		let legend = chartDiv.nextElementSibling;
		legend.style.display = "block";
		legend.style.position = "absolute";
		legend.style.zIndex = "15";
		legend.style.left = `${chartDiv.getBoundingClientRect().left + window.scrollX + 20
			}px`;
		legend.style.top = `${chartDiv.getBoundingClientRect().top + 2}px`;
		legend.style.zIndex = "50";
		legend.innerHTML =
			'<div style="font-size: 20px; margin: 4px 0px; color: #fff">' +
			element.toUpperCase() +
			" <span id=" +
			iT +
			"></span></div><div></div>";
		///////// switcher
		function createSimpleSwitcher(
			items,
			activeItem,
			activeItemChangedCallback
		) {
			let switcherElement = legend.nextElementSibling;
			switcherElement.innerHTML = "";
			let intervalElements = items.map(function (item) {
				let itemEl = document.createElement("button");
				itemEl.innerText = item;
				itemEl.classList.add("switcher-item");
				itemEl.classList.toggle("switcher-active-item", item === activeItem);
				itemEl.addEventListener("click", function () {
					onItemClicked(item);
				});
				switcherElement.appendChild(itemEl);
				return itemEl;
			});
			function onItemClicked(item) {
				if (item === activeItem) {
					return;
				}
				intervalElements.forEach(function (element, index) {
					element.classList.toggle(
						"switcher-active-item",
						items[index] === item
					);
				});
				activeItem = item;
				activeItemChangedCallback(item);
			}
			return switcherElement;
		}
		let intervals = ["1M", "5M", "15M", "30M", "60M"];
		let priceData = new Map([
			["1M", p1M],
			["5M", p5M],
			["15M", p15M],
			["30M", p30M],
			["60M", p60M],
		]);
		let volData = new Map([
			["1M", v1M],
			["5M", v5M],
			["15M", v15M],
			["30M", v30M],
			["60M", v60M],
		]);
		let switcherElement = createSimpleSwitcher(
			intervals,
			intervals[0],
			syncToInterval
		);
		let priceSeries = null;
		let volSeries = null;
		function syncToInterval(interval) {
			if (priceSeries || volSeries) {
				chart.removeSeries(priceSeries);
				chart.removeSeries(volSeries);
			}
			priceSeries = chart.addCandlestickSeries({
				upColor: "#FFFFFF",
				downColor: "#000000",
				borderDownColor: "#000000",
				borderUpColor: "#000000",
				wickDownColor: "#000000",
				wickUpColor: "#000000",
			});
			volSeries = chart.addLineSeries({
				color: "black",
				priceFormat: {
					type: "volume",
				},
				priceScaleId: "",
				scaleMargins: {
					top: 0.8,
					bottom: 0.02,
				},
			});
			priceSeries.setData(priceData.get(interval));
			volSeries.setData(volData.get(interval));
		}
		syncToInterval(intervals[0]);
		//////////////////////////
		let lastIndex = c1M.length - 1;
		let currentIndex = lastIndex + 1;
		let currentBar = {
			open: null,
			high: null,
			low: null,
			close: null,
			time: Math.round(Date.now() / 1000) + 19800,
		};
		let currentVol = {
			value: null,
			time: Math.round(Date.now() / 1000) + 19800,
		};
		function mergeTickToBar(result) {
			if (currentBar.open === null) {
				currentBar.open = result.lp;
				currentBar.high = result.lp;
				currentBar.low = result.lp;
				currentBar.close = result.lp;
			} else {
				currentBar.close = result.lp;
				currentBar.high = Math.max(currentBar.high, result.lp);
				currentBar.low = Math.min(currentBar.low, result.lp);
			}
			if (result.oi) {
				currentVol.value = result.oi;
				volSeries.update(currentVol);
			}
			priceSeries.update(currentBar);
		}
		/// button
		let button = switcherElement.nextElementSibling;
		button.style.left =
			chartDiv.getBoundingClientRect().right + window.scrollX + -100 + "px";
		button.style.top =
			chartDiv.getBoundingClientRect().bottom + window.scrollY + -65 + "px";
		let timeScale = chart.timeScale();
		timeScale.subscribeVisibleTimeRangeChange(function () {
			let buttonVisible = timeScale.scrollPosition() < 0;
			button.style.display = buttonVisible ? "block" : "none";
		});
		button.addEventListener("click", function () {
			timeScale.scrollToRealTime();
		});
		button.addEventListener("mouseover", function () {
			button.style.background = "rgba(250, 250, 250, 1)";
			button.style.color = "#000";
		});
		button.addEventListener("mouseout", function () {
			button.style.background = "rgba(250, 250, 250, 0.6)";
			button.style.color = "#4c525e";
		});
		//
		worker.port.addEventListener("message", function (msg) {
			let result = msg.data;
			if (result.tk == iT && result.lp != undefined) {
				mergeTickToBar(result);
				let currentTime = new Date;
				let currentTimeBar = new Date(((currentBar.time) - 19800) * 1000);
				if (currentTime.getMinutes() != currentTimeBar.getMinutes()) {
					// move to next bar
					currentIndex++;
					let timestamp = Math.round(Date.now() / 1000);
					currentBar = {
						open: null,
						high: null,
						low: null,
						close: null,
						time: timestamp + 19800,
					};
					currentVol = {
						value: null,
						time: timestamp + 19800,
					};
				}
				//candleSeries.update({ time: Math.round(Date.now() / 1000) + 19800, value: result.lp });
			}
			else {
				null;
			}
		})
	}
}
//chart with multiple tf
async function addLeg() {
	let table = document.getElementById('stratBody');
	let row = document.createElement('tr');
	let expiry = document.getElementById('exp').value.split(" ", 1);
	row.insertCell(0).innerHTML = `<input type="checkbox" checked name="boxes">`;
	row.insertCell(1).innerHTML =
		`<label class="toggle"><input type="checkbox" name="bs" onchange="changeStrike(this)"><span class="labels" data-on="B" data-off="S"></span></label>`;
	row.insertCell(2).innerHTML = expiry;
	row.insertCell(3).innerHTML = `<label><input type="number" class="form-control" value="${document.getElementById('strikeP').innerHTML}"
				step="${document.getElementById('diff').innerHTML}" onchange="changeStrike(this)" name="strike"></label>`;
	row.insertCell(4).innerHTML = `<label class="toggle">
			<input type="checkbox" name="cepe" onchange="changeStrike(this)">
				<span class="labels" data-on="CE" data-off="PE"></span>
		</label>`;
	row.insertCell(5).innerHTML = `<input type="number" class="form-control" value='${document.getElementById('ls').innerHTML}'
			min='${document.getElementById('ls').innerHTML}' step='${document.getElementById('ls').innerHTML}' name="qty">`;
	let scriptN = document.getElementById('name').innerHTML;
	let scriptName = scriptN.slice(-4) == '-EQ ' ? scriptN.substring(0, scriptN.length - 4) : scriptN;
	scriptName = scriptN.slice(-2) == 'F ' ? scriptN.substring(0, scriptN.length - 9) : scriptN;
	let svalues = {
		uid: localStorage.getItem("uid"),
		stext: scriptName + ' ' + expiry + ' ' + document.getElementById('strikeP').innerHTML + ' PE',
		exch: "NFO",
	};
	let scripts = await all(svalues, "SearchScrip");
	row.insertCell(6).id = scripts.values[0].token;
	row.insertCell(7).innerHTML = `<select class="form-control" name="NM">
				<option>NRML</option>
				<option>MIS</option>
			</select>`;
	row.insertCell(8).innerHTML = `Delta`;
	row.insertCell(9).innerHTML = `Theta`;
	row.insertCell(10).innerHTML = `Gamma`;
	row.insertCell(11).innerHTML = `Vega`;
	row.insertCell(12).innerHTML = `50`;
	row.insertCell(13).innerHTML += `<span class="badge bg-secondary strat-badge"
			onclick="this.parentElement.parentElement.remove()">DEL</span>`;
	sendMessageToSocket(`{ "t": "t", "k": "NFO|${scripts.values[0].token}" } `);
	row.classList.add('strat-inner');
	let cell14 = row.insertCell(14)
	cell14.innerHTML = scripts.values[0].tsym;
	cell14.classList.add('d-none');
	table.appendChild(row);
	limits();
	basketMargins();
}
//add leg to strategy builder
async function changeStrike(strikeList) {
	let row = strikeList.parentElement.parentElement.parentElement;
	let scriptN = document.getElementById('name').innerHTML;
	let scriptName = scriptN.slice(-4) == '-EQ ' ? scriptN.substring(0, scriptN.length - 4) : scriptN;
	let svalues = {
		uid: localStorage.getItem("uid"),
		stext: scriptName + ' ' + row.children[2].innerText + ' ' + row.querySelector('input[name="strike"]').value + (row.querySelector('input[name="cepe"]').checked ? ' CE' : ' PE'),
		exch: "NFO",
	};
	let scripts = await all(svalues, "SearchScrip");
	row.children[6].id = scripts.values[0].token;
	row.children[12].innerHTML = 50;
	row.children[14].innerHTML = scripts.values[0].tsym;
	sendMessageToSocket(`{ "t": "t", "k": "NFO|${scripts.values[0].token}" } `);
	limits();
	basketMargins();
}
//strategy builder change strike or ce pe
function tradeAll() {
	let checkboxes = document.querySelectorAll("input[name='boxes']");
	let rows = [];
	for (let checkbox of checkboxes) {
		let row = checkbox.parentElement.parentElement;
		rows.push(row);
	}
	rows.sort((a, b) => {
		return a.querySelector("input[name='qty']") - b.querySelector("input[name='qty']");
	});
	rows.forEach((row, i) => {
		setTimeout(
			function () {
				let value = {
					uid: localStorage.getItem("uid"),
					actid: localStorage.getItem("actid"),
					exch: 'NFO',
					tsym: row.children[14].innerHTML,
					qty: row.querySelector('input[name="qty"]').value,
					prc: "0",
					prd:
						row.querySelector('select[name="NM"]').value == "MIS"
							? "I"
							: "M",
					trantype: row.querySelector('input[name="bs"]').checked ? "B" : "S",
					prctyp: "MKT",
					ret: "DAY",
				};
				all(value, "PlaceOrder");
			}, i * 200)
	});
}
//trade all strategy builder
function tradeS() {
	let checkboxes = document.querySelectorAll("input[name='boxes']");
	let rows = [];
	for (let checkbox of checkboxes) {
		if (checkbox.checked == true) {
			let row = checkbox.parentElement.parentElement;
			rows.push(row);
		}
	}
	rows.sort((a, b) => {
		return a.querySelector("input[name='qty']") - b.querySelector("input[name='qty']");
	});
	rows.forEach((row, i) => {
		setTimeout(
			function () {
				let value = {
					uid: localStorage.getItem("uid"),
					actid: localStorage.getItem("actid"),
					exch: 'NFO',
					tsym: row.children[14].innerHTML,
					qty: row.querySelector('input[name="qty"]').value,
					prc: "0",
					prd:
						row.querySelector('select[name="NM"]').value == "MIS"
							? "I"
							: "M",
					trantype: row.querySelector('input[name="bs"]').checked ? "B" : "S",
					prctyp: "MKT",
					ret: "DAY",
				};
				all(value, "PlaceOrder");
			}, i * 200)
	});
}
//trade selected strategy builder
async function basketMargins() {
	let checkboxes = document.querySelectorAll("input[name='boxes']");
	let rows = [];
	for (let checkbox of checkboxes) {
		if (checkbox.checked == true) {
			let row = checkbox.parentElement.parentElement;
			rows.push(row);
		}
	}
	let value;
	let baskets = [];
	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		if (i == 0) {
			value = {
				uid: localStorage.getItem("uid"),
				actid: localStorage.getItem("actid"),
				exch: 'NFO',
				tsym: row.children[14].innerHTML,
				qty: row.querySelector('input[name="qty"]').value,
				prc: "0",
				prd:
					row.querySelector('select[name="NM"]').value == "MIS"
						? "I"
						: "M",
				trantype: row.querySelector('input[name="bs"]').checked ? "B" : "S",
				prctyp: "MKT",
			};
		}
		else {
			let values = {
				exch: 'NFO',
				tsym: row.children[14].innerHTML,
				qty: row.querySelector('input[name="qty"]').value,
				prc: "0",
				prd:
					row.querySelector('select[name="NM"]').value == "MIS"
						? "I"
						: "M",
				trantype: row.querySelector('input[name="bs"]').checked ? "B" : "S",
				prctyp: "MKT",
			};
			baskets.push(values);
		}
	}
	value.basketlists = baskets;
	let margins = await all(value, 'GetBasketMargin');
	document.getElementById('funds').innerHTML = margins.marginused;
	document.getElementById('margin').innerHTML = margins.marginusedtrade;
}
//basket margin show
async function roi() {
	let checkboxes = document.getElementsByClassName("cb");
	let rows = [];
	for (let checkbox of checkboxes) {
		let row = checkbox.parentElement.parentElement;
		rows.push(row);
	}
	let value;
	let baskets = [];
	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		if (Math.abs(row.children[5].innerHTML) != 0 && row.children[4].innerHTML == "NFO") {
			if (i == 0) {
				value = {
					uid: localStorage.getItem("uid"),
					actid: localStorage.getItem("actid"),
					exch: row.children[4].innerHTML,
					tsym: row.children[13].innerHTML,
					qty: `${Math.abs(row.children[5].innerHTML)}`,
					prc: row.children[6].innerHTML,
					prd:
						row.children[1].innerHTML == "MIS"
							? "I"
							: row.children[4].innerHTML == "NFO"
								? "M"
								: "C",
					trantype: parseInt(row.children[5].innerHTML) > 0 ? "B" : "S",
					prctyp: "LMT"
				};
			}
			else {
				let values = {
					exch: row.children[4].innerHTML,
					tsym: row.children[13].innerHTML,
					qty: `${Math.abs(row.children[5].innerHTML)}`,
					prc: row.children[6].innerHTML,
					prd:
						row.children[1].innerHTML == "MIS"
							? "I"
							: row.children[4].innerHTML == "NFO"
								? "M"
								: "C",
					trantype: parseInt(row.children[5].innerHTML) > 0 ? "B" : "S",
					prctyp: "LMT",
				};
				baskets.push(values);
			}
		}
	}
	if (value != undefined) {
		value.basketlists = baskets == undefined ? null : baskets;
		all(value, "GetBasketMargin").then(element => {
			document.getElementById('margin').innerHTML = parseInt(element.marginusedtrade) / 2;
		});
	}
}
//roi calculator
async function hold() {
	let hvalues = {
		uid: localStorage.getItem("uid"),
		actid: localStorage.getItem("actid"),
		prd: "C",
	};
	let holdings = await all(hvalues, "Holdings");
	if (holdings.length == "0") {
		document.getElementById("noH").classList.remove("d-none");
	} else {
		document.getElementById("HoldingTable").classList.remove("d-none");
		document.getElementById("totaldiv").classList.remove("d-none");
		let holdtbody = document.getElementById("Holdingtbody");
		let total = 0;
		holdings.forEach((element) => {
			let row = holdtbody.insertRow(-1);
			row.classList.add("holdTr");
			row.insertCell(0).innerHTML = element.exch_tsym[0].tsym;
			let qty = 0;
			element.dpqty ? qty = parseInt(element.holdqty) + parseInt(element.dpqty) + parseInt(element.btstqty) : qty = parseInt(element.holdqty) + parseInt(element.btstqty);
			row.insertCell(1).innerHTML = qty;
			row.insertCell(2).innerHTML = element.upldprc; //avg cost
			row.insertCell(3).setAttribute("id", `${element.exch_tsym[0].token}`);
			row.insertCell(4); //cv
			row.insertCell(5); //pl
			row.insertCell(6); //dpnl
			row.insertCell(7); //nc
			row.insertCell(8); //dc
			row.insertCell(9).innerHTML = "0"; // weights
			sendMessageToSocket(
				`{"t":"t","k":"${element.exch_tsym[0].exch}|${element.exch_tsym[0].token}"}`
			);
			// Add some text to the new cells:
			total += parseFloat(element.upldprc) * parseFloat(qty);
			document.getElementById("total").innerHTML = total.toFixed(2);
		});
		setTimeout(() => {
			holdings.forEach((element) => {
				let row = document.getElementById(
					element.exch_tsym[0].token
				).parentElement;
				row.children[9].innerHTML =
					(
						((element.upldprc * row.children[1].innerHTML) / total) *
						100
					).toFixed(2) + "%";
			});
		}, 2000);
		setInterval(function () {
			let rows = document.getElementsByClassName("holdTr");
			let current = 0;
			let net = 0;
			let dayt = 0;
			let pc = 0;
			for (let i = 0; i < rows.length; i++) {
				const element = rows[i];
				current += parseFloat(element.children[4].innerHTML);
				dayt += parseFloat(element.children[6].innerHTML);
				pc +=
					parseInt(element.children[1].innerHTML) *
					parseFloat(element.children[10].innerHTML);
			}
			net = current - parseFloat(document.getElementById("total").innerHTML);
			document.getElementById("current").innerHTML = current.toFixed(2);
			document.getElementById("day").innerHTML = dayt.toFixed(2);
			document.getElementById("net").innerHTML = net.toFixed(2);
			dayt > 0
				? document.getElementById("day").setAttribute("class", "green")
				: document.getElementById("day").setAttribute("class", "red");
			dayt > 0
				? document.getElementById("dayP").setAttribute("class", "green")
				: document.getElementById("dayP").setAttribute("class", "red");
			current > parseFloat(document.getElementById("total").innerHTML)
				? document.getElementById("net").setAttribute("class", "green")
				: document.getElementById("net").setAttribute("class", "red");
			current > parseFloat(document.getElementById("total").innerHTML)
				? document.getElementById("netP").setAttribute("class", "green")
				: document.getElementById("netP").setAttribute("class", "red");
			document.getElementById("dayP").innerHTML = `${(
				(dayt / pc) *
				100
			).toFixed(2)}%`;
			document.getElementById("netP").innerHTML = `${(
				(net / parseFloat(document.getElementById("total").innerHTML)) *
				100
			).toFixed(2)}%`;
		}, 2000);
	}
}
//holdings
async function order() {
	let ovalues = {
		uid: localStorage.getItem("uid"),
	};
	let orders = await all(ovalues, "OrderBook");
	if (orders.stat === "Not_Ok") {
		document.getElementById("noO").classList.remove("d-none");
	} else {
		let OOtbody = document.getElementById("OOtbody");
		let COtbody = document.getElementById("COtbody");
		orders.forEach((element) => {
			if (element.status === "OPEN") {
				document.getElementById("OOTable").classList.remove("d-none");
				let row = OOtbody.insertRow(0);
				row.insertCell(0).innerHTML = element.dname;
				row.insertCell(1).innerHTML = element.exch;
				row.insertCell(2).innerHTML = element.trantype;
				row.insertCell(3).innerHTML =
					element.prd == "M" || element.prd == "C" ? "NRML" : "MIS";
				row.insertCell(4).innerHTML = `${element.fillshares ? element.fillshares : 0
					}/${element.qty}`;
				row.insertCell(5).innerHTML = element.prc;
				row.insertCell(6).innerHTML = element.status;
				row.insertCell(7).innerHTML = element.norentm.slice(0, 8);
				row.insertCell(8).innerHTML = element.norenordno;
				row.insertCell(
					9
				).innerHTML = `<button class="or-cancel" onclick='cancel(this)'><i class="fa-solid fa-xmark"></i></button>`;
			} else {
				document.getElementById("COTable").classList.remove("d-none");
				let row = COtbody.insertRow(0);
				row.insertCell(0).innerHTML = element.dname;
				row.insertCell(1).innerHTML = element.exch;
				row.insertCell(2).innerHTML = element.trantype;
				row.insertCell(3).innerHTML =
					element.prd == "M" || element.prd == "C" ? "NRML" : "MIS";
				row.insertCell(4).innerHTML = `${element.fillshares ? element.fillshares : 0
					}/${element.qty}`;
				row.insertCell(5).innerHTML = element.avgprc ? element.avgprc : 0;
				row.insertCell(6).innerHTML = element.status;
				row.insertCell(7).innerHTML = element.norentm.slice(0, 8);
			}
		});
	}
}
//orderbook
async function cancel(cancelB) {
	let row = cancelB.parentNode.parentNode;
	let Oid = row.children[8].innerHTML;
	let cValues = {
		norenordno: Oid,
		uid: localStorage.getItem("uid"),
	};
	await all(cValues, "CancelOrder");
	window.location.reload();
}
// cancel in open orders
async function limits() {
	if (document.title == 'Limits') {

		let livalues = {
			uid: localStorage.getItem("uid"),
			actid: localStorage.getItem("actid"),
		};
		let limit = await all(livalues, "Limits");
		let total = limit.collateral ? parseFloat(limit.cash) + parseFloat(limit.collateral) + parseFloat(limit.unclearedcash) : parseFloat(limit.cash);
		document.getElementById("t").innerHTML = total.toFixed(2);
		document.getElementById("cash").innerHTML = limit.cash ? limit.cash : 0;
		document.getElementById("pm").innerHTML = limit.peak_mar ? limit.peak_mar : 0;
		document.getElementById("mu").innerHTML = limit.marginused
			? limit.marginused
			: 0;
		document.getElementById("co").innerHTML = limit.collateral
			? parseFloat(limit.collateral)
			: 0;
		document.getElementById("pr").innerHTML = limit.premium ? limit.premium : 0;
		document.getElementById("expo").innerHTML = limit.expo ? limit.expo : 0;
		document.getElementById("urt").innerHTML = limit.urmtom ? limit.urmtom : 0;
		document.getElementById("mc").innerHTML = limit.grcoll ? limit.grcoll : 0;
		document.getElementById("urc").innerHTML = limit.unclearedcash ? limit.unclearedcash : 0;
	}
	else {
		let livalues = {
			uid: localStorage.getItem("uid"),
			actid: localStorage.getItem("actid"),
		};
		let limit = await all(livalues, "Limits");
		let total = limit.collateral ? parseFloat(limit.cash) + parseFloat(limit.collateral) + parseFloat(limit.unclearedcash) : parseFloat(limit.cash);
		document.getElementById("t").innerHTML = total.toFixed(2);
	}
}
//limits
async function options() {

}
//oc
let distribution = document.title == 'Option Chain' || document.title == 'Strategy Builder' || document.title == 'Positions' || document.title == 'Adjustment' ? gaussian(0, 1) : null;
// declaring iv variable factor
function volFind(row) {
	let date_expiry = new Date(document.getElementById("exp").value.slice(0, 11).replaceAll('-', '/'));
	let volt = parseFloat(row.children[15].innerHTML) >= 0 ? parseFloat(row.children[15].innerHTML) / 100 : 0.5;
	date_expiry.setHours(15, 30, 0, 0)
	let date_now = new Date();
	let int_rate = 0;
	let seconds = Math.floor((date_expiry - date_now) / 1000),
		minutes = seconds / 60,
		hours = minutes / 60,
		delta_t = (hours / 24) / 365.0;
	let spot = parseFloat(document.getElementsByClassName("token")[0].innerHTML);
	let strike = parseFloat(row.children[7].innerHTML);
	let callPrice = parseFloat(row.children[6].innerHTML);
	let d1 =
		(Math.log(spot / strike) + (int_rate + Math.pow(volt, 2) / 2) * delta_t) /
		(volt * Math.sqrt(delta_t)),
		d2 =
			(Math.log(spot / strike) + (int_rate - Math.pow(volt, 2) / 2) * delta_t) /
			(volt * Math.sqrt(delta_t));

	let fv_strike = strike * Math.exp(-1 * int_rate * delta_t);
	//For calculating CDF and PDF using gaussian library
	//Premium Price
	let call_premium =
		spot * distribution.cdf(d1) - fv_strike * distribution.cdf(d2),
		put_premium =
			fv_strike * distribution.cdf(-1 * d2) - spot * distribution.cdf(-1 * d1);
	//Option greeks
	let call_vega = spot * distribution.pdf(d1) * Math.sqrt(delta_t),
		put_vega = call_vega;
	volt = (-(call_premium - callPrice) / call_vega) + volt;
	row.children[15].innerHTML = (volt * 100).toFixed(2);
	d1 =
		(Math.log(spot / strike) + (int_rate + Math.pow(volt, 2) / 2) * delta_t) /
		(volt * Math.sqrt(delta_t)),
		d2 =
		(Math.log(spot / strike) + (int_rate - Math.pow(volt, 2) / 2) * delta_t) /
		(volt * Math.sqrt(delta_t));

	let call_delta = distribution.cdf(d1),
		put_delta = call_delta - 1;
	row.children[0].innerHTML = call_delta.toFixed(3);
	row.children[14].innerHTML = put_delta.toFixed(3);

	let call_gamma = distribution.pdf(d1) / (spot * volt * Math.sqrt(delta_t)),
		put_gamma = call_gamma;

	let call_theta =
		((-1 * spot * distribution.pdf(d1) * volt) / (2 * Math.sqrt(delta_t)) -
			int_rate * fv_strike * distribution.cdf(d2)) /
		365,
		put_theta =
			((-1 * spot * distribution.pdf(d1) * volt) / (2 * Math.sqrt(delta_t)) +
				int_rate * fv_strike * distribution.cdf(-1 * d2)) /
			365;
	row.children[1].innerHTML = call_theta.toFixed(3);
	row.children[13].innerHTML = put_theta.toFixed(3);

	let call_rho = (fv_strike * delta_t * distribution.cdf(d2)) / 100,
		put_rho = (-1 * fv_strike * delta_t * distribution.cdf(-1 * d2)) / 100;
}
//find iv in strategy builder
function expSort(a, b) {
	let ad = new Date(a.exd.replaceAll('-', '/'));
	let bd = new Date(b.exd.replaceAll('-', '/'));
	let at = ad.getTime();
	let bt = bd.getTime();
	return at - bt;
}
//sort expiry by date
let oiData = 0;
async function oiUpdate() {
	let intervalS = null;
	if (oiData == 0) {
		oiData = 1;
		intervalS = setInterval(() => {
			document.querySelector(`table#tableOI thead`).innerHTML = '';
			document.querySelector(`table#tableIV tbody`).innerHTML = '';
			document.querySelector(`table#tableOI tbody`).innerHTML = '';
			document.querySelector(`table#tableIV thead`).innerHTML = '';
			tableSort('mainTable', 'tableOI', 8);
			tableSort('mainTable', 'tableOI', 3);
			tableSort('mainTable', 'tableOI', 4);
			tableSort('mainTable', 'tableOI', 12);
			tableSort('mainTable', 'tableOI', 13);
			tableSort('mainTable', 'tableIV', 8);
			tableSort('mainTable', 'tableIV', 16);
			charting('OI', 'tableOI');
		}, 60000);
	}
	let time = new Date();
	if (time.getHours() > 16 && time.getHours() < 9) {
		clearInterval(intervalS);
	}
	// if (document.title === "Option Chain") {
	// 	let cePrv = 0;
	// 	let pePrv = 0;
	// 	let decayArrayCE = [];
	// 	let decayArrayPE = [];
	// 	let straddle = [];
	// 	let strangle = [];
	// 	let openPrice = {
	// 		uid: localStorage.getItem("uid"),
	// 		token: ltp.id,
	// 		exch: "NSE"
	// 	}
	// 	//save data in table foot ce pe
	// 	let target = await all(openPrice, "GetQuotes");
	// 	target = target.o ? parseFloat(target.o) : parseFloat(target.lp);
	// 	var closest = ocV.values.reduce(function (prev, curr) {
	// 		return (Math.abs(curr.strprc - target) < Math.abs(prev.strprc - target) ? curr : prev);
	// 	});
	// 	var closest1 = ocV.values.reduce(function (prev, curr) {
	// 		return (Math.abs(curr.strprc - (target + (target * -1.5 / 100))) < Math.abs(prev.strprc - (target + (target * -1.5 / 100))) ? curr : prev);
	// 	});
	// 	var closest2 = ocV.values.reduce(function (prev, curr) {
	// 		return (Math.abs(curr.strprc - (target + (target * 1.5 / 100))) < Math.abs(prev.strprc - (target + (target * 1.5 / 100))) ? curr : prev);
	// 	});
	// 	console.log(closest.strprc, closest1.strprc, closest2.strprc);

	// 	const chartProperties = {
	// 		width: 1112,
	// 		height: 500,
	// 		timeScale: {
	// 			timeVisible: true,
	// 			secondsVisible: true,
	// 		},
	// 		layout: {
	// 			textColor: "#000000",
	// 			//backgroundColor: "rgba(120, 123, 134, 1)", //, rgba(93, 96, 107, 1)
	// 		},
	// 		rightPriceScale: {
	// 			scaleMargins: {
	// 				top: 0.3,
	// 				bottom: 0.25,
	// 			},
	// 			//mode: LightweightCharts.PriceScaleMode.Percentage,
	// 		},
	// 		grid: {
	// 			vertLines: {
	// 				color: "rgba(120, 123, 134, 1)",
	// 				visible: false,
	// 			},
	// 			horzLines: {
	// 				color: "rgba(120, 123, 134, 1)",
	// 				visible: false,
	// 			},
	// 		},
	// 		crosshair: {
	// 			mode: LightweightCharts.CrosshairMode.Normal,
	// 			vertLine: {
	// 				color: "#000",
	// 			},
	// 			horzLine: {
	// 				color: "#000",
	// 			},
	// 		},
	// 	};
	// 	const chartDiv = document.getElementById(`decay`);
	// 	chartDiv.innerHTML = "";
	// 	const chartDiv1 = document.getElementById(`straddle`);
	// 	chartDiv1.innerHTML = "";
	// 	const chart = LightweightCharts.createChart(chartDiv, chartProperties);
	// 	const chart1 = LightweightCharts.createChart(chartDiv1, chartProperties);
	// 	await ocV.values.forEach(async (element) => {
	// 		let td = document.getElementById(`${element.strprc}`).parentElement;
	// 		let stTime = new Date();
	// 		stTime.setHours(15, 30, 0, 0);
	// 		let etTime = new Date();
	// 		etTime.setHours(9, 15, 0, 0);
	// 		let timeValues = {
	// 			uid: localStorage.getItem("uid"),
	// 			exch: element.exch,
	// 			token: element.token,
	// 			st: `${Math.round((stTime.getTime() - 604800000) / 1000)}`,
	// 			et: `${Math.round((etTime.getTime()) / 1000)}`,
	// 		};
	// 		await all(timeValues, "TPSeries").then((data) => {
	// 			data.stat == "Not_Ok"
	// 				? null
	// 				: element.optt === "CE"
	// 					? (td.children[4].innerHTML = data[0].oi)
	// 					: (td.children[10].innerHTML = data[0].oi);
	// 			data.stat == "Not_Ok" ? null : element.optt === "CE"
	// 				? cePrv += parseFloat(data[0].intc)
	// 				: pePrv += parseFloat(data[0].intc);
	// 		});
	// 		let CValues = {
	// 			uid: localStorage.getItem("uid"),
	// 			exch: element.exch,
	// 			token: element.token,
	// 			st: `${etTime.getTime() / 1000}`,
	// 			et: `${Math.round(new Date() / 1000)}`,
	// 		};//closing value
	// 		await all(CValues, "TPSeries").then((data) => {
	// 			data.stat == "Not_Ok"
	// 				? null
	// 				: element.optt == "CE"
	// 					? (td.children[3].innerHTML = data[0].oi)
	// 					: (td.children[11].innerHTML = data[0].oi);
	// 			if (data.stat != "Not_Ok") {
	// 				data.forEach(elem => {
	// 					if (element.strprc == closest.strprc) {
	// 						let noEntry = straddle.find(e => e.time == (new Date(elem.ssboe * 1000).getTime() / 1000) + 19800);
	// 						if (noEntry == undefined) {
	// 							let a = {
	// 								time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
	// 								value: parseInt(elem.intc)
	// 							}
	// 							straddle.push(a);
	// 						} else {
	// 							noEntry.value = noEntry.value + parseInt(elem.intc);
	// 						}
	// 					}
	// 					if (element.strprc == closest1.strprc || element.strprc == closest2.strprc) {
	// 						let noEntry = strangle.find(e => e.time == (new Date(elem.ssboe * 1000).getTime() / 1000) + 19800);
	// 						if (element.optt == "PE" && closest1.strprc == element.strprc) {
	// 							if (noEntry == undefined) {
	// 								let a = {
	// 									time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
	// 									value: parseInt(elem.intc)
	// 								}
	// 								strangle.push(a);
	// 							} else {
	// 								noEntry.value = noEntry.value + parseInt(elem.intc);
	// 							}
	// 						} else if (element.optt == "CE" && closest2.strprc == element.strprc) {
	// 							if (noEntry == undefined) {
	// 								let a = {
	// 									time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
	// 									value: parseInt(elem.intc)
	// 								}
	// 								strangle.push(a);
	// 							} else {
	// 								noEntry.value = noEntry.value + parseInt(elem.intc);
	// 							}
	// 						}
	// 					}
	// 					if (element.optt == "CE") {
	// 						let cE = decayArrayCE.find(e => e.time == (new Date(elem.ssboe * 1000).getTime() / 1000) + 19800)
	// 						if (cE == undefined) {
	// 							let a = {
	// 								time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
	// 								value: parseInt(elem.intc) - parseInt(cePrv)
	// 							}
	// 							decayArrayCE.push(a);
	// 						} else {
	// 							cE.value = cE.value + parseInt(elem.intc);
	// 						}
	// 					} else {
	// 						let pE = decayArrayPE.find(e => e.time == (new Date(elem.ssboe * 1000).getTime() / 1000) + 19800)
	// 						if (pE == undefined) {
	// 							let a = {
	// 								time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
	// 								value: parseInt(elem.intc) - parseInt(pePrv)
	// 							}
	// 							decayArrayPE.push(a)
	// 						} else {
	// 							pE.value = pE.value + parseInt(elem.intc);
	// 							console.log(pE.value)
	// 						}
	// 					}
	// 				})
	// 			}
	// 		});
	// 	});

	// document.querySelector(`table#tableOI thead`).innerHTML = '';
	// document.querySelector(`table#tableIV tbody`).innerHTML = '';
	// document.querySelector(`table#tableOI tbody`).innerHTML = '';
	// document.querySelector(`table#tableIV thead`).innerHTML = '';

	// 	setTimeout(() => {
	// 		tableSort('mainTable', 'tableOI', 8);
	// 		tableSort('mainTable', 'tableOI', 3);
	// 		tableSort('mainTable', 'tableOI', 4);
	// 		tableSort('mainTable', 'tableOI', 12);
	// 		tableSort('mainTable', 'tableOI', 13);
	// 		tableSort('mainTable', 'tableIV', 8);
	// 		tableSort('mainTable', 'tableIV', 16);
	// 		decayArrayCE.reverse();
	// 		decayArrayPE.reverse();
	// 		straddle.reverse();
	// 		strangle.reverse();
	// setTimeout(() => {
	// 			let candleSeries = chart.addLineSeries({
	// 				color: randomRgbColor(),
	// 				lineWidth: 2,
	// 			});
	// 			candleSeries.setData(decayArrayCE);
	// 			let candleSeries1 = chart.addLineSeries({
	// 				color: randomRgbColor(),
	// 				lineWidth: 2,
	// 			});
	// 			candleSeries1.setData(decayArrayPE);
	// 			let candleSeries3 = chart1.addLineSeries({
	// 				color: randomRgbColor(),
	// 				lineWidth: 2,
	// 			});
	// 			candleSeries3.setData(straddle);
	// 			let candleSeries4 = chart1.addLineSeries({
	// 				color: randomRgbColor(),
	// 				lineWidth: 2,
	// 			});
	// 			candleSeries4.setData(strangle);
	// 	charting('OI', 'tableOI');
	// 	charting('IV', 'tableIV');
	// }, 1000);
	// 	}, 10000)
	// }
}
async function optionSort(oFOV) {
	document.getElementById("search").value = "";
	let ocE = await oFOV.opt_exp.sort(expSort);
	let futE = await oFOV.fut.sort(expSort);
	let expLi = document.getElementById("exp");
	expLi.innerHTML = "";
	ocE.forEach((element) => {
		let option = document.createElement("option");
		option.innerHTML = `${element.exd} ${element.tsym}`;
		expLi.appendChild(option);
	});
	if (document.title == 'Strategy Builder') {
		let scriptN = document.getElementById('name').innerHTML;
		let scriptName = scriptN.slice(-4) == '-EQ ' ? scriptN.substring(0, scriptN.length - 4) : scriptN;
		scriptName = scriptN.slice(-2) == 'F ' ? scriptN.substring(0, scriptN.length - 9) : scriptN;
		let svalues = {
			uid: localStorage.getItem("uid"),
			stext: scriptName + ' ' + document.getElementById('exp').value.split(" ", 1),
		};
		let scripts = await all(svalues, "SearchScrip");
		//console.log(scripts);
		let ocvalues = {
			uid: localStorage.getItem("uid"),
			exch: "NFO",
			tsym: scripts.values[0].tsym,
			cnt: '2',
			strprc: document.getElementsByClassName("token")[0].innerHTML,
		};
		let ocV = await all(ocvalues, "GetOptionChain");

		let num = parseInt(ocV.values[0].strprc);
		let num1 = parseInt(ocV.values[1].strprc);
		let diff = Math.abs(num1 - num);
		document.getElementById('diff').innerHTML = diff;
		document.getElementById('strikeP').innerHTML = num;
		document.getElementById('ls').innerHTML = ocV.values[0].ls;
		document.getElementById('stratBody').innerHTML = null;
		addLeg();
		document.getElementById('add').toggleAttribute('disabled', false);
		document.getElementById('trA').toggleAttribute('disabled', false);
		document.getElementById('trS').toggleAttribute('disabled', false);
		setInterval(function () {
			let body = document.getElementById("stratBody");
			let net = 0, inRs = 0, delta = 0, theta = 0, gamma = 0, vega = 0;
			for (let i = 0; i < body.children.length; i++) {
				const element = body.children[i];
				let lots = element.querySelector('input[name="qty"]').value / document.getElementById('ls').innerHTML;
				net += element.querySelector('input[name="bs"]').checked ? element.children[6].innerHTML * lots : -element.children[6].innerHTML * lots;
				inRs += element.querySelector('input[name="bs"]').checked ? element.querySelector('input[name="qty"]').value * element.children[6].innerHTML : - element.querySelector('input[name="qty"]').value * element.children[6].innerHTML;
				delta += lots > 1 ? parseFloat(element.children[8].innerHTML) * lots : parseFloat(element.children[8].innerHTML);
				theta += lots > 1 ? parseFloat(element.children[9].innerHTML) * lots : parseFloat(element.children[9].innerHTML);
				gamma += lots > 1 ? parseFloat(element.children[10].innerHTML) * lots : parseFloat(element.children[10].innerHTML);
				vega += lots > 1 ? parseFloat(element.children[11].innerHTML) * lots : parseFloat(element.children[11].innerHTML);
			}
			document.getElementById("net").innerHTML = net.toFixed(3);
			document.getElementById("inRs").innerHTML = inRs.toFixed(3);
			document.getElementById("delta").innerHTML = delta.toFixed(3);
			document.getElementById("theta").innerHTML = theta.toFixed(3);
			document.getElementById("gamma").innerHTML = gamma.toFixed(4);
			document.getElementById("vega").innerHTML = vega.toFixed(3);
		}, 1000);
	}
	else {
		document.getElementById("strikeC").value = "30";
		setTimeout(async () => {
			let ltp = document.querySelector(".token");
			let ocvalues = {
				uid: localStorage.getItem("uid"),
				exch: "NFO",
				tsym: ocE[0].tsym,
				cnt: document.getElementById("strikeC").value,
				strprc: ltp.innerHTML,
			};
			let ocV = await all(ocvalues, "GetOptionChain");
			let ce = await ocV.values.filter((x) => x.optt === "CE");
			let sp = await ce.sort(
				(a, b) => parseFloat(a.strprc) - parseFloat(b.strprc)
			);
			let atm = await sp.reduce((a, b) => {
				return Math.abs(b.strprc - ocvalues.strprc) <
					Math.abs(a.strprc - ocvalues.strprc)
					? b
					: a;
			});
			let ocBody = document.getElementById("ocBody");
			ocBody.innerHTML = "";
			if (document.title === "Option Chain") {
				await sp.forEach((element) => {
					let row = ocBody.insertRow(-1);
					let cell1 = row.insertCell(0); //delta
					let cell2 = row.insertCell(1); //theta
					row.insertCell(2).setAttribute("onnmouseenter", "oiUpdate(event)"); //chg oi
					row.insertCell(3).setAttribute("onchange", "oiUpdate(event)"); //oi
					let cell5 = row.insertCell(4); //oi cl
					row.insertCell(5).innerHTML = 0;
					row.insertCell(6); // ltp
					let cell7 = row.insertCell(7); // strike
					row.insertCell(8); // ltp
					row.insertCell(9).innerHTML = 0;
					let cell9 = row.insertCell(10); //oi cl
					row.insertCell(11).setAttribute("onchange", "oiUpdate(event)"); // oi
					row.insertCell(12).setAttribute("onchange", "oiUpdate(event)"); //chg oi
					let cell12 = row.insertCell(13); // theta
					let cell13 = row.insertCell(14); // delta
					row.insertCell(15).innerHTML = 50; // iv
					let cell15 = row.insertCell(16); // straddle
					let cell16 = row.insertCell(17); //pcr
					cell7.setAttribute("id", element.strprc);
					cell7.innerHTML = element.strprc;
					element.strprc == atm.strprc ? row.setAttribute("class", "atm") : "";
				});
				let cePrv = 0;
				let pePrv = 0;
				let decayArrayCE = [];
				let decayArrayPE = [];
				let straddle = [];
				let strangle = [];
				let openPrice = {
					uid: localStorage.getItem("uid"),
					token: ltp.id,
					exch: "NSE"
				}
				let target = await all(openPrice, "GetQuotes");
				target = target.o ? parseFloat(target.o) : parseFloat(target.lp);
				var closest = ocV.values.reduce(function (prev, curr) {
					return (Math.abs(curr.strprc - target) < Math.abs(prev.strprc - target) ? curr : prev);
				});
				var closest1 = ocV.values.reduce(function (prev, curr) {
					return (Math.abs(curr.strprc - (target + (target * -1.5 / 100))) < Math.abs(prev.strprc - (target + (target * -1.5 / 100))) ? curr : prev);
				});
				var closest2 = ocV.values.reduce(function (prev, curr) {
					return (Math.abs(curr.strprc - (target + (target * 1.5 / 100))) < Math.abs(prev.strprc - (target + (target * 1.5 / 100))) ? curr : prev);
				});
				const chartDiv = document.getElementById(`decay`);
				chartDiv.innerHTML = "";
				const chartDiv1 = document.getElementById(`straddle`);
				chartDiv1.innerHTML = "";
				const chartProperties = {
					width: 632,
					height: 500,
					timeScale: {
						timeVisible: true,
						secondsVisible: true,
					},
					layout: {
						textColor: "#000000",
						background: {
							type: "solid",
							color: "white",// rgba(93, 96, 107, 1),
						},
						lineColor: 'black',
					},
					rightPriceScale: {
						scaleMargins: {
							top: 0.3,
							bottom: 0.25,
						},
						borderColor: 'black',
					},
					grid: {
						vertLines: {
							color: "rgba(120, 123, 134, 0)",
						},
						horzLines: {
							color: "rgba(120, 123, 134, 0)",
						},
					},
					crosshair: {
						mode: LightweightCharts.CrosshairMode.Normal,
						vertLine: {
							color: "#000",
						},
						horzLine: {
							color: "#000",
						},
					},
				};
				const chart = LightweightCharts.createChart(chartDiv, chartProperties);
				const chart1 = LightweightCharts.createChart(chartDiv1, chartProperties);
				await ocV.values.forEach(async (element) => {
					let td = document.getElementById(`${element.strprc}`).parentElement;
					let stTime = new Date();
					stTime.setHours(15, 30, 0, 0);
					let etTime = new Date();
					etTime.setHours(9, 15, 0, 0);
					let timeValues = {
						uid: localStorage.getItem("uid"),
						exch: element.exch,
						token: element.token,
						st: `${Math.round((stTime.getTime() - 604800000) / 1000)}`,
						et: `${Math.round((etTime.getTime()) / 1000)}`,
					};
					await all(timeValues, "TPSeries").then((data) => {
						data.stat == "Not_Ok"
							? null
							: element.optt === "CE"
								? (td.children[4].innerHTML = data[0].oi)
								: (td.children[10].innerHTML = data[0].oi);
						data.stat == "Not_Ok" ? null : element.optt === "CE"
							? cePrv += parseFloat(data[0].intc)
							: pePrv += parseFloat(data[0].intc);
					});
					let CValues = {
						uid: localStorage.getItem("uid"),
						exch: element.exch,
						token: element.token,
						st: `${etTime.getTime() / 1000}`,
						et: `${Math.round(new Date() / 1000)}`,
					};//closing value
					await all(CValues, "TPSeries").then((data) => {
						data.stat == "Not_Ok"
							? null
							: element.optt == "CE"
								? (td.children[3].innerHTML = data[0].oi)
								: (td.children[11].innerHTML = data[0].oi);
						if (data.stat != "Not_Ok") {
							data.forEach(elem => {
								if (element.strprc == closest.strprc) {
									let noEntry = straddle.find(e => e.time == (new Date(elem.ssboe * 1000).getTime() / 1000) + 19800);
									if (noEntry == undefined) {
										let a = {
											time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
											value: parseInt(elem.intc)
										}
										straddle.push(a);
									} else {
										noEntry.value = noEntry.value + parseInt(elem.intc);
									}
								}
								if (element.strprc == closest1.strprc || element.strprc == closest2.strprc) {
									let noEntry = strangle.find(e => e.time == (new Date(elem.ssboe * 1000).getTime() / 1000) + 19800);
									if (element.optt == "PE" && closest1.strprc == element.strprc) {
										if (noEntry == undefined) {
											let a = {
												time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
												value: parseInt(elem.intc)
											}
											strangle.push(a);
										} else {
											noEntry.value = noEntry.value + parseInt(elem.intc);
										}
									} else if (element.optt == "CE" && closest2.strprc == element.strprc) {
										if (noEntry == undefined) {
											let a = {
												time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
												value: parseInt(elem.intc)
											}
											strangle.push(a);
										} else {
											noEntry.value = noEntry.value + parseInt(elem.intc);
										}
									}
								}
								if (element.optt == "CE") {
									let cE = decayArrayCE.find(e => e.time == (new Date(elem.ssboe * 1000).getTime() / 1000) + 19800)
									if (cE == undefined) {
										let a = {
											time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
											value: parseInt(elem.intc) - parseInt(cePrv)
										}
										decayArrayCE.push(a);
									} else {
										cE.value = cE.value + parseInt(elem.intc);
									}
								} else {
									let pE = decayArrayPE.find(e => e.time == (new Date(elem.ssboe * 1000).getTime() / 1000) + 19800)
									if (pE == undefined) {
										let a = {
											time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
											value: parseInt(elem.intc) - parseInt(pePrv)
										}
										decayArrayPE.push(a)
									} else {
										pE.value = pE.value + parseInt(elem.intc);
										//console.log(pE.value)
									}
								}
							})
						}
					});
					if (element.optt === "CE") {
						td.children[6].setAttribute("id", element.token);
						td.children[2].innerHTML =
							td.children[3].innerHTML - td.children[4].innerHTML;
						parseInt(td.children[2].innerHTML) >= 0
							? td.children[2].setAttribute("class", "green")
							: td.children[2].setAttribute("class", "red");
					} else {
						td.children[8].setAttribute("id", element.token);
						td.children[12].innerHTML =
							td.children[11].innerHTML - td.children[10].innerHTML;
						parseInt(td.children[12].innerHTML) >= 0
							? td.children[12].setAttribute("class", "green")
							: td.children[12].setAttribute("class", "red");
					}
					sendMessageToSocket(`{"t":"t","k":"NFO|${element.token}"}`);
					// console.log(pePrv, cePrv)
				});

				document.querySelector(`table#tableOI thead`).innerHTML = '';
				document.querySelector(`table#tableIV tbody`).innerHTML = '';
				document.querySelector(`table#tableOI tbody`).innerHTML = '';
				document.querySelector(`table#tableIV thead`).innerHTML = '';

				setTimeout(() => {
					tableSort('mainTable', 'tableOI', 8);
					tableSort('mainTable', 'tableOI', 3);
					tableSort('mainTable', 'tableOI', 4);
					tableSort('mainTable', 'tableOI', 12);
					tableSort('mainTable', 'tableOI', 13);
					tableSort('mainTable', 'tableIV', 8);
					tableSort('mainTable', 'tableIV', 16);
					decayArrayCE.reverse();
					decayArrayPE.reverse();
					straddle.reverse();
					strangle.reverse();
					setTimeout(() => {
						let candleSeries = chart.addLineSeries({
							color: randomRgbColor(),
							lineWidth: 2,
							title: 'CE'
						});
						candleSeries.setData(decayArrayCE);
						let candleSeries1 = chart.addLineSeries({
							color: randomRgbColor(),
							lineWidth: 2,
							title: 'PE'
						});
						candleSeries1.setData(decayArrayPE);
						let candleSeries3 = chart1.addLineSeries({
							color: randomRgbColor(),
							lineWidth: 2,
							title: closest.strprc
						});
						candleSeries3.setData(straddle);
						let candleSeries4 = chart1.addLineSeries({
							color: randomRgbColor(),
							lineWidth: 2,
							title: `${closest1.strprc} + ${closest2.strprc}`
						});
						candleSeries4.setData(strangle);
						chart.timeScale().fitContent();
						chart1.timeScale().fitContent();
						charting('OI', 'tableOI');
						// charting('IV', 'tableIV');
						oiUpdate();
					}, 1000);
				}, 10000)
			} else {
				await sp.forEach((element) => {
					let row = ocBody.insertRow(-1);
					let cell1 = row.insertCell(0); //ce ltp
					let cell2 = row.insertCell(1); //strike
					let cell3 = row.insertCell(2); //pe ltp
					cell1.setAttribute("onmouseenter", "buttons(this)");
					cell2.setAttribute("id", element.strprc);
					cell2.innerHTML = element.strprc;
					cell3.setAttribute("onmouseenter", "buttons(this)");
					element.strprc == atm.strprc ? row.setAttribute("class", "atm") : "";
				});
				ocV.values.forEach((element) => {
					let td = document.getElementById(`${element.strprc}`).parentElement;

					element.optt === "CE"
						? td.children[0].setAttribute("id", element.token)
						: td.children[2].setAttribute("id", element.token);
					sendMessageToSocket(`{"t":"t","k":"NFO|${element.token}"}`);
				});
			}
		}, 200);
	}
}
async function changeExp() {
	let x = document.getElementById("exp").value;
	let strikeC = parseInt(document.getElementById("strikeC").value);
	strikeC = strikeC > 40 ? "40" : strikeC <= 0 ? "1" : `${strikeC}`;
	let ltp = document.querySelector(".token");
	let ocvalues = {
		uid: localStorage.getItem("uid"),
		exch: "NFO",
		tsym: x.slice(12),
		cnt: strikeC,
		strprc: ltp.innerHTML,
	};
	document.getElementById("strikeC").value = strikeC;
	let ocV = await all(ocvalues, "GetOptionChain");
	let ce = await ocV.values.filter((x) => x.optt === "CE");
	let sp = await ce.sort((a, b) => parseFloat(a.strprc) - parseFloat(b.strprc));
	let atm = await sp.reduce((a, b) => {
		return Math.abs(b.strprc - ocvalues.strprc) <
			Math.abs(a.strprc - ocvalues.strprc)
			? b
			: a;
	});
	let ocBody = document.getElementById("ocBody");
	ocBody.innerHTML = "";
	if (document.title === "Option Chain") {
		await sp.forEach((element) => {
			let row = ocBody.insertRow(-1);
			let cell1 = row.insertCell(0); //delta
			let cell2 = row.insertCell(1); //theta
			row.insertCell(2).setAttribute("onnmouseenter", "oiUpdate(event)"); //chg oi
			row.insertCell(3).setAttribute("onchange", "oiUpdate(event)"); //oi
			let cell5 = row.insertCell(4); //oi cl
			row.insertCell(5).innerHTML = 0;
			row.insertCell(6); // ltp
			let cell7 = row.insertCell(7); // strike
			row.insertCell(8); // ltp
			row.insertCell(9).innerHTML = 0;
			let cell9 = row.insertCell(10); //oi cl
			row.insertCell(11).setAttribute("onchange", "oiUpdate(event)"); // oi
			row.insertCell(12).setAttribute("onchange", "oiUpdate(event)"); //chg oi
			let cell12 = row.insertCell(13); // theta
			let cell13 = row.insertCell(14); // delta
			row.insertCell(15).innerHTML = 50; // iv
			let cell15 = row.insertCell(16); // straddle
			let cell16 = row.insertCell(17); //pcr
			cell7.setAttribute("id", element.strprc);
			cell7.innerHTML = element.strprc;
			element.strprc == atm.strprc ? row.setAttribute("class", "atm") : "";
		});
		let cePrv = 0;
		let pePrv = 0;
		let decayArrayCE = [];
		let decayArrayPE = [];
		let straddle = [];
		let strangle = [];
		let openPrice = {
			uid: localStorage.getItem("uid"),
			token: ltp.id,
			exch: "NSE"
		}
		let target = await all(openPrice, "GetQuotes");
		target = target.o ? parseFloat(target.o) : parseFloat(target.lp);
		var closest = ocV.values.reduce(function (prev, curr) {
			return (Math.abs(curr.strprc - target) < Math.abs(prev.strprc - target) ? curr : prev);
		});
		var closest1 = ocV.values.reduce(function (prev, curr) {
			return (Math.abs(curr.strprc - (target + (target * -1.5 / 100))) < Math.abs(prev.strprc - (target + (target * -1.5 / 100))) ? curr : prev);
		});
		var closest2 = ocV.values.reduce(function (prev, curr) {
			return (Math.abs(curr.strprc - (target + (target * 1.5 / 100))) < Math.abs(prev.strprc - (target + (target * 1.5 / 100))) ? curr : prev);
		});
		const chartDiv = document.getElementById(`decay`);
		chartDiv.innerHTML = "";
		const chartDiv1 = document.getElementById(`straddle`);
		chartDiv1.innerHTML = "";
		const chartProperties = {
			width: 632,
			height: 500,
			timeScale: {
				timeVisible: true,
				secondsVisible: true,
			},
			layout: {
				textColor: "#000000",
				background: {
					type: "solid",
					color: "white",// rgba(93, 96, 107, 1),
				},
				lineColor: 'black',
			},
			rightPriceScale: {
				scaleMargins: {
					top: 0.3,
					bottom: 0.25,
				},
				borderColor: 'black',
			},
			grid: {
				vertLines: {
					color: "rgba(120, 123, 134, 0)",
				},
				horzLines: {
					color: "rgba(120, 123, 134, 0)",
				},
			},
			crosshair: {
				mode: LightweightCharts.CrosshairMode.Normal,
				vertLine: {
					color: "#000",
				},
				horzLine: {
					color: "#000",
				},
			},
		};
		const chart = LightweightCharts.createChart(chartDiv, chartProperties);
		const chart1 = LightweightCharts.createChart(chartDiv1, chartProperties);
		await ocV.values.forEach(async (element) => {
			let td = document.getElementById(`${element.strprc}`).parentElement;
			let stTime = new Date();
			stTime.setHours(15, 30, 0, 0);
			let etTime = new Date();
			etTime.setHours(9, 15, 0, 0);
			let timeValues = {
				uid: localStorage.getItem("uid"),
				exch: element.exch,
				token: element.token,
				st: `${Math.round((stTime.getTime() - 604800000) / 1000)}`,
				et: `${Math.round((etTime.getTime()) / 1000)}`,
			};
			await all(timeValues, "TPSeries").then((data) => {
				data.stat == "Not_Ok"
					? null
					: element.optt === "CE"
						? (td.children[4].innerHTML = data[0].oi)
						: (td.children[10].innerHTML = data[0].oi);
				data.stat == "Not_Ok" ? null : element.optt === "CE"
					? cePrv += parseFloat(data[0].intc)
					: pePrv += parseFloat(data[0].intc);
			});
			let CValues = {
				uid: localStorage.getItem("uid"),
				exch: element.exch,
				token: element.token,
				st: `${etTime.getTime() / 1000}`,
				et: `${Math.round(new Date() / 1000)}`,
			};//closing value
			await all(CValues, "TPSeries").then((data) => {
				data.stat == "Not_Ok"
					? null
					: element.optt == "CE"
						? (td.children[3].innerHTML = data[0].oi)
						: (td.children[11].innerHTML = data[0].oi);
				if (data.stat != "Not_Ok") {
					data.forEach(elem => {
						if (element.strprc == closest.strprc) {
							let noEntry = straddle.find(e => e.time == (new Date(elem.ssboe * 1000).getTime() / 1000) + 19800);
							if (noEntry == undefined) {
								let a = {
									time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
									value: parseInt(elem.intc)
								}
								straddle.push(a);
							} else {
								noEntry.value = noEntry.value + parseInt(elem.intc);
							}
						}
						if (element.strprc == closest1.strprc || element.strprc == closest2.strprc) {
							let noEntry = strangle.find(e => e.time == (new Date(elem.ssboe * 1000).getTime() / 1000) + 19800);
							if (element.optt == "PE" && closest1.strprc == element.strprc) {
								if (noEntry == undefined) {
									let a = {
										time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
										value: parseInt(elem.intc)
									}
									strangle.push(a);
								} else {
									noEntry.value = noEntry.value + parseInt(elem.intc);
								}
							} else if (element.optt == "CE" && closest2.strprc == element.strprc) {
								if (noEntry == undefined) {
									let a = {
										time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
										value: parseInt(elem.intc)
									}
									strangle.push(a);
								} else {
									noEntry.value = noEntry.value + parseInt(elem.intc);
								}
							}
						}
						if (element.optt == "CE") {
							let cE = decayArrayCE.find(e => e.time == (new Date(elem.ssboe * 1000).getTime() / 1000) + 19800)
							if (cE == undefined) {
								let a = {
									time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
									value: parseInt(elem.intc) - parseInt(cePrv)
								}
								decayArrayCE.push(a);
							} else {
								cE.value = cE.value + parseInt(elem.intc);
							}
						} else {
							let pE = decayArrayPE.find(e => e.time == (new Date(elem.ssboe * 1000).getTime() / 1000) + 19800)
							if (pE == undefined) {
								let a = {
									time: new Date(elem.ssboe * 1000).getTime() / 1000 + 19800,
									value: parseInt(elem.intc) - parseInt(pePrv)
								}
								decayArrayPE.push(a)
							} else {
								pE.value = pE.value + parseInt(elem.intc);
							}
						}
					})
				}
			});
			if (element.optt === "CE") {
				td.children[6].setAttribute("id", element.token);
				td.children[2].innerHTML =
					td.children[3].innerHTML - td.children[4].innerHTML;
				parseInt(td.children[2].innerHTML) >= 0
					? td.children[2].setAttribute("class", "green")
					: td.children[2].setAttribute("class", "red");
			} else {
				td.children[8].setAttribute("id", element.token);
				td.children[12].innerHTML =
					td.children[11].innerHTML - td.children[10].innerHTML;
				parseInt(td.children[12].innerHTML) >= 0
					? td.children[12].setAttribute("class", "green")
					: td.children[12].setAttribute("class", "red");
			}
			sendMessageToSocket(`{"t":"t","k":"NFO|${element.token}"}`);
			// console.log(pePrv, cePrv)
		});

		document.querySelector(`table#tableOI thead`).innerHTML = '';
		document.querySelector(`table#tableIV tbody`).innerHTML = '';
		document.querySelector(`table#tableOI tbody`).innerHTML = '';
		document.querySelector(`table#tableIV thead`).innerHTML = '';

		setTimeout(() => {
			tableSort('mainTable', 'tableOI', 8);
			tableSort('mainTable', 'tableOI', 3);
			tableSort('mainTable', 'tableOI', 4);
			tableSort('mainTable', 'tableOI', 12);
			tableSort('mainTable', 'tableOI', 13);
			tableSort('mainTable', 'tableIV', 8);
			tableSort('mainTable', 'tableIV', 16);
			decayArrayCE.reverse();
			decayArrayPE.reverse();
			straddle.reverse();
			strangle.reverse();
			setTimeout(() => {
				let candleSeries = chart.addLineSeries({
					color: randomRgbColor(),
					lineWidth: 2,
					title: 'CE'
				});
				candleSeries.setData(decayArrayCE);
				let candleSeries1 = chart.addLineSeries({
					color: randomRgbColor(),
					lineWidth: 2,
					title: 'PE'
				});
				candleSeries1.setData(decayArrayPE);
				let candleSeries3 = chart1.addLineSeries({
					color: randomRgbColor(),
					lineWidth: 2,
					title: closest.strprc
				});
				candleSeries3.setData(straddle);
				let candleSeries4 = chart1.addLineSeries({
					color: randomRgbColor(),
					lineWidth: 2,
					title: `${closest1.strprc} + ${closest2.strprc}`
				});
				candleSeries4.setData(strangle);
				chart.timeScale().fitContent();
				chart1.timeScale().fitContent();
				charting('OI', 'tableOI');
				// charting('IV', 'tableIV');
			}, 1000);
		}, 10000)
	} else {
		sp.forEach((element) => {
			let row = ocBody.insertRow(-1);
			let cell1 = row.insertCell(0); //ce ltp
			let cell2 = row.insertCell(1); //strike
			let cell3 = row.insertCell(2); //pe ltp
			cell1.setAttribute("onmouseenter", "buttons(this)");
			cell2.setAttribute("id", element.strprc);
			cell2.innerHTML = element.strprc;
			cell3.setAttribute("onmouseenter", "buttons(this)");
			element.strprc == atm.strprc ? row.setAttribute("class", "atm") : "";
		});
		ocV.values.forEach((element) => {
			let td = document.getElementById(`${element.strprc}`).parentElement;
			if (element.optt === "CE") {
				td.children[0].setAttribute("id", element.token);
			} else {
				td.children[2].setAttribute("id", element.token);
			}
			sendMessageToSocket(`{ "t": "t", "k": "NFO|${element.token}" } `);
		});
	}
}
//changes oc when expiry changes
async function oc() {
	let token = null;
	let name = null;
	let val = document.getElementById("search").value;
	let opts = document.getElementById('dlist').childNodes;
	for (var i = 0; i < opts.length; i++) {
		if (opts[i].value === val) {
			// An item was selected from the list!
			// yourCallbackHere()
			token = opts[i].value;
			name = opts[i].innerHTML;
		}
	}
	let oFO = {
		uid: localStorage.getItem("uid"),
		exch: "NSE",
		token: token,
	};
	let oFOV = await all(oFO, "GetLinkedScrips");
	document.getElementById("name").innerHTML = name;
	let ltp = document.querySelector(".token");
	ltp.setAttribute('id', token);
	sendMessageToSocket(`{"t":"t","k":"NSE|${token}"}`);
	if (oFOV.fut.length != 0) { optionSort(oFOV); } else {
		alert('No Script');
		document.getElementById("search").value = "";
	}
}
//list all ce and pe in option chain
function tableSort(tableO, tableN, col) {
	if (document.querySelector(`table#${tableO} thead tr`).children.length >= col) {
		if (document.querySelector(`table#${tableN} thead`).children.length === 0) {
			document.querySelector(`table#${tableN} thead`).insertAdjacentHTML("beforeend", '<tr></tr>');
		}

		document.querySelector(`table#${tableN} thead tr`).insertAdjacentHTML("beforeend", '<th>' + document.querySelector(`table#${tableO} thead tr`).children[col - 1].innerHTML + '</th>');

		document.querySelectorAll(`table#${tableO} tbody tr`).forEach(function (a, i) {
			if (document.querySelector(`table#${tableN} tbody`).children.length != document.querySelector(`table#${tableO} tbody`).children.length) {
				document.querySelector(`table#${tableN} tbody`).insertAdjacentHTML("beforeend", '<tr></tr>');
			}
			document.querySelector(`table#${tableN} tbody tr:nth-child(` + (i + 1) + ')').insertAdjacentHTML("beforeend", '<td>' + a.children[col - 1].innerHTML + '</tr>');
		});
	}
}
//transfer data to new table
function charting(chartDiv, datatable) {
	Highcharts.chart(chartDiv, {
		data: {
			table: datatable
		},
		chart: {
			type: 'column',
			backgroundColor: '#565656',
			events: {
				addSeries: function () {
					var label = this.renderer.label('A series was added, about to redraw chart', 100, 120)
						.attr({
							fill: Highcharts.getOptions().colors[0],
							padding: 10,
							r: 5,
							zIndex: 8
						})
						.css({
							color: '#FFFFFF'
						})
						.add();

					setTimeout(function () {
						label.fadeOut();
					}, 1000);
				},
				load: function () {
					const chart = this;
					let a = chart.series.length;
					//console.log(a)
					//console.log(chart.series)
					// chart.series.forEach(series => {
					//     series.update({
					//         stack: series.name
					//     }, false);
					// });
					chart.series.forEach(series => {
						if (series.name.includes('CE')) {
							series.update({
								stack: 0
							}, true);
						}
						else if (series.name.includes('PE')) {
							series.update({
								stack: 1
							}, true);
						}
					});
					//console.log(chart.series.stack)
					chart.redraw();
				}
			}
		},
		title: {
			text: chartDiv,
			style: {
				color: '#000',
				font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
			}
		},
		xAxis: {
			type: 'category',
			//gridLineWidth: 1,
			lineColor: '#000',
			//tickColor: '#000',
			labels: {
				style: {
					color: 'white',
					font: '11px Trebuchet MS, Verdana, sans-serif'
				}
			},
			title: {
				style: {
					color: 'black',
					fontWeight: 'bold',
					fontSize: '16px',
					fontFamily: 'Trebuchet MS, Verdana, sans-serif'

				}
			}
		},
		yAxis: {
			//minorTickInterval: 'auto',
			lineColor: '#000',
			lineWidth: 1,
			tickWidth: 1,
			//tickColor: '#000',
			labels: {
				style: {
					color: '#000',
					font: '11px Trebuchet MS, Verdana, sans-serif'
				}
			},
			title: {
				allowDecimals: false,
				text: 'Amount',
				style: {
					color: '#000',
					fontWeight: 'bold',
					fontSize: '12px',
					fontFamily: 'Trebuchet MS, Verdana, sans-serif'
				}
			}
		},
		plotOptions: {
			column: {
				stacking: 'overlap'
			}
		},
		tooltip: {
			formatter: function () {
				return '<b>' + this.series.name + '</b><br/>' +
					this.point.y + ' ' + this.point.name.toLowerCase();
			}
		}
	});
}
//combined column chart 
function closeAlert() {
	document.getElementById("alert").classList.add("d-none");
}
//close alert button
async function findGreek(row) {
	let date_expiry = new Date(row.children[2].innerHTML.replaceAll('-', '/'));
	let volt = parseFloat(row.children[12].innerHTML) >= 0 ? parseFloat(row.children[12].innerHTML) / 100 : 0.5;
	if (row.children[12].innerHTML == 'NaN' || row.children[12].innerHTML == 'INFINITY') {
		volt = 0.5;
	}
	date_expiry.setHours(15, 30, 0, 0)
	let date_now = new Date();
	let int_rate = 0;
	let seconds = Math.floor((date_expiry - date_now) / 1000),
		minutes = seconds / 60,
		hours = minutes / 60,
		delta_t = hours / 24 / 365.0;
	let spot = parseFloat(document.getElementsByClassName("token")[0].innerHTML);
	let strike = parseFloat(row.querySelector('input[name="strike"]').value);
	let callPrice = parseFloat(row.children[6].innerHTML);
	let d1 =
		(Math.log(spot / strike) + (int_rate + Math.pow(volt, 2) / 2) * delta_t) /
		(volt * Math.sqrt(delta_t)),
		d2 =
			(Math.log(spot / strike) + (int_rate - Math.pow(volt, 2) / 2) * delta_t) /
			(volt * Math.sqrt(delta_t));

	let fv_strike = strike * Math.exp(-1 * int_rate * delta_t);

	//For calculating CDF and PDF using gaussian library
	//Premium Price
	let call_premium = row.querySelector('input[name="cepe"]').checked ?
		spot * distribution.cdf(d1) - fv_strike * distribution.cdf(d2)
		:
		fv_strike * distribution.cdf(-1 * d2) - spot * distribution.cdf(-1 * d1);
	//Option greeks
	let vega = spot * distribution.pdf(d1) * Math.sqrt(delta_t);
	volt = (-(call_premium - callPrice) / vega) + volt;
	row.children[11].innerHTML = vega.toFixed(3);
	row.children[12].innerHTML = (volt * 100).toFixed(2);
	d1 =
		(Math.log(spot / strike) + (int_rate + Math.pow(volt, 2) / 2) * delta_t) /
		(volt * Math.sqrt(delta_t)),
		d2 =
		(Math.log(spot / strike) + (int_rate - Math.pow(volt, 2) / 2) * delta_t) /
		(volt * Math.sqrt(delta_t));

	let call_delta = distribution.cdf(d1),
		put_delta = call_delta - 1;

	let gamma = distribution.pdf(d1) / (spot * volt * Math.sqrt(delta_t));
	row.children[10].innerHTML = gamma.toFixed(5);

	let call_theta =
		((-1 * spot * distribution.pdf(d1) * volt) / (2 * Math.sqrt(delta_t)) -
			int_rate * fv_strike * distribution.cdf(d2)) /
		365,
		put_theta =
			((-1 * spot * distribution.pdf(d1) * volt) / (2 * Math.sqrt(delta_t)) +
				int_rate * fv_strike * distribution.cdf(-1 * d2)) /
			365;
	if (row.querySelector('input[name="cepe"]').checked) {
		row.children[8].innerHTML = call_delta.toFixed(3);
		row.children[9].innerHTML = call_theta.toFixed(3);
	} else {
		row.children[8].innerHTML = put_delta.toFixed(3);
		row.children[9].innerHTML = put_theta.toFixed(3);
	}

	let call_rho = (fv_strike * delta_t * distribution.cdf(d2)) / 100,
		put_rho = (-1 * fv_strike * delta_t * distribution.cdf(-1 * d2)) / 100;
}
//find iv in oi table
function changeDiv(buttons) {
	let button = buttons.innerHTML;
	if (button == "Table") {
		document.getElementById("tableDiv").classList.remove('d-none')
		document.getElementById("decayS").classList.add('d-none')
		document.getElementById("OIGraph").classList.add('d-none');
	}
	else if (button == "OI Graph") {
		document.getElementById("tableDiv").classList.add('d-none')
		document.getElementById("decayS").classList.add('d-none')
		document.getElementById("OIGraph").classList.remove('d-none');
	}
	else if (button == "Decay Strangle") {
		document.getElementById("tableDiv").classList.add('d-none')
		document.getElementById("decayS").classList.remove('d-none')
		document.getElementById("OIGraph").classList.add('d-none');
	}
}
//change OI div
async function hedge() {
	let posvalues = {
		uid: localStorage.getItem("uid"),
		actid: localStorage.getItem("actid"),
	};
	let pos = await all(posvalues, "PositionBook");
	if (pos.stat == "Not_Ok") {
		document.getElementById("NSEHeader").classList.add("d-none");
		document.getElementById("noP").classList.remove("d-none");
	} else {
		let posLi = document.getElementById("posList");
		posLi.innerHTML = "";
		pos.forEach((element) => {
			let option = document.createElement("option");
			option.innerHTML = `${element.dname}`;
			//option.id = element.token;
			posLi.appendChild(option);
		});
		selPos(posLi)
	}
}
async function selPos(s) {
	let dname = s[s.selectedIndex].value; // get value
	let posvalues = {
		uid: localStorage.getItem("uid"),
		actid: localStorage.getItem("actid"),
	};
	let pos = await all(posvalues, "PositionBook");
	if (pos.stat == "Not_Ok") {
		document.getElementById("NSEHeader").classList.add("d-none");
		document.getElementById("noP").classList.remove("d-none");
	} else {
		pos.forEach((element) => {
			if (element.dname.slice(0, -1) == dname && element.netqty != 0) {
				document.getElementById('type').innerHTML =
					element.prd == "M" || element.prd == "C" ? "NRML" : "MIS";
				document.getElementById('dname').innerHTML = element.dname;
				document.getElementById('qty').innerHTML = element.netqty;
				document.getElementById('avgPrice').innerHTML =
					element.daybuyqty == "0" && element.daysellqty == "0"
						? element.upldprc
						: element.netavgprc;
				document.getElementsByClassName('ltp')[0].setAttribute("id", element.token);
				document.getElementById('strike').innerHTML = element.dname.split(" ")[2] + `&nbsp;`;
				document.getElementById('tsym').innerHTML = element.tsym;
				let ocvalues = {
					uid: localStorage.getItem("uid"),
					exch: "NFO",
					tsym: element.tsym,
					cnt: '2',
					strprc: element.dname.split(" ")[2],
				};
				all(ocvalues, "GetOptionChain").then((ocV) => {
					if (element.dname.split(" ")[3] == 'CE') {
						document.getElementsByClassName('bdtoken')[0].id = ocV.values[2].token;
						document.getElementById('btsym').innerHTML = ocV.values[2].tsym;
						chart('sellChart', element.token, 'NFO');
						chart('hedgeChart', ocV.values[2].token, 'NFO');
						sendMessageToSocket(`{"t":"t","k":"${ocV.values[2].exch}|${ocV.values[2].token}"}`);
					} else {
						document.getElementsByClassName('bdtoken')[0].id = ocV.values[5].token;
						document.getElementById('btsym').innerHTML = ocV.values[5].tsym;
						chart('sellChart', element.token, 'NFO');
						chart('hedgeChart', ocV.values[5].token, 'NFO');
						sendMessageToSocket(`{"t":"t","k":"${ocV.values[5].exch}|${ocV.values[5].token}"}`);
					}
				});
				sendMessageToSocket(`{"t":"t","k":"${element.exch}|${element.token}"}`);
				sendMessageToSocket(`{"t":"d","k":"${element.exch}|${element.token}"}`);
			}
		});
	}
}
function orderTimer() {
	setInterval(async () => {
		let posvalues = {
			uid: localStorage.getItem("uid"),
			actid: localStorage.getItem("actid"),
		};
		let pos = await all(posvalues, "PositionBook");
		placeOrder(pos);
	}, 1000);
}
async function placeOrder(pos) {
	for (let i = 0; i < pos.length; i++) {
		const elemenT = pos[i];
		if (elemenT.tsym == document.getElementById('tsym').innerHTML) {
			let bvalue = {
				uid: localStorage.getItem("uid"),
				actid: localStorage.getItem("actid"),
				exch: "NFO",
				tsym: document.getElementById("btsym").innerHTML,
				qty: `${Math.abs(document.getElementById("qty").innerHTML)}`,
				prc: '0',
				prd: document.getElementById("type").value == "MIS" ? "I" : "M",
				trgprc: '0',
				prctyp: 'MKT',
				ret: "DAY",
			};
			let buyArray = pos.filter(function (element) {
				return document.getElementById("btsym").innerHTML == element.tsym;
			})
			if (buyArray.length > 0) {
				let element = buyArray[0];
				if (parseFloat(document.getElementsByClassName('ltp')[0].innerHTML) > document.getElementById('buyAbove').value && element.netqty == '0') {
					bvalue.trantype = 'B';
					all(bvalue, "PlaceOrder");
				}
				else if (parseFloat(document.getElementsByClassName('ltp')[0].innerHTML) < document.getElementById('sellBelow').value && element.netqty > '0') {
					bvalue.trantype = 'S';
					all(bvalue, "PlaceOrder");
				}
			}
			else {
				if (parseFloat(document.getElementsByClassName('ltp')[0].innerHTML) > document.getElementById('buyAbove').value) {
					bvalue.trantype = 'B';
					all(bvalue, "PlaceOrder");
				}
			}
		}
	}
}
//hedge
async function indices() {
	await chart("nf", "26000", "NSE");
	await chart("bnf", "26009", "NSE");
	await chart("vix", "26017", "NSE");
	await chart("sensex", "1", "BSE");
	sendMessageToSocket(
		`{"t":"t","k":"NSE|26000#NSE|26009#NSE|26017#NSE|26011#NSE|26008#NSE|26062#NSE|26047#NSE|26030#NSE|26025#NSE|26029#NSE|26021#NSE|26023#NSE|26004"}`
	);
	sendMessageToSocket(`{"t":"t","k":"BSE|1"}`);
}
//indices
async function adjustment() {
	let posvalues = {
		uid: localStorage.getItem("uid"),
		actid: localStorage.getItem("actid"),
	};
	let pos = await all(posvalues, "PositionBook");
	if (pos.stat == "Not_Ok") {
		document.getElementById("NSEHeader").classList.add("d-none");
		document.getElementById("noP").classList.remove("d-none");
	} else {
		let fnoScirpts = [
			{ value: '26009', name: 'BANKNIFTY' },
			{ value: '26000', name: 'NIFTY' },
			{ value: '26037', name: 'FINNIFTY' },
			{ value: '26074', name: 'MIDCPNIFTY' },
			{ value: '7', name: 'AARTIIND' },
			{ value: '13', name: 'ABB' },
			{ value: '17903', name: 'ABBOTINDIA' },
			{ value: '21614', name: 'ABCAPITAL' },
			{ value: '30108', name: 'ABFRL' },
			{ value: '22', name: 'ACC' },
			{ value: '25', name: 'ADANIENT' },
			{ value: '15083', name: 'ADANIPORTS' },
			{ value: '11703', name: 'ALKEM' },
			{ value: '100', name: 'AMARAJABAT' },
			{ value: '1270', name: 'AMBUJACEM' },
			{ value: '157', name: 'APOLLOHOSP' },
			{ value: '163', name: 'APOLLOTYRE' },
			{ value: '212', name: 'ASHOKLEY' },
			{ value: '236', name: 'ASIANPAINT' },
			{ value: '14418', name: 'ASTRAL' },
			{ value: '263', name: 'ATUL' },
			{ value: '21238', name: 'AUBANK' },
			{ value: '275', name: 'AUROPHARMA' },
			{ value: '5900', name: 'AXISBANK' },
			{ value: '16669', name: 'BAJAJ - AUTO' },
			{ value: '16675', name: 'BAJAJFINSV' },
			{ value: '317', name: 'BAJFINANCE' },
			{ value: '335', name: 'BALKRISIND' },
			{ value: '341', name: 'BALRAMCHIN' },
			{ value: '2263', name: 'BANDHANBNK' },
			{ value: '4668', name: 'BANKBARODA' },
			{ value: '371', name: 'BATAINDIA' },
			{ value: '383', name: 'BEL' },
			{ value: '404', name: 'BERGEPAINT' },
			{ value: '422', name: 'BHARATFORG' },
			{ value: '10604', name: 'BHARTIARTL' },
			{ value: '438', name: 'BHEL' },
			{ value: '11373', name: 'BIOCON' },
			{ value: '2181', name: 'BOSCHLTD' },
			{ value: '526', name: 'BPCL' },
			{ value: '547', name: 'BRITANNIA' },
			{ value: '6994', name: 'BSOFT' },
			{ value: '10794', name: 'CANBK' },
			{ value: '583', name: 'CANFINHOME' },
			{ value: '637', name: 'CHAMBLFERT' },
			{ value: '685', name: 'CHOLAFIN' },
			{ value: '694', name: 'CIPLA' },
			{ value: '20374', name: 'COALINDIA' },
			{ value: '11543', name: 'COFORGE' },
			{ value: '15141', name: 'COLPAL' },
			{ value: '4749', name: 'CONCOR' },
			{ value: '739', name: 'COROMANDEL' },
			{ value: '17094', name: 'CROMPTON' },
			{ value: '5701', name: 'CUB' },
			{ value: '1901', name: 'CUMMINSIND' },
			{ value: '772', name: 'DABUR' },
			{ value: '8075', name: 'DALBHARAT' },
			{ value: '19943', name: 'DEEPAKNTR' },
			{ value: '15044', name: 'DELTACORP' },
			{ value: '10940', name: 'DIVISLAB' },
			{ value: '21690', name: 'DIXON' },
			{ value: '14732', name: 'DLF' },
			{ value: '881', name: 'DRREDDY' },
			{ value: '910', name: 'EICHERMOT' },
			{ value: '958', name: 'ESCORTS' },
			{ value: '676', name: 'EXIDEIND' },
			{ value: '1023', name: 'FEDERALBNK' },
			{ value: '14304', name: 'FSL' },
			{ value: '4717', name: 'GAIL' },
			{ value: '7406', name: 'GLENMARK' },
			{ value: '13528', name: 'GMRINFRA' },
			{ value: '1174', name: 'GNFC' },
			{ value: '10099', name: 'GODREJCP' },
			{ value: '17875', name: 'GODREJPROP' },
			{ value: '11872', name: 'GRANULES' },
			{ value: '1232', name: 'GRASIM' },
			{ value: '13197', name: 'GSPL' },
			{ value: '10599', name: 'GUJGASLTD' },
			{ value: '2303', name: 'HAL' },
			{ value: '9819', name: 'HAVELLS' },
			{ value: '7229', name: 'HCLTECH' },
			{ value: '1330', name: 'HDFC' },
			{ value: '4244', name: 'HDFCAMC' },
			{ value: '1333', name: 'HDFCBANK' },
			{ value: '467', name: 'HDFCLIFE' },
			{ value: '1348', name: 'HEROMOTOCO' },
			{ value: '1363', name: 'HINDALCO' },
			{ value: '17939', name: 'HINDCOPPER' },
			{ value: '1406', name: 'HINDPETRO' },
			{ value: '1394', name: 'HINDUNILVR' },
			{ value: '3417', name: 'HONAUT' },
			{ value: '30125', name: 'IBULHSGFIN' },
			{ value: '4963', name: 'ICICIBANK' },
			{ value: '21770', name: 'ICICIGI' },
			{ value: '18652', name: 'ICICIPRULI' },
			{ value: '14366', name: 'IDEA' },
			{ value: '11957', name: 'IDFC' },
			{ value: '11184', name: 'IDFCFIRSTB' },
			{ value: '220', name: 'IEX' },
			{ value: '11262', name: 'IGL' },
			{ value: '1512', name: 'INDHOTEL' },
			{ value: '1515', name: 'INDIACEM' },
			{ value: '10726', name: 'INDIAMART' },
			{ value: '11195', name: 'INDIGO' },
			{ value: '5258', name: 'INDUSINDBK' },
			{ value: '29135', name: 'INDUSTOWER' },
			{ value: '1594', name: 'INFY' },
			{ value: '5926', name: 'INTELLECT' },
			{ value: '1624', name: 'IOC' },
			{ value: '1633', name: 'IPCALAB' },
			{ value: '13611', name: 'IRCTC' },
			{ value: '1660', name: 'ITC' },
			{ value: '6733', name: 'JINDALSTEL' },
			{ value: '13270', name: 'JKCEMENT' },
			{ value: '11723', name: 'JSWSTEEL' },
			{ value: '18096', name: 'JUBLFOOD' },
			{ value: '1922', name: 'KOTAKBANK' },
			{ value: '24948', name: 'L & TFH' },
			{ value: '11654', name: 'LALPATHLAB' },
			{ value: '19234', name: 'LAURUSLABS' },
			{ value: '1997', name: 'LICHSGFIN' },
			{ value: '11483', name: 'LT' },
			{ value: '17818', name: 'LTI' },
			{ value: '18564', name: 'LTTS' },
			{ value: '10440', name: 'LUPIN' },
			{ value: '2031', name: 'M & M' },
			{ value: '13285', name: 'M & MFIN' },
			{ value: '19061', name: 'MANAPPURAM' },
			{ value: '4067', name: 'MARICO' },
			{ value: '10999', name: 'MARUTI' },
			{ value: '10447', name: 'MCDOWELL - N' },
			{ value: '31181', name: 'MCX' },
			{ value: '9581', name: 'METROPOLIS' },
			{ value: '2142', name: 'MFSL' },
			{ value: '17534', name: 'MGL' },
			{ value: '14356', name: 'MINDTREE' },
			{ value: '4204', name: 'MOTHERSON' },
			{ value: '4503', name: 'MPHASIS' },
			{ value: '2277', name: 'MRF' },
			{ value: '23650', name: 'MUTHOOTFIN' },
			{ value: '6364', name: 'NATIONALUM' },
			{ value: '13751', name: 'NAUKRI' },
			{ value: '14672', name: 'NAVINFLUOR' },
			{ value: '17963', name: 'NESTLEIND' },
			{ value: '15332', name: 'NMDC' },
			{ value: '11630', name: 'NTPC' },
			{ value: '20242', name: 'OBEROIRLTY' },
			{ value: '10738', name: 'OFSS' },
			{ value: '2475', name: 'ONGC' },
			{ value: '14413', name: 'PAGEIND' },
			{ value: '2412', name: 'PEL' },
			{ value: '18365', name: 'PERSISTENT' },
			{ value: '11351', name: 'PETRONET' },
			{ value: '14299', name: 'PFC' },
			{ value: '2664', name: 'PIDILITIND' },
			{ value: '24184', name: 'PIIND' },
			{ value: '10666', name: 'PNB' },
			{ value: '9590', name: 'POLYCAB' },
			{ value: '14977', name: 'POWERGRID' },
			{ value: '13147', name: 'PVR' },
			{ value: '15337', name: 'RAIN' },
			{ value: '2043', name: 'RAMCOCEM' },
			{ value: '18391', name: 'RBLBANK' },
			{ value: '15355', name: 'RECLTD' },
			{ value: '2885', name: 'RELIANCE' },
			{ value: '2963', name: 'SAIL' },
			{ value: '17971', name: 'SBICARD' },
			{ value: '21808', name: 'SBILIFE' },
			{ value: '3045', name: 'SBIN' },
			{ value: '3103', name: 'SHREECEM' },
			{ value: '3150', name: 'SIEMENS' },
			{ value: '3273', name: 'SRF' },
			{ value: '4306', name: 'SRTRANSFIN' },
			{ value: '3351', name: 'SUNPHARMA' },
			{ value: '13404', name: 'SUNTV' },
			{ value: '10243', name: 'SYNGENE' },
			{ value: '3405', name: 'TATACHEM' },
			{ value: '3721', name: 'TATACOMM' },
			{ value: '3432', name: 'TATACONSUM' },
			{ value: '3456', name: 'TATAMOTORS' },
			{ value: '3426', name: 'TATAPOWER' },
			{ value: '3499', name: 'TATASTEEL' },
			{ value: '11536', name: 'TCS' },
			{ value: '13538', name: 'TECHM' },
			{ value: '3506', name: 'TITAN' },
			{ value: '3518', name: 'TORNTPHARM' },
			{ value: '13786', name: 'TORNTPOWER' },
			{ value: '1964', name: 'TRENT' },
			{ value: '8479', name: 'TVSMOTOR' },
			{ value: '16713', name: 'UBL' },
			{ value: '11532', name: 'ULTRACEMCO' },
			{ value: '11287', name: 'UPL' },
			{ value: '3063', name: 'VEDL' },
			{ value: '3718', name: 'VOLTAS' },
			{ value: '18011', name: 'WHIRLPOOL' },
			{ value: '3787', name: 'WIPRO' },
			{ value: '3812', name: 'ZEEL' },
			{ value: '7929', name: 'ZYDUSLIFE' }
		]
		let data1 = [];
		pos.forEach((element) => {
			if (element.exch == "NSE" || element.exch == "BSE" || element.exch == "MCX") {
				null;
			}
		});
		for (let i = 0; i < fnoScirpts.length; i++) {
			let arr = pos.filter(function (element) {
				return element.exch == "NFO" && element.dname.split(" ")[0] == fnoScirpts[i].name;
			})
			//console.log(arrR)
			arr.length > 0 ? data1.push([fnoScirpts[i].value, fnoScirpts[i].name, arr]) : null;
		};
		data1.forEach(async (element) => {
			let openPrice = {
				uid: localStorage.getItem("uid"),
				token: element[0],
				exch: "NSE"
			}
			let target = await all(openPrice, "GetQuotes");
			let ocvalues = {
				uid: localStorage.getItem("uid"),
				exch: element[2][0].exch,
				tsym: element[2][0].tsym,
				cnt: '2',
				strprc: target.lp,
			};
			let ocV = await all(ocvalues, "GetOptionChain");
			let oFO = {
				uid: localStorage.getItem("uid"),
				exch: "NSE",
				token: element[0],
			};
			let oFOV = await all(oFO, "GetLinkedScrips");
			let ocE = await oFOV.opt_exp.sort(expSort);
			let num = parseInt(ocV.values[0].strprc);
			let num1 = parseInt(ocV.values[1].strprc);
			let gap = Math.abs(num1 - num);
			let tabContent = document.getElementsByClassName('tab-content')[0];
			let div = document.createElement('div');
			let infoDiv = document.createElement('div');
			infoDiv.setAttribute('onclick', 'hideTables(this)');
			infoDiv.setAttribute('class', 'order-head')
			let nameSpan = document.createElement('span');
			nameSpan.innerHTML = element[1] + ` `;
			let token = document.createElement('span');
			token.id = element[0];
			let strikeP = document.createElement('span');
			strikeP.innerHTML = ` ` + num + ` `;
			let ls = document.createElement('span');
			ls.innerHTML = ` ` + ocV.values[0].ls + ` `;
			let diff = document.createElement('span');
			diff.innerHTML = ` ` + gap + ` `;
			let expInput = document.createElement('select');
			//expInput.classList.add('input-group', 'form-control');
			expInput.innerHTML = "";
			ocE.forEach((element) => {
				let option = document.createElement("option");
				option.innerHTML = `${element.exd} ${element.tsym}`;
				expInput.appendChild(option);
			});
			let table = document.createElement("TABLE");
			table.classList.add('table', 'table-striped', 'position-table', 'd-none')
			let thead = table.createTHead();
			let tbody = document.createElement('tbody');
			let noP = document.querySelector('#noP');
			let tHeadRow = thead.insertRow(0);
			tHeadRow.insertCell(0).innerHTML = `0`;
			tHeadRow.insertCell(1).innerHTML = `B/S`;
			tHeadRow.insertCell(2).innerHTML = `Expiry`;
			tHeadRow.insertCell(3).innerHTML = `Strike`;
			tHeadRow.insertCell(4).innerHTML = `CE/PE`;
			tHeadRow.insertCell(5).innerHTML = `QTY`;
			tHeadRow.insertCell(6).innerHTML = `Entry Price`;
			tHeadRow.insertCell(7).innerHTML = `N/M`;
			tHeadRow.insertCell(8).innerHTML = `IV`;
			tHeadRow.insertCell(9).classList.add('d-none');
			tHeadRow.insertCell(10).innerHTML = `Del`;
			tabContent.insertBefore(div, noP);
			table.appendChild(tbody);
			infoDiv.appendChild(nameSpan);
			infoDiv.appendChild(token);
			infoDiv.appendChild(strikeP);
			infoDiv.appendChild(ls);
			infoDiv.appendChild(diff);
			infoDiv.appendChild(expInput);
			div.appendChild(infoDiv);
			div.appendChild(table);
			let buttonsRow = document.createElement('div');
			buttonsRow.classList.add('d-none');
			buttonsRow.classList.add('row');
			buttonsRow.innerHTML = `<div class="col-md-3">
			   <div class="strat-button">
				  <button class="crypt-button-green-full" onclick="tradeAdjAll(this)">Trade
					 All</button>
			   </div>
			</div>
			<div class="col-md-3">
			   <div class="strat-button">
				  <button class="crypt-button-green-full" onclick="tradeAdjS(this)">Trade
					 Selected</button>
			   </div>
			</div>
			<div class="col-md-3">
			   <div class="strat-button">
				  <button class="crypt-button-green-full" onclick="addAdjLeg(this)" id="add">Add</button>
			   </div>
			</div>
			<div class="col-md-3">
			   <div class="strat-button">
				  <button class="crypt-button-green-full" onclick="adjGraph(this)">PayOff</button>
			   </div>
			</div>`;
			div.appendChild(buttonsRow);
			addPos(element, tbody);
			sendMessageToSocket(
				`{"t":"t","k":"NSE|${element[0]}"}`
			);
		});
	}
}
//adjustment
async function addPos(posList, tbody) {
	for (let index = 0; index < posList[2].length; index++) {
		const element = posList[2][index];
		let row = tbody.insertRow();
		row.insertCell(0).innerHTML = ``;
		row.insertCell(1).innerHTML = element.netqty >= 0
			? `<label class="toggle"><input type="checkbox" name="bs" checked disabled><span class="labels" data-on="B" data-off="S"></span></label>`
			: `<label class="toggle"><input type="checkbox" name="bs" disabled><span class="labels" data-on="B" data-off="S"></span></label>`
		row.insertCell(2).innerHTML = element.dname.split(" ")[1];
		row.insertCell(3).innerHTML = `<label><input name="strike" value="${parseInt(element.dname.split(" ")[2])}" class="form-control" disabled></label>`;
		row.insertCell(4).innerHTML = element.dname.split(" ")[3] == 'CE'
			? `<label class="toggle"><input type="checkbox" name="cepe" checked disabled><span class="labels" data-on="CE" data-off="PE"></span></label>`
			: `<label class="toggle"><input type="checkbox" name="cepe" disabled><span class="labels" data-on="CE" data-off="PE"></span></label>`
			;
		row.insertCell(5).innerHTML = `<input name="qty" value="${Math.abs(element.netqty)}" class="form-control" disabled>`
		row.insertCell(6).innerHTML =
			element.daybuyqty == "0" && element.daysellqty == "0"
				? element.upldprc
				: element.netavgprc;
		row.insertCell(7).innerHTML = `<select class="form-control" name="NM" disabled>
		<option>${element.prd == "M" || element.prd == "C" ? "NRML" : "MIS"}</option>
	</select>`;
		row.insertCell(8).innerHTML = 50;
		let cell9 = row.insertCell(9);
		cell9.innerHTML = element.tsym;
		cell9.classList.add('d-none');
		let cell10 = row.insertCell(10);
		setInterval(async () => {
			let quotesValues = {
				uid: localStorage.getItem("uid"),
				exch: element.exch,
				token: element.token
			}
			let quote = await all(quotesValues, "GetQuotes");
			cell10.innerHTML = quote.lp;
			calcIV(row);
		}, 60000);
		let quotesValues = {
			uid: localStorage.getItem("uid"),
			exch: element.exch,
			token: element.token
		}
		let quote = await all(quotesValues, "GetQuotes");
		cell10.innerHTML = quote.lp;
		calcIV(row);
	}
}
//
async function addAdjLeg(addButton) {
	let table = addButton.parentElement.parentElement.parentElement.previousElementSibling;
	let scriptName = table.previousElementSibling.children[0].innerHTML;
	let strike = table.previousElementSibling.children[2].innerHTML;
	let ls = parseInt(table.previousElementSibling.children[3].innerHTML);
	let diff = parseInt(table.previousElementSibling.children[4].innerHTML);
	let expiry = table.previousElementSibling.children[5].value.split(" ", 1);
	let row = table.children[1].insertRow();
	row.insertCell(0).innerHTML = `<td>
	<input type="checkbox" checked name="boxes">
	</td>`;
	//row.querySelector('input[name="bs"]').checked ? "B" : "S"
	row.insertCell(1).innerHTML =
		`<label class="toggle"><input type="checkbox" name="bs" onchange="changeAdjStrike(this)"><span class="labels" data-on="B" data-off="S"></span></label>`
	let svalues = {
		uid: localStorage.getItem("uid"),
		stext: scriptName + ' ' + expiry + ' ' + strike + ' PE',
		exch: "NFO",
	};
	let scripts = await all(svalues, "SearchScrip");
	let element = scripts.values[0];
	row.insertCell(2).innerHTML = element.dname.split(" ")[1];
	row.insertCell(3).innerHTML = `<label><input type="number" name="strike" onchange="changeAdjStrike(this)" value="${parseInt(element.dname.split(" ")[2])}" step='${diff}' class="form-control"></label>`;
	row.insertCell(4).innerHTML = `<label class="toggle"><input type="checkbox" onchange="changeAdjStrike(this)" name="cepe"><span class="labels" data-on="CE" data-off="PE"></span></label>`
		;
	row.insertCell(5).innerHTML = `<input type="number" class="form-control" value='${ls}'
	min='${ls}' step='${ls}' name="qty">`
	row.insertCell(6).id = element.token;
	row.insertCell(7).innerHTML = `<select class="form-control" name="NM">
	<option>NRML</option>
	<option>MIS</option>
</select>`;
	row.insertCell(8).innerHTML = 50;
	let cell9 = row.insertCell(9);
	cell9.innerHTML = element.tsym;
	cell9.classList.add('d-none');
	row.insertCell(10).innerHTML += `<span class="badge bg-secondary strat-badge"
			onclick="this.parentElement.parentElement.remove()">DEL</span>`;
	sendMessageToSocket(`{"t": "t", "k": "NFO|${element.token}"}`);
	calcIV(row);
}
async function changeAdjStrike(strikeList) {
	let row = await strikeList.parentElement.parentElement.parentElement;
	let scriptName = await row.parentElement.parentElement.previousElementSibling.children[0].innerHTML;
	let svalues = {
		uid: localStorage.getItem("uid"),
		stext: scriptName + ' ' + row.children[2].innerText + ' ' + row.querySelector('input[name="strike"]').value + (row.querySelector('input[name="cepe"]').checked ? ' CE' : ' PE'),
		exch: "NFO",
	};
	let scripts = await all(svalues, "SearchScrip");
	row.children[6].id = scripts.values[0].token;
	row.children[8].innerHTML = 50;
	row.children[9].innerHTML = scripts.values[0].tsym;
	sendMessageToSocket(`{ "t": "t", "k": "NFO|${scripts.values[0].token}" } `);
	calcIV(row);
	//limits();
	//basketMargins();
}
function calcIV(row) {
	let date_expiry = new Date(row.children[2].innerHTML.replaceAll('-', '/'));
	let volt = parseFloat(row.children[8].innerHTML) >= 0 ? parseFloat(row.children[8].innerHTML) / 100 : 0.5;
	if (row.children[8].innerHTML == 'NaN' || row.children[8].innerHTML == 'INFINITY') {
		volt = 0.5;
	}
	date_expiry.setHours(15, 30, 0, 0)
	let date_now = new Date();
	let int_rate = 0;
	let seconds = Math.floor((date_expiry - date_now) / 1000),
		minutes = seconds / 60,
		hours = minutes / 60,
		delta_t = hours / 24 / 365.0;
	let spot = parseFloat(row.parentElement.parentElement.previousElementSibling.children[1].innerHTML);
	let strike = parseInt(row.children[3].children[0].children[0].value);
	let callPrice = row.children[0].innerHTML == '' ? parseFloat(row.children[10].innerHTML) : parseFloat(row.children[6].innerHTML);
	let d1 =
		(Math.log(spot / strike) + (int_rate + Math.pow(volt, 2) / 2) * delta_t) /
		(volt * Math.sqrt(delta_t)),
		d2 =
			(Math.log(spot / strike) + (int_rate - Math.pow(volt, 2) / 2) * delta_t) /
			(volt * Math.sqrt(delta_t));
	let fv_strike = strike * Math.exp(-1 * int_rate * delta_t);
	//For calculating CDF and PDF using gaussian library
	//Premium Price
	let call_premium = row.children[4].children[0].children[0].checked == "TRUE" ?
		spot * distribution.cdf(d1) - fv_strike * distribution.cdf(d2)
		:
		fv_strike * distribution.cdf(-1 * d2) - spot * distribution.cdf(-1 * d1);
	//Option greeks
	let vega = spot * distribution.pdf(d1) * Math.sqrt(delta_t);
	volt = (-(call_premium - callPrice) / vega) + volt;
	row.children[8].innerHTML = (volt * 100).toFixed(2);
}
function tradeAdjAll(button) {
	let table = button.parentElement.parentElement.parentElement.previousElementSibling;
	let checkboxes = table.querySelectorAll("input[name='boxes']");
	let rows = [];
	for (let checkbox of checkboxes) {
		let row = checkbox.parentElement.parentElement;
		rows.push(row);
	}
	rows.sort((a, b) => {
		return a.querySelector("input[name='qty']") - b.querySelector("input[name='qty']");
	});
	rows.forEach((row, i) => {
		setTimeout(
			function () {
				let value = {
					uid: localStorage.getItem("uid"),
					actid: localStorage.getItem("actid"),
					exch: 'NFO',
					tsym: row.children[9].innerHTML,
					qty: row.querySelector('input[name="qty"]').value,
					prc: "0",
					prd:
						row.querySelector('select[name="NM"]').value == "MIS"
							? "I"
							: "M",
					trantype: row.querySelector('input[name="bs"]').checked ? "B" : "S",
					prctyp: "MKT",
					ret: "DAY",
				};
				all(value, "PlaceOrder");
			}, i * 200)
	});
}
//trade all adjustment builder
function tradeAdjS(button) {
	let table = button.parentElement.parentElement.parentElement.previousElementSibling;
	let checkboxes = table.querySelectorAll("input[name='boxes']");
	let rows = [];
	for (let checkbox of checkboxes) {
		if (checkbox.checked == true) {
			let row = checkbox.parentElement.parentElement;
			rows.push(row);
		}
	}
	rows.sort((a, b) => {
		return a.querySelector("input[name='qty']") - b.querySelector("input[name='qty']");
	});
	rows.forEach((row, i) => {
		setTimeout(
			function () {
				let value = {
					uid: localStorage.getItem("uid"),
					actid: localStorage.getItem("actid"),
					exch: 'NFO',
					tsym: row.children[9].innerHTML,
					qty: row.querySelector('input[name="qty"]').value,
					prc: "0",
					prd:
						row.querySelector('select[name="NM"]').value == "MIS"
							? "I"
							: "M",
					trantype: row.querySelector('input[name="bs"]').checked ? "B" : "S",
					prctyp: "MKT",
					ret: "DAY",
				};
				all(value, "PlaceOrder");
			}, i * 200)
	});
}
//trade selected adjustment builder
function hideNav(button) {
	let navbar = button.nextElementSibling;
	navbar.classList.toggle("whide");
	button.classList.toggle("mt");
}
// hide navBar