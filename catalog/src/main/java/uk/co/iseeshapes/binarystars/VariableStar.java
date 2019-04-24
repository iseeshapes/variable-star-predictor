package uk.co.iseeshapes.binarystars;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.HashMap;
import java.util.Map;

public class VariableStar {
    @JsonProperty
    Map<String, String> names = new HashMap<>();

    @JsonProperty
    String type;

    @JsonProperty
    double maximumMagnitude;

    @JsonProperty
    double minimumMagnitude;

    @JsonProperty
    double epoch;

    @JsonProperty
    double period;

    @JsonProperty
    double eclipseTime;

    @JsonProperty
    double rightAscension;

    @JsonProperty
    double declination;

    @JsonProperty
    String spectralType;
}
