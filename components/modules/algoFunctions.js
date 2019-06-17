






<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAQJQRnhGCQj_MLfWgIIaeaPni4Vzw2eMI"></script>


var originsLatLngArr = [];

var LatList = [];//for center point
var LngList = [];//for center point

var addressArr = [] //will be received from DB

var allOptionalCenterPoints = [];
var minSumDistances = 1000;
var minVariance = 1000;
numSuccessGeoCode = 0;

$(document).ready(function () {

    // get adressArr from DB
    meetingId = 140;
    ajaxCall("GET", "../api/PreferenceParticipantMeetingLocation/getLocationsByMeeting?meetingId=" + meetingId, "", getSuccess, errorMeet);
});

//success- get locations from DB by meeting ID
function getSuccess(locationsdata) {
    var LatList = [];
    var LngList = [];
    var latLng;

    locations = locationsdata;
    console.log("locations", locations);
    for (var i = 0; i < locationsdata.length; i++) {
        LatList[i] = locationsdata[i].Latitude;
        LngList[i] = locationsdata[i].Longitude;
        latLng = { lat: locationsdata[i].Latitude, lng: locationsdata[i].Longitude };//array with the lat, lng of the current address
        //adding the latLng array of the current address to the origins array.
        originsLatLngArr.push(latLng);
    }


    console.log("originsLatLngArr:", originsLatLngArr);

    OriginPoints = {
        //Xarr and Yarr for calculating averages separately for X and Y
        LatList: LatList,
        LngList: LngList
    }
    CalcFirstCenterPoint(OriginPoints);


    //convert address to LATLNG
    // ConvertingFirst();

    //TBD- function that convert origins array to an objects array (JSON) array, with LatList and LngList fields

    ////get an initial center point
    //OriginPoints = {
    //    //Xarr and Yarr for calculating averages separately for X and Y
    //    LatList: [32.240830, 32.779370, 32.071270],
    //    LngList: [35.014100, 34.979770, 34.781700]
    //}
}

// this function is activated in case of a failure
function errorMeet(err) {
    swal("Error: " + err);
}
//success function of calculating first center point by average of origin points:
function success(centerPoint) {
    firstCenterPoint = { lat: centerPoint[0], lng: centerPoint[1] }; //convert the returned array to the "google" form
    console.log("first center point: ", firstCenterPoint);
    swal("sucess calculating initial point");
    //insert random points and first center point into "allOptionalCenterPoints" array:
    allOptionalCenterPoints = generateRandomPoints(centerPoint, 0.5, 3);
    console.log("allOptionalCenterPoints", allOptionalCenterPoints);//3 random points in 0.5 km radius
    allOptionalCenterPoints.push(firstCenterPoint);
    //run findDistances google function for each origin point
    for (var i = 0; i < allOptionalCenterPoints.length; i++) {
        findDistances(allOptionalCenterPoints[i]);
    }

    // console.log("originsLatLngArr", originsLatLngArr);

    //preform distances calculation for each point in the array as destnation in google request
    //for (var i = 0; i < allOptionalCenterPoints.length; i++) {
    //    findDistances(allOptionalCenterPoints[i]);
    //}
    //console.log(allOptionalCenterPoints[0].lat);
    //findDistances();
}

function error(err) {
    alert("error calculating initial point");
}

function findDistances(destination) {
    var bounds = new google.maps.LatLngBounds;
    var markersArray = [];
    var destinationIcon = 'https://chart.googleapis.com/chart?' +
        'chst=d_map_pin_letter&chld=D|FF0000|000000';
    var originIcon = 'https://chart.googleapis.com/chart?' +
        'chst=d_map_pin_letter&chld=O|FFFF00|000000';
    var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 32.077431, lng: 34.775952 }, //TBD - dynamic
        zoom: 10
    });
    var geocoder = new google.maps.Geocoder;

    var service = new google.maps.DistanceMatrixService;
    service.getDistanceMatrix({
        origins: originsLatLngArr,
        destinations: [destination],
        travelMode: 'DRIVING',
        unitSystem: google.maps.UnitSystem.METRIC, //Metric - returns distances in kilometers and meters.
        avoidHighways: false,
        avoidTolls: false
    }, function (response, status) {
        if (status !== 'OK') {
            alert('Error was: ' + status);
        } else {
            var originList = response.originAddresses;
            var destinationList = response.destinationAddresses;
            var outputDiv = document.getElementById('output');
            outputDiv.innerHTML = '';
            deleteMarkers(markersArray);

            //show on map
            var showGeocodedAddressOnMap = function (asDestination) {
                var icon = asDestination ? destinationIcon : originIcon;
                return function (results, status) {
                    if (status === 'OK') {
                        map.fitBounds(bounds.extend(results[0].geometry.location));
                        markersArray.push(new google.maps.Marker({
                            map: map,
                            position: results[0].geometry.location,
                            icon: icon
                        }));
                    } else {
                        alert('Geocode was not successful due to: ' + status);
                    }
                };
            };

            var distancesArr = [];
            var currentVariance;
            var sumDistances = 0

            //find the distance from the current center point to each origin point and display it on a div
            for (var i = 0; i < originList.length; i++) {
                var results = response.rows[i].elements;
                geocoder.geocode({ 'address': originList[i] },
                    showGeocodedAddressOnMap(false));
                for (var j = 0; j < results.length; j++) {
                    geocoder.geocode({ 'address': destinationList[j] },
                        showGeocodedAddressOnMap(true));
                    outputDiv.innerHTML += originList[i] + ' to ' + destinationList[j] +
                        ': ' + results[j].distance.text + ' in ' +
                        results[j].duration.text + '<br>';
                    console.log('results', results);

                    //add current distance to the DistancesSum and to the DistancesArr
                    sumDistances += (results[j].distance.value) / 1000; //distance in km
                    distancesArr.push((results[j].distance.value) / 1000)
                    //console.log("in the loop, itertion - " + i + ": distances Arr: ", distancesArr);
                }
            }
            console.log("distances Arr: ", distancesArr);
            console.log("sumDistances: ", sumDistances);
            currentVariance = CalcVariance(distancesArr); // varience of distances arr
            console.log("Variance: ", currentVariance);

            //finding the optimalPoint: minimum distances sum && minimum variance - comparing current destination to past destinations
            if (sumDistances < minSumDistances && currentVariance < minVariance) {
                alert("there is a minimum!")
                minSumDistances = sumDistances;
                minVariance = currentVariance;
                optimalPoint = destination;
                console.log("min Variance: ", minVariance);
                console.log("min SumDistances: ", sumDistances);
                console.log("optimal Point: ", optimalPoint);
                //send this optimal point to the nearByPlaces page
                jsonString = JSON.stringify(optimalPoint);
                localStorage["optimalPoint"] = jsonString; //save to local storage
                //      window.location.replace("nearbyPlaces.html");
            }
        }
    });
}

