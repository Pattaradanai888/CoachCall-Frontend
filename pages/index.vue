<template>
  <div>
    <!-- The entire page content is rendered immediately -->
    <div>
      <!-- Hero Section -->
      <div
        class="flex items-center justify-center bg-[url(/landing-bg2.jpg)] w-full h-screen bg-center bg-cover bg-no-repeat">
        <div class="container mx-auto px-4 h-full">
          <div class="grid grid-cols-2 h-full items-center">
            <div class="flex flex-col justify-center">
              <h1 class="text-7xl font-bold text-white mb-5">
                Revolutionize Your Basketball Coaching
              </h1>
              <p class="text-white mb-4">
                All-in-one platform for creating, managing, and tracking basketball training programs
                with gamification and analytics.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="container mx-auto px-4">
        <div class="mb-[5rem]">
          <div class="mt-20 text-center mb-[5rem]">
            <div class="flex justify-center mb-5">
              <h1 class="bg-[#9C1313] px-4 py-1 rounded-xl text-white">
                Feature
              </h1>
            </div>
            <h1 class="text-3xl font-bold">
              Everything you need to elevate your coaching
            </h1>
            <p class="mt-2">
              Our platform provides powerful tools to streamline your coaching workflow and maximize
              athlete potential.
            </p>
          </div>
          <div class="grid">
            <div class="grid-rows-2">
              <div class="grid grid-cols-3 gap-5">
                <div ref="featureCard1" class="bg-white shadow-xl mb-5">
                  <div class="p-5 text-center">
                    <div class="flex items-center justify-center mb-2">
                      <div class="bg-[#9C1313] rounded-xl">
                        <Icon name="mdi:check" size="2rem" style="color: white" class="mx-1" />
                      </div>
                    </div>
                    <h1 class="text-2xl font-bold">
                      Authentication
                    </h1>
                    <p>Secure registration and profile management with easy onboarding.</p>
                  </div>
                </div>
                <div ref="featureCard2" class="bg-white shadow-xl mb-5">
                  <div class="p-5 text-center">
                    <div class="flex items-center justify-center mb-2">
                      <div class="bg-[#9C1313] rounded-xl">
                        <Icon name="mdi:check" size="2rem" style="color: white" class="mx-1" />
                      </div>
                    </div>
                    <h1 class="text-2xl font-bold">
                      Course Management
                    </h1>
                    <p>
                      Create, organize, and assign courses with drag-and-drop tasks and templates.
                    </p>
                  </div>
                </div>
                <div ref="featureCard3" class="bg-white shadow-xl mb-5">
                  <div class="p-5 text-center">
                    <div class="flex items-center justify-center mb-2">
                      <div class="bg-[#9C1313] rounded-xl">
                        <Icon name="mdi:check" size="2rem" style="color: white" class="mx-1" />
                      </div>
                    </div>
                    <h1 class="text-2xl font-bold">
                      Performance Scoring
                    </h1>
                    <p>Automated performance tracking with radar charts for skill metrics.</p>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-5">
                <div ref="featureCard4" class="bg-white shadow-xl mb-5">
                  <div class="p-5 text-center">
                    <div class="flex items-center justify-center mb-2">
                      <div class="bg-[#9C1313] rounded-xl">
                        <Icon name="mdi:check" size="2rem" style="color: white" class="mx-1" />
                      </div>
                    </div>
                    <h1 class="text-2xl font-bold">
                      Main Dashboard
                    </h1>
                    <p>
                      Unified interface with key metrics, interactive charts, and session calendar.
                    </p>
                  </div>
                </div>
                <div ref="featureCard5" class="bg-white shadow-xl mb-5">
                  <div class="p-5 text-center">
                    <div class="flex items-center justify-center mb-2">
                      <div class="bg-[#9C1313] rounded-xl">
                        <Icon name="mdi:check" size="2rem" style="color: white" class="mx-1" />
                      </div>
                    </div>
                    <h1 class="text-2xl font-bold">
                      Coach Efficiency Dashboard
                    </h1>
                    <p>Track productivity and impact with motivational milestones.</p>
                  </div>
                </div>
                <div ref="featureCard6" class="bg-white shadow-xl mb-5">
                  <div class="p-5 text-center">
                    <div class="flex items-center justify-center mb-2">
                      <div class="bg-[#9C1313] rounded-xl">
                        <Icon name="mdi:check" size="2rem" style="color: white" class="mx-1" />
                      </div>
                    </div>
                    <h1 class="text-2xl font-bold">
                      Athlete Management
                    </h1>
                    <p>Manage athlete profiles, visualize performance, and rank athletes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="bg-white w-full bg-center bg-cover bg-no-repeat py-3">
        <div class="container mx-auto px-4">
          <div class="mt-20 text-center mb-5">
            <h1 class="text-3xl font-bold mb-4">
              Ready to transform your coaching?
            </h1>
            <p class="text-gray-600 max-w-xl mx-auto">
              Join thousands of coaches who are elevating their game with our platform.
            </p>
          </div>
          <div class="flex justify-center">
            <nuxt-link to="/register" class="mb-16">
              <button
                class="bg-white text-[#9C1313] font-bold border-4 border-[#9C1313] border-solid px-4 py-2 rounded-xl hover:bg-[#9C1313] hover:text-white mx-auto">
                Sign up now
              </button>
            </nuxt-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { navigateTo } from '#app';
import { Icon } from '#components';

const authStore = useAuthStore();

onMounted(() => {
  if (authStore.isAuthenticated) {
    navigateTo('/dashboard', { replace: true });
  }
});

// Template refs for the feature cards
const featureCard1 = ref<HTMLElement>();
const featureCard2 = ref<HTMLElement>();
const featureCard3 = ref<HTMLElement>();
const featureCard4 = ref<HTMLElement>();
const featureCard5 = ref<HTMLElement>();
const featureCard6 = ref<HTMLElement>();

// Motion configuration
const motionConfig = {
  initial: {
    scale: 1,
  },
  visible: {
    scale: 1,
  },
  hovered: {
    scale: 1.2,
  },
};

// Apply motion to each feature card
useMotion(featureCard1, motionConfig);
useMotion(featureCard2, motionConfig);
useMotion(featureCard3, motionConfig);
useMotion(featureCard4, motionConfig);
useMotion(featureCard5, motionConfig);
useMotion(featureCard6, motionConfig);
</script>