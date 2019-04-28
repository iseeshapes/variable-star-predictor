package uk.co.iseeshapes.binarystars;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

class GCVSStar {
    private static final Logger log = LoggerFactory.getLogger(GCVSStar.class);

    private static final Pattern starNamePattern = Pattern.compile("^([A-Z]{1,2}|[a-z.]{1,3}\\s+\\d?|V\\d{4})*\\s+([A-Za-z]{3}).*$");
    private static final Pattern magnitudePattern = Pattern.compile("^([\\s(<>])\\s*([-\\d.]+)[\\s:]*([\\s)]?)$");
    private static final Pattern ignoreMagnitudePattern = Pattern.compile("^[\\s\\d().:'BRIJUVabcgpuvy*]*$");
    private static final Pattern raDecPattern = Pattern.compile("(\\d{2})(\\d{2})(\\d{2}\\.\\d*)\\s+([+-]\\d{2})(\\d{2})(\\d{2}\\.\\d*)\\s*");
    private static final Pattern spectralTypePattern = Pattern.compile("^([OBAFGKM][0-9]?[IVX]*[e]?).*$");

    private static final double NoMagnitude = -100.0;

    @JsonProperty
    String name;

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

    private static double decodeMagnitude (double baseMagnitude, String raw) {
        double result;
        Matcher matcher = magnitudePattern.matcher(raw);
        if (!matcher.matches()) {
            matcher = ignoreMagnitudePattern.matcher(raw);
            if (!matcher.matches()) {
                log.error("Cannot match magnitude \"{}\" to pattern \"{}\"", raw, magnitudePattern.pattern());
            }
            return NoMagnitude;
        }
        result = Double.parseDouble(matcher.group(2));
        if ("(".equals(matcher.group(1))) {
            result += baseMagnitude;
        }
        return result;
    }

    private static double convertTimeToRadians (double hours, double minutes, double seconds) {
        return Math.toRadians((hours + minutes / 60 + seconds / 3600) * 15);
    }

    private static double convertDegreesToRadians (double degrees, double minutes, double seconds) {
        return Math.toRadians(degrees + minutes/60 + seconds/3600);
    }

    static GCVSStar createStar(String line) {
        String rawRaDec, variableType, rawEpoch, rawPeriod, rawPerCent, rawStarName, starName;
        double ra, dec, julianDate, max , min, min1, min2, period, eclipseTime;
        Matcher matcher;

        variableType = line.substring(41, 50);
        variableType = variableType.trim();

        rawStarName = line.substring(8, 18);
        matcher = starNamePattern.matcher(rawStarName);
        if (matcher.matches()) {
            starName = matcher.group(1).trim() + " " + matcher.group(2).trim();
        } else {
            log.error("Cannot match \"{}\" to pattern \"{}\"", rawStarName, starNamePattern.pattern());
            return null;
        }

        max = decodeMagnitude(0.0, line.substring(52, 60));
        if (max == NoMagnitude) {
            log.error("Star {} has no valid max magnitude raw = \"{}\"", starName, line.substring(52, 60));
            return null;
        }

        min1 = decodeMagnitude(max, line.substring(62, 74));
        min2 = decodeMagnitude(max, line.substring(75, 87));
        min = min1 > min2 ? min1 : min2;
        if (min == NoMagnitude) {
            log.error("Star {} has no valid min magnitude raw = \"{}\" / \"{}\"", starName, line.substring(62, 74), line.substring(75, 87));
            return null;
        }

        rawEpoch = line.substring(91, 101).trim();
        if (rawEpoch.length() > 0) {
            julianDate = Double.parseDouble("24" + rawEpoch);
        } else {
            julianDate = 0.0;
        }

        rawPeriod = line.substring(111, 126).trim();
        if (rawPeriod.length() == 0) {
            period = 0.0;
        } else {
            try {
                period = Float.parseFloat(rawPeriod);
            } catch (NumberFormatException e) {
                return null;
            }
            if (period == 0.0) {
                return null;
            }
        }

        rawPerCent = line.substring(131, 133).trim();
        if (rawPerCent.length() > 0) {
            eclipseTime = Double.parseDouble(rawPerCent) * period / 100.0;
        } else {
            eclipseTime = 0.0;
        }

        rawRaDec = line.substring(20, 39);
        matcher = raDecPattern.matcher(rawRaDec);
        if (matcher.matches()) {
            ra = convertTimeToRadians(Double.parseDouble(matcher.group(1)),
                    Double.parseDouble(matcher.group(2)), Double.parseDouble(matcher.group(3)));
            dec = convertDegreesToRadians(Double.parseDouble(matcher.group(4)),
                    Double.parseDouble(matcher.group(5)), Double.parseDouble(matcher.group(6)));
        } else {
            log.error("Cannot convert \"{}\" to pattern \"{}\"", rawRaDec, raDecPattern.pattern());
            return null;
        }

        String rawSpectralType = line.substring(137, 154).trim();
        if (rawSpectralType.length() != 0) {
            matcher = spectralTypePattern.matcher(rawSpectralType);
            if (!matcher.matches()) {
                //log.error("For star {} cannot convert \"{}\" to pattern \"{}\"", starName, rawSpectralType,
                //        spectralTypePattern.pattern());
                rawSpectralType = "";
            }
        }

        GCVSStar gcvsStar = new GCVSStar();
        gcvsStar.name = starName;
        gcvsStar.type = variableType;
        gcvsStar.maximumMagnitude = max;
        gcvsStar.minimumMagnitude = min;
        gcvsStar.epoch = julianDate;
        gcvsStar.period = period;
        gcvsStar.eclipseTime = eclipseTime;
        gcvsStar.rightAscension = ra;
        gcvsStar.declination = dec;
        gcvsStar.spectralType = rawSpectralType;

        return gcvsStar;
    }
}
