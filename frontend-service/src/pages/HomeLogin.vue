<script setup lang="ts">

</script>

<template>

  <div class="bg-white dark:bg-gray-900 animate-fade-in transition duration-500 ease-in-out">
    <div class="flex justify-center h-screen">
      <div class="hidden bg-cover lg:block lg:w-2/3" style="background-image: url('/images/background-image.png')">
        <div class="flex items-center h-full px-20 bg-gray-900 bg-opacity-40">
          <div>
            <h2 class="text-2xl font-bold text-white sm:text-3xl">CodeMaster</h2>

            <p class="max-w-xl mt-3 text-gray-300">
              Improve your coding skills with our platform. Join a community of developers and learn from each other.
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
        <div class="flex-1">
          <div class="text-center">
            <div class="flex justify-center mx-auto">
              <img class="w-auto h-16 sm:h-16" src="/icons/logo.png" alt="CodeMaster Logo" />
            </div>

            <p class="mt-3 text-black dark:text-gray-300">Sign in to access your account</p>
          </div>

          <div class="mt-8">
            <form>
              <div>
                <label for="email" class="block mb-2 text-sm text-black dark:text-gray-200">Email Address</label>
                <input type="email" name="email" id="email" placeholder="example@example.com" class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
              </div>

              <div class="mt-6">
                <div class="flex justify-between mb-2">
                  <label for="password" class="text-sm text-black dark:text-gray-200">Password</label>
                  <!--<a href="#" class="text-sm text-gray-400 focus:text-blue-500 hover:text-blue-500 hover:underline">Forgot password?</a>-->
                </div>

                <input type="password" name="password" id="password" placeholder="Your Password" class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
              </div>

              <div class="mt-6">
                <button class="w-full px-4 py-2 tracking-wide text-white transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50">
                  Sign in
                </button>
              </div>

            </form>

            <p class="mt-6 text-sm text-center text-black">Don&#x27;t have an account yet? <a href="#" class="text-primary focus:outline-none focus:underline hover:underline underline">Sign up</a>.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>