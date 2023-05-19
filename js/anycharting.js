async function anycharting(search, element, tex) {
    element.innerHTML = '';
    let val = search.value;
    let opts = document.getElementById('dlist').childNodes;
    let scriptName;
    let iT;
    for (var i = 0; i < opts.length; i++) {
        if (opts[i].value === val) {
            // An item was selected from the list!
            // yourCallbackHere()
            iT = opts[i].value;
            scriptName = opts[i].innerHTML;
        }
    }
    let timeValues = {
        uid: localStorage.getItem("uid"),
        exch: `${tex}`,
        token: `${iT}`,
        st: `${Math.round((Date.now() - 3456000000) / 1000)}`,
        et: `${Math.round(Date.now() / 1000)}`,
    };
    let c1M = await all(timeValues, "TPSeries");
    let chart = anychart.stock();

    // create data table
    anychart.format.inputDateTimeFormat("dd-MM-yyyy hh:mm:ss");
    let table = anychart.data.table("time");
    table.addData(c1M.reverse());
    // create data mappings
    let mapping = table.mapAs({ 'time': 'time', 'open': 'into', 'high': 'inth', 'low': 'intl', 'close': 'intc' });
    let plot = chart.plot(0);
    let series = chart.plot(0).candlestick(mapping);
    series.name(scriptName)
    series.legendItem().iconType('rising-falling');
    series.fallingFill("Black");
    series.fallingStroke("Black");
    series.risingFill("White");
    series.risingStroke("Black");
    series.legendItem().fontColor("#000000");
    series.pointWidth(3.7);
    chart.plot(0).yAxis(0).orientation('right');
    chart.padding()
        .right(55)
        .bottom(15);
    let labels = chart.plot(0).xAxis().labels();
    labels.fontColor("Black")
    let ylabels = chart.plot(0).yAxis().labels();
    ylabels.fontColor("Black")
    let background = chart.background();
    background.fill({
        // set colors position
        keys: ["#787b86", "#5d606b"],
        // set angle of colors drawing
        angle: 270
    });
    background.stroke('2 #2196F3');
    background.corners(10);
    // set container id for the chart
    chart.crosshair().displayMode("float");
    plot.crosshair().xStroke("#000000", 1.5, "5 4");
    plot.crosshair().yStroke("#000000", 1.5, "5 4");
    chart.container(element);
    let indicator = chart.plot(0).priceIndicator();
    indicator.value("last-visible")
    indicator.fallingStroke('Black', 1, "1 2");
    indicator.risingStroke('Black', 1, "1 2");
    // configure label
    indicator.label().background().fill("White");
    indicator.label().fontColor("Black");
    // initiate chart drawing
    chart.draw();
    chart.listen("annotationDrawingFinish", function () {
        // setToolbarButtonActive(null);
    });
    chart.scroller().line(table.mapAs({ value: "intc" }));
    //xAxis.height(1000);
    let rangeSelector = anychart.ui.rangeSelector();
    let customRanges = [
        {
            'text': '10 Min',
            'type': 'points',
            'count': 10,
            'anchor': 'last-date'
        },
        {
            'text': '30 Min',
            'type': 'unit',
            'unit': 'minutes',
            'count': 30,
            'anchor': 'last-date'
        },
        {
            'text': '1 Hr',
            'type': 'unit',
            'unit': 'minutes',
            'count': 60,
            'anchor': 'last-date'
        },
        {
            'text': '1 Day',
            'type': 'unit',
            'unit': 'day',
            'count': 0,
            'anchor': 'last-date'
        },
        {
            'text': 'Full Range',
            'type': 'max'
        },

    ];
    rangeSelector.ranges(customRanges);
    rangeSelector.render(chart);

    let currentDate = new Date;
    let currentBar = {
        time: `${("00" + currentDate.getDate()).slice(-2)
            + "-" + ("00" + (currentDate.getMonth() + 1)).slice(-2)
            + "-" + currentDate.getFullYear() + " "
            + ("00" + currentDate.getHours()).slice(-2) + ":"
            + ("00" + currentDate.getMinutes()).slice(-2)
            + ":" + ("00" + currentDate.getSeconds()).slice(-2)
            }`
        , into: null, inth: null, intl: null, intc: null
    };
    sendMessageToSocket(`{"t":"t","k":"${tex}|${iT}"}`);
    worker.port.addEventListener("message", function (msg) {
        let result = msg.data;
        if (result.tk == iT && result.lp != undefined) {
            let currentTime = new Date;
            let currentTimeBar = currentBar.time.split(':');
            if (currentTimeBar[1] != currentTime.getMinutes()) {
                currentTime = ("00" + currentTime.getDate()).slice(-2)
                    + "-" + ("00" + (currentTime.getMonth() + 1)).slice(-2)
                    + "-" + currentTime.getFullYear() + " "
                    + ("00" + currentTime.getHours()).slice(-2) + ":"
                    + ("00" + currentTime.getMinutes()).slice(-2)
                    + ":" + ("00" + currentTime.getSeconds()).slice(-2);
                currentBar.time = currentTime;
                currentBar.into = parseFloat(result.lp);
                currentBar.inth = parseFloat(result.lp);
                currentBar.intl = parseFloat(result.lp);
                currentBar.intc = parseFloat(result.lp);
            }
            else {
                if (currentBar.into === null) {
                    currentBar.into = parseFloat(result.lp);
                    currentBar.inth = parseFloat(result.lp);
                    currentBar.intl = parseFloat(result.lp);
                    currentBar.intc = parseFloat(result.lp);
                } else {
                    currentBar.intc = parseFloat(result.lp);
                    currentBar.inth = Math.max(currentBar.inth, result.lp);
                    currentBar.intl = Math.min(currentBar.intl, result.lp);
                }
            }
            table.addData([currentBar]);
            // && new Date().getMilliseconds() > 500
            //candleSeries.update({ time: Math.round(Date.now() / 1000) + 19800, value: result.lp });

        }
    });
}

