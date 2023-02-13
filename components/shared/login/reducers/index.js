const initialData = {
    loginData: {},
    isLoginLoading: false,
    isLoginSuccess: false,
    isLoginRejected: false
}
export default function login(state = initialData, action) {
    switch (action.type) {
        case 'POST_LOGIN':
            return {
                ...state,
                isLoginLoading: true,
                isLoginRejected: false
            }
        case 'POST_LOGIN_FULFILLED':
            return {
                ...state,
                loginData: action.payload,
                isLoginSuccess: true,
                isLoginLoading: false
            }
        case 'POST_LOGIN_REJECTED':
            return {
                ...state,
                searchData: {},
                isLoginLoading: false,
                isLoginRejected: true
            }
        case 'POST_LOGIN_DEFAULT':
            return {
                ...state,
                searchData: {},
                isLoginLoading: false,
                isLoginSuccess: false,
                isLoginRejected: false
            }
        default:
            return {
                ...state
            }
    }
}
