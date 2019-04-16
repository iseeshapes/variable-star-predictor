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

module.exports = class JulianDate {
  constructor () {
    this.J2000Epoch = 2451545.0;
    this.dayInMilliseconds = 24 * 60 * 60 * 1000;
    this.epochDate = new Date (2000, 1, 1, 12, 0, 0, 0);
  }

  getJulianDate (date) {
    var julianDate = (date.getTime() - this.epochDate.getTime()) / this.dayInMilliseconds;
    return julianDate + this.J2000Epoch;
  }

  getStartJulianDate () {
    var startDate = new Date();

    startDate.setHours(20);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    return this.getJulianDate(startDate);
  }

  getEndJulianDate () {
    var endDate = new Date();

    endDate.setHours(5);
    endDate.setMinutes(0);
    endDate.setSeconds(0);
    endDate.setMilliseconds(0);

    endDate.setTime(endDate.getTime() + this.dayInMilliseconds);

    return this.getJulianDate(endDate);
  }

  getDate (julianDate) {
    var julianDate2 = julianDate - this.J2000Epoch;
    var time = this.epochDate.getTime() + (julianDate2 * this.dayInMilliseconds);
    return new Date(time);
  }

}
