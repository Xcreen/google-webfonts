<template>
  <footer class="py-5">
    <div class="d-flex justify-content-between py-4 my-4 border-top">
      <p>© 2022 Xcreen</p>
      <ul class="list-unstyled d-flex">
        <li class="ms-3">
          <a class="link-dark" href="http://google.de" target="_blank" data-bs-toggle="tooltip" data-bs-placement="top" title="Xcreen on Github">
            <i class="fa-brands fa-github fa-xl"></i>
          </a>
        </li>
        <li class="ms-3">
          <a class="link-dark" href="#" target="_blank" data-bs-toggle="tooltip" data-bs-placement="top" title="Xcreen on Twitter">
            <i class="fa-brands fa-twitter fa-xl"></i>
          </a>
        </li>
      </ul>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {}
  },
  mounted() {
    //Init Bootstrap-Tooltips
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('footer [data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
  }
}
</script>

<style scoped>
</style>
