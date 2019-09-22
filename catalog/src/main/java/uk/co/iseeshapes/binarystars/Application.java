package uk.co.iseeshapes.binarystars;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Application {
    private static final Logger log = LoggerFactory.getLogger(Application.class);

    private static final Pattern binaryStarTypePattern = Pattern.compile("^E([AWBP])?([+/:].*)?$");
    private static final Pattern pulsatingStarTypePattern = Pattern.compile("^(.*[+:/])?(ACYG|BCEPS?|BLBOO|CEPB?|CW(AB)|DCEPS?|DSCTC?|GDOR|L[BC]?|LPB|M|PVTEL|RPHS|RR(\\(B\\)|AB|C)?|RV[AB]?|SR[A-DS]?|SXPHE|ZZ[ABO]?)([+:/].*)?$");

    private static final double fileEpoch = 2458485.0; // 12 noon 1/1/2019

    private List<VariableStar> eclipsingVariableStars;
    private List<VariableStar> pulsatingVariableStars;

    private List<GCVSStar> gcvsStars;
    private List<KrakowStar> krakowStars;

    private Application ()  {
        eclipsingVariableStars = new ArrayList<>();
        pulsatingVariableStars = new ArrayList<>();

        gcvsStars = new ArrayList<>();
        krakowStars = new ArrayList<>();
    }

    private void loadGCVSFile (File gcvsDataFile) throws IOException {
        gcvsStars.clear();

        FileReader fileReader = new FileReader(gcvsDataFile);
        String record;
        try (BufferedReader bufferedReader = new BufferedReader(fileReader)) {
            int gcvsLineCount = 0;
            GCVSStar gcvsStar;

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
            log.info("Found {} GCVS stars from {} lines", gcvsStars.size(), gcvsLineCount);
        }
    }

    private void loadKrackowFile (File krakrowFile) throws IOException {
        krakowStars.clear();

        KrakowStar krakowStar;
        int krackowLineCount = 0;
        String record;
        String lastName = "";
        FileReader fileReader = new FileReader(krakrowFile);

        try (BufferedReader bufferedReader = new BufferedReader(fileReader)) {
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
        }
        log.info ("Found {} Krakow stars from {} lines", krakowStars.size(), krackowLineCount);
    }

    private static VariableStar createVariableStar(GCVSStar gcvsStar) {
        VariableStar variableStar;

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

        return variableStar;
    }

    private void createEclipsingVariableStars() {
        eclipsingVariableStars.clear();

        VariableStar variableStar;

        KrakowStar krakowStar = null;
        boolean found;
        Matcher matcher;
        int count = 0;
        int krackowCount = 0;

        for (GCVSStar gcvsStar : gcvsStars) {
            found = false;
            for (KrakowStar krakowStar1 : krakowStars) {
                krakowStar = krakowStar1;
                if (krakowStar.gcvsName.equalsIgnoreCase(gcvsStar.name)) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                matcher = binaryStarTypePattern.matcher(gcvsStar.type);
                if (!matcher.matches()) {
                    continue;
                }
            }
            count++;
            variableStar = createVariableStar(gcvsStar);
            if (krakowStar != null && found) {
                krackowCount++;
                variableStar.names.put("Krakow", krakowStar.krakowName);
                variableStar.epoch = krakowStar.epoch;
                variableStar.period = krakowStar.period;
            }

            if (variableStar.period <= 0.0) {
                continue;
            }
            while (variableStar.epoch + variableStar.period < fileEpoch) {
                variableStar.epoch += variableStar.period;
            }
            /*if (variableStar.period <= 0.1) {
                log.info("GCVS: {}, period : {}", gcvsStar.name, gcvsStar.period);
                continue;
            }*/
            eclipsingVariableStars.add(variableStar);
        }
        if (log.isInfoEnabled()) {
            log.info("Created {} eclipsing binary variable stars of which {} are from the Krackow catalog", count, krackowCount);
        }
    }

    private void createPulsatingVariableStars() {
        pulsatingVariableStars.clear();
        Matcher matcher;
        int count = 0;

        for(GCVSStar gcvsStar : gcvsStars) {
            matcher = pulsatingStarTypePattern.matcher(gcvsStar.type);
            if (gcvsStar.maximumMagnitude > 14.0 || !matcher.matches()) {
                continue;
            }
            if (gcvsStar.period <= 0.0) {
                continue;
            }
            while (gcvsStar.epoch + gcvsStar.period < fileEpoch) {
                gcvsStar.epoch += gcvsStar.period;
            }
            /*if (gcvsStar.period <= 0.1) {
                log.info("GCVS: {}, period : {}", gcvsStar.name, gcvsStar.period);
                continue;
            }*/
            count++;
            pulsatingVariableStars.add(createVariableStar(gcvsStar));
        }
        if (log.isInfoEnabled()) {
            log.info("Created {} pulsating variable stars", count);
        }
    }

    public static void main (String[] args) throws IOException {
        File gcvsDataFile = new File(args[0]);
        File krakrowFile = new File(args[1]);
        File eclipsingStarsFile = new File (args[2]);
        File pulsatingStarsFile = new File (args[3]);

        Application application = new Application();
        application.loadGCVSFile(gcvsDataFile);
        application.loadKrackowFile(krakrowFile);
        application.createEclipsingVariableStars();
        application.createPulsatingVariableStars();

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(eclipsingStarsFile, application.eclipsingVariableStars);
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(pulsatingStarsFile, application.pulsatingVariableStars);
    }
}
