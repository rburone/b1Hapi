function b1Socket(client) {
    this.client = client
    this.ip     = null
    this.port   = null

    this.connect = async (ip, port) => {
        return new Promise((resolve, reject) => {
            this.client.connect(ip, port, () => {
                this.ip = ip
                this.port = port

                this.client.on('close', () => {
                });

                resolve('ok')
            });

            this.client.on('error', error => {
                reject(error)
            });

        })
    }

    this.send = async (msg) => {
        let response = ''
        return new Promise((resolve, reject) => {
            this.client.write(msg + '\r\n')
            let line = '';

            this.client.on('data', chunk => {
                let str = chunk.toString();
                const isEnd = chunk[chunk.length - 1] == 62

                for (let i = 0, len = str.length; i < len; i++) {
                    let chr = str[i];
                    line += chr;

                    if (/[\n\r]$/.test(chr)) {
                        console.log(line)
                        response += line + chr
                        line = '';
                    }

                    if (isEnd) {
                        console.log('END')
                        resolve(response)
                    }
                }
            });

            this.client.on('error', error => {
                reject(error)
            });
        })
    }
}

if (typeof module !== 'undefined') {
    module.exports = b1Socket
}
