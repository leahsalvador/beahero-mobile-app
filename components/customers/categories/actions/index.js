import config from '../../../../config'
import Axios from 'axios'
import { getSessionToken } from '../../../utilities/token'

export const GET_CATEGORIES = 'GET_CATEGORIES'
export const GET_CATEGORIES_FULFILLED = 'GET_CATEGORIES_FULFILLED'
export const GET_CATEGORIES_REJECTED = 'GET_CATEGORIES_REJECTED'

export const loadCategories = () => {
    return async dispatch => {
        dispatch({
            type: GET_CATEGORIES,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/categories`, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: GET_CATEGORIES_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log('err', error)
            return dispatch({
                type: GET_CATEGORIES_REJECTED,
                payload: error
            })
        })
    }
}


