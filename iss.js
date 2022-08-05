// contain logic for fetching data from each API
const request = require('request');

const fetchMyIP = function(myCBFxn) {
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) {
      myCBFxn(error, null);
      return;

    }

    if (response.statusCode !== 200) {
      myCBFxn(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    }

    const ip = JSON.parse(body).ip;
    myCBFxn(null, ip);
  });
};

const fetchCoordsByIp = function(ip, myCBFxn) {
  request(`http://ipwho.is/${ip}`, (error, response, body) => {

    if (error) {
      myCBFxn(error, null);
      return;
    }

    const bodyObj = JSON.parse(body);

    if (!bodyObj.success) {
      const message = `Success status was ${bodyObj.success}. Server message says: ${bodyObj.message} when fetching IP for ${bodyObj.ip}`;
      myCBFxn(Error(message), null);
      return;
    }

    const { latitude, longitude } = bodyObj;
    myCBFxn(null, { latitude, longitude });
  });
};

const fetchISSFlyOverTime = function(coords, myCBFxn) {
  const url = `https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      myCBFxn(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      myCBFxn(Error(`status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    myCBFxn(null, passes);
  });
};

const nextISSITimesForMyLocation = function(myCBFxn) {
  fetchMyIP((error, ip) => {
    if (error) {
      return myCBFxn(error, null);
    }
    fetchCoordsByIp(ip, (error, coordinates) => {
      if (error) {
        return myCBFxn(error, null);
      }
      fetchISSFlyOverTime(coordinates, (error, passTimes) => {
        if (error) {
          return myCBFxn(error, null);
        }
        myCBFxn(null, passTimes);
      });
    });
  });
};

module.exports = { nextISSITimesForMyLocation };