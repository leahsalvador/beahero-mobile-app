import {
    GET_TRANSACTION_INFO,
    GET_TRANSACTION_INFO_FULFILLED,
    GET_TRANSACTION_INFO_REJECTED,
    POST_CONFIRM_RIDER,
    POST_CONFIRM_RIDER_FULFILLED,
    POST_CONFIRM_RIDER_REJECTED,
    POST_ACCEPT_DELIVERY,
    POST_ACCEPT_DELIVERY_FULFILLED,
    POST_ACCEPT_DELIVERY_REJECTED,
    GET_TRANSACTION,
    GET_TRANSACTION_FULFILLED,
    GET_TRANSACTION_REJECTED,
    PUT_UDPATE_TRANSACTION_STATUS,
    PUT_UDPATE_TRANSACTION_STATUS_FULFILLED,
    PUT_UDPATE_TRANSACTION_STATUS_REJECTED,
    GET_RATES,
    GET_RATES_FULFILLED,
    GET_RATES_REJECTED
} from '../actions'

const initialData = {
    transactionInfoLoading: false,
    transactionInfoSuccess: false,
    transactionInfoRejected: false,
    transactionInfoData: [
        {
            riders: []
        }
    ],
    acceptDeliveryLoading: false,
    acceptDeliverySuccess: false,
    acceptDeliveryRejected: false,
    transactionLoading: false,
    transactionSuccess: false,
    transactionRejected: false,
    transactionData: {},
    ratesLoading: false,
    ratesSuccess: false,
    ratesRejected: false,
    ratesData: [],
}
export default function map(state = initialData, action) {
    switch (action.type) {
        case GET_TRANSACTION_INFO:
            return {
                ...state,
                transactionInfoLoading: true
            }
        case GET_TRANSACTION_INFO_FULFILLED:
            return {
                ...state,
                transactionInfoData: action.payload,
                transactionInfoLoading: false
            }
        case GET_TRANSACTION_INFO_REJECTED:
            return {
                ...state,
                transactionInfoLoading: false
            }

        case POST_CONFIRM_RIDER:
            return {
                ...state,
                confirmRiderLoading: true,
                confirmRiderSuccess: false,
                confirmRiderRejected: false,
            }
        case POST_CONFIRM_RIDER_FULFILLED:
            return {
                ...state,
                confirmRiderLoading: false,
                confirmRiderSuccess: true,
                confirmRiderRejected: false,
            }
        case POST_CONFIRM_RIDER_REJECTED:
            return {
                ...state,
                confirmRiderLoading: false,
                confirmRiderSuccess: false,
                confirmRiderRejected: true,
            }
        case POST_ACCEPT_DELIVERY:
            return {
                ...state,
                acceptDeliveryLoading: true,
                acceptDeliverySuccess: false,
                acceptDeliveryRejected: false,
            }
        case POST_ACCEPT_DELIVERY_FULFILLED:
            return {
                ...state,
                acceptDeliveryLoading: false,
                acceptDeliverySuccess: true,
                acceptDeliveryRejected: false,
            }
        case POST_ACCEPT_DELIVERY_REJECTED:
            return {
                ...state,
                acceptDeliveryLoading: false,
                acceptDeliverySuccess: false,
                acceptDeliveryRejected: true,
            }
        case GET_TRANSACTION:
            return {
                ...state,
                transactionLoading: true,
                transactionSuccess: false,
                transactionRejected: false,
            }
        case GET_TRANSACTION_FULFILLED:
            return {
                ...state,
                transactionLoading: false,
                transactionSuccess: true,
                transactionRejected: false,
                transactionData: action.payload,
            }
        case GET_TRANSACTION_REJECTED:
            return {
                ...state,
                transactionLoading: false,
                transactionSuccess: false,
                transactionRejected: true,
            }
        case PUT_UDPATE_TRANSACTION_STATUS:
            return {
                ...state,
                updateTransactionStatusLoading: true,
                updateTransactionStatusSuccess: false,
                updateTransactionStatusRejected: false,
            }
        case PUT_UDPATE_TRANSACTION_STATUS_FULFILLED:
            return {
                ...state,
                updateTransactionStatusLoading: false,
                updateTransactionStatusSuccess: true,
                updateTransactionStatusRejected: false,
            }
        case PUT_UDPATE_TRANSACTION_STATUS_REJECTED:
            return {
                ...state,
                updateTransactionStatusLoading: false,
                updateTransactionStatusSuccess: false,
                updateTransactionStatusRejected: true,
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
