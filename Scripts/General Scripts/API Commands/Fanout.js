function fanoutFn(matches, msg) {
  const distance = Number(matches[1] || 10) || 0
  if(msg.selected.length < 1) {
    whisper('Please select at least one graphic', {speakingTo: msg.playerid})
  }

  var minLeft = Infinity
  var minTop = Infinity
  eachGraphic(msg, (graphic) => {
    const left = graphic.get('left')
    const top = graphic.get('top')
    if(left < minLeft) {
      minLeft = left
    }

    if(top < minTop) {
      minTop = top
    }
  })

  var count = 0;
  eachGraphic(msg, (graphic) => {
    graphic.set({
      left: minLeft + (count * distance),
      top: minTop + (count * distance)
    })

    count++
  })

  whisper(`${count} objects fanned out.`)
}

on('ready', () => {
  CentralInput.addCMD(/^!\s*fanout\s+(\d*)\s*$/i, fanoutFn, true);
})
