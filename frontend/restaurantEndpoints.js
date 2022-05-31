import { get, post } from './helpers/ApiRequestsHelper'
function getAll () {
  return get('users/myrestaurants')
}

function getDetail (id) {
  return get(`restaurants/${id}`)
}

function getRestaurantCategories () {
  return get('restaurantCategories')
}

function create (data) {
  return post('restaurants', data)
}
function getPromocion () {
  return get('restaurants/promocion')
}

export { getAll, getDetail, getRestaurantCategories, create, getPromocion }
