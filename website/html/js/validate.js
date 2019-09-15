'use strict'

function getNumber (id, min, max) {
  let value = $("#" + id).val();
  if (value === "") {
    value = NaN;
  } else {
    value = Number(value);
    if (min > value || value > max) {
      value = NaN;
    }
  }

  return value;
}

function validateNumber (id, value) {
  if (isNaN(value)) {
    $("#" + id).addClass("error");
    $("#submit").prop("disabled", true);
  } else {
    $("#" + id).removeClass("error");
  }
}

function getLongitude () {
  return getNumber("longitude", 0, 360);
}

function getLatitude () {
  return getNumber("latitude", -90, 90);
}

function getMiniumAltitude () {
  return getNumber ("miniumAltitude", 0, 90);
}

function getMaximumMagnitude () {
  return getNumber ("maximumMagnitude", -10, 20);
}

function getStarHour () {
  return getNumber("startHour", 0, 23);
}

function getEndHour () {
  return getNumber("endHour", 0, 23);
}

function validateAll () {
  $("#submit").prop("disabled", false);
  var longitude = getLongitude();
  var latitude = getLatitude();
  var miniumAltitude = getMiniumAltitude();
  var maximumMagnitude = getMaximumMagnitude();
  var startHour = getStarHour();
  var endHour = getEndHour();

  if (isNaN(longitude) || isNaN(latitude) || isNaN(miniumAltitude)
        || isNaN(maximumMagnitude) || isNaN(startHour) || isNaN(endHour)) {
    $("#submit").prop("disabled", true);
  }
}

function validateLongitude () {
  validateNumber ("longitude", getLongitude ());
  validateAll ();
}

function validateLatitude () {
  validateNumber ("latitude", getLatitude());
  validateAll ();
}

function validateMinimumAltitude () {
  validateNumber ("miniumAltitude", getMiniumAltitude ());
  validateAll ();
}

function validateMaximumMagnitude () {
  validateNumber ("maximumMagnitude", getMaximumMagnitude ());
  validateAll ();
}

function validateStarHour () {
  validateNumber ("startHour", getStarHour ());
  validateAll ();
}

function validateEndHour () {
  validateNumber ("endHour", getEndHour ());
  validateAll ();
}
