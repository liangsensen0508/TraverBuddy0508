<template>
  <keep-alive>
    <router-view />
  </keep-alive>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  background: linear-gradient(to bottom left, #a0c9ff, #f2f5fa) fixed;
}

img {
  display: block;
  border: none;
}
</style>
