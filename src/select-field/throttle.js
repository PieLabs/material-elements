export default function throttle(fn, wait) {
  let waiting = false;
  return function () {
    if (!waiting) {
      waiting = true;
      setTimeout(() => {
        fn();
        waiting = false;
      }, wait);
    } else {
    }
  }
}