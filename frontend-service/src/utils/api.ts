import axios from 'axios'
import type { AuthenticationResponse, UserManagerResponse } from './interface.ts'

const AUTHENTICATION_URL = 'http://localhost/api/v1/authentication/'
const USER_URL = 'http://localhost/api/v1/users/'
// Enable sending cookies with requests
axios.defaults.withCredentials = true

export const registerNewUser = async (
  nickname: string,
  email: string,
  password: string,
  role: string = 'user'
): Promise<AuthenticationResponse> => {
  const response = await axios.post(`${AUTHENTICATION_URL}register`, {
    nickname,
    email,
    password,
    role,
  })
  return response.data
}

export const loginUser = async (
  nickname: string,
  password: string
): Promise<AuthenticationResponse> => {
  const response = await axios.post(`${AUTHENTICATION_URL}login`, {
    nickname,
    password,
  })
  return response.data
}

export const logoutUser = async (
  nickname: string
): Promise<void> => {
  const response = await axios.post(`${AUTHENTICATION_URL}logout`, {
    nickname,
  })
  return response.data
}

export const getUserByNickname = async (
  nickname: string
): Promise<UserManagerResponse> => {
  const response = await axios.get(`${USER_URL}${nickname}`)
  return response.data
}

export const updateProfilePicture = async (
  nickname: string,
  newProfilePicture: { url: string, alt: string}
): Promise<UserManagerResponse> => {
  const response = await axios.put(`${USER_URL}profile-picture`, {
    nickname,
    newProfilePicture,
  })
  return response.data
}

export const updateCV = async (
  nickname: string,
  newCV: { url: string }
): Promise<UserManagerResponse> => {
  const response = await axios.put(`${USER_URL}cv`, {
    nickname,
    newCV,
  })
  return response.data
}

export const updateBio = async (
  nickname: string,
  newBio: string
): Promise<UserManagerResponse> => {
  const response = await axios.put(`${USER_URL}bio`, {
    nickname,
    newBio,
  })
  return response.data
}

export const updateLanguages = async (
  nickname: string,
  newLanguages: {name: string}[]
): Promise<UserManagerResponse> => {
  const response = await axios.put(`${USER_URL}languages`, {
    nickname,
    newLanguages,
  })
  return response.data
}