const Handlers   = require('./handlers');
const { Server } = require('socket.io')
const net        = require('net')
const say        = require('../../lib/console_helper')

const client = new net.Socket();

async function openTelnet(IP, io) {
    return new Promise((resolve, reject) => {
        let isCmdExec = false
        let response  = ''

        client.connect(IP[1], IP[0], function () {
            say('tell', 'Telnet', `Connected ${IP[0]}:${IP[1]}`)
            io.emit('chat message', `Conectando a ${IP[0]}:${IP[1]}`)
        });

        client.on('connect', function () {
            io.emit('chat message', `Conexión exitosa`)
            io.emit('chat message', `Loguenado`)
            setTimeout(() => {
                client.write('ACC\r\n')
                connect = true
                resolve(true)
            }, 1000)
        })
    })
}

let sep       = ''
let isCmdExec = false
let connect   = false
let response  = ''
let ioT

client.on('data', buffer => {
    const lastCode = buffer[buffer.length - 1]
    const data = buffer.toString('utf8')

    if (data) {
        // console.log(data.FgGreen, lastCode);
        if (data.trim() == 'Password: ?') {
            client.write('OTTER\r\n')
        } else if (lastCode == 62 && isCmdExec) {
            isCmdExec = false
            ioT.emit('chat message', response)
            client.destroy(); // kill client after server's response
        } else if (isCmdExec) {
            sep = ([10, 41, 32, 52].includes(lastCode)) ? '\n' : ''
            response += data.trim() + sep
        }

    }
});

client.on('close', function () {
    console.log('Connection closed'.Margin.FgYellow.BgRed);
    // process.exit()
});

const listIp = {
    'pna_norte': ['128.0.3.16', 10009]
}

module.exports = {
    name: 'webSocket',
    register(server, options, next) {
        const io = new Server(server.listener);
        ioT = io
        io.on('connection', socket => {
            say('tell','Websocket','New connection')

            socket.on('disconnect', () => {
                say('tell', 'Websocket', 'Client disconnected')
            });

            socket.on('chat message', async (msg) => {
                if (/^conectar.*/.test(msg)) {
                    // const [,ip, port] = msg.split(':')
                    const [ip, port] = listIp[msg.split(' ')[1]]
                    await openTelnet([ip, port], io)
                    io.emit('chat message', 'Espera comando');
                } else {
                    if (connect) {
                        client.write(msg + '\r\n')
                        isCmdExec = true
                    }
                    // say('tell', 'Websocket', `Message: ${msg}`)
                    io.emit('chat message', msg);
                }
            });
        });
    },
}
