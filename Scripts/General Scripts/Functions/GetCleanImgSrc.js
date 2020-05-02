function getCleanImgsrc(imgsrc, type) {
    if(!type) {
      type = "thumb"
    }

    var matches = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
    if(matches) {
        return matches[1] + type + matches[3]+(matches[4] ? matches[4] : `?${Math.round(Math.random()*9999999)}`)
    } else {
      whisper("Failed to parse: " + imgsrc)
    }
}
