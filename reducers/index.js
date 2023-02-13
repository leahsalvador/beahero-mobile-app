import { combineReducers } from 'redux'
import login from '../components/shared/login/reducers'
import customers from '../components/customers/reducers'
import riders from '../components/riders/reducers'

const rootReducer = combineReducers({
    login,
    customers: customers,
    riders: riders,
    admin: {}
})

export default rootReducer
