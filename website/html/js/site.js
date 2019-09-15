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

let tableData = [];

function getPeriod (startHour, endHour) {
  let dayInMilliseconds = 24 * 60 * 60 * 1000;
  let period = {};

  period.startDate = new Date();
  period.startDate.setHours(startHour);
  period.startDate.setMinutes(0);
  period.startDate.setSeconds(0);
  period.startDate.setMilliseconds(0);

  period.endDate = new Date();
  period.endDate.setHours(endHour);
  period.endDate.setMinutes(0);
  period.endDate.setSeconds(0);
  period.endDate.setMilliseconds(0);
  if (endHour < startHour) {
    period.endDate.setTime(period.endDate.getTime() + dayInMilliseconds);
  }

  return period;
}

function formatTime (date) {
  let hour = date.getHours();
  let minute = date.getMinutes();

  let result = "";

  if (hour < 10) {
    result += "0";
  }
  result += hour;

  result += ":";

  if (minute < 10) {
    result += "0";
  }
  result += minute;

  return result;
}

function fillInEclipsePoint (eclipsePoint) {
  if (eclipsePoint === null) {
    return '<td class="data blank">-</td><td class="data blank">-</td>'
  }
  return '<td class="data time">' + formatTime(new Date(eclipsePoint.date)) + '</td>'
    + '<td class="data number">' + eclipsePoint.altitude.toFixed(0) + '</td>';
}

function fillInSources (names) {
  let url = "http://www.sai.msu.su/gcvs/cgi-bin/search.cgi?search=" + names.GCVS;
  url = url.replace(" ", "+");

  let sources = '<td class="data">';
  sources += '<a href="' + url + '" target="_blank">GCVS</a>';
  if (typeof names.Krakow !== 'undefined') {
    url = "http://www.as.up.krakow.pl/minicalc/" + names.Krakow + ".HTM"
    url = url.replace (" ", "");

    sources += ', <a href="' + url + '" target="_blank">TIDAK</a>';
  }
  sources += "</td>";

  return sources
}

function updateTable () {
  let starNamePattern = /^([A-Z]{1,2}|[a-z.]{1,3}\s+\d?|V\d{4})*\s+([A-Za-z]{3}).*$/;
  $("table.data tr.data").remove();

  let sort = $("#sort").val();
  if ("time".localeCompare(sort) == 0) {
    tableData.sort((lhs, rhs) => {
      let lhsDate = new Date(lhs.midEclipse.date);
      let rhsDate = new Date(rhs.midEclipse.date);
      if (lhsDate < rhsDate) {
        return -1;
      }
      if (lhsDate > rhsDate) {
        return 1;
      }
      return 0;
    });
  } else if ("name".localeCompare(sort) == 0) {
    tableData.sort((lhs, rhs) => {
      let lhsMatch = lhs.names.GCVS.match(starNamePattern);
      let rhsMatch = rhs.names.GCVS.match(starNamePattern);

      if (rhsMatch == null && rhsMatch == null) {
        return 0;
      } else if (lhsMatch == null) {
        return 1;
      } else if (rhsMatch == null) {
        return -1;
      }

      let result = lhsMatch[2].localeCompare(rhsMatch[2]);
      if (result !== 0) {
        return result;
      }

      return lhsMatch[1].localeCompare(rhsMatch[1]);
    });
  } else if ("type".localeCompare(sort) == 0) {
    tableData.sort((lhs, rhs) => {
      return lhs.type.localeCompare(rhs.type);
    });
  } else if ("magnitude".localeCompare(sort) == 0) {
    tableData.sort ((lhs, rhs) => {
      let lhsRange = lhs.maximumMagnitude - lhs.minimumMagnitude;
      let rhsRange = rhs.maximumMagnitude - rhs.minimumMagnitude;
      if (lhsRange < rhsRange) {
        return -1;
      }
      if (lhsRange > rhsRange) {
        return 1;
      }
      return 0;
    });
  }

  let excludeNoStart = $("#excludeNoStart").is(":checked");
  let variableType = $("#variableType").val().toUpperCase();
  let sources;
  let starCount = 0;
  for (let i=0;i<tableData.length;i++) {
    if (excludeNoStart && tableData[i].startEclipse === null) {
      continue;
    }
    if (variableType.length > 0 && tableData[i].type.indexOf(variableType) == -1) {
      continue;
    }

    starCount++;

    let html = '<tr class="data"><td class="data">' + tableData[i].names.GCVS + '</td>'
      + '<td class="data">' + tableData[i].type + '</td>'
      + '<td class="data number">' + tableData[i].maximumMagnitude.toFixed(2) + '</td>'
      + '<td class="data number">' + tableData[i].minimumMagnitude.toFixed(2) + '</td>';

    html += fillInEclipsePoint(tableData[i].startEclipse);
    html += fillInEclipsePoint(tableData[i].midEclipse);
    html += fillInEclipsePoint(tableData[i].endEclipse);
    html += '<td class="data">' + tableData[i].spectralType + '</td>';
    html += fillInSources (tableData[i].names);
    html += '</tr>';
    //console.log (html);
    $("#dataTable > tbody:last-child").append(html);
  }

  if (starCount === 0) {
    $("#dataTable > tbody:last-child")
      .append('<tr class="data"><td colspan="12" class="no-results">No Stars</td></tr>');
    $("#summary").html("Try expanding search or loosening filters");
  } else if (starCount == tableData.length) {
    $("#summary").html(tableData.length + " stars found");
  } else {
    $("#summary").html("Filtered " + starCount + " from " + tableData.length + " stars found");
  }
}

function calculate () {
  let error = false;

  let longitude = getLongitude();
  let latitude = getLatitude();
  let miniumAltitude = getMiniumAltitude();
  let maximumMagnitude = getMaximumMagnitude();
  let startHour = getStarHour();
  let endHour = getEndHour();

  if (isNaN(longitude) || isNaN(latitude) || isNaN(miniumAltitude)
        || isNaN(maximumMagnitude) || isNaN(startHour) || isNaN(endHour)) {
    return;
  }

  let period = getPeriod (startHour, endHour);

  let query = "search/searchType/" + searchType
    + "/longitude/" + longitude
    + "/latitude/" + latitude
    + "/miniumAltitude/" + miniumAltitude
    + "/maximumMagnitude/" + maximumMagnitude
    + "/startDate/" + period.startDate
    + "/endDate/" + period.endDate;

  $.getJSON (query, function (_data) {
    tableData = _data;
    updateTable ();

    if (tableData.length > 0) {
      setCookie ("longitude", longitude);
      setCookie ("latitude", latitude);
      setCookie ("miniumAltitude", miniumAltitude);
      setCookie ("maximumMagnitude", maximumMagnitude);
      setCookie ("startHour", startHour);
      setCookie ("endHour", endHour);
    }
  });
}
