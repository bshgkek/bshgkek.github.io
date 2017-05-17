/*
to do
check dealer blackjack when ace showing
split double surrender?
*/



var DEBUG = true;

var numDecks = 4;
var numShuffles = 5;
var numGames = 15;

var PLAYER = new Player("jj",1500);
var DEALER = new Player("dealer",0,true);
var DECK = new Deck(5);

var playing = false;


// ----------------------------------------------------------------------------
// ------------------------------EVENT LISTENERS-------------------------------
// ----------------------------------------------------------------------------


document.getElementById('dealButton').addEventListener('click', function(e) {
    if (!playing){
        if(DEBUG){ console.log("DEALING");}
        playing = true;
        PLAYER.hand = [];
        DEALER.hand = [];
        DECK.deal(PLAYER);
        DECK.deal(DEALER);
        DECK.deal(PLAYER);
        DECK.deal(DEALER);
        fillHTML();
    }
});
document.getElementById('hitButton').addEventListener('click', function(e) {
    if(playing){
        if(DEBUG){ console.log("PLAYER HITING");}
        DECK.deal(PLAYER);
        if (PLAYER.getHandScore()[1] > 21) {
            playing = false;
            scoreHands();
        }
        if (PLAYER.hand.length == 2 && PLAYER.getHandScore()[1] == 21) {
            playing = false;
            scoreHands();
        }
        fillHTML();
    }
});
document.getElementById('standButton').addEventListener('click', function(e) {
    if(playing){
        if(DEBUG){ console.log("PLAYER STANDING");}
        dealerTurn();
        scoreHands();
        fillHTML(true);
        playing = false;
    }
});



// ----------------------------------------------------------------------------
// --------------------------------PLAYER CLASS--------------------------------
// ----------------------------------------------------------------------------



function Player(name = "", bank = 1000, dealer = false, hand = []) {

    this.name = name;
    this.bank = bank;
    this.hand = hand;
    this.dealer = dealer;

};

Player.prototype.getHandString = function() {
    var curHand = "";
    for (i = 0; i < this.hand.length; i++) {
        if (i == (this.hand.length - 1)) {
            curHand += this.hand[i].toString();
        } else {
            curHand += this.hand[i].toString() + ", ";
        }
    }
    return curHand;
};

Player.prototype.getHandStringShort = function() {
    var curHand = "";
    for (i = 0; i < this.hand.length; i++) {
        if (i == (this.hand.length - 1)) {
            curHand += this.hand[i].toStringShort();
        } else {
            curHand += this.hand[i].toStringShort() + ", ";
        }
    }
    return curHand;
};

Player.prototype.getHandScore = function() {
    total1 = 0;
    total2 = 0;
    ace = false;
    for (i = 0; i < this.hand.length; i++) {
        cur = this.hand[i].rank;
        if ("JQK".indexOf(cur) > -1) {
            total1 += 10;
            total2 += 10;
        } else if (cur == "A") {
            if (ace === false) {
                total1 += 1;
                if (total2 + 11 > 21){ 
                    total2 += 1; 
                }
                else { 
                    total2 += 11; 
                }
                ace = true;
            } else {
                total1 += 1;
                total2 += 1;
            }
        } else {
            total1 += parseInt(cur);
            total2 += parseInt(cur);
        }
    }

    if(total1 != total2 && total2 > 21) {
        total2 -= 10;
    }
    return [total1,total2];
};

Player.prototype.resetHand = function() {
    this.hand = [];
};

Player.prototype.getDealerHandString = function() {
    return this.hand[0].toStringShort() + ", [X]";
};
Player.prototype.getDealerHandScore = function() {
    var cur = this.hand[0].rank;
    if (cur == "A") {
      return "1 or 11";
    }
    else if ("JQK".indexOf(cur) > -1) {
      return "10";
    }
    else { 
      return cur;
    }
};

// ----------------------------------------------------------------------------
// ---------------------------------CARD CLASS---------------------------------
// ----------------------------------------------------------------------------



function Card(value, rank, suit, fullRank, fullSuit) {

    this.value = value;
    this.rank = rank;
    this.suit = suit;
    this.fullRank = fullRank;
    this.fullSuit = fullSuit;

};

Card.prototype.toString = function() {
    return this.fullRank + ' of ' + this.fullSuit;
};

Card.prototype.toStringShort = function() {
    return this.rank + this.suit;
};

Card.prototype.getImgName = function () {
    return "img/" + this.rank + "o" + this.fullSuit.charAt(0) + ".jpg";
};



// ----------------------------------------------------------------------------
// ---------------------------------DECK CLASS---------------------------------
// ----------------------------------------------------------------------------



