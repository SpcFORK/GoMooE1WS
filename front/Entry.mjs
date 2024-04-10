function Core() {
  console.log(1)
  return import("/Main.mjs");
}

export default Core