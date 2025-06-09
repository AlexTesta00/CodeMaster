import axios from 'axios'

const API_URL = 'http://localhost/api/v1/authentication/'
// Enable sending cookies with requests
axios.defaults.withCredentials = true

export interface AuthenticationResponse {
  message: string
  success: boolean
  token?: string
  user?: {
    info: {
      nickname: string
      email: string
      password: string
      role: 'admin' | 'user'
    }
    banned: boolean
    refreshToken: string
  }
}

export const registerNewUser = async (
  nickname: string,
  email: string,
  password: string,
  role: string = 'user'
): Promise<AuthenticationResponse> => {
  const response = await axios.post(`${API_URL}register`, {
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
  const response = await axios.post(`${API_URL}login`, {
    nickname,
    password,
  })
  return response.data
}