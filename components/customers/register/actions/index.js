import config from '../../../../config'
import Axios from 'axios'
import { getSessionToken } from '../../../utilities/token'

export const POST_CUSTOMER_REGISTER = 'POST_CUSTOMER_REGISTER'
export const POST_CUSTOMER_REGISTER_FULFILLED = 'POST_CUSTOMER_REGISTER_FULFILLED'
export const POST_CUSTOMER_REGISTER_REJECTED = 'POST_CUSTOMER_REGISTER_REJECTED'


export const submitRegister = (data) => {
    console.log("SUBMIt REGISTER", data)
    return async dispatch => {
        dispatch({
            type: POST_CUSTOMER_REGISTER,
            payload: {}
        })
        return Axios.post(`${config.REACT_APP_API_BASE_URL}/customer`, { ...data }, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                // Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: POST_CUSTOMER_REGISTER_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            return dispatch({
                type: POST_CUSTOMER_REGISTER_REJECTED,
                payload: error
            })
        })
    }
}
