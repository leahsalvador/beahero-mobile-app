import {
    GET_CATEGORIES,
    GET_CATEGORIES_FULFILLED,
    GET_CATEGORIES_REJECTED,
    SET_CARTS_DATA,
    POST_TRANSACTION,
    POST_TRANSACTION_FULFILLED,
    POST_TRANSACTION_REJECTED
} from '../actions'
const initialData = {
    categoriesLoading: false,
    categoriesSuccess: false,
    categoriesRejected: false,
    categoriesData: [],
    cartsData: []
}
export default function categories(state = initialData, action) {
    switch (action.type) {
        case GET_CATEGORIES:
            return {
                ...state,
                categoriesLoading: true
            }
        case GET_CATEGORIES_FULFILLED:
            return {
                ...state,
                categoriesData: action.payload,
                categoriesLoading: false
            }
        case GET_CATEGORIES_REJECTED:
            return {
                ...state,
                categoriesLoading: false
            }
        case SET_CARTS_DATA:
            return {
                ...state,
                cartsData: action.payload
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
