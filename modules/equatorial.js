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
'use strict'

module.exports = class Equatorial {
  constructor () {
    this.J2000Epoch = 2451545.0;
    this.dayInSeconds = 24 * 60 * 60;
    this.hourInSeconds = 60 * 60;
    this.siderealDayRatio = 1.0027379093;

    this.sin_obliq_2000 = 0.397777155931913701597179975942380896684;
    this.cos_obliq_2000 = 0.917482062069181825744000384639406458043;
  }

  convertHoursToRadians (hours) {
      return hours * 2 * Math.PI / 24;
  }

  calculateGreenwichMeanSiderealTime(julianDate) {
      var partDay = julianDate % 1.0;
      if (partDay > 0.5) {
          partDay -= 0.5;
      } else {
          partDay += 0.5;
      }
      var roundedJulianDate = julianDate - partDay;
      var T = (roundedJulianDate - this.J2000Epoch) / 36525.0;
      var seconds = 24110.54841 + 8640184.812866 * T + 0.093104 * Math.pow(T,2) - 0.0000062 * Math.pow(T,3);
      seconds += partDay * this.siderealDayRatio * this.dayInSeconds;
      seconds = seconds % this.dayInSeconds;
      return this.convertHoursToRadians(seconds/this.hourInSeconds);
  }

  calculateLocalSiderealTime(julianDate, longitude) {
      var greenwichMeanSiderealTime = this.calculateGreenwichMeanSiderealTime(julianDate);
      return (greenwichMeanSiderealTime + longitude) % (2 * Math.PI);
  }

  calculateHourAngleFromEquatorial2(localSiderealTime, rightAscension) {
      var hourAngle = localSiderealTime - rightAscension;
      if (hourAngle < 0) {
          hourAngle += Math.PI * 2;
      } else if (hourAngle > Math.PI * 2) {
          hourAngle -= Math.PI * 2;
      }
      return hourAngle;
  }

  calculateHourAngleFromEquatorial(julianDate, longitude, rightAscension) {
      var localSiderealTime = this.calculateLocalSiderealTime(julianDate, longitude);
      return this.calculateHourAngleFromEquatorial2(localSiderealTime, rightAscension);
  }

  calculateAltitude (hourAngle, declination, latitude) {
      var altitude = Math.sin(declination) * Math.sin(latitude);
      altitude += Math.cos(declination) * Math.cos(latitude) * Math.cos(hourAngle);
      return Math.asin(altitude);
  }

  calculateAzimuth(hourAngle, declination, latitude, altitude) {
      var azimuth = Math.sin(declination) - (Math.sin(altitude) * Math.sin(latitude));
      azimuth =  azimuth / (Math.cos(altitude) * Math.cos(latitude));
      azimuth = Math.acos(azimuth);

      if (Math.sin(hourAngle) >= 0) {
          azimuth = (2 * Math.PI) - azimuth;
      }

      return azimuth;
  }
}
