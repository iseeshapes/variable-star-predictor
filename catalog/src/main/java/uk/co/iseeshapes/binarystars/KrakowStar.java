package uk.co.iseeshapes.binarystars;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class KrakowStar {
    private static final Logger log = LoggerFactory.getLogger(KrakowStar.class);

    private static final Pattern typePattern = Pattern.compile("^ALL|PRI$");
    private static final Pattern vStarNamePattern = Pattern.compile("^([A-Z]{3})\\sV([0-9]+)$");
    private static final Pattern starNamePattern = Pattern.compile("^([A-Z]{3})\\s([A-Z]+)$");

    String krakowName;

    String gcvsName;

    double epoch;

    double period;

    public static KrakowStar createStar(String line, String lastName) {
        String rawType = line.substring(10, 13).toUpperCase();
        Matcher matcher = typePattern.matcher(rawType);
        if (!matcher.matches()) {
            //log.info("Type: {}", rawType);
            return null;
        }

        String starName;
        String rawName = line.substring(0, 9).trim();
        matcher = vStarNamePattern.matcher(rawName);
        if (matcher.matches()) {
            starName = String.format("V%04d %s", Integer.parseInt(matcher.group(2)), matcher.group(1));
        } else {
            matcher = starNamePattern.matcher(rawName);
            if (matcher.matches()) {
                String forename = matcher.group(2);
                if (forename.length() > 3) {
                    forename = forename.substring(0, 3);
                }
                starName = forename + " " + matcher.group(1);
            } else {
                log.error("Cannot match \"{}\" to patterns {} or {}", rawName, starNamePattern.pattern(),
                        vStarNamePattern.pattern());
                return null;
            }
        }

        if (starName.equals(lastName)) {
            return null;
        }

        KrakowStar krakowStar = new KrakowStar();
        krakowStar.krakowName = rawName;
        krakowStar.gcvsName = starName;

        String rawEpoch = line.substring(14, 26);
        try {
            krakowStar.epoch = Double.parseDouble(rawEpoch.trim());
        } catch (NumberFormatException e) {
            log.error("Cannot convert \"{}\" to julian day epoch", rawEpoch);
            return null;
        }

        String rawPeriod = line.substring(33, 46);
        try {
            krakowStar.period = Double.parseDouble(rawPeriod);
        } catch (NumberFormatException e) {
            log.error("Cannot convert \"{}\" to period", rawPeriod);
            return null;
        }

        return krakowStar;
    }
}
