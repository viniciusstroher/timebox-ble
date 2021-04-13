const noble = require('noble')
const http = require('http')
const fs = require('fs')
const server = require('http').createServer()
const socketServer = require('socket.io')(server)
const UPDATE_GYROSCOPE = 'UPDATE_GYROSCOPE'
const socketPort = 3000

const now = () => {
	return new Date().toString()
}

socketServer.on('connection', client => {
  console.log(`on socket -> client connected`)
  client.on('disconnect', () => console.log(`on socket -> client disconnect`));
  client.on(UPDATE_GYROSCOPE, (event) => {
  	console.log(UPDATE_GYROSCOPE, event)
  })
});


noble.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('scanStart', function() {
  console.log('on -> scanStart');
});

noble.on('scanStop', function() {
  console.log('on -> scanStop');
});

noble.on('discover', function(peripheral) {
  console.log('on -> discover: ' + peripheral);

  noble.stopScanning();

  peripheral.on('connect', function() {
    console.log('on -> connect');
    this.updateRssi();
  });

  peripheral.on('disconnect', function() {
    console.log('on -> disconnect');
  });

  peripheral.on('rssiUpdate', function(rssi) {
    console.log('on -> RSSI update ' + rssi);
    this.discoverServices();
  });

  peripheral.on('servicesDiscover', function(services) {
    console.log('on -> peripheral services discovered');
    
    services.forEach((s,i) => {
    	console.log(`on -> service [${i}] name: ${s.name} - ${s.uuid}`)
    })

    const BLE_CUSTOM_SERVICE_TIMEBOX = 2;

    services[BLE_CUSTOM_SERVICE_TIMEBOX].on('includedServicesDiscover', function(includedServiceUuids) {
      console.log('on -> service included services discovered ' + includedServiceUuids);
      this.discoverCharacteristics();
    });

    services[BLE_CUSTOM_SERVICE_TIMEBOX].on('characteristicsDiscover', function(characteristics) {
      console.log('on -> service characteristics discovered ' + characteristics);
      BLE_CUSTOM_SERVICE_CHARATERISTIC_TIMEBOX = 0;
      characteristics[BLE_CUSTOM_SERVICE_CHARATERISTIC_TIMEBOX].on('read', function(data, isNotification) {
        console.log('on -> characteristic read ' + data + ' ' + isNotification);
        // peripheral.disconnect();
        const gyroscopeData = JSON.parse(data.toString())
        socketServer.sockets.emit(UPDATE_GYROSCOPE, gyroscopeData)
      });
      
      characteristics[BLE_CUSTOM_SERVICE_CHARATERISTIC_TIMEBOX].on('notify', function(state) {
        console.log('on -> characteristic notify ' + state);
        // peripheral.disconnect();
      });

      characteristics[BLE_CUSTOM_SERVICE_CHARATERISTIC_TIMEBOX].subscribe(function(error) {
        console.log('on -> esp32 notification on');
      });
    });

    services[BLE_CUSTOM_SERVICE_TIMEBOX].discoverIncludedServices();
  });
  peripheral.connect();
});

console.log(`[${now()}][starting] 0.0.0.0:${socketPort}`)
server.listen(socketPort);