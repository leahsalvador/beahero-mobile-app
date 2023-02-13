import config from '../../../../config'
import Axios from 'axios'

import jwtDecode from 'jwt-decode'
import SQLite from "react-native-sqlite-2";
import { getSessionToken } from '../../../utilities/token'

const db = SQLite.openDatabase('test.db', '1.0', '', 1)

export const GET_PRODUCTS = 'GET_PRODUCTS'
export const GET_PRODUCTS_FULFILLED = 'GET_PRODUCTS_FULFILLED'
export const GET_PRODUCTS_REJECTED = 'GET_PRODUCTS_REJECTED'

export const POST_TRANSACTION = 'POST_TRANSACTION'
export const POST_TRANSACTION_FULFILLED = 'POST_TRANSACTION_FULFILLED'
export const POST_TRANSACTION_REJECTED = 'POST_TRANSACTION_REJECTED'

export const GET_MERCHANTS = 'GET_MERCHANTS'
export const GET_MERCHANTS_FULFILLED = 'GET_MERCHANTS_FULFILLED'
export const GET_MERCHANTS_REJECTED = 'GET_MERCHANTS_REJECTED'

export const GET_MERCHANT_PRODUCTS = 'GET_MERCHANT_PRODUCTS'
export const GET_MERCHANT_PRODUCTS_FULFILLED = 'GET_MERCHANT_PRODUCTS_FULFILLED'
export const GET_MERCHANT_PRODUCTS_REJECTED = 'GET_MERCHANT_PRODUCTS_REJECTED'

export const loadProducts = (params) => {
    const {
        categoryId,
        searchTerm,
        latitude,
        longitude,
        radiusInKm
    } = params
    return async dispatch => {
        dispatch({
            type: GET_PRODUCTS,
        })
        const token = await getSessionToken()
        console.log("LOAD PRODUCT?", `${config.REACT_APP_API_BASE_URL}/nearest-merchant-products?latitude=${latitude}&longitude=${longitude}&radiusInKm=${radiusInKm}&categoryId=${categoryId}&searchTerm=${searchTerm}`)
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/nearest-merchant-products?latitude=${latitude}&longitude=${longitude}&radiusInKm=${radiusInKm}&categoryId=${categoryId}&searchTerm=${searchTerm}`, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: GET_PRODUCTS_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log('err', error)
            return dispatch({
                type: GET_PRODUCTS_REJECTED,
                payload: error
            })
        })
    }
}

export const loadMerchants = (businessCategoryType) => {
    return async dispatch => {
        dispatch({
            type: GET_MERCHANTS,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/merchants-business-category/${businessCategoryType}`, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: GET_MERCHANTS_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log('err', error)
            return dispatch({
                type: GET_MERCHANTS_REJECTED,
                payload: error
            })
        })
    }
}

export const loadMerchantProducts = (merchantId) => {
    return async dispatch => {
        dispatch({
            type: GET_MERCHANT_PRODUCTS,
            payload: []
        })
        const token = await getSessionToken()
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/merchant-products/${merchantId}`, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: GET_MERCHANT_PRODUCTS_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log('err', error)
            return dispatch({
                type: GET_MERCHANT_PRODUCTS_REJECTED,
                payload: error
            })
        })
    }
}


export const submitTransaction = (data) => {
    return async dispatch => {
        dispatch({
            type: POST_TRANSACTION,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.post(`${config.REACT_APP_API_BASE_URL}/transaction`, { ...data }, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: POST_TRANSACTION_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log('err', error)
            return dispatch({
                type: POST_TRANSACTION_REJECTED,
                payload: error
            })
        })
    }
}

