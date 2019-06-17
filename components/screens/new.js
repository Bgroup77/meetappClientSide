const getDistanceMatrix = (service, data) => new Promise((resolve, reject) => {
  service.getDistanceMatrix(data, (response, status) => {
    if (status === 'OK') {
      resolve(response)
    } else {
      reject(response);
    }
  })
});

getDistance = async (start, end) => {
  const origin = new google.maps.LatLng(start[0], start[1]);
  const final = new google.maps.LatLng(end[0], end[1]);
  const service = new google.maps.DistanceMatrixService();
  const result = await getDistanceMatrix(
    service,
    {
      origins: [origin],
      destinations: [final],
      travelMode: 'DRIVING'
    }
  )
  return {
    distance: result.rows[0].elements[0].status
  };
};