if (!window.decodeBackStanza) {
  window.decodeBackStanza = require("WAWap").decodeStanza;
  window.encodeBackStanza = require("WAWap").encodeStanza;
}

function byteArrayToHex(byteArray) {
  return Array.from(byteArray).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function isAscii(byteArray) {
  return byteArray.every(byte => byte >= 32 && byte <= 126);
}

function byteArrayToString(byteArray) {
  return String.fromCharCode.apply(null, byteArray);
}

function convertToXML(tag, attrs, content) {
  const attributes = Object.keys(attrs).map(key => `${key}="${attrs[key]}"`).join(' ');
  let contentString = '';

  if (Array.isArray(content)) {
    contentString = content.map(item => {
      if (typeof item === 'object' && item !== null) {
        if (item instanceof Uint8Array) {
          if (isAscii(item)) {
            return byteArrayToString(item);
          }
          return byteArrayToHex(item);
        }
        return convertToXML(item.tag, item.attrs || {}, item.content || []);
      }
      return item;
    }).join('');
  } else if (content instanceof Uint8Array) {
    if (isAscii(content)) {
      contentString = byteArrayToString(content);
    } else {
      contentString = byteArrayToHex(content);
    }
  } else if (content) {
    contentString = content;
  }

  if (attributes) {
    return contentString ? `<${tag} ${attributes}>${contentString}</${tag}>` : `<${tag} ${attributes}/>`;
  } else {
    return contentString ? `<${tag}>${contentString}</${tag}>` : `<${tag}/>`;
  }
}

require("WAWap").decodeStanza = async (e, t) => {
  const result = await window.decodeBackStanza(e, t);
  const xmlString = convertToXML(result.tag, result.attrs || {}, result.content || []);
  //console.log('[XML] <- ', xmlString);
  return result;
}

require("WAWap").encodeStanza = (...args) => {
  const result = window.encodeBackStanza(...args);
  const xmlString = convertToXML(args[0].tag, args[0].attrs || {}, args[0].content || []);
  //console.log('[XML] -> ', xmlString);
  return result;
}