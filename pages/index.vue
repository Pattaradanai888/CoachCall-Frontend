<template>
  <div
    class="flex items-center justify-center bg-[url(/landing-bg2.jpg)] w-full h-screen bg-center bg-cover bg-no-repeat"
  >
    <div class="container mx-auto px-4 h-full">
      <div class="grid grid-cols-2 h-full items-center">
        <div class="flex flex-col justify-center">
          <!-- Added text-center for horizontal alignment -->
          <h1 class="text-7xl font-bold text-white mb-5">Revolutionize Your Basketball Coaching</h1>
          <p class="text-white mb-4">
            All-in-one platform for creating, managing, and tracking basketball training programs
            with gamification and analytics.
          </p>
          <nuxt-link to="/dashboard">
            <button
              class="bg-white font-bold text-[#9C1313] border-4 border-[#9C1313] border-solid px-4 py-2 rounded-xl hover:bg-[#9C1313] hover:text-white mx-auto"
            >
              <!-- Added mx-auto to center button -->
              See all plan
            </button>
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>

  <div class="container mx-auto px-4">
    <!-- Feature -->
    <div class="mb-[5rem]">
      <div class="mt-20 text-center mb-[5rem]">
        <div class="flex justify-center mb-5">
          <h1 class="bg-[#9C1313] px-4 py-1 rounded-xl text-white">Feature</h1>
        </div>
        <h1 class="text-3xl font-bold">Everything you need to elevate your coaching</h1>
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
                <h1 class="text-2xl font-bold">Authentication</h1>
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
                <h1 class="text-2xl font-bold">Course Management</h1>
                <p>Create, organize, and assign courses with drag-and-drop tasks and templates.</p>
              </div>
            </div>
            <div ref="featureCard3" class="bg-white shadow-xl mb-5">
              <div class="p-5 text-center">
                <div class="flex items-center justify-center mb-2">
                  <div class="bg-[#9C1313] rounded-xl">
                    <Icon name="mdi:check" size="2rem" style="color: white" class="mx-1" />
                  </div>
                </div>
                <h1 class="text-2xl font-bold">Performance Scoring</h1>
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
                <h1 class="text-2xl font-bold">Main Dashboard</h1>
                <p>Unified interface with key metrics, interactive charts, and session calendar.</p>
              </div>
            </div>
            <div ref="featureCard5" class="bg-white shadow-xl mb-5">
              <div class="p-5 text-center">
                <div class="flex items-center justify-center mb-2">
                  <div class="bg-[#9C1313] rounded-xl">
                    <Icon name="mdi:check" size="2rem" style="color: white" class="mx-1" />
                  </div>
                </div>
                <h1 class="text-2xl font-bold">Coach Efficiency Dashboard</h1>
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
                <h1 class="text-2xl font-bold">Athlete Management</h1>
                <p>Manage athlete profiles, visualize performance, and rank athletes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Test -->
  <div class="bg-white w-full bg-center bg-cover bg-no-repeat py-3">
    <div class="container mx-auto px-4">
      <!-- Header Section -->
      <div class="mt-20 text-center mb-16">
        <div class="flex justify-center mb-5">
          <h1 class="bg-[#9C1313] px-4 py-1 rounded-xl text-white text-sm font-semibold">
            Testimonials
          </h1>
        </div>
        <h1 class="text-3xl font-bold mb-2">Trusted by coaches everywhere</h1>
        <p class="text-gray-600 max-w-xl mx-auto">
          See what coaches are saying about our platform.
        </p>
      </div>

      <!-- Testimonials Grid -->
      <div class="grid md:grid-cols-2 gap-8 mb-12 text-center">
        <!-- Testimonial 1 -->
        <div class="shadow-xl p-8">
          <img
            src="/coach1.avif"
            class="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-[#9C1313]"
            alt="Michael Rodriguez"
          />
          <h3 class="font-bold text-lg">Michael Rodriguez</h3>
          <p class="text-gray-500 text-sm">College Basketball Coach</p>
          <p class="text-gray-700 italic mt-4">
            "This platform has completely transformed how I manage my team. The analytics and
            tracking features have helped my athletes improve significantly."
          </p>
        </div>

        <!-- Testimonial 2 -->
        <div class="shadow-xl p-5">
          <img
            src="/coach2.webp"
            class="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-[#9C1313]"
            alt="Michael Rodriguez"
          />
          <h3 class="font-bold text-lg">Sarah Johnson</h3>
          <p class="text-gray-500 text-sm">High School Basketball Coach</p>
          <p class="text-gray-700 italic mt-4">
            "The gamification elements have increased my team's engagement and motivation. I can
            easily track progress and identify areas for improvement."
          </p>
        </div>
      </div>
    </div>
  </div>
  <div class="container mx-auto px-4">
    <!-- Plan -->
    <div class="mb-[5rem]">
      <div class="mt-20 text-center mb-[5rem]">
        <div class="flex justify-center mb-5">
          <h1 class="bg-[#9C1313] px-4 py-1 rounded-xl text-white">Pricing</h1>
        </div>
        <h1 class="text-3xl font-bold">Simple, transparent pricing</h1>
        <p class="mt-2">Choose the plan that's right for you and your team.</p>
      </div>

      <!--Plan section-->
      <div class="grid grid-cols-3 gap-2">
        <div class="bg-white shadow-xl mb-5 px-4 py-2">
          <div class="p-5">
            <h1 class="text-xl font-bold">Starter</h1>
            <p>For individual coaches</p>
            <h1 class="text-3xl font-bold my-2">FREE</h1>
            <div class="flex">
              <Icon name="mdi:check-bold" size="1.5rem" style="color: green" class="mr-2" />
              <p>Up to 10 athletes</p>
            </div>
            <div class="flex">
              <Icon name="mdi:check-bold" size="1.5rem" style="color: green" class="mr-2" />
              <p>Basic analytics</p>
            </div>
            <div class="flex">
              <Icon name="mdi:check-bold" size="1.5rem" style="color: green" class="mr-2" />
            </div>
          </div>
        </div>
        <div class="bg-white shadow-xl mb-5 px-4 py-2">
          <div class="p-5">
            <h1 class="text-xl font-bold">Pro</h1>
            <p>For small teams</p>
            <div class="flex my-2">
              <h1 class="text-3xl font-bold">$79</h1>
              <h1 class="align-bottom">/month</h1>
            </div>
            <div class="flex">
              <Icon name="mdi:check-bold" size="1.5rem" style="color: green" class="mr-2" />
              <p>Up to 20 athletes</p>
            </div>
            <div class="flex">
              <Icon name="mdi:check-bold" size="1.5rem" style="color: green" class="mr-2" />
              <p>Advanced analytics</p>
            </div>
            <div class="flex">
              <Icon name="mdi:check-bold" size="1.5rem" style="color: green" class="mr-2" />
              <p>Custom templates</p>
            </div>
            <div class="flex">
              <Icon name="mdi:check-bold" size="1.5rem" style="color: green" class="mr-2" />
              <p>Priority support</p>
            </div>
            <div class="flex">
              <Icon name="mdi:check-bold" size="1.5rem" style="color: green" class="mr-2" />
              <p>Team collaboration</p>
            </div>
          </div>
        </div>
        <div class="bg-white shadow-xl mb-5 px-4 py-2">
          <div class="p-5">
            <h1 class="text-xl font-bold">Enterprise</h1>
            <p>For large organizations</p>
            <div class="flex my-2">
              <h1 class="text-3xl font-bold">$199</h1>
              <h1 class="align-bottom">/month</h1>
            </div>
            <div class="flex">
              <Icon name="mdi:check-bold" size="1.5rem" style="color: green" class="mr-2" />
              <p>Unlimited athletes</p>
            </div>
            <div class="flex">
              <Icon name="mdi:check-bold" size="1.5rem" style="color: green" class="mr-2" />
              <p>Premium analytics</p>
            </div>
            <div class="flex">
              <Icon name="mdi:check-bold" size="1.5rem" style="color: green" class="mr-2" />
              <p>Custom integrations</p>
            </div>
            <div class="flex">
              <Icon name="mdi:check-bold" size="1.5rem" style="color: green" class="mr-2" />
              <p>24/7 dedicated support</p>
            </div>
            <div class="flex">
              <Icon name="mdi:check-bold" size="1.5rem" style="color: green" class="mr-2" />
              <p>Advanced security features</p>
            </div>
            <div class="flex">
              <Icon name="mdi:check-bold" size="1.5rem" style="color: green" class="mr-2" />
              <p>Custom branding</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="bg-white w-full bg-center bg-cover bg-no-repeat py-3">
    <div class="container mx-auto px-4">
      <!-- Header Section -->
      <div class="mt-20 text-center mb-5">
        <h1 class="text-3xl font-bold mb-4">Ready to transform your coaching?</h1>
        <p class="text-gray-600 max-w-xl mx-auto">
          Join thousands of coaches who are elevating their game with our platform.
        </p>
      </div>
      <div class="flex justify-center">
        <nuxt-link to="/register" class="mb-16">
          <button
            class="bg-white text-[#9C1313] font-bold border-4 border-[#9C1313] border-solid px-4 py-2 rounded-xl hover:bg-[#9C1313] hover:text-white mx-auto"
          >
            <!-- Added mx-auto to center button -->
            Sign up now
          </button>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '#components';

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
const motionInstance1 = useMotion(featureCard1, motionConfig);
const motionInstance2 = useMotion(featureCard2, motionConfig);
const motionInstance3 = useMotion(featureCard3, motionConfig);
const motionInstance4 = useMotion(featureCard4, motionConfig);
const motionInstance5 = useMotion(featureCard5, motionConfig);
const motionInstance6 = useMotion(featureCard6, motionConfig);
</script>

<style></style>