function Deck(numDecks = 1) {

    this.cardLetters = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    this.cardStrings = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"];
    this.suitLetters = ["D", "H", "S", "C"];
    this.suitSymbols = ["♦", "♥", "♠", "♣"];
    this.suitStrings = ["Diamonds", "Hearts", "Spades", "Clubs"];
    this.deck = [];
    this.numDecks = numDecks;


    if(DEBUG){console.log(`Making new deck from ${numDecks} decks.`);}
    for (e = 0; e < this.numDecks; e++) {
        var cardCount = 1;
        for (w = 0; w < this.suitLetters.length; w++) {
            for (q = 0; q < this.cardLetters.length; q++) {
                this.deck.push(new Card(cardCount, this.cardLetters[q], this.suitLetters[w], this.cardStrings[q], this.suitStrings[w]));
                cardCount += 1;
            }
        }
    }
    if(DEBUG){console.log(`Deck created.`);}
};

Deck.prototype.makeDeck = function(numDecks = 1) {
    if(DEBUG){console.log(`Making new deck from ${numDecks} decks.`);}
    this.deck = [];
    for (e = 0; e < numDecks; e++) {
        var cardCount = 1;
        for (w = 0; w < this.suitLetters.length; w++) {
            for (q = 0; q < this.cardLetters.length; q++) {
                this.deck.push(new Card(cardCount, this.cardLetters[q], this.suitLetters[w], this.cardStrings[q], this.suitStrings[w]));
                cardCount += 1;
            }
        }
    }
    if(DEBUG){console.log(`Deck created.`);}
};

Deck.prototype.shuffle = function(numShuffles = 5) {
    if(DEBUG){console.log(`Shuffling deck ${numShuffles} times.`);}
    for (e = 0; e < numShuffles; e++) {
        for (var j, x, i = this.deck.length; i; j = parseInt(Math.random() * i), x = this.deck[--i], this.deck[i] = this.deck[j], this.deck[j] = x);
    }
    if(DEBUG){console.log(`Deck shuffled.`);}
};

Deck.prototype.deal = function(player) {
    if (this.deck.length === 0) {
        if(DEBUG){console.log("Out of cards!");}
        this.makeDeck(this.numDecks);
        this.shuffle();
    }
    player.hand.push(this.deck.pop());
};

Deck.prototype.toString = function() {
    var finalString = "";
    var deck = this.deck;
    for (i = 0; i < deck.length; i++) {
        if (i == (deck.length - 1)) {
            finalString += deck[i].toString();
        } else {
            finalString += deck[i].toString() + ", ";
        }
    }
    return finalString;
};



// ----------------------------------------------------------------------------
// ------------------------------OTHER FUNCTIONS-------------------------------
// ----------------------------------------------------------------------------


function fillHTML(final = false) {
    console.log("final: ", final);

    if(PLAYER.hand.length > 0 && DEALER.hand.length > 0){
        document.getElementById("player").textContent = `Player: ${PLAYER.getHandStringShort()} - ${PLAYER.getHandScore()}`;
        if(final) {
            document.getElementById("dealer").textContent = `\nDealer: ${DEALER.getHandStringShort()} - ${DEALER.getHandScore()}`;
        } else {
            document.getElementById("dealer").textContent = `\nDealer: ${DEALER.getDealerHandString()} - ${DEALER.getDealerHandScore()}`;
        }
    } else {
        document.getElementById("player").textContent = "";
        document.getElementById("dealer").textContent = "";
    }
}


function dealerTurn() {
    var score = DEALER.getHandScore();
    if(score[1] >= 17) {
        return
    } else {
        DECK.deal(DEALER);
        dealerTurn();
    }
}

function scoreHands() {
    console.log("DEALER.getHandScore()[1]: ", DEALER.getHandScore()[1]);
    console.log("PLAYER.getHandScore()[1]: ", PLAYER.getHandScore()[1]);
    if (DEALER.getHandScore()[1] > 21) {
        console.log("you win");
        return 1;
    } else if(DEALER.getHandScore()[1] > PLAYER.getHandScore()[1]) {
        console.log("you lose");
        return -1;
    }  else if(DEALER.getHandScore()[1] < PLAYER.getHandScore()[1]) {
        console.log("you win");
        return 1;
    } else if(DEALER.getHandScore()[1] == PLAYER.getHandScore()[1]) {
        console.log("you push");
        return 0;
    } else if(PLAYER.getHandScore()[1] > 21) {
        console.log("you lose");
        return -1
    } else if(PLAYER.hand.length == 2 && PLAYER.getHandScore()[1] == 21) {
        console.log("blackjack");
    } else {
        console.log("??????");
        console.log("DEALER.getHandScore()[1]: ", DEALER.getHandScore()[1]);
        console.log("PLAYER.getHandScore()[1]: ", PLAYER.getHandScore()[1]);
    }
}

// ----------------------------------------------------------------------------
// ------------------------------INITIALIZE GAME-------------------------------
// ----------------------------------------------------------------------------

DECK.shuffle(5);
fillHTML();



