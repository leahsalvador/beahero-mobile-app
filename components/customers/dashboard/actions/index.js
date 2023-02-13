import config from '../../../../config'
import Axios from 'axios'

import jwtDecode from 'jwt-decode'
import SQLite from "react-native-sqlite-2";
const db = SQLite.openDatabase('test.db', '1.0', '', 1)

export const GET_POSTS = 'GET_POSTS'
export const GET_POSTS_FULFILLED = 'GET_POSTS_FULFILLED'
export const GET_POSTS_REJECTED = 'GET_POSTS_REJECTED'

// SQLITE QUERY
export const _sessionStore = () => {
    return new Promise((resolve, reject) => {
        // try {
        //     db.transaction(tx => {
        //         // Select all inserted records, loop over them while printing them on the console.
        //         tx.executeSql('SELECT * FROM `SessionToken` where id = 1', [], function (tx, res) {
        //             for (let i = 0; i < res.rows.length; ++i) {
        //                 return resolve(res.rows.item(i))
        //             }
        //         })
        //     })
        // } catch (error) {
        //     reject(error)
        // }
        return resolve(true)
    })
}

export const loadPosts = (data) => {
    return dispatch => {
        dispatch({
            type: GET_POSTS,
            payload: {}
        })
        // return _sessionStore().then((store) => {
        // const { token } = store
        return Axios.get(`${config.REACT_APP_API_BASE_URL}/posts`, {
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                // Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            dispatch({
                type: GET_POSTS_FULFILLED,
                payload: response.data
            })
        }).catch((error) => {
            console.log('err', error)
            dispatch({
                type: GET_POSTS_REJECTED,
                payload: error
            })
        })
        // })
    }
}

// export const submitMessage = (data) => {
//   console.log('submit message action', data)
//   return dispatch => {
//     dispatch({
//       type: 'POST_MESSAGES',
//       payload: {}
//     })
//     return _sessionStore().then((store) => {
//       const { token } = store
//       return Axios.post(`${config.REACT_APP_API_BASE_URL}/message`, data, {
//         headers: {
//           Accept: 'application/json;charset=UTF-8',
//           'Content-Type': 'application/json;charset=UTF-8',
//           Authorization: `Bearer ${token}`
//         }
//       }).then((response) => {
//         console.log('response', response)
//         dispatch({
//           type: 'POST_MESSAGES_FULFILLED',
//           payload: response.data
//         })
//         dispatch(loadMessages(data.recipient_id))
//         return { error: false }
//       }).catch((error) => {
//         console.log('err', error)
//         dispatch({
//           type: 'POST_MESSAGES_REJECTED',
//           payload: error
//         })
//         return { error: true }
//       })
//     })
//   }
// }
