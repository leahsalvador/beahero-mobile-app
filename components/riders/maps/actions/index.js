import config from '../../../../config'
import Axios from 'axios'
import { getSessionToken } from '../../../utilities/token'
import jwtDecode from 'jwt-decode'
import SQLite from "react-native-sqlite-2";
import { fromPairs } from 'lodash';
const db = SQLite.openDatabase('test.db', '1.0', '', 1)

export const GET_TRANSACTION_INFO = 'GET_TRANSACTION_INFO'
export const GET_TRANSACTION_INFO_FULFILLED = 'GET_TRANSACTION_INFO_FULFILLED'
export const GET_TRANSACTION_INFO_REJECTED = 'GET_TRANSACTION_INFO_REJECTED'

export const POST_CONFIRM_RIDER = 'POST_CONFIRM_RIDER'
export const POST_CONFIRM_RIDER_FULFILLED = 'POST_CONFIRM_RIDER_FULFILLED'
export const POST_CONFIRM_RIDER_REJECTED = 'POST_CONFIRM_RIDER_REJECTED'

export const POST_ACCEPT_DELIVERY = 'POST_ACCEPT_DELIVERY'
export const POST_ACCEPT_DELIVERY_FULFILLED = 'POST_ACCEPT_DELIVERY_FULFILLED'
export const POST_ACCEPT_DELIVERY_REJECTED = 'POST_ACCEPT_DELIVERY_REJECTED'

export const PUT_UDPATE_TRANSACTION_STATUS = 'PUT_UDPATE_TRANSACTION_STATUS'
export const PUT_UDPATE_TRANSACTION_STATUS_FULFILLED = 'PUT_UDPATE_TRANSACTION_STATUS_FULFILLED'
export const PUT_UDPATE_TRANSACTION_STATUS_REJECTED = 'PUT_UDPATE_TRANSACTION_STATUS_REJECTED'

export const GET_TRANSACTION = 'GET_TRANSACTION'
export const GET_TRANSACTION_FULFILLED = 'GET_TRANSACTION_FULFILLED'
export const GET_TRANSACTION_REJECTED = 'GET_TRANSACTION_REJECTED'

export const PUT_UPDATE_USER_LOCATION = 'PUT_UPDATE_USER_LOCATION'
export const PUT_UPDATE_USER_LOCATION_FULFILLED = 'PUT_UPDATE_USER_LOCATION_FULFILLED'
export const PUT_UPDATE_USER_LOCATION_REJECTED = 'PUT_UPDATE_USER_LOCATION_REJECTED'

export const GET_RATES = 'GET_RATES'
export const GET_RATES_FULFILLED = 'GET_RATES_FULFILLED'
export const GET_RATES_REJECTED = 'GET_RATES_REJECTED'

export const PUT_RIDER_CURRENT_POSITION = 'PUT_RIDER_CURRENT_POSITION'
export const PUT_RIDER_CURRENT_POSITION_FULFILLED = 'PUT_RIDER_CURRENT_POSITION_FULFILLED'
export const PUT_RIDER_CURRENT_POSITION_REJECTED = 'PUT_RIDER_CURRENT_POSITION_REJECTED'

// SQLITE QUERY
export const _sessionStore = () => {
    return new Promise((resolve, reject) => {
        try {
            db.transaction(tx => {
                tx.executeSql('SELECT * FROM `SessionToken` where id = 1', [], function (tx, res) {
                    for (let i = 0; i < res.rows.length; ++i) {
                        return resolve(res.rows.item(i))
                    }
                })
            })
        } catch (error) {
            reject(error)
        }
    })
}



export const loadLatestTransactionOfRider = () => {
    return async dispatch => {
        dispatch({
            type: GET_TRANSACTION,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/rider-latest-transaction`, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: GET_TRANSACTION_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log('loadLatestTransactionOfRider err', error)
            return dispatch({
                type: GET_TRANSACTION_REJECTED,
                payload: error
            })
        })
    }
}

// after the customer choose a rider, the chosen rider must accept first
// then after confirming the transaction, it will trigger a socket io listen in 'active-transaction'.
export const confirmationForRider = (riderIdAndTransactionId) => {
    return dispatch => {
        dispatch({
            type: POST_CONFIRM_RIDER,
            payload: {}
        })
        return _sessionStore().then((store) => {
            const { token } = store
            return Axios.post(`${config.REACT_APP_API_BASE_URL}/rider-confirm`, { ...riderIdAndTransactionId }, {
                headers: {
                    Accept: 'application/json;charset=UTF-8',
                    'Content-Type': 'application/json;charset=UTF-8',
                    Authorization: `Bearer ${token}`
                }
            }).then((response) => {
                return dispatch({
                    type: POST_CONFIRM_RIDER_FULFILLED,
                    payload: response.data
                })
            }).catch((error) => {
                return dispatch({
                    type: POST_CONFIRM_RIDER_REJECTED,
                    payload: error
                })
            })
        })
    }
}


export const submitAcceptDelivery = (data) => {
    return async dispatch => {
        dispatch({
            type: POST_ACCEPT_DELIVERY,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.post(`${config.REACT_APP_API_BASE_URL}/customer-notify/${data.customerId}`, { ...data }, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: POST_ACCEPT_DELIVERY_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log(' submitAcceptDelivery err', error)
            return dispatch({
                type: POST_ACCEPT_DELIVERY_REJECTED,
                payload: error
            })
        })
    }
}

export const updateStatus = (transactionId, status) => {
    const submitData = {
        status
    }
    return async dispatch => {
        dispatch({
            type: PUT_UDPATE_TRANSACTION_STATUS,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.put(`${config.REACT_APP_API_BASE_URL}/transaction-status/${transactionId}`, { ...submitData }, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: PUT_UDPATE_TRANSACTION_STATUS_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            return dispatch({
                type: PUT_UDPATE_TRANSACTION_STATUS_REJECTED,
                payload: error
            })
        })
    }
}

export const loadTransaction = (transactionId) => {
    return async dispatch => {
        dispatch({
            type: GET_TRANSACTION,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/transaction/${transactionId}`, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: GET_TRANSACTION_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            return dispatch({
                type: GET_TRANSACTION_REJECTED,
                payload: error
            })
        })
    }
}


export const updateUserLocation = (data) => {
    return async dispatch => {
        dispatch({
            type: PUT_UPDATE_USER_LOCATION,
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
            return dispatch({
                type: PUT_UPDATE_USER_LOCATION_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            return dispatch({
                type: PUT_UPDATE_USER_LOCATION_REJECTED,
                payload: error
            })
        })
    }
}

export const loadRates = () => {
    return async dispatch => {
        dispatch({
            type: GET_RATES,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/rates`, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: GET_RATES_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log('loadRates err', error)
            return dispatch({
                type: GET_RATES_REJECTED,
                payload: error
            })
        })
    }
}


export const updateRiderCurrentPosition = (position) => {
    console.log("position===========================================>", position)
    return async dispatch => {
        dispatch({
            type: PUT_RIDER_CURRENT_POSITION,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.put(`${config.REACT_APP_API_BASE_URL}/rider-update-current-position`, { ...position }, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: PUT_RIDER_CURRENT_POSITION_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log('loadRates err', error)
            return dispatch({
                type: PUT_RIDER_CURRENT_POSITION_REJECTED,
                payload: error
            })
        })
    }
}










