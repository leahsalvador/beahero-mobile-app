import config from '../../../../config'
import Axios from 'axios'
// import * as SQLite from 'expo-sqlite'
import SQLite from "react-native-sqlite-2";
import jwt_decode from "jwt-decode";
const db = SQLite.openDatabase('test.db', '1.0', '', 1)

export const _store = (token) => {
    const arrayData = []
    return new Promise((resolve, reject) => {
        db.transaction(function (txn) {
            // Drop the table if it exists
            txn.executeSql('DROP TABLE IF EXISTS SessionToken', [])

            // Create the table and define the properties of the columns
            txn.executeSql('CREATE TABLE IF NOT EXISTS SessionToken(id INTEGER PRIMARY KEY NOT NULL, token VARCHAR(20000))', [])

            // Insert a record
            txn.executeSql('INSERT INTO SessionToken (token) VALUES (:token)', [`${token}`])

            // Select all inserted records, loop over them while printing them on the console.
            txn.executeSql('SELECT * FROM `SessionToken`', [], function (tx, res) {
                for (let i = 0; i < res.rows.length; ++i) {
                    arrayData.push(res.rows.item(i))
                }
            })
        })
        return resolve(arrayData)
    })
}

export const submitLogin = (data, type) => {
    console.log("submit logggin", data, `${config.REACT_APP_API_BASE_URL}/login`)
    return dispatch => {
        dispatch({
            type: 'POST_LOGIN',
            payload: {}
        })
        return Axios.post(`${config.REACT_APP_API_BASE_URL}/login`, { ...data }, {
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(function (response) {
                return _store(response.data.token).then(() => {
                    const userType = jwt_decode(response.data.token).type
                    if (userType === 1 && type === 'customer') {
                        dispatch({
                            type: 'POST_LOGIN_FULFILLED',
                            payload: response.data
                        })
                    } else if (userType === 2 && type === 'rider') {
                        dispatch({
                            type: 'POST_LOGIN_FULFILLED',
                            payload: response.data
                        })
                    } else {
                        dispatch({
                            type: 'POST_LOGIN_REJECTED',
                            payload: {}
                        })
                    }
                })
            })
            .catch(function (error) {
                console.log("error", error)

                dispatch({
                    type: 'POST_LOGIN_REJECTED',
                    payload: error
                })
            })
            .finally(() => {
                dispatch({ type: 'POST_LOGIN_DEFAULT' })
            })
    }
}


export const submitLoginWithFacebook = (data) => {
    return dispatch => {
        dispatch({
            type: 'POST_LOGIN',
            payload: {}
        })
        return Axios.post(`${config.REACT_APP_API_BASE_URL}/loginWithFacebook`, { ...data }, {
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(function (response) {
            console.log("RESPONSE Success2", response.data.token)
            return _store(response.data.token).then(() => {
                dispatch({
                    type: 'POST_LOGIN_FULFILLED',
                    payload: response.data
                })
            })
        })
            .catch(function (error) {
                console.log("RESPONSE failed", error)

                dispatch({
                    type: 'POST_LOGIN_REJECTED',
                    payload: error
                })
            })
            .finally(() => {
                dispatch({ type: 'POST_LOGIN_DEFAULT' })
            })
    }
}

