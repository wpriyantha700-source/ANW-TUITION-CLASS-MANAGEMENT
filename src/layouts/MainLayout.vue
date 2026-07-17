<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-black bordered-bottom" height-hint="98">
      <q-toolbar class="q-py-sm q-px-md">
        <!-- Mobile Menu Button (Visible only on small screens) -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="lt-md q-mr-sm"
          @click="toggleLeftDrawer"
        />

        <!-- Brand Logo / Name -->
        <q-toolbar-title class="text-weight-bolder text-h6 text-md-h5" style="letter-spacing: -1px">
          ANW <span class="text-grey-7">SYSTEMS</span>
        </q-toolbar-title>

        <!-- Desktop Navigation (Hidden on small screens) -->
        <div class="gt-sm q-gutter-x-md">
          <q-btn flat no-caps label="Home" class="text-weight-bold" to="/" />
          <q-btn
            flat
            no-caps
            label="Features"
            class="text-weight-medium text-grey-8"
            to="/#features"
          />
          <q-btn
            flat
            no-caps
            label="About Us"
            class="text-weight-medium text-grey-8"
            to="/#about"
          />
          <q-btn
            flat
            no-caps
            label="Contact"
            class="text-weight-medium text-grey-8"
            to="/#contact"
          />
        </div>

        <q-space />

        <!-- Auth Buttons -->
        <div class="q-gutter-x-sm row items-center">
          <q-btn flat no-caps label="Log In" class="text-weight-bold" color="black" to="/login" />
          <q-btn
            unelevated
            rounded
            no-caps
            label="Register"
            class="bg-black text-white text-weight-bold q-px-md q-px-md-lg"
            to="/register"
          />
        </div>
      </q-toolbar>

      <!-- Mobile Navigation Row (Visible only on small screens) -->
      <div class="lt-md row justify-center q-pb-sm q-gutter-x-sm">
        <q-btn flat no-caps label="Home" class="text-weight-bold" to="/" dense />
        <q-btn
          flat
          no-caps
          label="Features"
          class="text-weight-medium text-grey-8"
          to="/#features"
          dense
        />
        <q-btn
          flat
          no-caps
          label="About Us"
          class="text-weight-medium text-grey-8"
          to="/#about"
          dense
        />
        <q-btn
          flat
          no-caps
          label="Contact"
          class="text-weight-medium text-grey-8"
          to="/#contact"
          dense
        />
      </div>
    </q-header>

    <!-- Mobile Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      overlay
      behavior="mobile"
      class="bg-white text-black"
    >
      <q-list padding class="text-weight-medium">
        <q-item-label header class="text-grey-8">Menu</q-item-label>

        <q-item clickable v-ripple to="/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Home</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/#features">
          <q-item-section avatar>
            <q-icon name="star" />
          </q-item-section>
          <q-item-section>Features</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/#about">
          <q-item-section avatar>
            <q-icon name="info" />
          </q-item-section>
          <q-item-section>About Us</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/#contact">
          <q-item-section avatar>
            <q-icon name="phone" />
          </q-item-section>
          <q-item-section>Contact</q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item clickable v-ripple to="/login">
          <q-item-section avatar>
            <q-icon name="login" />
          </q-item-section>
          <q-item-section>Log In</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
.bordered-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.9) !important;
}
</style>
