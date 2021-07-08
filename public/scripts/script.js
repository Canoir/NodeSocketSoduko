//
window.onload = () => {
    const socket = io();
    let s = [];
    let end = false;
    socket.on('connection', (socket) => {
        console.log("Connected!");
    });
    socket.on('board', (obj) => {
        s = obj;
        //
        const inputs = document.querySelectorAll('input');
        inputs.forEach((e, i) => {
            const v = s[Number((i / 9).toString().split('.')[0])][i % 9].toString();
            if (v === '0')
                e.value = '';
            else {
                e.value = v;
                e.disabled = true;
            }
            e.type = "number";
            e.oninput = (e) => {
                const v = Number(e.target.value);
                if ((isNaN(v) || v > 9 || v < 0) && !end)
                    e.target.value = "";
                else
                    onChange(e, i)
            };
        });

    });

    socket.on('result', (r) => {
        end = true;
        alert(r.t);
        const inputs = document.querySelectorAll('input');
        inputs.forEach((_) => {
            _.disabled = true;
        });
        clearInterval(inter);
        const t = document.getElementById("time");
        if (r.r) {
            t.innerHTML += " <b>--</b> YOU WON!";
            t.className += 'success';
        } else {
            t.innerHTML += " <b>--</b> YOU LOSE!";
            t.className += 'failed';
        }
    })

    let sec = 0;

    function onChange(event, index) {
        const i = event.target;
        const v = Number(i.value);
        socket.emit('onChange', {value: v, index: index}, (r) => {
            if (!r)
                i.className = "error";
            else {
                i.className = "";
                checkUp();
            }
        });
    }

    //
    let inter = setInterval(() => {
        document.getElementById("time").innerHTML = (sec / 60).toString().split('.')[0] + ":" + sec % 60;
        sec++;
    }, 1000);

    //
    function checkUp() {
        socket.emit('checkUp', {});
    }
}