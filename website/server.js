/*
This file is part of BinaryStarEclipsePredictor.

BinaryStarEclipsePredictor is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

BinaryStarEclipsePredictor is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with BinaryStarEclipsePredictor.  If not, see <https://www.gnu.org/licenses/>.
*/
'use strict';

const path = require('path')
const fs = require ('fs');
const express = require('express');
const app = express();
const port = 3000;

const JulianDate = require('./modules/julianDate');
const julianDate = new JulianDate ();
const Equatorial = require('./modules/equatorial');
const equatorial = new Equatorial ();

function toRadians(degrees) {
  return degrees * Math.PI / 180.0;
}

function toDegrees(radians) {
  return radians * 180.0 / Math.PI;
}

function createTimeAndPosition (time, binaryStar, longitude, latitude) {
  let hourAngle = equatorial.calculateHourAngleFromEquatorial(time, longitude,
    binaryStar.rightAscension);
  let altitude = equatorial.calculateAltitude (hourAngle, binaryStar.declination,
    latitude);
  let azimuth = equatorial.calculateAzimuth (hourAngle, binaryStar.declination,
    latitude, altitude);

  return {
    date: julianDate.getDate (time),
    azimuth: toDegrees(azimuth),
    altitude: toDegrees(altitude)
  }
}

app.get("/searchType/:searchType/longitude/:longitude/latitude/:latitude/miniumAltitude/:miniumAltitude/maximumMagnitude/:maximumMagnitude/startDate/:startDate/endDate/:endDate", (request, response) => {
    if (request.params.searchType == undefined || request.params.searchType == null) {
      response.status(500).json({ message : "No 'searchType' parameter defined in query string" });
      return;
    }

    if (request.params.longitude == null || request.params.longitude == undefined) {
      response.status(500).json({ message : "No 'longitude' parameter defined in query string" });
      return;
    }

  if (request.params.latitude == null || request.params.latitude == undefined) {
    response.status(500).json({ message : "No 'latitude' parameter defined in query string" });
    return;
  }

  if (request.params.miniumAltitude == null || request.params.miniumAltitude == undefined) {
    response.status(500).json({ message : "No 'miniumAltitude' parameter defined in query string" });
    return;
  }

  if (request.params.maximumMagnitude == null || request.params.maximumMagnitude == undefined) {
    response.status(500).json({ message : "No 'maximumMagnitude' parameter defined in query string" });
    return;
  }

  if (request.params.startDate == null || request.params.startDate == undefined) {
    response.status(500).json({ message : "No 'startDate' parameter defined in query string" });
    return;
  }

  if (request.params.endDate == null || request.params.endDate == undefined) {
    response.status(500).json({ message : "No 'endDate' parameter defined in query string" });
    return;
  }

  let longitude = toRadians(request.params.longitude);
  let latitude = toRadians(request.params.latitude);
  let miniumAltitude = request.params.miniumAltitude;
  let maximumMagnitude = request.params.maximumMagnitude;
  let startDate = new Date(request.params.startDate);
  let endDate = new Date(request.params.endDate);

  let startJulianDate = julianDate.getJulianDate(startDate);
  let endJulianDate = julianDate.getJulianDate(endDate);

  let rawData = undefined;
  if (request.params.searchType === "eclipsing") {
      rawData = fs.readFileSync ('data/eclipsingVariableStarData.json');
  } else if (request.params.searchType === "pulsating") {
      rawData = fs.readFileSync ('data/pulsatingVariableStarData.json');
  }
  let binaryStars = JSON.parse(rawData);

  let results = [];

  let midEclipseTime, startEclipseTime, endEclipseTime;
  let midEclipse, startEclipse, endEclipse;
  let fast;

  for (let i=0;i<binaryStars.length;i++) {
    if (binaryStars[i].minimumMagnitude > maximumMagnitude
      || binaryStars[i].maximumMagnitude > maximumMagnitude) {
      continue;
    }

    if (binaryStars[i].period <= 0.0) {
        continue;
    } else if (binaryStars[i].period <= 0.2) {
        fast = true;
        midEclipseTime = (endJulianDate + startJulianDate) / 2;
    } else {
        midEclipseTime = binaryStars[i].epoch;
        while (midEclipseTime < startJulianDate) {
            midEclipseTime += binaryStars[i].period;
        }
        fast = false;
    }

    if (fast === false && binaryStars[i].eclipseTime > 0) {
      startEclipseTime = midEclipseTime - binaryStars[i].eclipseTime / 2;
      endEclipseTime = midEclipseTime + binaryStars[i].eclipseTime / 2;

      if (startEclipseTime < startJulianDate || endEclipseTime > endJulianDate) {
        continue;
      }

      midEclipse = createTimeAndPosition(midEclipseTime, binaryStars[i], longitude, latitude);
      if (midEclipse.altitude < miniumAltitude) {
          continue;
      }

      startEclipse = createTimeAndPosition(startEclipseTime, binaryStars[i], longitude, latitude);
      endEclipse = createTimeAndPosition(endEclipseTime, binaryStars[i], longitude, latitude);

      if (startEclipse.altitude < miniumAltitude
        || endEclipse.altitude < miniumAltitude) {
        continue;
      }
    } else {
      if (midEclipseTime < startJulianDate || midEclipseTime > endJulianDate) {
        continue;
      }

      midEclipse = createTimeAndPosition(midEclipseTime, binaryStars[i], longitude, latitude);
      if (midEclipse.altitude < miniumAltitude) {
        continue;
      }
      startEclipse = null;
      endEclipse = null;
    }

    results.push({
      names: binaryStars[i].names,
      type: binaryStars[i].type,
      minimumMagnitude: binaryStars[i].minimumMagnitude,
      maximumMagnitude: binaryStars[i].maximumMagnitude,
      startEclipse: startEclipse,
      midEclipse: midEclipse,
      endEclipse: endEclipse,
      spectralType: binaryStars[i].spectralType,
      fast: fast
    });
  }

  response.status(200).json(results);
});

app.listen(port);
