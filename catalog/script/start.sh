#!/usr/bin/env bash

data_dir=/Users/eliot/astro/data

gcvsFile="$data_dir/General Catalog Variable Stars/gcvs5.txt"
krackowFile="$data_dir/Krakow Univerity Eclipsing Binaries/EPHEM.TXT"
eclipsingFile=$data_dir/tmp/eclipsingVariableStarData.json
pulsatingFile=$data_dir/tmp/pulsatingVariableStarData.json
jarFile=build/libs/binaryStarData.jar
jarFiles="build/libs/*"

#echo java -classpath $jarFile:$jarFiles uk.co.iseeshapes.binarystars.Application "$inputFile" $outputFile

java -classpath $jarFile:$jarFiles uk.co.iseeshapes.binarystars.Application "$gcvsFile" "$krackowFile" ${eclipsingFile} ${pulsatingFile}
