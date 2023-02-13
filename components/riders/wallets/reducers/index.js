import {
    GET_RIDER_WALLET,
    GET_RIDER_WALLET_FULFILLED,
    GET_RIDER_WALLET_REJECTED,
    GET_RIDER_TRANSACTIONS,
    GET_RIDER_TRANSACTIONS_FULFILLED,
    GET_RIDER_TRANSACTIONS_REJECTED
} from '../actions'
const initialData = {
    walletLoading: false,
    walletSuccess: false,
    walletRejected: false,
    walletData: {},
    riderTransactionsLoading: false,
    riderTransactionsData: [],
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
        default:
            return {
                ...state
            }
    }
}
