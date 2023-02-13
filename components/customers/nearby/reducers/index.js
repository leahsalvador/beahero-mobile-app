import {
    GET_PRODUCTS,
    GET_PRODUCTS_FULFILLED,
    GET_PRODUCTS_REJECTED,
    POST_TRANSACTION,
    POST_TRANSACTION_FULFILLED,
    POST_TRANSACTION_REJECTED,
    GET_MERCHANTS,
    GET_MERCHANTS_FULFILLED,
    GET_MERCHANTS_REJECTED,
    GET_MERCHANT_PRODUCTS,
    GET_MERCHANT_PRODUCTS_FULFILLED,
    GET_MERCHANT_PRODUCTS_REJECTED

} from '../actions'

const initialData = {
    transactionLoading: false,
    transactionData: [],
    productsLoading: false,
    productsSuccess: false,
    productsRejected: false,
    productsData: [],
    merchantsLoading: false,
    merchantsData: [],
    merchantProductsLoading: false,
    merchantProductsData: [],
}
export default function products(state = initialData, action) {
    switch (action.type) {
        case GET_PRODUCTS:
            return {
                ...state,
                productsLoading: true
            }
        case GET_PRODUCTS_FULFILLED:
            return {
                ...state,
                productsData: action.payload,
                productsLoading: false
            }
        case GET_PRODUCTS_REJECTED:
            return {
                ...state,
                productsLoading: false
            }
        case GET_MERCHANTS:
            return {
                ...state,
                merchantsLoading: true
            }
        case GET_MERCHANTS_FULFILLED:
            return {
                ...state,
                merchantsData: action.payload,
                merchantsLoading: false
            }
        case GET_MERCHANTS_REJECTED:
            return {
                ...state,
                merchantsLoading: false
            }
        case GET_MERCHANT_PRODUCTS:
            return {
                ...state,
                merchantProductsLoading: true
            }
        case GET_MERCHANT_PRODUCTS_FULFILLED:
            return {
                ...state,
                merchantProductsData: action.payload,
                merchantProductsLoading: false
            }
        case GET_MERCHANT_PRODUCTS_REJECTED:
            return {
                ...state,
                merchantProductsLoading: false
            }
        case POST_TRANSACTION:
            return {
                ...state,
                transactionLoading: true
            }
        case POST_TRANSACTION_FULFILLED:
            return {
                ...state,
                transactionData: action.payload,
                transactionLoading: false
            }
        case POST_TRANSACTION_REJECTED:
            return {
                ...state,
                transactionLoading: false
            }
        default:
            return {
                ...state
            }
    }
}
