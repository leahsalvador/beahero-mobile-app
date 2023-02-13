import config from '../../../../config'
import Axios from 'axios'
import { getSessionToken } from '../../../utilities/token'

export const GET_TRANSACTION = 'GET_TRANSACTION'
export const GET_TRANSACTION_FULFILLED = 'GET_TRANSACTION_FULFILLED'
export const GET_TRANSACTION_REJECTED = 'GET_TRANSACTION_REJECTED'

export const POST_NOTIFY_RIDERS = 'POST_NOTIFY_RIDERS'
export const POST_NOTIFY_RIDERS_FULFILLED = 'POST_NOTIFY_RIDERS_FULFILLED'
export const POST_NOTIFY_RIDERS_REJECTED = 'POST_NOTIFY_RIDERS_REJECTED'

export const GET_CUSTOMER_LATEST_TRANSACTION = 'GET_CUSTOMER_LATEST_TRANSACTION'
export const GET_CUSTOMER_LATEST_TRANSACTION_FULFILLED = 'GET_CUSTOMER_LATEST_TRANSACTION_FULFILLED'
export const GET_CUSTOMER_LATEST_TRANSACTION_REJECTED = 'GET_CUSTOMER_LATEST_TRANSACTION_REJECTED'

export const GET_NEARBY_RIDERS = 'GET_NEARBY_RIDERS'
export const GET_NEARBY_RIDERS_FULFILLED = 'GET_NEARBY_RIDERS_FULFILLED'
export const GET_NEARBY_RIDERS_REJECTED = 'GET_NEARBY_RIDERS_REJECTED'

export const GET_RATES = 'GET_RATES'
export const GET_RATES_FULFILLED = 'GET_RATES_FULFILLED'
export const GET_RATES_REJECTED = 'GET_RATES_REJECTED'

export const loadTransaction = (transactionId) => {
    console.log("<----------------------------------------------loadTransaction");
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
            console.log('err', error)
            return dispatch({
                type: GET_TRANSACTION_REJECTED,
                payload: error
            })
        })
    }
}

export const notifyRiders = (data) => {
    console.log("<----------------------------------------------notifyRiders");

    return async dispatch => {
        dispatch({
            type: POST_NOTIFY_RIDERS,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.post(`${config.REACT_APP_API_BASE_URL}/riders-notify`, { ...data }, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: POST_NOTIFY_RIDERS_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            return dispatch({
                type: POST_NOTIFY_RIDERS_REJECTED,
                payload: error
            })
        })
    }
}

export const loadCustomerLatestTransaction = () => {
    console.log("<----------------------------------------------loadCustomerLatestTransaction");

    return async dispatch => {
        dispatch({
            type: GET_CUSTOMER_LATEST_TRANSACTION,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/customer-latest-transaction`, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: GET_CUSTOMER_LATEST_TRANSACTION_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            return dispatch({
                type: GET_CUSTOMER_LATEST_TRANSACTION_REJECTED,
                payload: error
            })
        })
    }
}

export const loadNearbyRiders = () => {
    console.log("<----------------------------------------------loadNearbyRiders");

    return async dispatch => {
        dispatch({
            type: GET_NEARBY_RIDERS,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/riders-nearby`, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: GET_NEARBY_RIDERS_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            return dispatch({
                type: GET_NEARBY_RIDERS_REJECTED,
                payload: error
            })
        })
    }
}


export const loadRates = () => {

    console.log("<----------------------------------------------loadrates");
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
            console.log('err', error)
            return dispatch({
                type: GET_RATES_REJECTED,
                payload: error
            })
        })
    }
}


