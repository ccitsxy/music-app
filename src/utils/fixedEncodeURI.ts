export function fixedEncodeURI(str: string) {
  return encodeURI(str).replace(/#/g, '%23')
}
