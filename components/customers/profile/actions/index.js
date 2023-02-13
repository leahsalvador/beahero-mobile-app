import config from '../../../../config'
import Axios from 'axios'
import { getSessionToken } from '../../../utilities/token'

export const PUT_CUSTOMER = 'PUT_CUSTOMER'
export const PUT_CUSTOMER_FULFILLED = 'PUT_CUSTOMER_FULFILLED'
export const PUT_CUSTOMER_REJECTED = 'PUT_CUSTOMER_REJECTED'

export const GET_CUSTOMER = 'GET_CUSTOMER'
export const GET_CUSTOMER_FULFILLED = 'GET_CUSTOMER_FULFILLED'
export const GET_CUSTOMER_REJECTED = 'GET_CUSTOMER_REJECTED'

export const loadCustomer = (customerId) => {
    return async dispatch => {
        dispatch({
            type: GET_CUSTOMER,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/customer/${customerId}`, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: GET_CUSTOMER_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            return dispatch({
                type: GET_CUSTOMER_REJECTED,
                payload: error
            })
        })
    }
}

export const updateCustomer = (data) => {
    console.log("SUBMIt REGISTER", data)
    return async dispatch => {
        dispatch({
            type: PUT_CUSTOMER,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.put(`${config.REACT_APP_API_BASE_URL}/customer/${data.id}`, { ...data }, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            console.log("SUCCESS")
            dispatch({
                type: GET_CUSTOMER_FULFILLED,
                payload: data
            })
            return dispatch({
                type: PUT_CUSTOMER_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log("REJECTED", error)

            return dispatch({
                type: PUT_CUSTOMER_REJECTED,
                payload: error
            })
        })
    }
}


