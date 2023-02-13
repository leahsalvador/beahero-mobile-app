
import config from '../../config'
const GOOGLE_MAPS_APIKEY = config.GOOGLE_MAPS_APIKEY;

export function geoCode(address) {
    return new Promise((resolve, reject) => {
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAPS_APIKEY}`).then((response) => response.json())
            .then((responseData) => {
                return resolve(responseData.results[0])
            })
    }).catch((res) => console.log("err", err))
}

export function geoCodeReverse(latitude, longitude) {
    return new Promise((resolve, reject) => {
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`).then((response) => response.json())
            .then((responseData) => {
                return resolve(responseData.results[0])
            })
    }).catch((res) => console.log("err", err))
}



