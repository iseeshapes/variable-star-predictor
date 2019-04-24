#!/usr/bin/env bash

data_dir=/Users/eliot/astro/data

inputFile1="$data_dir/General Catalog Variable Stars/gcvs5.txt"
inputFile2="$data_dir/Krakow Univerity Eclipsing Binaries/EPHEM.TXT"
outputFile=$data_dir/tmp/binaryStarData.json
jarFile=build/libs/binaryStarData.jar
jarFiles="build/libs/*"

#echo java -classpath $jarFile:$jarFiles uk.co.iseeshapes.binarystars.Application "$inputFile" $outputFile

java -classpath $jarFile:$jarFiles uk.co.iseeshapes.binarystars.Application "$inputFile1" "$inputFile2" $outputFile
