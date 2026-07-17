<template>
  <q-page class="bg-white text-dark">
    <!-- Hero Section -->
    <!-- Hero Section -->
    <!-- Hero Section -->
    <div
      class="hero-section relative-position flex column justify-center items-center items-md-start q-pa-md q-pa-md-xl text-center text-md-left"
    >
      <div class="hero-content full-width q-py-xl" style="max-width: 1200px; z-index: 2">
        <div
          class="text-caption text-weight-bold q-mb-md tracking-widest text-uppercase text-grey-8"
        >
          100% Free & Open Source
        </div>
        <h1
          class="text-h1 text-weight-bolder q-mb-md q-mt-none text-black"
          style="line-height: 1.1; letter-spacing: -2px"
        >
          The Future of <br />
          Education Management
        </h1>
        <p
          class="text-h5 text-grey-9 q-mb-xl text-weight-regular q-mx-auto q-mx-md-0"
          style="opacity: 0.8; max-width: 700px"
        >
          Streamline your class operations, track student progress, and manage payments with a
          premium, high-performance system designed for modern educators.
        </p>

        <div class="flex justify-center justify-md-start q-gutter-md q-mb-xl">
          <q-btn
            label="Register Your Institute"
            color="black"
            text-color="white"
            size="lg"
            rounded
            unelevated
            to="/register"
            class="q-px-xl q-py-sm text-weight-bold shadow-10"
          />
          <q-btn
            label="Learn More"
            outline
            color="black"
            size="lg"
            rounded
            class="q-px-xl q-py-sm text-weight-bold bg-transparent"
            @click="scrollToSection('features')"
          />
        </div>

        <div class="hero-image-container q-mt-xl relative-position text-center">
          <q-img
            src="/hero-dashboard.png"
            class="rounded-borders shadow-20"
            style="max-width: 70%; border: 1px solid rgba(0, 0, 0, 0.05)"
          />
          <div
            class="absolute-top-left bg-black text-white q-pa-sm text-subtitle2 rounded-borders"
            style="top: -15px; left: 20px"
          >
            v2.0 Dashboard
          </div>
        </div>
      </div>

      <!-- Abstract Background Elements -->
      <div
        class="absolute-top-right q-pa-xl"
        style="z-index: 0; opacity: 0.05; transform: rotate(15deg)"
      >
        <q-icon name="school" size="400px" color="black" />
      </div>
      <div
        class="absolute-bottom-left q-pa-xl"
        style="z-index: 0; opacity: 0.05; transform: rotate(-10deg)"
      >
        <q-icon name="widgets" size="300px" color="black" />
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section bg-grey-10 text-white q-py-lg q-py-md-xl">
      <div class="container">
        <div class="row q-col-gutter-lg justify-center text-center">
          <div class="col-12 col-md-3">
            <div class="text-h2 text-weight-bolder text-white">50+</div>
            <div class="text-subtitle1 text-grey-4">Partner Institutes</div>
          </div>
          <div class="col-12 col-md-3">
            <div class="text-h2 text-weight-bolder text-white">10k+</div>
            <div class="text-subtitle1 text-grey-4">Active Students</div>
          </div>
          <div class="col-12 col-md-3">
            <div class="text-h2 text-weight-bolder text-white">99%</div>
            <div class="text-subtitle1 text-grey-4">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div id="features" class="features-section q-py-lg q-py-md-xl q-px-md q-px-md-lg">
      <div class="text-center q-mb-xl">
        <div class="text-overline text-grey-8 text-weight-bold">POWERFUL TOOLS</div>
        <h2 class="text-h3 text-weight-bold text-black q-mt-none">Everything You Need</h2>
      </div>

      <div class="row q-col-gutter-lg justify-center" style="max-width: 1200px; margin: 0 auto">
        <div class="col-12 col-md-4">
          <q-card
            flat
            class="feature-card bg-black h-full q-pa-md cursor-pointer row items-center no-wrap transition-all"
          >
            <q-card-section>
              <q-avatar
                color="white"
                text-color="black"
                icon="people"
                size="lg"
                font-size="28px"
                class="shadow-1"
              />
            </q-card-section>
            <q-card-section>
              <div class="text-h6 text-weight-bold q-mb-xs text-white">Student Management</div>
              <div class="text-grey-5 text-caption">
                Efficiently enroll, track, and manage student profiles and histories.
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card
            flat
            class="feature-card bg-black h-full q-pa-md cursor-pointer row items-center no-wrap"
          >
            <q-card-section>
              <q-avatar
                color="white"
                text-color="black"
                icon="payments"
                size="lg"
                font-size="28px"
                class="shadow-1"
              />
            </q-card-section>
            <q-card-section>
              <div class="text-h6 text-weight-bold q-mb-xs text-white">Smart Payments</div>
              <div class="text-grey-5 text-caption">
                Seamless fee collection, invoicing, and financial reporting.
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card
            flat
            class="feature-card bg-black h-full q-pa-md cursor-pointer row items-center no-wrap"
          >
            <q-card-section>
              <q-avatar
                color="white"
                text-color="black"
                icon="qr_code_scanner"
                size="lg"
                font-size="28px"
                class="shadow-1"
              />
            </q-card-section>
            <q-card-section>
              <div class="text-h6 text-weight-bold q-mb-xs text-white">Auto Attendance</div>
              <div class="text-grey-5 text-caption">
                QR-based quick attendance marking for students and staff.
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card
            flat
            class="feature-card bg-black h-full q-pa-md cursor-pointer row items-center no-wrap"
          >
            <q-card-section>
              <q-avatar
                color="white"
                text-color="black"
                icon="badge"
                size="lg"
                font-size="28px"
                class="shadow-1"
              />
            </q-card-section>
            <q-card-section>
              <div class="text-h6 text-weight-bold q-mb-xs text-white">Staff Management</div>
              <div class="text-grey-5 text-caption">
                Manage teachers, staff roles, and payroll seamlessly.
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card
            flat
            class="feature-card bg-black h-full q-pa-md cursor-pointer row items-center no-wrap"
          >
            <q-card-section>
              <q-avatar
                color="white"
                text-color="black"
                icon="calendar_month"
                size="lg"
                font-size="28px"
                class="shadow-1"
              />
            </q-card-section>
            <q-card-section>
              <div class="text-h6 text-weight-bold q-mb-xs text-white">Smart Scheduling</div>
              <div class="text-grey-5 text-caption">
                Organize classes, exams, and events with an intuitive planner.
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card
            flat
            class="feature-card bg-black h-full q-pa-md cursor-pointer row items-center no-wrap"
          >
            <q-card-section>
              <q-avatar
                color="white"
                text-color="black"
                icon="assignment_turned_in"
                size="lg"
                font-size="28px"
                class="shadow-1"
              />
            </q-card-section>
            <q-card-section>
              <div class="text-h6 text-weight-bold q-mb-xs text-white">Exam Results</div>
              <div class="text-grey-5 text-caption">
                Publish exam marks and generate detailed student performance reports.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- About Us Section -->
    <div id="about" class="about-section q-py-xl q-px-md bg-grey-1">
      <div class="container" style="max-width: 1000px">
        <div class="row items-center q-col-gutter-xl">
          <div class="col-12 col-md-6">
            <div class="text-overline text-grey-8 text-weight-bold">OUR MISSION</div>
            <h2 class="text-h3 text-weight-bold text-black q-mt-none q-mb-md">
              Empowering Modern Educators
            </h2>
            <p class="text-body1 text-grey-8 q-mb-lg">
              ANW Systems was born out of a desire to simplify the complexities of tuition class
              management. We believe that educators should focus on teaching, not wrestling with
              administrative tasks.
            </p>
            <p class="text-body1 text-grey-8">
              Our platform provides a comprehensive suite of tools designed to handle everything
              from attendance tracking to financial reporting, all within a beautiful and intuitive
              interface.
            </p>
          </div>
          <div class="col-12 col-md-6 text-center">
            <q-icon name="hub" size="200px" color="grey-3" />
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Footer -->
    <div id="contact" class="bg-black text-white q-pt-lg q-pt-md-xl q-pb-lg">
      <div class="container q-px-lg">
        <div class="row q-col-gutter-xl">
          <!-- Brand & Social -->
          <div class="col-12 col-md-4">
            <div class="text-h5 text-weight-bold q-mb-md">
              ANW <span class="text-grey-6">SYSTEMS</span>
            </div>
            <p class="text-grey-6 q-mb-lg" style="max-width: 300px">
              Empowering education with advanced technology. A 100% Free & Open Source solution for
              modern tuition management.
            </p>
            <div class="q-gutter-sm">
              <q-btn flat round dense icon="facebook" class="text-grey-5 hover:text-white" />
              <q-btn
                flat
                round
                dense
                icon="ion_logo_twitter"
                class="text-grey-5 hover:text-white"
              />
              <q-btn
                flat
                round
                dense
                icon="ion_logo_linkedin"
                class="text-grey-5 hover:text-white"
              />
              <q-btn
                flat
                round
                dense
                icon="ion_logo_instagram"
                class="text-grey-5 hover:text-white"
              />
            </div>
          </div>

          <!-- Quick Links -->
          <div class="col-6 col-md-2">
            <div class="text-subtitle1 text-weight-bold q-mb-md">Platform</div>
            <div class="flex column q-gutter-sm">
              <a href="#" class="text-grey-6 no-decoration hover:text-white transition-all">Home</a>
              <a href="#features" class="text-grey-6 no-decoration hover:text-white transition-all"
                >Features</a
              >
              <a href="#about" class="text-grey-6 no-decoration hover:text-white transition-all"
                >About Us</a
              >
            </div>
          </div>

          <!-- Support -->
          <div class="col-6 col-md-2">
            <div class="text-subtitle1 text-weight-bold q-mb-md">Support</div>
            <div class="flex column q-gutter-sm">
              <a href="#" class="text-grey-6 no-decoration hover:text-white transition-all"
                >Help Center</a
              >
              <a href="#" class="text-grey-6 no-decoration hover:text-white transition-all"
                >Privacy Policy</a
              >
              <a href="#" class="text-grey-6 no-decoration hover:text-white transition-all"
                >Terms of Service</a
              >
              <a href="#contact" class="text-grey-6 no-decoration hover:text-white transition-all"
                >Contact</a
              >
            </div>
          </div>

          <!-- Contact Info -->
          <div class="col-12 col-md-4">
            <div class="text-subtitle1 text-weight-bold q-mb-md">Get in Touch</div>
            <div class="q-list padding-none">
              <div class="row items-center q-mb-sm text-grey-6">
                <q-icon name="email" size="xs" class="q-mr-sm" /> support@anw-systems.com
              </div>
              <div class="row items-center q-mb-sm text-grey-6">
                <q-icon name="phone" size="xs" class="q-mr-sm" /> +94 76 764 0861
              </div>
              <div class="row items-center text-grey-6">
                <q-icon name="location_on" size="xs" class="q-mr-sm" /> Colombo, Sri Lanka
              </div>
            </div>

            <!-- Newsletter Input (Optional) -->
            <div class="q-mt-lg">
              <q-input
                filled
                dark
                dense
                label="Subscribe to newsletter"
                bg-color="grey-9"
                input-class="text-white"
              >
                <template v-slot:append>
                  <q-btn round dense flat icon="send" />
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <q-separator color="grey-9" class="q-my-xl" />

        <div class="row justify-between items-center text-grey-7 text-caption">
          <div>© 2026 ANW Tuition Management System. All Rights Reserved.</div>
          <div class="flex q-gutter-md">
            <span>Designed by ANW Team</span>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style lang="scss">
.container {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;

  @media (min-width: 600px) {
    max-width: 540px;
  }
  @media (min-width: 1024px) {
    max-width: 960px;
  }
  @media (min-width: 1440px) {
    max-width: 1140px;
  }
}

.text-h1 {
  font-size: 4.5rem;
}
@media (max-width: 599px) {
  .text-h1 {
    font-size: 2.5rem; /* Smaller font on mobile */
    line-height: 1.2 !important;
  }
}

.feature-card {
  transition:
    transform 0.3s ease,
    background-color 0.3s ease;
  border: 1px solid transparent;

  &:hover {
    transform: translateY(-5px);
    background-color: #1a1a1a !important; /* Dark grey on hover */
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
  }
}
</style>
