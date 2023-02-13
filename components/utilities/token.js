
import SQLite from "react-native-sqlite-2";
import jwt_decode from "jwt-decode";
const db = SQLite.openDatabase('test.db', '1.0', '', 1)

export function _sessionStore() {
    return new Promise((resolve, reject) => {
        db.transaction(function (txn) {
            // Create the table and define the properties of the columns
            txn.executeSql('CREATE TABLE IF NOT EXISTS SessionToken(id INTEGER PRIMARY KEY NOT NULL, token VARCHAR(20000))', [])
            // Select all inserted records, loop over them while printing them on the console.
            txn.executeSql('SELECT * FROM `SessionToken`', {}, function (tx, res) {
                if (res.rows._array[0]) {
                    const data = jwt_decode(res.rows._array[0].token)
                    return resolve({ ...data })
                }
            })
        })
    }).catch((res) => console.log("err", err))
}

export const _sessionToken = () => {
    return new Promise((resolve, reject) => {
        try {
            db.transaction(tx => {
                tx.executeSql('SELECT * FROM `SessionToken` where id = 1', [], function (tx, res) {
                    for (let i = 0; i < res.rows.length; ++i) {
                        return resolve(res.rows.item(i))
                    }
                })
            })
        } catch (error) {
            reject(error)
        }
    })
}


export async function getDataFromToken() {
    const userData = await _sessionStore()
    return userData
}

export async function getSessionToken() {
    const sessionToken = await _sessionToken()
    return sessionToken.token
}