let worker = new SharedWorker("./js/worker.js");
let rejected = 0;
let completed = 0;
worker.port.addEventListener("message", function (msg) {
    let result = msg.data;
    let a = msg.data.s;
    document.getElementById('navButton').style.backgroundColor =
        "#D1FFBD";
    if (a == 'OK' && a != undefined) {
        let actid = localStorage.getItem('actid');
        sendMessageToSocket(`{"t:o""k:${actid}"}`);
    }
    if (result == 'WS Disconnected') {
        document.getElementById("navButton").style.backgroundColor =
            "#FCD299";
        setTimeout(() => {
            location.reload();
        }, 3000);

    }
    if (result.lp) {
        document.getElementById(`${result.tk}`)
            ? (document.getElementById(`${result.tk}`).innerHTML = result.lp)
            : null;
    }
    if (document.title === "Option Chain") {
        if (result.lp) {
            let outerElement = document.getElementById(`${result.tk}`)
                ? document.getElementById(`${result.tk}`).parentElement
                : null;
            if (outerElement == null) {
                //sendMessageToSocket(`{"t":"u","k":"${result.e}|${result.tk}"}`);
            } else {
                if (outerElement.children.length > 4) {
                    let prvClo = (100 / (100 + parseFloat(result.pc)) * parseFloat(result.lp)),
                        chg = result.lp - prvClo;
                    document.getElementById(`${result.tk}`)
                        ? document.getElementById(`${result.tk}`).innerHTML = result.lp
                        : null;
                    parseFloat(result.pc) < 0 ? document.getElementById(`${result.tk}`).setAttribute('class', 'red') : document.getElementById(`${result.tk}`).setAttribute('class', 'green')
                    let straddle =
                        parseFloat(outerElement.children[6].innerHTML) +
                        parseFloat(outerElement.children[8].innerHTML);
                    outerElement.children[16].innerHTML = straddle.toFixed(2);
                    if (result.oi) {
                        if (result.tk == outerElement.children[6].id) {
                            outerElement.children[3].innerHTML = result.oi;
                            outerElement.children[2].innerHTML = result.oi - outerElement.children[4].innerHTML;
                            outerElement.children[5].innerHTML = prvClo.toFixed(2);
                            parseInt(outerElement.children[2].innerHTML) >= 0
                                ? outerElement.children[2].setAttribute("class", "green")
                                : outerElement.children[2].setAttribute("class", "red");
                            volFind(outerElement);
                        } else {
                            outerElement.children[11].innerHTML = result.oi;
                            outerElement.children[12].innerHTML =
                                result.oi - outerElement.children[10].innerHTML;
                            outerElement.children[9].innerHTML = prvClo.toFixed(2);
                            parseInt(outerElement.children[11].innerHTML) >= 0
                                ? outerElement.children[11].setAttribute("class", "green")
                                : outerElement.children[11].setAttribute("class", "red");
                        }
                    }
                    result.lp > outerElement.children[6].innerHTML ? (cp = 0) : (cp = 1);
                    let pcr =
                        parseFloat(outerElement.children[11].innerHTML) /
                        parseFloat(outerElement.children[3].innerHTML);
                    outerElement.children[17].innerHTML = pcr.toFixed(2);
                }
            }
        }
    }
    if (document.title === "Strategy Builder") {
        let outerElement = document.getElementById(`${result.tk}`)
            ? document.getElementById(`${result.tk}`).parentElement
            : null;
        if (outerElement == null) {
            sendMessageToSocket(`{"t":"u","k":"${result.e}|${result.tk}"}`);
        } else {
            if (outerElement.children.length > 4) {
                findGreek(outerElement)
            }
        }
    }
    if (document.title === "Positions") {
        if (result.lp) {
            let outerElement = document.getElementById(`${result.tk}`).parentElement;
            if (outerElement.children.length > 4) {
                if (outerElement.parentElement.id == 'posBody') {
                    outerElement.children[8].innerHTML = (
                        (parseFloat(outerElement.children[7].innerHTML) -
                            parseFloat(outerElement.children[6].innerHTML)) *
                        parseFloat(outerElement.children[5].innerHTML)
                    ).toFixed(2);
                    parseFloat(outerElement.children[8].innerHTML) >= 0
                        ? outerElement.children[8].setAttribute("class", "green")
                        : outerElement.children[8].setAttribute("class", "red");
                    outerElement.children[10].innerHTML = ((parseFloat(outerElement.children[7].innerHTML) / parseFloat(outerElement.children[6].innerHTML) * 100) - 100).toFixed(2) + " %";
                } else {
                    outerElement.children[7].innerHTML = (
                        (parseFloat(outerElement.children[6].innerHTML) -
                            parseFloat(outerElement.children[5].innerHTML)) *
                        parseFloat(outerElement.children[4].innerHTML)
                    ).toFixed(2);
                    parseFloat(outerElement.children[7].innerHTML) >= 0
                        ? outerElement.children[7].setAttribute("class", "green")
                        : outerElement.children[7].setAttribute("class", "red");
                    outerElement.children[9].innerHTML = ((parseFloat(outerElement.children[6].innerHTML) / parseFloat(outerElement.children[5].innerHTML) * 100) - 100).toFixed(2) + " %";
                    result.oi ? PosIV(outerElement) : null;
                }
            }
        }
        if (result.t == "df") {
            let outerElement = document.getElementById(`${result.tk}`).parentElement;
            if (outerElement.children.length > 4) {
                result.bp1 && result.sp1 ? outerElement.children[12].innerHTML = (result.sp1 - result.bp1).toFixed(2) : null;
            }
        }
    }
    if (document.title === "Adjustment") {
        if (result.lp) {
            let outerElement = document.getElementById(`${result.tk}`).parentElement;
            if (outerElement.children.length > 6) {
                calcIV(outerElement)
            }
        }
    }
    if (document.title === "Holdings") {
        if (result.lp) {
            let outerElement = document.getElementById(`${result.tk}`).parentElement;
            let qty = parseFloat(outerElement.children[1].innerHTML);
            let aprc = parseFloat(outerElement.children[2].innerHTML);
            let ltp = parseFloat(result.lp);
            outerElement.children[4].innerHTML = (qty * ltp).toFixed(2);
            let pl = (outerElement.children[5].innerHTML = (qty * (ltp - aprc)).toFixed(2));
            pl > 0
                ? outerElement.children[5].setAttribute("class", "green")
                : outerElement.children[5].setAttribute("class", "red");
            if (result.c) {
                let cell10 = outerElement.insertCell(10);
                cell10.setAttribute("class", "d-none");
                cell10.innerHTML = result.c;
            }
            outerElement.children[6].innerHTML = (
                qty *
                parseFloat(outerElement.children[10].innerHTML) *
                (parseFloat(result.pc) / 100)
            ).toFixed(2);
            outerElement.children[6].innerHTML > 0
                ? outerElement.children[6].setAttribute("class", "green")
                : outerElement.children[6].setAttribute("class", "red");
            outerElement.children[7].innerHTML = `${((pl / (qty * aprc)) * 100).toFixed(2)} %`;
            ((pl / (qty * aprc)) * 100).toFixed(2) > 0
                ? outerElement.children[7].setAttribute("class", "green")
                : outerElement.children[7].setAttribute("class", "red");
            if (result.pc) {
                outerElement.children[8].innerHTML = `${result.pc} %`;
                result.pc > 0
                    ? outerElement.children[8].setAttribute("class", "green")
                    : outerElement.children[8].setAttribute("class", "red");
            }
            current += qty * ltp;
        }
    }
    if (document.title === "dashboard") {
        let bltp = document.getElementsByClassName("bltp")[0];
        bltp.id == result.tk ? (bltp.innerHTML = result.lp) : null;
        let sltp = document.getElementsByClassName("sltp")[0];
        sltp.id == result.tk ? (sltp.innerHTML = result.lp) : null;
    }
    if (document.title === "Indices") {
        document.getElementById(`${result.tk}`).innerHTML =
            result.lp + " " + result.pc + "%";
        result.pc >= 0
            ? document.getElementById(`${result.tk}`).setAttribute('class', "green")
            : document.getElementById(`${result.tk}`).setAttribute('class', "red");
    }
    if (result.t == "om") {
        let alert = document.getElementById("alert");
        let x = document.getElementById("myAudio");
        x.muted = false;
        x.play();
        alert.classList.remove("d-none");
        document.getElementById(
            "msg"
        ).innerHTML = `Order ID ${result.norenordno} for ${result.tsym} in ${result.exch} is ${result.status}`;
        setTimeout(function () {
            alert.classList.add("d-none");
        }, 5000);
        if (document.title == "Positions" || document.title == "Orders") {
            setTimeout(function () {
                location.reload();
            }, 10000);
        }
        if (result.status == "REJECTED") {
            rejected += 1;
            document.getElementsByClassName('left-reject')[0].classList.remove('d-none');
            document.getElementById('rejected').innerHTML = rejected;
        }
        if (result.status == "COMPLETED") {
            completed += 1;
            document.getElementsByClassName('right-accept')[0].classList.remove('d-none');
            document.getElementById('completed').innerHTML = completed;
        }
    }
}, false);
worker.port.start();
const sendLocalto = message => {
    worker.port.postMessage({
        action: 'connect',
        value: message,
    })
}
const sendMessageToSocket = message => {
    worker.port.postMessage({
        action: 'send',
        value: message,
    });
};
let wsValues = {
    t: "c",
    uid: localStorage.getItem("uid"),
    actid: localStorage.getItem("actid"),
    susertoken: localStorage.getItem("susertoken"),
    source: "API",
};
sendLocalto(wsValues);