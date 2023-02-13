import {
    GET_POSTS,
    GET_POSTS_FULFILLED,
    GET_POSTS_REJECTED
} from '../actions'
const initialData = {
    postsLoading: false,
    postsSuccess: false,
    postsRejected: false,
    postsData: []
}
export default function posts(state = initialData, action) {
    switch (action.type) {
        case GET_POSTS:
            return {
                ...state,
                postsLoading: true
            }
        case GET_POSTS_FULFILLED:
            return {
                ...state,
                postsData: action.payload,
                postsLoading: false
            }
        case GET_POSTS_REJECTED:
            return {
                ...state,
                postsLoading: false
            }
        default:
            return {
                ...state
            }
    }
}
