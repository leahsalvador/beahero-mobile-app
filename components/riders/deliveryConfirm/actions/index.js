import config from '../../../../config'
import Axios from 'axios'
import { getSessionToken } from '../../../utilities/token'

export const GET_TRANSACTION = 'GET_TRANSACTION'
export const GET_TRANSACTION_FULFILLED = 'GET_TRANSACTION_FULFILLED'
export const GET_TRANSACTION_REJECTED = 'GET_TRANSACTION_REJECTED'

export const GET_RATES = 'GET_RATES'
export const GET_RATES_FULFILLED = 'GET_RATES_FULFILLED'
export const GET_RATES_REJECTED = 'GET_RATES_REJECTED'

export const POST_FINISHED_DELIVERY = 'POST_FINISHED_DELIVERY'
export const POST_FINISHED_DELIVERY_FULFILLED = 'POST_FINISHED_DELIVERY_FULFILLED'
export const POST_FINISHED_DELIVERY_REJECTED = 'POST_FINISHED_DELIVERY_REJECTED'

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
            console.log('err', error)
            return dispatch({
                type: GET_TRANSACTION_REJECTED,
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
            console.log('err', error)
            return dispatch({
                type: GET_RATES_REJECTED,
                payload: error
            })
        })
    }
}

export const submitFinishedDelivery = (data) => {
    return async dispatch => {
        dispatch({
            type: POST_FINISHED_DELIVERY,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.post(`${config.REACT_APP_API_BASE_URL}/transaction-successfully-delivered/${data.transactionId}`, { ...data }, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: POST_FINISHED_DELIVERY_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log('err', error)
            return dispatch({
                type: POST_FINISHED_DELIVERY_REJECTED,
                payload: error
            })
        })
    }
}






