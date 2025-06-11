import Swal from 'sweetalert2'

const Toast = Swal.mixin({
    toast: true,
    position: 'bottom',
    iconColor: 'white',
    customClass: {
        popup: 'colored-toast',
    },
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
})

export const successToast = async (title: string) =>
    await Toast.fire({
        icon: 'success',
        title: title,
        background: 'green',
        color: 'white',
    })

export const errorToast = async (title: string) =>
    await Toast.fire({
        icon: 'error',
        title: title,
        background: 'red',
        color: 'white',
    })
