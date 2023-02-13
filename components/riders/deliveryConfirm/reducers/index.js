import {
    GET_RIDER_WALLET,
    GET_RIDER_WALLET_FULFILLED,
    GET_RIDER_WALLET_REJECTED,
    GET_RIDER_TRANSACTIONS,
    GET_RIDER_TRANSACTIONS_FULFILLED,
    GET_RIDER_TRANSACTIONS_REJECTED,
    GET_TRANSACTION,
    GET_TRANSACTION_FULFILLED,
    GET_TRANSACTION_REJECTED,
    GET_RATES,
    GET_RATES_FULFILLED,
    GET_RATES_REJECTED
} from '../actions'
const initialData = {
    walletLoading: false,
    walletSuccess: false,
    walletRejected: false,
    walletData: {},
    riderTransactionsLoading: false,
    riderTransactionsData: [],
    transactionLoading: false,
    transactionSuccess: false,
    transactionRejected: false,
    transactionData: [],
    ratesLoading: false,
    ratesSuccess: false,
    ratesRejected: false,
    ratesData: []
}
export default function wallet(state = initialData, action) {
    switch (action.type) {
        case GET_RIDER_WALLET:
            return {
                ...state,
                walletLoading: true
            }
        case GET_RIDER_WALLET_FULFILLED:
            return {
                ...state,
                walletData: action.payload,
                walletLoading: false
            }
        case GET_RIDER_WALLET_REJECTED:
            return {
                ...state,
                walletLoading: false
            }

        case GET_RIDER_TRANSACTIONS:
            return {
                ...state,
                riderTransactionsLoading: true
            }
        case GET_RIDER_TRANSACTIONS_FULFILLED:
            return {
                ...state,
                riderTransactionsLoading: false,
                riderTransactionsData: action.payload,
            }
        case GET_RIDER_TRANSACTIONS_REJECTED:
            return {
                ...state,
                riderTransactionsLoading: false
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
