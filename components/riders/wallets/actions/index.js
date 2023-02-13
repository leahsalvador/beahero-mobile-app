import config from '../../../../config'
import Axios from 'axios'
import { getSessionToken } from '../../../utilities/token'

export const GET_RIDER_WALLET = 'GET_RIDER_WALLET'
export const GET_RIDER_WALLET_FULFILLED = 'GET_RIDER_WALLET_FULFILLED'
export const GET_RIDER_WALLET_REJECTED = 'GET_RIDER_WALLET_REJECTED'

export const GET_RIDER_TRANSACTIONS = 'GET_RIDER_TRANSACTIONS'
export const GET_RIDER_TRANSACTIONS_FULFILLED = 'GET_RIDER_TRANSACTIONS_FULFILLED'
export const GET_RIDER_TRANSACTIONS_REJECTED = 'GET_RIDER_TRANSACTIONS_REJECTED'


export const loadWallet = (riderId) => {
    return async dispatch => {
        dispatch({
            type: GET_RIDER_WALLET,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/rider-wallet/${riderId}`, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: GET_RIDER_WALLET_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log('err', error)
            return dispatch({
                type: GET_RIDER_WALLET_REJECTED,
                payload: error
            })
        })
    }
}


export const loadRiderTransactions = (riderId) => {
    return async dispatch => {
        dispatch({
            type: GET_RIDER_TRANSACTIONS,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/rider-transactions/${riderId}`, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: GET_RIDER_TRANSACTIONS_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log('err', error)
            return dispatch({
                type: GET_RIDER_TRANSACTIONS_REJECTED,
                payload: error
            })
        })
    }
}