/*

game ai

h = hit
s = stand
d = double hit
g = double stand
r = surrender hit
v = surrender stand
o = surrender split
p = split
f = split if double after split is allowed


hard hands
hand    0   A   2   3   4   5   6   7   8   9   10
h48 = ["x","h","h","h","h","h","h","h","h","h","h"]
h9  = ["x","h","h","h","d","d","d","h","h","h","h"]
h10 = ["x","h","d","d","d","d","d","d","d","d","h"]
h11 = ["x","d","d","d","d","d","d","d","d","d","d"]
h12 = ["x","h","h","h","s","s","s","h","h","h","h"]
h13 = ["x","h","s","s","s","s","s","h","h","h","h"]
h14 = ["x","h","s","s","s","s","s","h","h","h","h"]
h15 = ["x","r","s","s","s","s","s","h","h","h","r"]
h16 = ["x","r","s","s","s","s","s","h","h","r","r"]
h17 = ["x","v","s","s","s","s","s","s","s","s","s"]
h18 = ["x","s","s","s","s","s","s","s","s","s","s"]
h19 = ["x","s","s","s","s","s","s","s","s","s","s"]
h20 = ["x","s","s","s","s","s","s","s","s","s","s"]
soft hands
hand     0   A   2   3   4   5   6   7   8   9   10
s13  = ["x","h","h","h","h","d","d","h","h","h","h"]
s14  = ["x","h","h","h","h","d","d","h","h","h","h"]
s15  = ["x","h","h","h","d","d","d","h","h","h","h"]
s16  = ["x","h","h","h","d","d","d","h","h","h","h"]
s17  = ["x","h","h","d","d","d","d","h","h","h","h"]
s18  = ["x","h","g","g","g","g","g","s","s","h","h"]
s19  = ["x","s","s","s","s","s","g","s","s","s","s"]
s20  = ["x","s","s","s","s","s","s","s","s","s","s"]
pair hands
hand    0   A   2   3   4   5   6   7   8   9   10
p2s = ["x","h","f","f","p","p","p","p","h","h","h"]
p3s = ["x","h","f","f","p","p","p","p","h","h","h"]
p4s = ["x","h","h","h","h","f","f","p","h","h","h"]
p5s = ["x","h","d","d","d","d","d","d","d","d","h"]
p6s = ["x","h","f","p","p","p","p","h","h","h","h"]
p7s = ["x","h","p","p","p","p","p","p","h","h","h"]
p8s = ["x","o","p","p","p","p","p","p","p","p","p"]
p9s = ["x","s","p","p","p","p","p","s","p","p","s"]
pTs = ["x","s","s","s","s","s","s","s","s","s","s"]
pAs = ["x","p","p","p","p","p","p","p","p","p","p"]

bs=["h48", ["x", "h", "h", "h", "h", "h", "h", "h", "h", "h", "h"], "h9", ["x", "h", "h", "d", "d", "d", "d", "h", "h", "h", "h"], "h10", ["x", "h", "d", "d", "d", "d", "d", "d", "d", "d", "h"], "h11", ["x", "d", "d", "d", "d", "d", "d", "d", "d", "d", "d"], "h12", ["x", "h", "h", "h", "s", "s", "s", "h", "h", "h", "h"], "h13", ["x", "h", "s", "s", "s", "s", "s", "h", "h", "h", "h"], "h14", ["x", "h", "s", "s", "s", "s", "s", "h", "h", "h", "h"], "h15", ["x", "r", "s", "s", "s", "s", "s", "h", "h", "h", "r"], "h16", ["x", "r", "s", "s", "s", "s", "s", "h", "h", "r", "r"], "h17", ["x", "v", "s", "s", "s", "s", "s", "s", "s", "s", "s"], "h18", ["x", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s"], "h19", ["x", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s"], "h20", ["x", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s"], "s13", ["x", "h", "h", "h", "h", "d", "d", "h", "h", "h", "h"], "s14", ["x", "h", "h", "h", "h", "d", "d", "h", "h", "h", "h"], "s15", ["x", "h", "h", "h", "d", "d", "d", "h", "h", "h", "h"], "s16", ["x", "h", "h", "h", "d", "d", "d", "h", "h", "h", "h"], "s17", ["x", "h", "h", "d", "d", "d", "d", "h", "h", "h", "h"], "s18", ["x", "h", "g", "g", "g", "g", "g", "s", "s", "h", "h"], "s19", ["x", "s", "s", "s", "s", "s", "g", "s", "s", "s", "s"], "s20", ["x", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s"], "p2s", ["x", "h", "f", "f", "p", "p", "p", "p", "h", "h", "h"], "p3s", ["x", "h", "f", "f", "p", "p", "p", "p", "h", "h", "h"], "p4s", ["x", "h", "h", "h", "h", "f", "f", "h", "h", "h", "h"], "p5s", ["x", "h", "d", "d", "d", "d", "d", "d", "d", "d", "h"], "p6s", ["x", "h", "f", "p", "p", "p", "p", "h", "h", "h", "h"], "p7s", ["x", "h", "p", "p", "p", "p", "p", "p", "h", "h", "h"], "p8s", ["x", "o", "p", "p", "p", "p", "p", "p", "p", "p", "p"], "p9s", ["x", "s", "p", "p", "p", "p", "p", "s", "p", "p", "s"], "pTs", ["x", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s"], "pAs", ["x", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p"]]

bsLong = ["h", "hit", "s", "stand", "d", "double hit", "g", "double stand", "r", "surrender hit", "v", "surrender stand", "o", "surrender split", "p", "split", "f", "split if double after split is allowed"]


*/