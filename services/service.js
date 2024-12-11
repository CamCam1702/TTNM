class CV {
  _dispatch(event) {
    const { msg } = event;
    this._status[msg] = ['loading'];
    this.worker.postMessage(event);
    return new Promise((res, rej) => {
      let interval = setInterval(() => {
        const status = this._status[msg];
        // if (!status || status == undefined) res(true);
        if (status[0] === 'done') {
          res(status[1]);
        } else if (status[0] === 'error') rej(status[1]);
        else if (status[0] !== 'loading') {
          delete this._status[msg];
          clearInterval(interval);
        }
      }, 0);
    });
  }

  load() {
    this._status = {};
    this.worker = new Worker('/js/worker.js'); // load worker

    // Capture events and save [status, event] inside the _status object
    this.worker.onmessage = (e) => (this._status[e.data.msg] = ['done', e]);
    this.worker.onerror = (e) => (this._status[e.data.msg] = ['error', e]);
    return this._dispatch({ msg: 'load' });
  }

  imageProcessing(payload) {
    return this._dispatch({ msg: 'imageProcessing', payload });
  }

  predict(payload) {
    return this._dispatch({ msg: 'predict', payload });
  }
}

export default new CV();
