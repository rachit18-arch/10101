function stratGraph() {
    let liveP = parseInt(document.getElementsByClassName("token")[0].innerHTML);
    let date_expiry = new Date(document.getElementById('exp').value.split(" ", 1)[0].replaceAll('-', '/'));
    date_expiry.setHours(15, 30, 0, 0)
    let date_now = new Date();
    let int_rate = 0;
    let seconds = Math.floor((date_expiry - date_now) / 1000),
        minutes = seconds / 60,
        hours = minutes / 60;
    console.log(hours);
    let delta_t = (hours / 24) / 365.0;
    let sigma = (liveP * (parseFloat(document.getElementById('26017').innerHTML) / 100) * Math.sqrt(hours / 24) / Math.sqrt(365)).toFixed(2);
    console.log(sigma)
    let cmp = parseInt(liveP - (sigma * 2.5));
    let cmpM = liveP + (sigma * 2.5);
    let range = parseInt((cmpM - cmp) / (liveP * 0.001))
    let greekTable = document.getElementById('greekTable');
    let liveGreekTable = document.getElementById('liveGreekTable');
    greekTable.innerHTML = '';
    liveGreekTable.innerHTML = '';
    setTimeout(() => {
        let cmp = 1;
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
                let strike = element.querySelector('input[name="strike"]').value;
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
                if (dte.getTime() != date_expiry.getTime()) {
                    seconds = Math.floor((dte - date_now) / 1000),
                        minutes = seconds / 60,
                        hours = minutes / 60;
                    delta_t = (hours / 24) / 365.0;
                }
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
    }, 100);
    setTimeout(() => {
        for (let index = 0; index < 3000; index++) {
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
                    let strike = element.querySelector('input[name="strike"]').value;
                    let ce = element.querySelector('input[name="cepe"]').checked ? 1 : 0;
                    let a = null;
                    cmp == 42900 ?
                        console.log(seconds) : null;
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
                    if (dte.getTime() != date_expiry.getTime()) {
                        seconds = Math.floor((dte - date_now) / 1000),
                            minutes = seconds / 60,
                            hours = minutes / 60;
                        delta_t = (hours / 24) / 365.0;
                    }
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
                    if (cmp == 42900) {
                        console.log(date_expiry.getTime(), dte.getTime())
                        console.log(d1, d2, seconds, call_premium, delta_t, dte)
                    }
                    let premiumPNL = a - entryPrice;
                    let rupeesPNL = (premiumPNL * qty).toFixed(2);
                    row.insertCell(-1).innerHTML = rupeesPNL;
                    let livePremiumPNL = call_premium - entryPrice;
                    if (cmp == 42900) {
                        console.log(livePremiumPNL, qty)
                    }
                    let liveRupeesPNL = (livePremiumPNL * qty).toFixed(2);
                    row2.insertCell(-1).innerHTML = liveRupeesPNL;
                }
            }
            //cmp += parseInt(cmp * 0.001);
            liveP > 1000 ? cmp += 1 : liveP > 100 ? cmp += 0.5 : cmp += 0.25
        }
    }, 200);
    setTimeout(() => {
        let cmp = 100000;
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
                let strike = element.querySelector('input[name="strike"]').value;
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
                if (dte.getTime() != date_expiry.getTime()) {
                    seconds = Math.floor((dte - date_now) / 1000),
                        minutes = seconds / 60,
                        hours = minutes / 60;
                    delta_t = (hours / 24) / 365.0;
                }
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
            if (row.children[0].innerHTML >= (liveP - (liveP * 2 / 100)) && row.children[0].innerHTML <= cmpM) {
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
            pnlArray.push([parseInt(row.children[0].innerHTML), parseInt(row.children[1].innerHTML)])
        }

        let maxHU = greekTable.children[greekTable.children.length - 1].children[1].innerHTML;
        let maxHU1 = greekTable.children[greekTable.children.length - 2].children[1].innerHTML;
        let maxLU = greekTable.children[0].children[1].innerHTML;
        let maxLU1 = greekTable.children[1].children[1].innerHTML;
        let unlimitedP = false;
        let unlimitedL = false;
        if (maxLU == maxLU1) {
            console.log('FIXED PROFIT PE')
        } else if (maxLU > maxLU1) {
            console.log('unlimited LOSS PE')
            unlimitedL = true;
        } else if (maxLU < maxLU1) {
            console.log('unlimited Profit PE')
            unlimitedP = true;
        }
        if (maxHU == maxHU1) {
            console.log('FIXED CE')
        }
        else if (maxHU > maxHU1) {
            console.log('unlimited Profit CE')
            unlimitedP = true;
        } else if (maxHU < maxHU1) {
            console.log('unlimited LOSS CE')
            unlimitedL = true;
        }
        if (unlimitedL == true && unlimitedP == true) {
            console.log('gg')
        }
        else if (unlimitedL == true) {
            console.log("ok")

        } else if (unlimitedP == true) {
            console.log('k')
        } else {
            console.log("test")
        }
        function charting(chartDiv, datatable) {
            Highcharts.chart(chartDiv, {
                data: {
                    table: datatable
                },
                chart: {
                    //type: 'line',
                    backgroundColor: '#565656',
                }, series: [{
                    type: 'areaspline',
                    negativeFillColor: 'RGB(255,0,0,0.3)',
                    lineColor: '#67b1f2',
                    fillColor: 'RGB(0,255,0,0.3)',
                    threshold: 0,
                }],
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
                    plotLines: [{
                        color: '#FF0000', // Red
                        width: 2,
                        value: 100 // Position, you'll have to translate this to the values on your x axis
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
                        color: '#ffce6e',
                        value: 0,
                        width: 2,
                        zIndex: 4,
                    }],
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
        // charting('chartDiv2', 'greekLive2');
    }, 1000)
}
