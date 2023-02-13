import config from '../../../../config'
import Axios from 'axios'
import { getSessionToken } from '../../../utilities/token'

export const GET_CUSTOMER_TRANSACTIONS = 'GET_CUSTOMER_TRANSACTIONS'
export const GET_CUSTOMER_TRANSACTIONS_FULFILLED = 'GET_CUSTOMER_TRANSACTIONS_FULFILLED'
export const GET_CUSTOMER_TRANSACTIONS_REJECTED = 'GET_CUSTOMER_TRANSACTIONS_REJECTED'

export const loadCustomerTransactions = (customerId) => {
    return async dispatch => {
        dispatch({
            type: GET_CUSTOMER_TRANSACTIONS,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/customer-transactions/${customerId}`, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: GET_CUSTOMER_TRANSACTIONS_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log('err', error)
            return dispatch({
                type: GET_CUSTOMER_TRANSACTIONS_REJECTED,
                payload: error
            })
        })
    }
}


