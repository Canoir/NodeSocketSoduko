const http = require('http');
//
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const server = http.createServer(app);
//
const io = require("socket.io")(server);
io.on('connect', (socket) => {
    let s = [
        [9, 2, 0, 1, 0, 0, 0, 6, 0],
        [0, 1, 0, 4, 0, 3, 7, 0, 2],
        [4, 7, 0, 0, 0, 0, 0, 9, 1],
        [0, 0, 0, 0, 0, 2, 1, 0, 3],
        [6, 3, 0, 0, 1, 0, 0, 5, 4],
        [0, 9, 7, 3, 4, 0, 6, 0, 0],
        [3, 0, 1, 0, 8, 9, 0, 0, 0],
        [7, 8, 5, 6, 0, 0, 2, 0, 0],
        [0, 4, 9, 7, 0, 0, 8, 3, 0],
    ];
    let end = false;
    socket.emit('board',s);
    //
    socket.on('onChange',(obj,ack)=>{
        const h = toHouse(obj.index);
        const v = obj.value;
        let r = true;
        //
        s[h.r].forEach((_) => {
            if (_ === v)
                r = false;
        });
        for (let _ = 0; _ < 9; _++)
            if (s[_][h.c] === v) {
                r = false;
                break;
            }
        //
        s[h.r][h.c] = v;
        //
        ack(r);
    })
    socket.on('checkUp',(obj)=>{
        if(!end) {
            let res = false;
            for (let _ = 0; _ < 9 && !res; _++)
                s[_].forEach((i) => {
                    if (i === 0) res = true;
                })
            if (!res) {
                socket.emit('result', {t: 'You Won!', r: true});
                socket.broadcast.emit('result', {t: 'You Lose!', r: false});
                end = true;
            }
        }
    });
    //
    function toHouse(i) {
        return {r: Number((i / 9).toString().split('.')[0]), c: i % 9};
    }
})
//
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
module.exports = {app: app, server: server};
