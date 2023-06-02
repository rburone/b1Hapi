class b1SseChannel {
    contructor() {
        this.connectionsClis  = [];
        this.connectionsCount = () => this.connectionsClis.length;
        this.jsonEncode = true
    }

    suscribe(req, res) {
        this.connectionsClis.push(res)
    }

    unSuscribe(res) {
        const i = this.connections.indexOf(res)
        while (i !== -1) {
            this.connections.splice(i, 1)
            i = this.connections.indexOf(res)
        }
    }

    send(msg, clients) {
        const message = this.parseMessage(msg, this.jsonEncode);

        if (!clients) {
            // Remove duplicate entries from the history
            if (msg.id) {
                this.history = this.history.filter(entry => entry.id !== msg.id)
            }

            // Add the message to history (if not a "private" message)
            const entry = { id: msg.id, msg: message };
            if (msg.id && this.history.unshift(entry) > this.historySize) {
                this.history.pop();
            }
        }

        this.broadcast(clients || this.connections, message);

        // this.emit('message', this, msg, clients || this.connections);
    }

    broadcast(connections, packet) {
        var i = connections.length;
        while (i--) {
            connections[i].write(packet);
            this.flush(connections[i]);
        }
    }

    flush(response) {
        if (response.flush && response.flush.name !== 'deprecated') {
            response.flush();
        }
    }

    parseMessage(msg, jsonEncode) {
        if (typeof msg === 'string') {
            msg = { data: msg };
        }

        var output = '';
        if (msg.event) {
            output += 'event: ' + msg.event + '\n';
        }

        if (msg.retry) {
            output += 'retry: ' + msg.retry + '\n';
        }

        if (msg.id) {
            output += 'id: ' + msg.id + '\n';
        }

        var data = msg.data || '';
        if (jsonEncode) {
            data = JSON.stringify(data);
        }

        output += this.parseTextData(data);

        return output;
    }

    parseTextData(text) {
        var data = String(text).replace(/(\r\n|\r|\n)/g, '\n');
        var lines = data.split(/\n/), line;

        var output = '';
        for (var i = 0, l = lines.length; i < l; ++i) {
            line = lines[i];

            output += 'data: ' + line;
            output += (i + 1) === l ? '\n\n' : '\n';
        }

        return output;
    }
}
