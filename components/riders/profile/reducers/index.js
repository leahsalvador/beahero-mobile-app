import {
    GET_RIDER,
    GET_RIDER_FULFILLED,
    GET_RIDER_REJECTED,
    PUT_RIDER,
    PUT_RIDER_FULFILLED,
    PUT_RIDER_REJECTED
} from '../actions'
const initialData = {
    riderLoading: false,
    riderSuccess: false,
    riderRejected: false
}
export default function profile(state = initialData, action) {
    switch (action.type) {
        case GET_RIDER:
            return {
                ...state,
                riderLoading: true,
                riderRejected: false
            }
        case GET_RIDER_FULFILLED:
            return {
                ...state,
                riderData: action.payload,
                riderSuccess: true,
                riderLoading: false,
            }
        case GET_RIDER_REJECTED:
            return {
                ...state,
                riderLoading: false,
                riderRejected: true
            }
        case PUT_RIDER:
            return {
                ...state,
                riderLoading: true,
                riderRejected: false
            }
        case PUT_RIDER_FULFILLED:
            return {
                ...state,
                riderSuccess: true,
                riderLoading: false
            }
        case PUT_RIDER_REJECTED:
            return {
                ...state,
                riderLoading: false,
                riderRejected: true
            }
        default:
            return {
                ...state
            }
    }
}
