import {
    GET_CUSTOMER,
    GET_CUSTOMER_FULFILLED,
    GET_CUSTOMER_REJECTED,
    PUT_CUSTOMER,
    PUT_CUSTOMER_FULFILLED,
    PUT_CUSTOMER_REJECTED
} from '../actions'
const initialData = {
    customerData: {},
    customerLoading: false,
    customerSuccess: false,
    customerRejected: false
}
export default function profile(state = initialData, action) {
    switch (action.type) {
        case GET_CUSTOMER:
            return {
                ...state,
                customerLoading: true,
                customerRejected: false
            }
        case GET_CUSTOMER_FULFILLED:
            return {
                ...state,
                customerData: action.payload,
                customerSuccess: true,
                customerLoading: false,
            }
        case GET_CUSTOMER_REJECTED:
            return {
                ...state,
                customerLoading: false,
                customerRejected: true
            }
        case PUT_CUSTOMER:
            return {
                ...state,
                customerLoading: true,
                customerRejected: false
            }
        case PUT_CUSTOMER_FULFILLED:
            return {
                ...state,
                customerSuccess: true,
                customerLoading: false
            }
        case PUT_CUSTOMER_REJECTED:
            return {
                ...state,
                customerLoading: false,
                customerRejected: true
            }
        default:
            return {
                ...state
            }
    }
}
