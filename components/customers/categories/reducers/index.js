import {
    GET_CATEGORIES,
    GET_CATEGORIES_FULFILLED,
    GET_CATEGORIES_REJECTED
} from '../actions'
const initialData = {
    categoriesLoading: false,
    categoriesSuccess: false,
    categoriesRejected: false,
    categoriesData: []
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
        default:
            return {
                ...state
            }
    }
}
