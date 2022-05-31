/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View, ScrollView, FlatList, Pressable } from 'react-native'
import { getAll, getPromocion } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { brandPrimary, brandPrimaryTap, brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'

export default function RestaurantsScreen ({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)
  const [restaurantsPro, setRestaurantsPro] = useState([])
  const [myRestaurants, setMyRestaurants] = useState([])

  useEffect(() => {
    async function fetchRestaurants () {
      try {
        const fetchedRestaurants = await getAll()
        setRestaurants(fetchedRestaurants)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving restaurants. ${error} `,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle
        })
      }
    }
    if (loggedInUser) {
      fetchRestaurants()
    } else {
      setRestaurants(null)
    }
  }, [loggedInUser, route])
  useEffect(() => {
    const fetchPromocion = async () => {
      try {
        const fetchedPromocion = await getPromocion()
        setRestaurantsPro(fetchedPromocion)
      } catch (error) { // Addresses problem 3
        showMessage({
          message: `There was an error while retrieving promoted restaurants products. ${error} `,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle
        })
      }
    }
    // TODO: set restaurants to state
    if (route) {
      fetchPromocion()
    } else {
      setRestaurantsPro([])
    }
  }, [loggedInUser, route])

  const renderRestaurant = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : undefined}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null &&
          <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>
        }
        <TextSemiBold>Shipping: <TextSemiBold textStyle={{ color: brandPrimary }}>{item.shippingCosts.toFixed(2)}€</TextSemiBold></TextSemiBold>
        <View style={styles.containerHorizontal}>
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? brandPrimaryTap
                : brandPrimary
            },
            styles.button2
          ]}
            onPress={() => {
              const tempProducts = [...myRestaurants]
              const tempProduct = tempProducts.filter(x => x.productId === item.id)[0]
              if (tempProduct !== undefined && tempProduct.quantity > 1) {
                tempProduct.quantity--
              } else if (tempProduct.quantity == 1) {
                tempProducts.splice(tempProducts.indexOf(tempProduct), 1)
              }
              setMyRestaurants(tempProducts)
            }}
          >
          <TextRegular textStyle = {styles.text2}>-</TextRegular>
        </Pressable>
          <TextRegular textStyle = {{ marginTop: 15, marginLeft: 10 }}>{
          myRestaurants.filter(x => x.productId === item.id).length === 0 ? 0 : myRestaurants.filter(x => x.productId === item.id)[0].quantity
          }</TextRegular>
          <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? brandPrimaryTap
                : brandPrimary
            },
            styles.button2
          ]}
            onPress={() => {
              const tempProducts = [...myRestaurants]
              const tempProduct = tempProducts.filter(x => x.productId === item.id)[0]
              if (tempProduct === undefined) {
                const myProduct = {
                  productId: item.id,
                  name: item.name,
                  quantity: 1
                }
                tempProducts.push(myProduct)
              } else {
                tempProduct.quantity++
              }
              setMyRestaurants(tempProducts)
            }}
          >
          <TextRegular textStyle = {styles.text2}>+</TextRegular>
          </Pressable>
        </View>
      </ImageCard>
    )
  }
  const renderRestaurantProHeader = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : undefined}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null &&
          <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>
        }
        <TextSemiBold>Shipping: <TextSemiBold textStyle={{ color: brandPrimary }}>{item.shippingCosts.toFixed(2)}€</TextSemiBold></TextSemiBold>
      </ImageCard>
    )
  }

  const renderEmptyRestaurantsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No restaurants were retreived. Are you logged in?
      </TextRegular>
    )
  }

  const renderHeader = () => {
    return (
      <>
      {loggedInUser &&
      <Pressable
        onPress={() => navigation.navigate('CreateRestaurantScreen')
        }
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? brandPrimaryTap
              : brandPrimary
          },
          styles.button
        ]}>
        <MaterialCommunityIcons name='plus-circle' color={brandSecondary} size={20}/>
        <TextRegular textStyle={styles.text}>
          Create restaurant
        </TextRegular>
      </Pressable>
    }
    </>
    )
  }

  return (

    <ScrollView>
      <view>

          <TextSemiBold textStyle={styles.textTitle}>
          Promoted restaurants
        </TextSemiBold>

         <FlatList

            style={styles.container}
            data={restaurantsPro}
            renderItem={renderRestaurantProHeader}
            keyExtractor={item => item.id.toString()}
          />

          <TextSemiBold textStyle={styles.textTitle}>
          Restaurants
          </TextSemiBold>

        <FlatList
          style={styles.container}
          data={restaurants}
          renderItem={renderRestaurant}
          keyExtractor={item => item.id.toString()}
          ListHeaderComponent={renderHeader}
           ListEmptyComponent={renderEmptyRestaurantsList}

        />
      </view>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    fontSize: 16,
    color: brandSecondary,
    textAlign: 'center',
    marginLeft: 5
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