function deleteMarkers(markersArray) {
    for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
    }
    markersArray = [];
}
//calculate average of numbers' array
function CalcAverage(data) {
    var sum = 0, i;
    for (i = 0; i < data.length; i += 1) {
        sum += data[i];
    }
    avg = sum / data.length;
    return avg;
}
//calcula variance of numbers' array
function CalcVariance(values) {
    var avg = CalcAverage(values); //calculte avg of distances
    //console.log('avg', avg);
    var squareDiffs = values.map(function (value) {
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
    });
    var avgSquareDiff = CalcAverage(squareDiffs)
    return avgSquareDiff;
}
//function for generating random points within a circle of radius R and a center point
function generateRandomPoints(centerPoint, radius, numOfPoints) {
    var randomPointsArr = [];
    for (var i = 0; i < numOfPoints; i++) {
        r = radius * Math.sqrt(Math.random())
        theta = Math.random() * 2 * Math.PI
        point = {
            lat: centerPoint[0] + r * Math.cos(theta),
            lng: centerPoint[1] + r * Math.sin(theta)
        }

        randomPointsArr.push(point);
    }
    //console.log(randomPointsArr);
    return randomPointsArr;
}
//function that gets an address and convert it to latLng and adds it to the global 'originsLatLngArr'
function ConvertAddressToLatLng(address) {
    var geocoder2 = new google.maps.Geocoder();
    geocoder2.geocode({ 'address': address }, function (results, status) {
        console.log("status", status);
        if (status == google.maps.GeocoderStatus.OK) {
            var latitude = results[0].geometry.location.lat();
            var longitude = results[0].geometry.location.lng();
            console.log("latitude", latitude);
            console.log("longitude", longitude);
            var latLng = { lat: latitude, lng: longitude };//array with the lat, lng of the current address
            originsLatLngArr.push(latLng); //adding the latLng array of the current address to the address array.
            console.log("originsLatLngArr:", originsLatLngArr);
            numSuccessGeoCode++;
            if (counter == numSuccessGeoCode)
                AfterConverting();
        }
        else
            console.log("status", status);
    });
}
function AfterConverting() {
    OriginPoints = SeparateOriginsTo_X_Y_Arrays(originsLatLngArr);

    //sending the JSON of originPoints for calculating first a point
    ajaxCall("POST", "../api/algorithm/PutOriginPoints", JSON.stringify(OriginPoints), success, error);
    return false;
}
function ConvertingFirst() {
    counter = addressArr.length;
    for (var i = 0; i < addressArr.length; i++) {
        ConvertAddressToLatLng(addressArr[i]);
    }

}
//separate LatLngArr to 2 arrays of lats and lngs
function SeparateOriginsTo_X_Y_Arrays(originsLatLngArr) {

    for (var i = 0; i < originsLatLngArr.length; i++) {
        LatList.push(originsLatLngArr[i].lat);
        LngList.push(originsLatLngArr[i].lng);
    }
    console.log("Separate func - LatList:", LatList);
    console.log("Separate func - LngList:", LngList);

    OriginPoints = {
        //Xarr and Yarr for calculating averages separately for X and Y
        LatList: LatList,
        LngList: LngList
    }
    return OriginPoints;
}
function CalcFirstCenterPoint(OriginPoints) {
    //sending the JSON of originPoints for calculating first a point
    ajaxCall("POST", "../api/algorithm/PutOriginPoints", JSON.stringify(OriginPoints), success, error);
    return false;

}

