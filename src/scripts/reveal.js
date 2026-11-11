// Scroll reveal for product pages: .dl-reveal fades in once (only with .dl-motion on <html>).
(function () {
  var root = document.documentElement;
  if (!root.classList.contains("dl-motion")) return;
  var items = document.querySelectorAll(".dl-reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  items.forEach(function (el) { io.observe(el); });
})();
