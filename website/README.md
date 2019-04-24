* Install NodeJS from https://nodejs.org/

* Install Components Using "npm":

    npm install

* In the data folder there must be a file called binaryStarData.json that contains
the binary star data in the JSON format below.

    [
      {
        "name" : "RT And",
        "type" : "EA/RS",
        "maximumMagnitude" : 8.97,
        "minimumMagnitude" : 9.28,
        "epoch" : 2451421.737,
        "period" : 0.628921627998352,
        "eclipseTime" : 0.10691667675971984,
        "rightAscension" : 6.070116966537161,
        "declination" : 0.9254753802804265
      }, {
        "name" : "SY And",
        "type" : "EA",
        "maximumMagnitude" : 10.7,
        "minimumMagnitude" : 12.2,
        "epoch" : 2417796.36,
        "period" : 34.908470153808594,
        "eclipseTime" : 2.0945082092285157,
        "rightAscension" : 0.05791366068378018,
        "declination" : 0.7629095959855013
      }
    ]

* To run the web server use:

    node server.js

* The site will be at:

    http://localhost:3000/

# License

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
