import { combineReducers } from 'redux'
import categories from '../categories/reducers'
import products from '../nearby/reducers'
import maps from '../maps/reducers'
import carts from '../carts/reducers'
import confirm from '../confirm/reducers'
import receipt from '../receipt/reducers'
import register from '../register/reducers'
import profile from '../profile/reducers'
import history from '../history/reducers'

const rootReducer = combineReducers({
    categories,
    products,
    maps,
    carts,
    confirm,
    receipt,
    register,
    profile,
    history
})

export default rootReducer
