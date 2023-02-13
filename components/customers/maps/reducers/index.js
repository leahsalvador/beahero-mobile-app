import {
    GET_NEARBY_RIDERS,
    GET_NEARBY_RIDERS_FULFILLED,
    GET_NEARBY_RIDERS_REJECTED,
    GET_CUSTOMER_LATEST_TRANSACTION,
    GET_CUSTOMER_LATEST_TRANSACTION_FULFILLED,
    GET_CUSTOMER_LATEST_TRANSACTION_REJECTED,
    GET_RATES,
    GET_RATES_FULFILLED,
    GET_RATES_REJECTED
} from '../actions'

const initialData = {
    nearByRidersLoading: false,
    nearByRidersSuccess: true,
    nearByRidersRejected: false,
    nearByRidersData: [],
    customerLatestTransactionLoading: false,
    customerLatestTransactionSuccess: false,
    customerLatestTransactionRejected: false,
    customerLatestTransactionData: {},
    ratesLoading: false,
    ratesSuccess: false,
    ratesRejected: false,
    ratesData: [],
}
export default function transactionInfo(state = initialData, action) {
    switch (action.type) {
        case GET_CUSTOMER_LATEST_TRANSACTION:
            return {
                ...state,
                customerLatestTransactionLoading: true,
                customerLatestTransactionSuccess: false,
                customerLatestTransactionRejected: false,
            }
        case GET_CUSTOMER_LATEST_TRANSACTION_FULFILLED:
            return {
                ...state,
                customerLatestTransactionLoading: true,
                customerLatestTransactionSuccess: false,
                customerLatestTransactionRejected: false,
                customerLatestTransactionData: action.payload
            }
        case GET_CUSTOMER_LATEST_TRANSACTION_REJECTED:
            return {
                ...state,
                customerLatestTransactionLoading: false,
                customerLatestTransactionSuccess: false,
                customerLatestTransactionRejected: true,
            }
        case GET_NEARBY_RIDERS:
            return {
                ...state,
                nearByRidersLoading: true,
                nearByRidersSuccess: false,
                nearByRidersRejected: false,
            }
        case GET_NEARBY_RIDERS_FULFILLED:
            return {
                ...state,
                nearByRidersLoading: false,
                nearByRidersSuccess: true,
                nearByRidersRejected: false,
                nearByRidersData: action.payload
            }
        case GET_NEARBY_RIDERS_REJECTED:
            return {
                ...state,
                confirmRiderLoading: false,
                confirmRiderSuccess: false,
                confirmRiderRejected: true,
            }

        case GET_RATES:
            return {
                ...state,
                ratesLoading: true,
                ratesSuccess: false,
                ratesRejected: false,
            }
        case GET_RATES_FULFILLED:
            return {
                ...state,
                ratesLoading: false,
                ratesSuccess: true,
                ratesRejected: false,
                ratesData: action.payload,
            }
        case GET_RATES_REJECTED:
            return {
                ...state,
                ratesLoading: false,
                ratesSuccess: false,
                ratesRejected: true,
            }
        default:
            return {
                ...state
            }
    }
}
