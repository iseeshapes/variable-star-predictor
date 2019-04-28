package uk.co.iseeshapes.binarystars;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Application {
    private static final Logger log = LoggerFactory.getLogger(Application.class);

    private static final Pattern variableTypePattern = Pattern.compile("^E([AWBP])?([+/:].*)?$");

    private static List<VariableStar> merge (List<GCVSStar> gcvsStars, List<KrakowStar> krakowStars) {
        VariableStar variableStar;
        List<VariableStar> variableStars = new ArrayList<>();

        KrakowStar krakowStar = null;
        boolean found;
        Matcher matcher;

        for (GCVSStar gcvsStar : gcvsStars) {
            found = false;
            Iterator<KrakowStar> krakowStarIterator = krakowStars.iterator();
            while (krakowStarIterator.hasNext()) {
                krakowStar = krakowStarIterator.next();
                if (krakowStar.gcvsName.equalsIgnoreCase(gcvsStar.name)) {
                    krakowStarIterator.remove();
                    found = true;
                    break;
                }
            }

            if (!found) {
                matcher = variableTypePattern.matcher(gcvsStar.type);
                if (!matcher.matches()) {
                    continue;
                }
            }
            variableStar = new VariableStar();
            variableStar.names.put("GCVS", gcvsStar.name);
            variableStar.type = gcvsStar.type;
            variableStar.maximumMagnitude = gcvsStar.maximumMagnitude;
            variableStar.minimumMagnitude = gcvsStar.minimumMagnitude;
            variableStar.epoch = gcvsStar.epoch;
            variableStar.period = gcvsStar.period;
            variableStar.eclipseTime = gcvsStar.eclipseTime;
            variableStar.rightAscension = gcvsStar.rightAscension;
            variableStar.declination = gcvsStar.declination;
            variableStar.spectralType = gcvsStar.spectralType;
            if (krakowStar != null && found) {
                variableStar.names.put("Krakow", krakowStar.krakowName);
                variableStar.epoch = krakowStar.epoch;
                variableStar.period = krakowStar.period;
            }

            variableStars.add(variableStar);
        }

        return variableStars;
    }

    public static void main (String[] args) throws IOException {
        File gvcsDataFile = new File(args[0]);
        File krakrowFile = new File(args[1]);
        File jsonFile = new File (args[2]);

        FileReader fileReader = new FileReader(gvcsDataFile);
        BufferedReader bufferedReader = new BufferedReader(fileReader);
        String record;

        int gcvsLineCount = 0;
        GCVSStar gcvsStar;
        List<GCVSStar> gcvsStars = new ArrayList<>();

        while (true) {
            record = bufferedReader.readLine();
            if (record == null) {
                break;
            }
            gcvsLineCount++;
            if (gcvsLineCount < 2) {
                continue;
            }
            gcvsStar = GCVSStar.createStar(record);
            if (gcvsStar != null) {
                gcvsStars.add(gcvsStar);
            }
        }
        fileReader.close();
        log.info ("Found {} GCVS stars from {} lines", gcvsStars.size(), gcvsLineCount);

        fileReader = new FileReader(krakrowFile);
        bufferedReader = new BufferedReader(fileReader);

        int krackowLineCount = 0;
        KrakowStar krakowStar;
        List<KrakowStar> krakowStars = new ArrayList<>();
        String lastName = "";
        while (true) {
            record = bufferedReader.readLine();
            if (record == null) {
                break;
            }
            krackowLineCount++;
            if (krackowLineCount < 2) {
                continue;
            }
            krakowStar = KrakowStar.createStar(record, lastName);
            if (krakowStar != null) {
                lastName = krakowStar.gcvsName;
                krakowStars.add(krakowStar);
            }
        }
        fileReader.close();
        log.info ("Found {} Krakow stars from {} lines", krakowStars.size(), krackowLineCount);

        List<VariableStar> variableStars = merge(gcvsStars, krakowStars);

        StringBuilder message = new StringBuilder();
        message.append("\nKrakow Stars not merged:");
        if (krakowStars.size() > 0) {
            for (KrakowStar star : krakowStars) {
                message.append("\n").append(star.krakowName);
            }
        }

        VariableStar variableStar;
        Iterator<VariableStar> variableStarIterator = variableStars.iterator();
        //message.append("\n\nStars removed for having 0 period:");
        while (variableStarIterator.hasNext()) {
            variableStar = variableStarIterator.next();
            if (variableStar.period == 0.0) {
                variableStarIterator.remove();
                //message.append('\n').append(variableStar.names.get("GCVS"));
            }
        }
        log.error(message.toString());

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(jsonFile, variableStars);
    }
}
