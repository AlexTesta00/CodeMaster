<script setup lang="ts">
import ServiceCard from "../components/ServiceCard.vue";
import {onMounted, ref} from "vue";
import {
  healtCheckAuthentication, healtCheckCodeGenerator,
  healtCheckCodequest,
  healtCheckCommunity,
  healtCheckSolution,
  healtCheckUser
} from "../utils/api.ts";
import {errorToast} from "../utils/notify.ts";

const authenticationStatus = ref(false);
const userServiceStatus = ref(false);
const codeQuestServiceStatus = ref(false);
const solutionServiceStatus = ref(false);
const communityServiceStatus = ref(false);
const codeGenerationServiceStatus = ref(false);

const checkServiceStatus = async (
    checkFn: () => Promise<{ status: string; success: boolean }>,
    targetRef: { value: boolean }
) => {
  try {
    const result = await checkFn();
    if (result.success) {
      targetRef.value = result.status === "OK";
    }
  } catch (error) {
    await errorToast("Some services are offline");
  }
};

const checkAllServices = async () => {
  await Promise.all([
    checkServiceStatus(healtCheckAuthentication, authenticationStatus),
    checkServiceStatus(healtCheckUser, userServiceStatus),
    checkServiceStatus(healtCheckCodequest, codeQuestServiceStatus),
    checkServiceStatus(healtCheckSolution, solutionServiceStatus),
    checkServiceStatus(healtCheckCommunity, communityServiceStatus),
    checkServiceStatus(healtCheckCodeGenerator, codeGenerationServiceStatus)
  ]);
};

onMounted( async () => {
  await checkAllServices();
})
</script>

<template>
  <section
      class="min-h-screen bg-background dark:bg-bgdark animate-fade-in overflow-y-hidden"
  >
    <div class="bg-background dark:bg-bgdark w-full h-full flex flex-col items-center justify-center lg:items-start lg:justify-center my-6">
      <h1 class="text-4xl w-full text-center">CodeMaster Service Status </h1>
      <service-card name="Authentication Service" :status=authenticationStatus></service-card>
      <service-card name="User Service" :status=userServiceStatus></service-card>
      <service-card name="CodeQuest Service" :status=codeQuestServiceStatus></service-card>
      <service-card name="Solution Service" :status=solutionServiceStatus></service-card>
      <service-card name="Community Service" :status=communityServiceStatus></service-card>
      <service-card name="Code Generation Service" :status=codeGenerationServiceStatus></service-card>
    </div>
  </section>
</template>