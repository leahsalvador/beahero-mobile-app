import {
    POST_CUSTOMER_REGISTER,
    POST_CUSTOMER_REGISTER_FULFILLED,
    POST_CUSTOMER_REGISTER_REJECTED
} from '../actions'
const initialData = {
    loginData: {},
    registerLoading: false,
    registerSuccess: false,
    registerRejected: false
}
export default function login(state = initialData, action) {
    switch (action.type) {
        case POST_CUSTOMER_REGISTER:
            return {
                ...state,
                registerLoading: true,
                registerRejected: false
            }
        case POST_CUSTOMER_REGISTER_FULFILLED:
            return {
                ...state,
                loginData: action.payload,
                registerSuccess: true,
                registerLoading: false
            }
        case POST_CUSTOMER_REGISTER_REJECTED:
            return {
                ...state,
                searchData: {},
                registerLoading: false,
                registerRejected: true
            }
        default:
            return {
                ...state
            }
    }
}
