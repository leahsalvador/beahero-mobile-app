import {
    GET_CUSTOMER_TRANSACTIONS,
    GET_CUSTOMER_TRANSACTIONS_FULFILLED,
    GET_CUSTOMER_TRANSACTIONS_REJECTED
} from '../actions'
const initialData = {
    customerTransactionsLoading: false,
    customerTransactionsData: [],
}
export default function history(state = initialData, action) {
    switch (action.type) {
        case GET_CUSTOMER_TRANSACTIONS:
            return {
                ...state,
                customerTransactionsLoading: true
            }
        case GET_CUSTOMER_TRANSACTIONS_FULFILLED:
            return {
                ...state,
                customerTransactionsLoading: false,
                customerTransactionsData: action.payload,
            }
        case GET_CUSTOMER_TRANSACTIONS_REJECTED:
            return {
                ...state,
                customerTransactionsLoading: false
            }
        default:
            return {
                ...state
            }
    }
}
