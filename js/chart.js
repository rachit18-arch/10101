async function stratGraph() {
    if (document.getElementById('dte').value == "") {
        alert("Select Payoff Date")
    }
    else {
        let liveP = parseInt(document.getElementsByClassName("token")[0].innerHTML);
        let date_expiry = new Date(document.getElementById('dte').value.replaceAll('-', '/'));
        date_expiry.setHours(15, 30, 0, 0)
        let date_now = new Date();
        let sec = Math.floor((date_expiry - date_now) / 1000),
            min = sec / 60,
            ho = min / 60;
        let int_rate = 0;
        vixValues = {
            uid: localStorage.getItem("uid"),
            exch: "NSE",
            token: "26017"
        }
        let vix = await all(vixValues, 'GetQuotes');
        let sigma = (liveP * (parseFloat(vix.lp) / 100) * Math.sqrt(ho / 24) / Math.sqrt(365)).toFixed(2);
        let perce = liveP > 10000 ? 2.5 : liveP > 1000 ? 10 : 20;
        let cmp = parseInt(liveP - (sigma * perce));
        let cmpL = parseInt(liveP - (sigma * perce));
        let cmpH = parseInt(liveP + (sigma * perce));
        let greekTable = document.getElementById('greekTable');
        let liveGreekTable = document.getElementById('liveGreekTable');
        let strikeArray = [];
        greekTable.innerHTML = '';
        liveGreekTable.innerHTML = '';
        setTimeout(() => {
            for (let index = cmpL; index < cmpH; index++) {
                let row = greekTable.insertRow(-1);
                let row2 = liveGreekTable.insertRow(-1);
                row.insertCell(0).innerHTML = cmp;
                row2.insertCell(0).innerHTML = cmp;
                if (document.title == 'Strategy Builder') {
                    let body = document.getElementById("stratBody");
                    let totalPNL = 0;
                    for (let i = 0; i < body.children.length; i++) {
                        const element = body.children[i];
                        let qty = element.querySelector('input[name="bs"]').checked ? element.querySelector('input[name="qty"]').value : -element.querySelector('input[name="qty"]').value;
                        let iv = parseFloat(element.children[12].innerHTML) / 100;
                        let entryPrice = parseFloat(element.children[6].innerHTML).toFixed(2);
                        let strike = parseInt(element.querySelector('input[name="strike"]').value);
                        if (index == cmpL) {
                            strikeArray.push(strike);
                        }
                        let ce = element.querySelector('input[name="cepe"]').checked ? 1 : 0;
                        let a = null;
                        let dte = new Date(element.children[2].innerHTML.replaceAll('-', '/'));
                        dte.setHours(15, 30, 0, 0)
                        if (dte.getTime() != date_expiry.getTime()) {
                            let diff = dte.getTime() - date_expiry.getTime()
                            let seconds2 = Math.floor(diff / 1000),
                                minutes2 = seconds2 / 60,
                                hours2 = minutes2 / 60;
                            let delta_t2 = (hours2 / 24) / 365.0;
                            let fv_strike2 = strike * Math.exp(-1 * int_rate * delta_t2);
                            let d12 =
                                (Math.log(cmp / strike) + (int_rate + Math.pow(iv, 2) / 2) * delta_t2) /
                                (iv * Math.sqrt(delta_t2)),
                                d22 =
                                    (Math.log(cmp / strike) + (int_rate - Math.pow(iv, 2) / 2) * delta_t2) /
                                    (iv * Math.sqrt(delta_t2));

                            let call_premium2 = element.querySelector('input[name="cepe"]').checked ?
                                cmp * distribution.cdf(d12) - fv_strike2 * distribution.cdf(d22)
                                :
                                fv_strike2 * distribution.cdf(-1 * d22) - cmp * distribution.cdf(-1 * d12);
                            a = call_premium2;
                        }
                        else {
                            if (ce == 1) {
                                a = Math.max(cmp - strike, 0)
                            } else {
                                a = Math.max(strike - cmp, 0)
                            };
                        }
                        let seconds = Math.floor((dte - date_now) / 1000),
                            minutes = seconds / 60,
                            hours = minutes / 60;
                        delta_t = (hours / 24) / 365.0;
                        let fv_strike = strike * Math.exp(-1 * int_rate * delta_t);
                        let d1 =
                            (Math.log(cmp / strike) + (int_rate + Math.pow(iv, 2) / 2) * delta_t) /
                            (iv * Math.sqrt(delta_t)),
                            d2 =
                                (Math.log(cmp / strike) + (int_rate - Math.pow(iv, 2) / 2) * delta_t) /
                                (iv * Math.sqrt(delta_t));
                        let call_premium = element.querySelector('input[name="cepe"]').checked ?
                            cmp * distribution.cdf(d1) - fv_strike * distribution.cdf(d2)
                            :
                            fv_strike * distribution.cdf(-1 * d2) - cmp * distribution.cdf(-1 * d1);
                        let premiumPNL = a - entryPrice;
                        let rupeesPNL = (premiumPNL * qty).toFixed(2);
                        row.insertCell(-1).innerHTML = rupeesPNL;
                        let livePremiumPNL = call_premium - entryPrice;
                        let liveRupeesPNL = (livePremiumPNL * qty).toFixed(2);
                        row2.insertCell(-1).innerHTML = liveRupeesPNL;
                    }
                }
                //cmp += parseInt(cmp * 0.001);
                liveP > 1000 ? cmp += 1 : liveP > 100 ? cmp += 0.5 : cmp += 0.25
            }
        }, 200);
        setTimeout(() => {
            let gt = document.getElementById('greekTable1');
            gt.innerHTML = '';
            let closest = 0;
            let pnlArray = [];
            for (let i = 0; i < greekTable.children.length; i++) {
                let row = greekTable.children[i];
                let row2 = liveGreekTable.children[i];
                let a = 0;
                let b = 0;
                if (row.children[0].innerHTML >= cmpL && row.children[0].innerHTML <= cmpH) {
                    let total = gt.insertRow(-1);
                    for (let j = 0; j < row.children.length; j++) {
                        const element = row.children[j];
                        const element2 = row2.children[j];
                        if (j != 0) {
                            a += parseFloat(element.innerHTML)
                            b += parseFloat(element2.innerHTML)
                        } else {
                            total.insertCell(0).innerHTML = greekTable.children[i].children[0].innerHTML;
                        }
                    }
                    total.insertCell(-1).innerHTML = a.toFixed(2);
                    total.insertCell(-1).innerHTML = b.toFixed(2);
                }
                pnlArray.push([parseInt(row.children[0].innerHTML), parseInt(a)])
            }
            setTimeout(() => {
                const max = pnlArray.reduce(function (prev, current) {
                    return (prev[1] > current[1]) ? prev : current
                })
                document.getElementById('profit').innerHTML = max[1];
                const min = pnlArray.reduce(function (prev, current) {
                    return (prev[1] < current[1]) ? prev : current
                })
                document.getElementById('loss').innerHTML = min[1];
                document.getElementById('rr').innerHTML = Math.abs(max[1] / min[1]).toFixed(2);
                document.getElementById('eROI').innerHTML = (max[1] / parseInt(document.getElementById('margin').innerHTML) * 100).toFixed(2) + '%'
                strikeArray.unshift(pnlArray[0][0])
                strikeArray.push(pnlArray[pnlArray.length - 1][0])
                strikeArray.sort((a, b) => a - b);
                let tempNum = 0;
                let BE = [];
                for (let i = 0; i < strikeArray.length; i++) {
                    let strike = strikeArray[i];
                    if (i == 0) {
                        pnlArray.forEach(element => {
                            if (element[0] == strike) {
                                tempNum = element[1];
                            }
                        })
                    } else {
                        let prvStrike = strikeArray[i - 1];
                        pnlArray.forEach(element => {
                            if (Math.sign(element[1]) != Math.sign(tempNum) && tempNum != 0) {
                                if (element[0] == strike) {
                                    BE.push(parseInt(prvStrike + (strike - prvStrike) * (0 - tempNum) / (element[1] - tempNum)));
                                    tempNum = element[1];
                                }
                            }
                        });
                    }
                    document.getElementById('BE').innerHTML = BE.length > 0 ? BE.toString() : '-';
                }
            }, 200)
            function charting(chartDiv, datatable) {
                Highcharts.chart(chartDiv, {
                    data: {
                        table: datatable
                    },
                    chart: {
                        //type: 'line',
                        backgroundColor: '#131516',
                    }, series: [{
                        type: 'areaspline',
                        negativeFillColor: 'RGB(255,0,0,0.5)',
                        lineColor: '#67b1f2',
                        fillColor: 'RGB(0,255,0,0.5)',
                        threshold: 0,
                    }],
                    title: {
                        text: 'PayOff Graph',
                        style: {
                            color: 'white',
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
                        plotLines: [{
                            color: '#FF0000', // Red
                            width: 2,
                            value: parseInt(pnlArray.length / 2), // Position, you'll have to translate this to the values on your x axis
                            dashStyle: 'ShortDash'
                        }],
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
                        plotLines: [{
                            color: 'skyblue',
                            value: 0,
                            width: 2,
                            zIndex: 4,
                            dashStyle: 'LongDash'

                        }],
                        labels: {
                            style: {
                                color: 'white',
                                font: '11px Trebuchet MS, Verdana, sans-serif'
                            }
                        },
                        title: {
                            allowDecimals: false,
                            text: 'Amount',
                            style: {
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '12px',
                                fontFamily: 'Trebuchet MS, Verdana, sans-serif'
                            }
                        }
                    },
                    plotOptions: {
                        // column: {
                        //     stacking: 'overlap'
                        // }
                    },
                    tooltip: {
                        formatter: function () {
                            return '<b>' + this.series.name + '</b><br/>' +
                                this.point.y + ' ' + this.point.name.toLowerCase();
                        }
                    }
                });
            }
            charting('chartDiv', 'greek2');
        }, 1000)
    }
}

function PosIV(row) {
    let date_expiry = new Date(row.children[11].innerHTML.replaceAll('-', '/'));
    let volt = parseFloat(row.children[10].innerHTML) >= 0 ? parseFloat(row.children[10].innerHTML) / 100 : 50;
    if (row.children[10].innerHTML == 'NaN' || row.children[10].innerHTML == 'INFINITY') {
        volt = 0.5;
    }
    date_expiry.setHours(15, 30, 0, 0)
    let date_now = new Date();
    let int_rate = 0;
    let seconds = Math.floor((date_expiry - date_now) / 1000),
        minutes = seconds / 60,
        hours = minutes / 60,
        delta_t = hours / 24 / 365.0;
    let spot = parseFloat(row.parentElement.parentElement.parentElement.children[0].children[1].innerHTML);
    let strike = parseInt(row.children[3].innerHTML.split(" ")[2]);
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
    let call_premium = row.children[3].innerHTML.split(" ")[3] == "CE" ?
        spot * distribution.cdf(d1) - fv_strike * distribution.cdf(d2)
        :
        fv_strike * distribution.cdf(-1 * d2) - spot * distribution.cdf(-1 * d1);
    //Option greeks
    let vega = spot * distribution.pdf(d1) * Math.sqrt(delta_t);
    volt = (-(call_premium - callPrice) / vega) + volt;
    row.children[10].innerHTML = (volt * 100).toFixed(2);
}

async function posGraph(posGB) {
    if (document.getElementById('dte').value == "") {
        alert("Select Payoff Date")
    }
    else {
        let table = posGB.parentElement.parentElement.parentElement.parentElement;
        let liveP = parseInt(table.parentElement.children[0].children[1].innerHTML);
        let date_expiry = new Date(document.getElementById('dte').value.replaceAll('-', '/'));
        date_expiry.setHours(15, 30, 0, 0)
        let date_now = new Date();
        let sec = Math.floor((date_expiry - date_now) / 1000),
            min = sec / 60,
            ho = min / 60;
        let int_rate = 0;
        vixValues = {
            uid: localStorage.getItem("uid"),
            exch: "NSE",
            token: "26017"
        }
        let vix = await all(vixValues, 'GetQuotes');
        let sigma = (liveP * (parseFloat(vix.lp) / 100) * Math.sqrt(ho / 24) / Math.sqrt(365)).toFixed(2);
        let perce = liveP > 10000 ? 2.5 : liveP > 1000 ? 10 : 20;
        let cmp = parseInt(liveP - (sigma * perce));
        let cmpL = parseInt(liveP - (sigma * perce));
        let cmpH = parseInt(liveP + (sigma * perce));
        let greekTable = document.getElementById('greekTable');
        let liveGreekTable = document.getElementById('liveGreekTable');
        let strikeArray = [];
        greekTable.innerHTML = '';
        liveGreekTable.innerHTML = '';
        setTimeout(() => {
            for (let index = cmpL; index < cmpH; index++) {
                let row = greekTable.insertRow(-1);
                let row2 = liveGreekTable.insertRow(-1);
                row.insertCell(0).innerHTML = cmp;
                row2.insertCell(0).innerHTML = cmp;
                if (document.title == 'Positions') {
                    let body = table.children[1];
                    let totalPNL = 0;
                    for (let i = 0; i < body.children.length; i++) {
                        const element = body.children[i];
                        let qty = parseInt(element.children[4].innerHTML);
                        if (qty != 0) {
                            let iv = parseFloat(element.children[10].innerHTML) / 100;
                            let entryPrice = parseFloat(element.children[5].innerHTML).toFixed(2);
                            let strike = parseInt(element.children[3].innerHTML.split(" ")[2]);
                            if (index == cmpL) {
                                strikeArray.push(strike);
                            }
                            let ce = element.children[3].innerHTML.split(" ")[3] == "CE" ? 1 : 0;
                            let a = null;
                            let dte = new Date(element.children[11].innerHTML.replaceAll('-', '/'));
                            dte.setHours(15, 30, 0, 0)
                            if (dte.getTime() != date_expiry.getTime()) {
                                let diff = dte.getTime() - date_expiry.getTime()
                                let seconds2 = Math.floor(diff / 1000),
                                    minutes2 = seconds2 / 60,
                                    hours2 = minutes2 / 60;
                                let delta_t2 = (hours2 / 24) / 365.0;
                                let fv_strike2 = strike * Math.exp(-1 * int_rate * delta_t2);
                                let d12 =
                                    (Math.log(cmp / strike) + (int_rate + Math.pow(iv, 2) / 2) * delta_t2) /
                                    (iv * Math.sqrt(delta_t2)),
                                    d22 =
                                        (Math.log(cmp / strike) + (int_rate - Math.pow(iv, 2) / 2) * delta_t2) /
                                        (iv * Math.sqrt(delta_t2));

                                let call_premium2 = ce == 1 ?
                                    cmp * distribution.cdf(d12) - fv_strike2 * distribution.cdf(d22)
                                    :
                                    fv_strike2 * distribution.cdf(-1 * d22) - cmp * distribution.cdf(-1 * d12);
                                a = call_premium2;
                            }
                            else {
                                if (ce == 1) {
                                    a = Math.max(cmp - strike, 0)
                                } else {
                                    a = Math.max(strike - cmp, 0)
                                };
                            }
                            let seconds = Math.floor((dte - date_now) / 1000),
                                minutes = seconds / 60,
                                hours = minutes / 60;
                            delta_t = (hours / 24) / 365.0;
                            let fv_strike = strike * Math.exp(-1 * int_rate * delta_t);
                            let d1 =
                                (Math.log(cmp / strike) + (int_rate + Math.pow(iv, 2) / 2) * delta_t) /
                                (iv * Math.sqrt(delta_t)),
                                d2 =
                                    (Math.log(cmp / strike) + (int_rate - Math.pow(iv, 2) / 2) * delta_t) /
                                    (iv * Math.sqrt(delta_t));
                            let call_premium = ce == 1 ?
                                cmp * distribution.cdf(d1) - fv_strike * distribution.cdf(d2)
                                :
                                fv_strike * distribution.cdf(-1 * d2) - cmp * distribution.cdf(-1 * d1);
                            let premiumPNL = a - entryPrice;
                            let rupeesPNL = (premiumPNL * qty).toFixed(2);
                            row.insertCell(-1).innerHTML = rupeesPNL;
                            let livePremiumPNL = call_premium - entryPrice;
                            let liveRupeesPNL = (livePremiumPNL * qty).toFixed(2);
                            row2.insertCell(-1).innerHTML = liveRupeesPNL;
                        }
                    }
                }
                //cmp += parseInt(cmp * 0.001);
                liveP > 1000 ? cmp += 1 : liveP > 100 ? cmp += 0.5 : cmp += 0.25
            }
        }, 200);
        setTimeout(() => {
            let gt = document.getElementById('greekTable1');
            gt.innerHTML = '';
            let closest = 0;
            let pnlArray = [];
            for (let i = 0; i < greekTable.children.length; i++) {
                let row = greekTable.children[i];
                let row2 = liveGreekTable.children[i];
                let a = 0;
                let b = 0;
                if (row.children[0].innerHTML >= cmpL && row.children[0].innerHTML <= cmpH) {
                    let total = gt.insertRow(-1);
                    for (let j = 0; j < row.children.length; j++) {
                        const element = row.children[j];
                        const element2 = row2.children[j];
                        if (j != 0) {
                            a += parseFloat(element.innerHTML)
                            b += parseFloat(element2.innerHTML)
                        } else {
                            total.insertCell(0).innerHTML = greekTable.children[i].children[0].innerHTML;
                        }
                    }
                    total.insertCell(-1).innerHTML = ((a + parseFloat(table.children[2].children[0].children[8].innerHTML)) + parseFloat(table.children[2].children[0].children[11].children[0].value)).toFixed(2);
                    total.insertCell(-1).innerHTML = ((b + parseFloat(table.children[2].children[0].children[8].innerHTML)) + parseFloat(table.children[2].children[0].children[11].children[0].value)).toFixed(2);
                }
                pnlArray.push([parseInt(row.children[0].innerHTML), a + parseFloat(table.children[2].children[0].children[8].innerHTML) + parseFloat(table.children[2].children[0].children[11].children[0].value)])
            }
            setTimeout(() => {
                const max = pnlArray.reduce(function (prev, current) {
                    return (prev[1] > current[1]) ? prev : current
                });
                document.getElementById('profit').innerHTML = max[1];
                const min = pnlArray.reduce(function (prev, current) {
                    return (prev[1] < current[1]) ? prev : current
                });
                document.getElementById('loss').innerHTML = min[1];
                document.getElementById('rr').innerHTML = Math.abs(max[1] / min[1]).toFixed(2);
                strikeArray.unshift(pnlArray[0][0])
                strikeArray.push(pnlArray[pnlArray.length - 1][0])
                strikeArray.sort((a, b) => a - b);
                let tempNum = 0;
                let BE = [];
                for (let i = 0; i < strikeArray.length; i++) {
                    let strike = strikeArray[i];
                    if (i == 0) {
                        pnlArray.forEach(element => {
                            if (element[0] == strike) {
                                tempNum = element[1];
                            }
                        })
                    } else {
                        let prvStrike = strikeArray[i - 1];
                        pnlArray.forEach(element => {
                            if (Math.sign(element[1]) != Math.sign(tempNum) && tempNum != 0) {
                                if (element[0] == strike) {
                                    BE.push(parseInt(prvStrike + (strike - prvStrike) * (0 - tempNum) / (element[1] - tempNum)));
                                    tempNum = element[1];
                                }
                            }
                        });
                    }
                }
                document.getElementById('BE').innerHTML = BE.length > 0 ? BE.toString() : '-';
            }, 200)
            function charting(chartDiv, datatable) {
                Highcharts.chart(chartDiv, {
                    data: {
                        table: datatable
                    },
                    chart: {
                        //type: 'line',
                        backgroundColor: '#131516',
                    }, series: [{
                        type: 'areaspline',
                        negativeFillColor: 'RGB(255,0,0,0.5)',
                        lineColor: '#67b1f2',
                        fillColor: 'RGB(0,255,0,0.5)',
                        threshold: 0,
                    }],
                    title: {
                        text: 'PayOff Graph',
                        style: {
                            color: 'white',
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
                        plotLines: [{
                            color: '#FF0000', // Red
                            width: 2,
                            value: parseInt(pnlArray.length / 2), // Position, you'll have to translate this to the values on your x axis
                            dashStyle: 'ShortDash'
                        }],
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
                        plotLines: [{
                            color: 'skyblue',
                            value: 0,
                            width: 2,
                            zIndex: 4,
                            dashStyle: 'LongDash'

                        }],
                        labels: {
                            style: {
                                color: 'white',
                                font: '11px Trebuchet MS, Verdana, sans-serif'
                            }
                        },
                        title: {
                            allowDecimals: false,
                            text: 'Amount',
                            style: {
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '12px',
                                fontFamily: 'Trebuchet MS, Verdana, sans-serif'
                            }
                        }
                    },
                    plotOptions: {
                        // column: {
                        //     stacking: 'overlap'
                        // }
                    },
                    tooltip: {
                        formatter: function () {
                            return '<b>' + this.series.name + '</b><br/>' +
                                this.point.y + ' ' + this.point.name.toLowerCase();
                        }
                    }
                });
            }
            charting('chartDiv', 'greek2');
        }, 1000)
    }
}
async function adjGraph(posGB) {
    if (document.getElementById('dte').value == "") {
        alert("Select Payoff Date")
    }
    else {
        let table = posGB.parentElement.parentElement.parentElement.parentElement.children[1];
        let liveP = parseInt(table.parentElement.children[0].children[1].innerHTML);
        let date_expiry = new Date(document.getElementById('dte').value.replaceAll('-', '/'));
        date_expiry.setHours(15, 30, 0, 0)
        let date_now = new Date();
        let sec = Math.floor((date_expiry - date_now) / 1000),
            min = sec / 60,
            ho = min / 60;
        let int_rate = 0;
        vixValues = {
            uid: localStorage.getItem("uid"),
            exch: "NSE",
            token: "26017"
        }
        let vix = await all(vixValues, 'GetQuotes');
        let sigma = (liveP * (parseFloat(vix.lp) / 100) * Math.sqrt(ho / 24) / Math.sqrt(365)).toFixed(2);
        let perce = liveP > 10000 ? 2.5 : liveP > 1000 ? 10 : 20;
        let cmp = parseInt(liveP - (sigma * perce));
        let cmpL = parseInt(liveP - (sigma * perce));
        let cmpH = parseInt(liveP + (sigma * perce));
        let greekTable = document.getElementById('greekTable');
        let liveGreekTable = document.getElementById('liveGreekTable');
        let strikeArray = [];
        greekTable.innerHTML = '';
        liveGreekTable.innerHTML = '';
        setTimeout(() => {
            for (let index = cmpL; index < cmpH; index++) {
                let row = greekTable.insertRow(-1);
                let row2 = liveGreekTable.insertRow(-1);
                row.insertCell(0).innerHTML = cmp;
                row2.insertCell(0).innerHTML = cmp;
                if (document.title == 'Adjustment') {
                    let body = table.children[1];
                    let totalPNL = 0;
                    for (let i = 0; i < body.children.length; i++) {
                        const element = body.children[i];
                        let qty = element.querySelector('input[name="bs"]').checked ? parseInt(element.children[5].children[0].value) : -parseInt(element.children[5].children[0].value);
                        if (qty != 0) {
                            let iv = parseFloat(element.children[8].innerHTML) / 100;
                            let entryPrice = parseFloat(element.children[6].innerHTML).toFixed(2);
                            let strike = parseInt(element.children[3].children[0].children[0].value);
                            if (index == cmpL) {
                                strikeArray.push(strike);
                            }
                            let ce = element.querySelector('input[name="cepe"]').checked ? 1 : 0;
                            let a = null;
                            let dte = new Date(element.children[2].innerHTML.replaceAll('-', '/'));
                            dte.setHours(15, 30, 0, 0)
                            if (dte.getTime() != date_expiry.getTime()) {
                                let diff = dte.getTime() - date_expiry.getTime()
                                let seconds2 = Math.floor(diff / 1000),
                                    minutes2 = seconds2 / 60,
                                    hours2 = minutes2 / 60;
                                let delta_t2 = (hours2 / 24) / 365.0;
                                let fv_strike2 = strike * Math.exp(-1 * int_rate * delta_t2);
                                let d12 =
                                    (Math.log(cmp / strike) + (int_rate + Math.pow(iv, 2) / 2) * delta_t2) /
                                    (iv * Math.sqrt(delta_t2)),
                                    d22 =
                                        (Math.log(cmp / strike) + (int_rate - Math.pow(iv, 2) / 2) * delta_t2) /
                                        (iv * Math.sqrt(delta_t2));

                                let call_premium2 = ce == 1 ?
                                    cmp * distribution.cdf(d12) - fv_strike2 * distribution.cdf(d22)
                                    :
                                    fv_strike2 * distribution.cdf(-1 * d22) - cmp * distribution.cdf(-1 * d12);
                                a = call_premium2;
                            }
                            else {
                                if (ce == 1) {
                                    a = Math.max(cmp - strike, 0)
                                } else {
                                    a = Math.max(strike - cmp, 0)
                                };
                            }
                            let seconds = Math.floor((dte - date_now) / 1000),
                                minutes = seconds / 60,
                                hours = minutes / 60;
                            delta_t = (hours / 24) / 365.0;
                            let fv_strike = strike * Math.exp(-1 * int_rate * delta_t);
                            let d1 =
                                (Math.log(cmp / strike) + (int_rate + Math.pow(iv, 2) / 2) * delta_t) /
                                (iv * Math.sqrt(delta_t)),
                                d2 =
                                    (Math.log(cmp / strike) + (int_rate - Math.pow(iv, 2) / 2) * delta_t) /
                                    (iv * Math.sqrt(delta_t));
                            let call_premium = ce == 1 ?
                                cmp * distribution.cdf(d1) - fv_strike * distribution.cdf(d2)
                                :
                                fv_strike * distribution.cdf(-1 * d2) - cmp * distribution.cdf(-1 * d1);
                            let premiumPNL = a - entryPrice;
                            let rupeesPNL = (premiumPNL * qty).toFixed(2);
                            row.insertCell(-1).innerHTML = rupeesPNL;
                            let livePremiumPNL = call_premium - entryPrice;
                            let liveRupeesPNL = (livePremiumPNL * qty).toFixed(2);
                            row2.insertCell(-1).innerHTML = liveRupeesPNL;
                        }
                    }
                }
                //cmp += parseInt(cmp * 0.001);
                liveP > 1000 ? cmp += 1 : liveP > 100 ? cmp += 0.5 : cmp += 0.25
            }
        }, 200);
        setTimeout(() => {
            let gt = document.getElementById('greekTable1');
            gt.innerHTML = '';
            let closest = 0;
            let pnlArray = [];
            for (let i = 0; i < greekTable.children.length; i++) {
                let row = greekTable.children[i];
                let row2 = liveGreekTable.children[i];
                let a = 0;
                let b = 0;
                if (row.children[0].innerHTML >= cmpL && row.children[0].innerHTML <= cmpH) {
                    let total = gt.insertRow(-1);
                    for (let j = 0; j < row.children.length; j++) {
                        const element = row.children[j];
                        const element2 = row2.children[j];
                        if (j != 0) {
                            a += parseFloat(element.innerHTML)
                            b += parseFloat(element2.innerHTML)
                        } else {
                            total.insertCell(0).innerHTML = greekTable.children[i].children[0].innerHTML;
                        }
                    }
                    total.insertCell(-1).innerHTML = a.toFixed(2);
                    total.insertCell(-1).innerHTML = b.toFixed(2);
                }
                pnlArray.push([parseInt(row.children[0].innerHTML), parseInt(a)])
            }
            setTimeout(() => {
                const max = pnlArray.reduce(function (prev, current) {
                    return (prev[1] > current[1]) ? prev : current
                });
                document.getElementById('profit').innerHTML = max[1];
                const min = pnlArray.reduce(function (prev, current) {
                    return (prev[1] < current[1]) ? prev : current
                });
                document.getElementById('loss').innerHTML = min[1];
                document.getElementById('rr').innerHTML = Math.abs(max[1] / min[1]).toFixed(2);
                strikeArray.unshift(pnlArray[0][0])
                strikeArray.push(pnlArray[pnlArray.length - 1][0])
                strikeArray.sort((a, b) => a - b);
                let tempNum = 0;
                let BE = [];
                for (let i = 0; i < strikeArray.length; i++) {
                    let strike = strikeArray[i];
                    if (i == 0) {
                        pnlArray.forEach(element => {
                            if (element[0] == strike) {
                                tempNum = element[1];
                            }
                        })
                    } else {
                        let prvStrike = strikeArray[i - 1];
                        pnlArray.forEach(element => {
                            if (Math.sign(element[1]) != Math.sign(tempNum) && tempNum != 0) {
                                if (element[0] == strike) {
                                    BE.push(parseInt(prvStrike + (strike - prvStrike) * (0 - tempNum) / (element[1] - tempNum)));
                                    tempNum = element[1];
                                }
                            }
                        });
                    }
                }
                document.getElementById('BE').innerHTML = BE.length > 0 ? BE.toString() : '-';
            }, 200)
            function charting(chartDiv, datatable) {
                Highcharts.chart(chartDiv, {
                    data: {
                        table: datatable
                    },
                    chart: {
                        //type: 'line',
                        backgroundColor: '#131516',
                    }, series: [{
                        type: 'areaspline',
                        negativeFillColor: 'RGB(255,0,0,0.5)',
                        lineColor: '#67b1f2',
                        fillColor: 'RGB(0,255,0,0.5)',
                        threshold: 0,
                    }],
                    title: {
                        text: 'PayOff Graph',
                        style: {
                            color: 'white',
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
                        plotLines: [{
                            color: '#FF0000', // Red
                            width: 2,
                            value: parseInt(pnlArray.length / 2), // Position, you'll have to translate this to the values on your x axis
                            dashStyle: 'ShortDash'
                        }],
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
                        plotLines: [{
                            color: 'skyblue',
                            value: 0,
                            width: 2,
                            zIndex: 4,
                            dashStyle: 'LongDash'

                        }],
                        labels: {
                            style: {
                                color: 'whie',
                                font: '11px Trebuchet MS, Verdana, sans-serif'
                            }
                        },
                        title: {
                            allowDecimals: false,
                            text: 'Amount',
                            style: {
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '12px',
                                fontFamily: 'Trebuchet MS, Verdana, sans-serif'
                            }
                        }
                    },
                    plotOptions: {
                        // column: {
                        //     stacking: 'overlap'
                        // }
                    },
                    tooltip: {
                        formatter: function () {
                            return '<b>' + this.series.name + '</b><br/>' +
                                this.point.y + ' ' + this.point.name.toLowerCase();
                        }
                    }
                });
            }
            charting('chartDiv', 'greek2');
        }, 1000)
    }
}