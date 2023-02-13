import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import CustomersNavigation from './customers/index';
import RidersNavigation from './riders/index';
import OpenNavigation from './shared/index'
import SQLite from "react-native-sqlite-2";
import jwt_decode from "jwt-decode";
import { View, Text } from 'react-native'
const db = SQLite.openDatabase('test.db', '1.0', '', 1)

const Main = (props) => {
  const [userType, setUserType] = useState(undefined)

  function _sessionStore() {
    return new Promise((resolve, reject) => {
      db.transaction(function (txn) {
        // Create the table and define the properties of the columns
        txn.executeSql('CREATE TABLE IF NOT EXISTS SessionToken(id INTEGER PRIMARY KEY NOT NULL, token VARCHAR(20000))', [])
        // Select all inserted records, loop over them while printing them on the console.
        txn.executeSql('SELECT * FROM `SessionToken`', console.log('txn', txn), function (tx, res) {
          if (res.rows._array[0]) {
            const type = jwt_decode(res.rows._array[0].token).type
            return resolve({ type })
          }

        })
      })
    })
  }

  async function _bootstrapAsync() {
    return _sessionStore().then((data) => {
      setUserType(data.type)
    })
  };

  // Run Once
  useEffect(() => {
    _bootstrapAsync()
  }, [])

  // Run if login success
  useEffect(() => {
    _bootstrapAsync()
  }, [props.isLoginSuccess])
  console.log("userType", userType)

  const isAuthenticated = userType ? true : false
  return (
    <>
      {userType === 1 && <CustomersNavigation isAuthenticated={isAuthenticated} {...props} />}
      {userType === 2 && <RidersNavigation isAuthenticated={isAuthenticated} {...props} />}
      {userType === undefined && <OpenNavigation />}
    </>
  )
}


function mapStateToProps(state) {
  return { isLoginSuccess: state.login.isLoginSuccess };
}

function mapDispatchToProps(dispatch) {
  return {
    onSubmitLogin: data => dispatch(submitLogin(data))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);
