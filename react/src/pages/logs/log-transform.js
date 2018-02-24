export default function transformLogBody (body){
  return chunkify(body).map(beautifyLog)
}

function chunkify (body) {
  const CHUNK_MAX_SIZE = 400000
  if (body.length < CHUNK_MAX_SIZE) {
    return [body]
  } else {
    let chunks = [], pos = CHUNK_MAX_SIZE, lastPos = 0
    while (pos < body.length) {
      console.log(pos)
      pos = body.lastIndexOf('\n', pos)
      if (pos <= lastPos) {
        pos = body.indexOf('\n', lastPos + 1)
      }
      if(pos <= lastPos){
        pos = body.length
      }
      chunks.push(body.substring(lastPos, pos))
      console.log(chunks)
      lastPos = pos
      pos += CHUNK_MAX_SIZE
    }
    chunks.push(body.substring(lastPos, body.length))
    return chunks
  }
}

function beautifyLog (logBody) {
  const userDebugRe = /(\|USER_DEBUG\|\[\d+\]\|\w+\|)([^\n]+)/g
  const sfObjectRe = /\w+:{\w+=.+,?\s*}/
  const jsonRe = /({.+})|(\[.+\])/
  const xmlRe = /<(?!\d)[^\s>\/=$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>[^\n]+<\/(?!\d)[^\s>\/=$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/
  const myindent = indent(20)
  return logBody.replace(userDebugRe, (match, p1, userDebug) => {
    if (sfObjectRe.test(userDebug)) { // Marking with control character for Prism parser
      return `${p1}\n${myindent(window.js_beautify(sfdcObjectBeautify(userDebug)))}\u0011`
    } else if (jsonRe.test(userDebug)) {
      return `${p1}\n${myindent(window.js_beautify(userDebug))}\u0012`
    } else if (xmlRe.test(userDebug)) {
      return `${p1}\n${myindent(window.html_beautify(userDebug))}\u0013`
    } else {
      return `${p1}${userDebug}\u0014`
    }
  })
}

function indent (num) {
  return (text) => text.replace(/^.*$/gm, (match) => `${' '.repeat(num)}${match}`)
}

function sfdcObjectBeautify (string) {
  return string.replace(/^\(/, '[').replace(/\)$/, ']')
    .replace(/={/g, ':{')
    .replace(/([{| |\[]\w+)=(.+?)(?=, |},|}\)|:{|])/g, function (match, p1, p2) {
      return `${p1}: ' ${p2} '`
    })
}
