<script setup lang="ts">
defineProps<{
    title: string
    errorCode: string
}>()
</script>

<template>
    <section class="w-full h-screen bg-background">
        <div
            class="w-full h-full flex flex-col justify-center items-center gap-6"
        >
            <h1
                class="w-full text-black dark:text-white text-center text-xl md:text-4xl lg:text-6xl font-sans"
            >
                {{ title }}
            </h1>
            <h2
                class="w-full text-gray-500 dark:text-white text-center text-lg md:text-3xl lg:text-5xl"
            >
                {{ errorCode }}
            </h2>
            <img
                src="/images/joe.jpg"
                alt="Remind to you netflix series, in this picture was figured joe golberg look guenevire back"
                class="w-4/5 lg:h-3/5 object-cover rounded-xl"
            />
            <p
                class="text-primary w-full text-center md:text-xl lg:text-2xl cursor-pointer"
            >
                &lt;- Return to guinevere back
            </p>
        </div>
    </section>
</template>
