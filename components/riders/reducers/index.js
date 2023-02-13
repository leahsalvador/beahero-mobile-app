import { combineReducers } from 'redux'
import maps from '../maps/reducers'
import wallets from '../wallets/reducers'
import deliveryConfirm from '../deliveryConfirm/reducers'
import profile from '../profile/reducers'

const rootReducer = combineReducers({
    maps,
    wallets,
    deliveryConfirm,
    profile
})

export default rootReducer
