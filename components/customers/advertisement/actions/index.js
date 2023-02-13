import config from '../../../../config'
import Axios from 'axios'
import { getSessionToken } from '../../../utilities/token'

export const PUT_VIEW_ADS = 'PUT_VIEW_ADS'
export const PUT_VIEW_ADS_FULFILLED = 'PUT_VIEW_ADS_FULFILLED'
export const PUT_VIEW_ADS_REJECTED = 'PUT_VIEW_ADS_REJECTED'

export const updateAdsView = (id) => {
    const submitData = {
        isViewAds: 1
    }
    return async dispatch => {
        dispatch({
            type: PUT_VIEW_ADS,
            payload: {}
        })
        const token = await getSessionToken()
        return Axios.put(`${config.REACT_APP_API_BASE_URL}/customer/${id}`, { ...submitData }, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            return dispatch({
                type: PUT_VIEW_ADS_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log('err', error)
            return dispatch({
                type: PUT_VIEW_ADS_REJECTED,
                payload: error
            })
        })
    }
}