// create annotations
function create(drawing) {
    plot.annotations().startDrawing(drawing.value);
}
// cancel drawing
function cancel() {
    plot.annotations().cancelDrawing();
    // reset the select list to the first option
}
// remove all annotations
function removeAll() {
    plot.annotations().removeAllAnnotations();
}
// remove the selected annotation
function removeSelected() {
    // get the selected annotation
    let selectedAnnotation = plot.annotations().getSelectedAnnotation();
    // remove the selected annotation
    plot.annotations().removeAnnotation(selectedAnnotation);
}
// send annotations to the server
function sendAnnotationsToServer(data) {
    /* here a variable for saving annotations is used,
    but you can save them to a database, local storage, or server*/
    console.log(data)
    annotationsAtServer = data;
}
// load annotations from the server
function getAnnotationsFromServer() {
    /* here a variable for load annotations is used,
    but you can load them from a database, local storage, or server*/
    return annotationsAtServer;
}
// save annotations
function save() {
    sendAnnotationsToServer(plot.annotations().toJson(true));
}
// load all saved annotations
function load() {
    let annotations = getAnnotationsFromServer();
    plot.annotations().fromJson(annotations);
}
// change annotation design
function changeAnnotationsDesign() {
    let annotation = plot.annotations().getSelectedAnnotation();
    if (annotation === null) return;
    let colorStroke = document.getElementById('colorPicker').value;
    let strokeType = document.getElementById('strokeType').value;
    let strokeWidth = document.getElementById('strokeWidth').value;
    let settings = {
        thickness: strokeWidth,
        color: colorStroke,
        dash: strokeType
    };
    annotation.stroke(settings);
    if (annotation.hovered || annotation.selected) {
        annotation.hovered().stroke(settings);
        annotation.selected().stroke(settings);
    }
}

function mergeTickToBar(result, currentBar, table) {
    let currentTime = new Date;
    let currentTimeBar = new Date(currentBar.time);
    if (currentTimeBar.getMinutes() != currentTime.getMinutes()) {
        currentBar.time = new Date;
    }
    else {
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
    }
    table.addData([currentBar]);
}
// anycharting("chart-container", "13", "NSE");
// anycharting("chart-container2", "26009", "NSE");