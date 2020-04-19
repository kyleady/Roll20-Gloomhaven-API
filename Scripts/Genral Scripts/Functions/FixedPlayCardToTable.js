const fixedPlayCardToTable = (cardid, options) => {
        let card = getObj('card',cardid);
        if(card){
            let deck = getObj('deck',card.get('deckid'));
            if(deck){
                if(!isCleanImgsrc(deck.get('avatar')) && !isCleanImgsrc(card.get('avatar'))){
                    // marketplace-marketplace:
                    playCardToTable(cardid, options);
                } else if (isCleanImgsrc(deck.get('avatar')) && isCleanImgsrc(card.get('avatar'))){
                    let pageid = options.pageid || Campaign().get('playerpageid');
                    let page = getObj('page',pageid);
                    if(page){

                        let imgs=[getCleanImgsrc(card.get('avatar')),getCleanImgsrc(deck.get('avatar'))];
                        let currentSide = options.hasOwnProperty('currentSide')
                            ? options.currentSide
                            : ('faceup' === deck.get('cardsplayed')
                                ? 0
                                : 1
                            );

                        let width = options.width || parseInt(deck.get('defaultwidth')) || 140;
                        let height = options.height || parseInt(deck.get('defaultheight')) || 210;
                        let left = options.left || (parseInt(page.get('width'))*70)/2;
                        let top = options.top || (parseInt(page.get('height'))*70)/2;

                        createObj( 'graphic', {
                            subtype: 'card',
                            cardid: card.id,
                            pageid: page.id,
                            currentSide: currentSide,
                            imgsrc: imgs[currentSide],
                            sides: imgs.map(i => encodeURIComponent(i)).join('|'),
                            left,top,width,height,
                            layer: 'objects',
                            isdrawing: true,
                            controlledby: 'all',
                            gmnotes: `cardid:${card.id}`
                        });
                    } else {
                        whisper(`Specified pageid does not exists.`);
                    }
                } else {
                    whisper(`Can't create cards for a deck mixing Marketplace and User Library images.`);
                }
            } else {
                whisper(`Cannot find deck for card ${card.get('name')}`);
            }
        } else {
            whisper(`Cannot find card for id ${cardid}`);
        }
    };
