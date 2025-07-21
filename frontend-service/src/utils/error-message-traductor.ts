export const authenticationTraductor = (error: string): string => {
    if (error.includes('400')) {
        return 'Nickname or password is incorrect'
    } else if (error.includes('Network Error')) {
        return 'Service is not available'
    } else if (error.includes('409')) {
        return 'User already exists'
    } else if (error.includes('502')) {
        return 'Service is not temporary available'
    } else if (error.includes('5000ms')) {
        return 'Service is not temporary available'
    }
    return error
}
