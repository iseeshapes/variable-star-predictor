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

var tableData = [];

function formatTime (date) {
  var hour = date.getHours();
  var minute = date.getMinutes();

  var result = "";

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

function updateTable () {
  $("table.data tr.data").remove();

  var sort = $("#sort").val();
  if ("time".localeCompare(sort) == 0) {
    tableData.sort((lhs, rhs) => {
      var lhsDate = new Date(lhs.midEclipse.date);
      var rhsDate = new Date(rhs.midEclipse.date);
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
      return lhs.name.localeCompare(rhs.name);
    });
  } else if ("type".localeCompare(sort) == 0) {
    tableData.sort((lhs, rhs) => {
      return lhs.type.localeCompare(rhs.type);
    });
  }

  var excludeNoStart = $("#excludeNoStart").is(":checked");
  var variableType = $("#variableType").val().toUpperCase();
  for (var i=0;i<tableData.length;i++) {
    if (excludeNoStart && tableData[i].startEclipse === null) {
      continue;
    }
    if (variableType.length > 0 && tableData[i].type.indexOf(variableType) == -1) {
      continue;
    }

    var html = '<tr class="data"><td class="data">' + tableData[i].name + '</td>'
      + '<td class="data">' + tableData[i].type + '</td>'
      + '<td class="data number">' + tableData[i].maximumMagnitude.toFixed(2) + '</td>'
      + '<td class="data number">' + tableData[i].minimumMagnitude.toFixed(2) + '</td>';

    html += fillInEclipsePoint(tableData[i].startEclipse);
    html += fillInEclipsePoint(tableData[i].midEclipse);
    html += fillInEclipsePoint(tableData[i].endEclipse);
    html += '</tr>';
    //console.log (html);
    $("#dataTable > tbody:last-child").append(html);
  }
}

function calculate () {
  var longitude = $("#longitude").val();
  var latitude = $("#latitude").val();
  var miniumAltitude = $("#miniumAltitude").val();
  var maximumMagnitude = $("#maximumMagnitude").val();

  if (longitude !== "") {
    setCookie("longitude", longitude, 60);
  } else {
    return;
  }

  if (latitude !== "") {
    setCookie("latitude", latitude, 60);
  } else {
    return;
  }

  if (miniumAltitude !== "") {
    setCookie("miniumAltitude", miniumAltitude, 60);
  } else {
    miniumAltitude = 30;
  }

  if (maximumMagnitude !== "") {
    setCookie("maximumMagnitude", maximumMagnitude, 60);
  } else {
    maximumMagnitude = 18;
  }

  var query = "/search/longitude/" + longitude
    + "/latitude/" + latitude
    + "/miniumAltitude/" + miniumAltitude
    + "/maximumMagnitude/" + maximumMagnitude;

  $.getJSON (query, function (_data) {
    tableData = _data;
    updateTable ();
  });
}
