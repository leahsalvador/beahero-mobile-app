import config from '../../../../config'
import Axios from 'axios'
import { getSessionToken } from '../../../utilities/token'

export const PUT_RIDER = 'PUT_RIDER'
export const PUT_RIDER_FULFILLED = 'PUT_RIDER_FULFILLED'
export const PUT_RIDER_REJECTED = 'PUT_RIDER_REJECTED'

export const GET_RIDER = 'GET_RIDER'
export const GET_RIDER_FULFILLED = 'GET_RIDER_FULFILLED'
export const GET_RIDER_REJECTED = 'GET_RIDER_REJECTED'

export const loadRider = (riderId) => {
    return async dispatch => {
        dispatch({
            type: GET_RIDER,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/rider/${riderId}`, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: GET_RIDER_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            return dispatch({
                type: GET_RIDER_REJECTED,
                payload: error
            })
        })
    }
}

export const updateRider = (data) => {
    console.log("SUBMIt REGISTER", data)
    return async dispatch => {
        dispatch({
            type: PUT_RIDER,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.put(`${config.REACT_APP_API_BASE_URL}/rider/${data.id}`, { ...data }, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            console.log("SUCCESS")
            dispatch({
                type: GET_RIDER_FULFILLED,
                payload: data
            })
            return dispatch({
                type: PUT_RIDER_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log("REJECTED", error)

            return dispatch({
                type: PUT_RIDER_REJECTED,
                payload: error
            })
        })
    }
}


